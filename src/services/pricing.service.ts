import type { CartItem, Coupon, PriceSummary } from '@/types';

const DEFAULT_DELIVERY_FEE = 30;
const DEFAULT_FREE_DELIVERY_THRESHOLD = 499;

export interface PricingConfig {
    deliveryFee: number;
    freeDeliveryThreshold: number;
    minOrderAmount: number;
}

/**
 * Calculate price summary for a cart.
 * All business logic here is server-side-only invocable.
 * Never trust frontend-computed totals for order creation.
 */
export function calculatePriceSummary(
    items: CartItem[],
    config: PricingConfig = {
        deliveryFee: DEFAULT_DELIVERY_FEE,
        freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
        minOrderAmount: 0,
    },
    coupon?: Coupon | null
): PriceSummary {
    // 1. Subtotal at MRP (full price)
    const subtotalAtMRP = items.reduce((sum, item) => {
        const product = item.product;
        if (!product) return sum;
        const mrp = product.mrp;
        return sum + mrp * item.quantity;
    }, 0);

    // 2. Selling price subtotal (items already discounted)
    const subtotalAtSelling = items.reduce((sum, item) => {
        const basePrice = item.unit_price;
        const variantModifier = item.variant?.price_modifier ?? 0;
        const effectivePrice = basePrice + variantModifier;
        return sum + effectivePrice * item.quantity;
    }, 0);

    // 3. Product discount = MRP total - selling total
    const discountAmount = Math.max(0, subtotalAtMRP - subtotalAtSelling);

    // 4. Coupon discount
    let couponDiscount = 0;
    if (coupon && coupon.is_active) {
        const now = new Date();
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now;
        const notBeforeStart = new Date(coupon.starts_at) <= now;
        const meetsMinOrder = subtotalAtSelling >= coupon.min_order_amount;

        if (notExpired && notBeforeStart && meetsMinOrder) {
            if (coupon.discount_type === 'percentage') {
                couponDiscount = (subtotalAtSelling * coupon.discount_value) / 100;
                if (coupon.max_discount_amount) {
                    couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount);
                }
            } else {
                // fixed
                couponDiscount = Math.min(coupon.discount_value, subtotalAtSelling);
            }
        }
    }

    // 5. Tax (calculated on selling price after coupon)
    // 5. Tax (calculated on selling price after coupon)
    const taxAmount = items.reduce((sum, item) => {
        const product = item.product;
        if (!product || !product.tax_percent) return sum;
        const itemTotal = item.unit_price * item.quantity;
        const itemCouponShare = subtotalAtSelling > 0
            ? (itemTotal / subtotalAtSelling) * couponDiscount
            : 0;
        const taxable = itemTotal - itemCouponShare;
        return sum + (taxable * product.tax_percent) / 100;
    }, 0);

    // 6. Delivery fee
    const deliveryFee =
        subtotalAtSelling - couponDiscount >= config.freeDeliveryThreshold
            ? 0
            : config.deliveryFee;

    // 7. Grand total
    const total = Math.max(
        0,
        subtotalAtSelling - couponDiscount + taxAmount + deliveryFee
    );

    return {
        subtotal: round2(subtotalAtMRP),
        discount_amount: round2(discountAmount),
        coupon_discount: round2(couponDiscount),
        tax_amount: round2(taxAmount),
        delivery_fee: round2(deliveryFee),
        total: round2(total),
    };
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Validate coupon for a specific user and order.
 * Returns the validated coupon or an error message.
 */
export interface CouponValidationResult {
    valid: boolean;
    coupon?: Coupon;
    error?: string;
}

export function validateCoupon(
    coupon: Coupon | null,
    orderSubtotal: number,
    userUsageCount: number
): CouponValidationResult {
    if (!coupon) return { valid: false, error: 'Coupon not found' };
    if (!coupon.is_active) return { valid: false, error: 'Coupon is inactive' };

    const now = new Date();
    if (new Date(coupon.starts_at) > now) {
        return { valid: false, error: 'Coupon is not yet active' };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        return { valid: false, error: 'Coupon has expired' };
    }
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, error: 'Coupon usage limit reached' };
    }
    if (userUsageCount >= coupon.per_user_limit) {
        return { valid: false, error: `You have already used this coupon ${coupon.per_user_limit} time(s)` };
    }
    if (orderSubtotal < coupon.min_order_amount) {
        return {
            valid: false,
            error: `Minimum order of ₹${coupon.min_order_amount} required for this coupon`,
        };
    }

    return { valid: true, coupon };
}
