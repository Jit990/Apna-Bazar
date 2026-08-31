// =============================================================
// APNA BAZAR - Core TypeScript Types
// =============================================================

// ---- User / Auth ----
export type UserRole = 'customer' | 'admin' | 'manager' | 'staff';

export interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
    role: UserRole;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ---- Address ----
export interface Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    house_flat: string;
    street_locality: string;
    landmark: string | null;
    city: string;
    state: string;
    pincode: string;
    delivery_instructions: string | null;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// ---- Category ----
export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    subcategories?: Category[];
    product_count?: number;
}

// ---- Product ----
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    alt_text: string | null;
    display_order: number;
    is_primary: boolean;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    name: string; // e.g. "Color", "Size", "Shade"
    value: string; // e.g. "Red", "Large", "Nude Pink"
    price_modifier: number; // +/- from base price
    stock_quantity: number;
    sku: string | null;
    is_active: boolean;
}

export interface ProductSpecification {
    label: string;
    value: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    category_id: string;
    subcategory_id: string | null;
    brand: string | null;
    sku: string;
    price: number;           // selling price
    mrp: number;             // maximum retail price
    cost_price: number | null; // admin only
    discount_percent: number; // computed from price vs mrp
    stock_quantity: number;
    low_stock_threshold: number;
    stock_status: StockStatus;
    weight_grams: number | null;
    // Flexible metadata for different product types
    metadata: Record<string, unknown>;
    // Flags
    is_active: boolean;
    is_featured: boolean;
    is_bestseller: boolean;
    is_new_arrival: boolean;
    // Tax
    tax_percent: number;
    // SEO
    meta_title: string | null;
    meta_description: string | null;
    timestamps: { created_at: string; updated_at: string };
    // Joined
    category?: Category;
    images?: ProductImage[];
    variants?: ProductVariant[];
    specifications?: ProductSpecification[];
    average_rating?: number;
    review_count?: number;
}

// ---- Cart ----
export interface CartItem {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;      // locked at time of adding
    product?: Product;
    variant?: ProductVariant;
}

export interface Cart {
    id: string;
    user_id: string | null;
    session_id: string | null;
    items: CartItem[];
    coupon_id: string | null;
    coupon?: Coupon;
    created_at: string;
    updated_at: string;
}

// ---- Pricing Summary ----
export interface PriceSummary {
    subtotal: number;        // sum of all items (at MRP)
    discount_amount: number; // product discounts
    coupon_discount: number;
    delivery_fee: number;
    tax_amount: number;
    total: number;
}

// ---- Coupon ----
export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: DiscountType;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    per_user_limit: number;
    used_count: number;
    applicable_category_ids: string[];
    applicable_product_ids: string[];
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

// ---- Order ----
export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_for_delivery'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'payment_failed'
    | 'refunded';

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string | null;
    product_name: string;    // snapshot
    variant_name: string | null;
    image_url: string | null;
    quantity: number;
    unit_price: number;
    mrp: number;
    total_price: number;
    product?: Product;
}

export interface OrderStatusEvent {
    id: string;
    order_id: string;
    status: OrderStatus;
    note: string | null;
    updated_by: string | null;
    created_at: string;
}

export interface Order {
    id: string;
    order_number: string;    // e.g. APB1024
    user_id: string;
    address_snapshot: Address;
    items: OrderItem[];
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    payment_id: string | null;
    razorpay_order_id: string | null;
    subtotal: number;
    discount_amount: number;
    coupon_id: string | null;
    coupon_discount: number;
    delivery_fee: number;
    tax_amount: number;
    total_amount: number;
    delivery_note: string | null;
    estimated_delivery: string | null;
    status_history?: OrderStatusEvent[];
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

// ---- Payment ----
export interface Payment {
    id: string;
    order_id: string;
    razorpay_payment_id: string | null;
    razorpay_order_id: string | null;
    razorpay_signature: string | null;
    amount: number;
    currency: string;
    method: PaymentMethod;
    status: PaymentStatus;
    gateway_response: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

// ---- Refund ----
export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Refund {
    id: string;
    payment_id: string;
    order_id: string;
    razorpay_refund_id: string | null;
    amount: number;
    reason: string | null;
    status: RefundStatus;
    created_at: string;
}

// ---- Delivery ----
export interface DeliveryZone {
    id: string;
    name: string;
    pincodes: string[];
    delivery_charge: number;
    free_delivery_threshold: number;
    min_order_amount: number;
    estimated_minutes_min: number;
    estimated_minutes_max: number;
    is_active: boolean;
    cod_available: boolean;
}

// ---- Banner ----
export interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    image_url: string;
    button_text: string | null;
    button_link: string | null;  // /category/cosmetics or /product/slug
    display_order: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
}

// ---- Store Settings ----
export interface StoreSettings {
    id: string;
    business_name: string;
    tagline: string;
    location: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    opening_hours: Record<string, { open: string; close: string; closed: boolean }>;
    delivery_message: string;
    cod_available: boolean;
    min_order_amount: number;
    free_delivery_threshold: number;
    delivery_charge: number;
    is_store_open: boolean;
    is_delivery_available: boolean;
    social_links: Record<string, string>;
    logo_url: string | null;
    favicon_url: string | null;
    updated_at: string;
}

// ---- Notification ----
export type NotificationType =
    | 'order_confirmed'
    | 'order_status'
    | 'payment_success'
    | 'payment_failed'
    | 'promo'
    | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    metadata: Record<string, unknown>;
    created_at: string;
}

// ---- Wishlist ----
export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    product?: Product;
    created_at: string;
}

// ---- Inventory Movement ----
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage';

export interface InventoryMovement {
    id: string;
    product_id: string;
    variant_id: string | null;
    type: MovementType;
    quantity_change: number; // +ve = in, -ve = out
    quantity_after: number;
    reference_id: string | null; // order_id, purchase_id etc.
    note: string | null;
    created_by: string | null;
    created_at: string;
}

// ---- Audit Log ----
export type AuditAction =
    | 'product_created' | 'product_updated' | 'product_deleted'
    | 'category_created' | 'category_updated' | 'category_deleted'
    | 'order_status_updated' | 'order_cancelled'
    | 'coupon_created' | 'coupon_updated' | 'coupon_deleted'
    | 'banner_created' | 'banner_updated' | 'banner_deleted'
    | 'settings_updated'
    | 'refund_initiated'
    | 'stock_adjusted'
    | 'admin_login';

export interface AuditLog {
    id: string;
    admin_id: string;
    action: AuditAction;
    entity: string;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
    admin?: Profile;
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ---- Pagination ----
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// ---- Search ----
export interface SearchResult {
    products: Product[];
    categories: Category[];
    total: number;
}

// ---- Filters ----
export interface ProductFilters {
    category_id?: string;
    subcategory_id?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    is_featured?: boolean;
    is_bestseller?: boolean;
    is_new_arrival?: boolean;
    search?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: number;
    limit?: number;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
    today_revenue: number;
    today_orders: number;
    pending_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_customers: number;
    low_stock_count: number;
    revenue_trend: { date: string; revenue: number }[];
    order_trend: { date: string; orders: number }[];
    top_products: { product: Product; total_sold: number; revenue: number }[];
    category_performance: { category: string; revenue: number; orders: number }[];
}
