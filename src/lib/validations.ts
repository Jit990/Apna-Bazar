import { z } from 'zod';

// ---- Auth ----
export const phoneSchema = z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const otpSchema = z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits');

export const signUpSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: phoneSchema,
    email: z.string().email('Invalid email').optional().or(z.literal('')),
});

// ---- Address ----
export const addressSchema = z.object({
    full_name: z.string().min(2).max(100),
    phone: phoneSchema,
    house_flat: z.string().min(1, 'House/Flat is required').max(200),
    street_locality: z.string().min(2, 'Street/Locality is required').max(300),
    landmark: z.string().max(200).optional().or(z.literal('')),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z
        .string()
        .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
    delivery_instructions: z.string().max(500).optional().or(z.literal('')),
    is_default: z.boolean().optional(),
});

// ---- Product ----
export const productSchema = z.object({
    name: z.string().min(2).max(300),
    description: z.string().optional(),
    short_description: z.string().max(500).optional(),
    category_id: z.string().uuid('Select a valid category'),
    subcategory_id: z.string().uuid().optional().nullable(),
    brand: z.string().max(100).optional(),
    sku: z.string().min(1).max(100),
    price: z.number().positive('Price must be positive'),
    mrp: z.number().positive('MRP must be positive'),
    cost_price: z.number().positive().optional().nullable(),
    stock_quantity: z.number().int().min(0),
    low_stock_threshold: z.number().int().min(0).default(5),
    weight_grams: z.number().positive().optional().nullable(),
    tax_percent: z.number().min(0).max(100).default(0),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    is_bestseller: z.boolean().default(false),
    is_new_arrival: z.boolean().default(false),
    meta_title: z.string().max(200).optional(),
    meta_description: z.string().max(500).optional(),
    metadata: z.record(z.string(), z.unknown()).default({}).optional(),
});

// ---- Category ----
export const categorySchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    parent_id: z.string().uuid().optional().nullable(),
    display_order: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
});

// ---- Coupon ----
export const couponSchema = z.object({
    code: z
        .string()
        .min(3)
        .max(20)
        .toUpperCase()
        .regex(/^[A-Z0-9_-]+$/, 'Only letters, numbers, hyphens, underscores allowed'),
    description: z.string().optional(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    min_order_amount: z.number().min(0).default(0),
    max_discount_amount: z.number().positive().optional().nullable(),
    usage_limit: z.number().int().positive().optional().nullable(),
    per_user_limit: z.number().int().positive().default(1),
    applicable_category_ids: z.array(z.string().uuid()).default([]),
    applicable_product_ids: z.array(z.string().uuid()).default([]),
    starts_at: z.string().datetime(),
    expires_at: z.string().datetime().optional().nullable(),
    is_active: z.boolean().default(true),
});

// ---- Banner ----
export const bannerSchema = z.object({
    title: z.string().min(1).max(200),
    subtitle: z.string().max(300).optional(),
    button_text: z.string().max(50).optional(),
    button_link: z.string().optional(),
    display_order: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    starts_at: z.string().datetime().optional().nullable(),
    ends_at: z.string().datetime().optional().nullable(),
});

// ---- Checkout ----
export const checkoutSchema = z.object({
    address_id: z.string().uuid('Select a delivery address'),
    payment_method: z.enum(['razorpay', 'cod']),
    coupon_code: z.string().optional(),
    delivery_note: z.string().max(500).optional(),
});

// ---- Coupon Apply ----
export const applyCouponSchema = z.object({
    code: z.string().min(1),
});

// ---- Store Settings ----
export const storeSettingsSchema = z.object({
    business_name: z.string().min(1).max(200),
    tagline: z.string().max(300),
    location: z.string().max(300),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    delivery_message: z.string().max(200),
    cod_available: z.boolean(),
    min_order_amount: z.number().min(0),
    free_delivery_threshold: z.number().min(0),
    delivery_charge: z.number().min(0),
    is_store_open: z.boolean(),
    is_delivery_available: z.boolean(),
});

// ---- Inventory Adjustment ----
export const inventoryAdjustmentSchema = z.object({
    product_id: z.string().uuid(),
    quantity_change: z.number().int(),
    type: z.enum(['purchase', 'adjustment', 'damage', 'return']),
    note: z.string().max(300).optional(),
});

// ---- Order Status Update ----
export const orderStatusUpdateSchema = z.object({
    status: z.enum([
        'pending',
        'confirmed',
        'preparing',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded',
    ]),
    note: z.string().max(500).optional(),
});

// ---- Payment Verification ----
export const paymentVerificationSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    order_id: z.string().uuid(),
});

// ---- Search ----
export const searchSchema = z.object({
    q: z.string().min(1).max(200),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
