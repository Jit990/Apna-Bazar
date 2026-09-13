import { describe, expect, it } from 'vitest';
import { calculatePriceSummary, validateCoupon, withServerCatalogPrices } from '@/services/pricing.service';
import type { CartItem, Coupon, Product } from '@/types';

function catalogProduct(price: number, mrp: number): Product {
    return {
        id: 'p1',
        name: 'Gold Ring',
        slug: 'gold-ring',
        description: null,
        short_description: null,
        category_id: 'cat-1',
        subcategory_id: null,
        brand: null,
        sku: 'SKU-1',
        price,
        mrp,
        cost_price: null,
        discount_percent: 0,
        stock_quantity: 10,
        low_stock_threshold: 5,
        stock_status: 'in_stock',
        weight_grams: null,
        metadata: {},
        is_active: true,
        is_featured: false,
        is_bestseller: false,
        is_new_arrival: false,
        tax_percent: 0,
        meta_title: null,
        meta_description: null,
        timestamps: { created_at: '', updated_at: '' },
        images: [],
    };
}

describe('checkout pricing', () => {
    it('ignores tampered cart unit_price and uses catalog price', () => {
        const cartItem: CartItem = {
            id: 'ci-1',
            cart_id: 'cart-1',
            product_id: 'p1',
            variant_id: null,
            quantity: 2,
            unit_price: 1,
            product: catalogProduct(500, 700),
        };

        const priced = withServerCatalogPrices([cartItem]);
        expect(priced[0].unit_price).toBe(500);

        const summary = calculatePriceSummary(priced, {
            deliveryFee: 30,
            freeDeliveryThreshold: 499,
            minOrderAmount: 0,
        });

        expect(summary.total).toBe(1000);
        expect(summary.delivery_fee).toBe(0);
    });

    it('rejects coupons below the real subtotal minimum', () => {
        const coupon: Coupon = {
            id: 'c1',
            code: 'SAVE50',
            description: null,
            discount_type: 'fixed',
            discount_value: 50,
            min_order_amount: 400,
            max_discount_amount: null,
            usage_limit: null,
            per_user_limit: 1,
            used_count: 0,
            applicable_category_ids: [],
            applicable_product_ids: [],
            starts_at: new Date(Date.now() - 1000).toISOString(),
            expires_at: null,
            is_active: true,
            created_at: new Date().toISOString(),
        };

        expect(validateCoupon(coupon, 0, 0).valid).toBe(false);
        expect(validateCoupon(coupon, 500, 0).valid).toBe(true);
    });
});
