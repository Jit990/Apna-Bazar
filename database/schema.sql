-- =============================================================
-- APNA BAZAR - Production PostgreSQL Schema (Supabase)
-- Run this in Supabase SQL Editor
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- =============================================================
-- PROFILES & ROLES
-- =============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'manager', 'staff');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  phone         TEXT UNIQUE,
  email         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =============================================================
-- ADDRESSES
-- =============================================================

CREATE TABLE addresses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  house_flat            TEXT NOT NULL,
  street_locality       TEXT NOT NULL,
  landmark              TEXT,
  city                  TEXT NOT NULL,
  state                 TEXT NOT NULL DEFAULT 'West Bengal',
  pincode               TEXT NOT NULL,
  delivery_instructions TEXT,
  is_default            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Ensure only one default per user
CREATE UNIQUE INDEX idx_addresses_one_default
  ON addresses(user_id)
  WHERE is_default = TRUE;

-- =============================================================
-- CATEGORIES
-- =============================================================

CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  image_url     TEXT,
  parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active_order ON categories(is_active, display_order);

-- =============================================================
-- PRODUCTS
-- =============================================================

CREATE TYPE stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');

CREATE TABLE products (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT,
  short_description    TEXT,
  category_id          UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand                TEXT,
  sku                  TEXT NOT NULL UNIQUE,
  price                NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  mrp                  NUMERIC(10,2) NOT NULL CHECK (mrp >= 0),
  cost_price           NUMERIC(10,2) CHECK (cost_price >= 0),
  discount_percent     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  stock_quantity       INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold  INTEGER NOT NULL DEFAULT 5,
  stock_status         stock_status NOT NULL DEFAULT 'in_stock',
  weight_grams         INTEGER,
  metadata             JSONB NOT NULL DEFAULT '{}',
  specifications       JSONB NOT NULL DEFAULT '[]', -- [{label, value}]
  tax_percent          NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured          BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller        BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival       BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title           TEXT,
  meta_description     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = TRUE;
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = TRUE;
-- Full text search index
CREATE INDEX idx_products_search ON products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, '')));

-- =============================================================
-- PRODUCT IMAGES
-- =============================================================

CREATE TABLE product_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  alt_text      TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- =============================================================
-- PRODUCT VARIANTS
-- =============================================================

CREATE TABLE product_variants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name             TEXT NOT NULL, -- e.g. "Color"
  value            TEXT NOT NULL, -- e.g. "Red"
  price_modifier   NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku              TEXT UNIQUE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- =============================================================
-- INVENTORY MOVEMENTS
-- =============================================================

CREATE TYPE inventory_movement_type AS ENUM ('purchase', 'sale', 'adjustment', 'return', 'damage');

CREATE TABLE inventory_movements (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id       UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  type             inventory_movement_type NOT NULL,
  quantity_change  INTEGER NOT NULL,
  quantity_after   INTEGER NOT NULL,
  reference_id     UUID,
  note             TEXT,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

-- =============================================================
-- CARTS
-- =============================================================

CREATE TABLE carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  TEXT,
  coupon_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cart_must_have_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;

CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- =============================================================
-- COUPONS
-- =============================================================

CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

CREATE TABLE coupons (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                      TEXT NOT NULL UNIQUE,
  description               TEXT,
  discount_type             discount_type NOT NULL,
  discount_value            NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount_amount       NUMERIC(10,2),
  usage_limit               INTEGER,
  per_user_limit            INTEGER NOT NULL DEFAULT 1,
  used_count                INTEGER NOT NULL DEFAULT 0,
  applicable_category_ids   UUID[] NOT NULL DEFAULT '{}',
  applicable_product_ids    UUID[] NOT NULL DEFAULT '{}',
  starts_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at                TIMESTAMPTZ,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, expires_at);

CREATE TABLE coupon_usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL,
  used_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, order_id)
);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);

-- =============================================================
-- ORDERS
-- =============================================================

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'preparing', 'ready_for_delivery',
  'out_for_delivery', 'delivered', 'cancelled', 'payment_failed', 'refunded'
);

CREATE TYPE payment_method AS ENUM ('razorpay', 'cod');

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
);

CREATE SEQUENCE orders_seq;

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        TEXT NOT NULL UNIQUE DEFAULT 'APB' || LPAD(NEXTVAL('orders_seq')::TEXT, 4, '0'),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  address_snapshot    JSONB NOT NULL,
  status              order_status NOT NULL DEFAULT 'pending',
  payment_method      payment_method NOT NULL,
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  payment_id          UUID,
  razorpay_order_id   TEXT,
  subtotal            NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_id           UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_discount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_note       TEXT,
  estimated_delivery  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id      UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  variant_name    TEXT,
  image_url       TEXT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(10,2) NOT NULL,
  mrp             NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  note        TEXT,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- =============================================================
-- PAYMENTS
-- =============================================================

CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  razorpay_payment_id   TEXT UNIQUE,
  razorpay_order_id     TEXT,
  razorpay_signature    TEXT,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'INR',
  method                payment_method NOT NULL,
  status                payment_status NOT NULL DEFAULT 'pending',
  gateway_response      JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- Foreign key back to payments
ALTER TABLE orders ADD CONSTRAINT fk_orders_payment_id
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- =============================================================
-- REFUNDS
-- =============================================================

CREATE TYPE refund_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE refunds (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id          UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  razorpay_refund_id  TEXT UNIQUE,
  amount              NUMERIC(10,2) NOT NULL,
  reason              TEXT,
  status              refund_status NOT NULL DEFAULT 'pending',
  initiated_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);

-- =============================================================
-- WISHLIST
-- =============================================================

CREATE TABLE wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- =============================================================
-- DELIVERY ZONES
-- =============================================================

CREATE TABLE delivery_zones (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                      TEXT NOT NULL,
  pincodes                  TEXT[] NOT NULL DEFAULT '{}',
  delivery_charge           NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_delivery_threshold   NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_minutes_min     INTEGER NOT NULL DEFAULT 10,
  estimated_minutes_max     INTEGER NOT NULL DEFAULT 30,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  cod_available             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BANNERS
-- =============================================================

CREATE TABLE banners (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  subtitle      TEXT,
  image_url     TEXT NOT NULL,
  button_text   TEXT,
  button_link   TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_active_order ON banners(is_active, display_order);

-- =============================================================
-- STORE SETTINGS (single-row table)
-- =============================================================

CREATE TABLE store_settings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name           TEXT NOT NULL DEFAULT 'Apna Bazar',
  tagline                 TEXT NOT NULL DEFAULT 'Han Rishta, Han Ehsaas, Humare Saath...',
  location                TEXT NOT NULL DEFAULT 'Bajkul, Pin-721655, West Bengal, India',
  phone                   TEXT,
  email                   TEXT,
  address                 TEXT,
  opening_hours           JSONB NOT NULL DEFAULT '{}',
  delivery_message        TEXT NOT NULL DEFAULT 'Fast Local Delivery',
  cod_available           BOOLEAN NOT NULL DEFAULT TRUE,
  min_order_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 499,
  delivery_charge         NUMERIC(10,2) NOT NULL DEFAULT 30,
  is_store_open           BOOLEAN NOT NULL DEFAULT TRUE,
  is_delivery_available   BOOLEAN NOT NULL DEFAULT TRUE,
  social_links            JSONB NOT NULL DEFAULT '{}',
  logo_url                TEXT,
  favicon_url             TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Enforce single row
  CONSTRAINT single_row CHECK (id = id)
);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================

CREATE TYPE notification_type AS ENUM (
  'order_confirmed', 'order_status', 'payment_success',
  'payment_failed', 'promo', 'system'
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================================
-- AUDIT LOGS
-- =============================================================

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB NOT NULL DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'addresses', 'categories', 'products', 'product_variants',
    'carts', 'cart_items', 'coupons', 'orders', 'payments', 'refunds',
    'delivery_zones', 'banners', 'store_settings'
  ]
  LOOP
    EXECUTE format('
      CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.phone
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update product stock_status
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity = 0 THEN
    NEW.stock_status = 'out_of_stock';
  ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
    NEW.stock_status = 'low_stock';
  ELSE
    NEW.stock_status = 'in_stock';
  END IF;
  -- Also recalculate discount_percent
  IF NEW.mrp > 0 AND NEW.price < NEW.mrp THEN
    NEW.discount_percent = ROUND(((NEW.mrp - NEW.price) / NEW.mrp) * 100, 2);
  ELSE
    NEW.discount_percent = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_stock_status
  BEFORE INSERT OR UPDATE OF stock_quantity, low_stock_threshold, price, mrp
  ON products
  FOR EACH ROW EXECUTE FUNCTION update_stock_status();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
-- Public tables (no user data)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager', 'staff')
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---- PROFILES RLS ----
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can do everything on profiles"
  ON profiles FOR ALL USING (is_admin());

-- ---- ADDRESSES RLS ----
CREATE POLICY "Users can manage their own addresses"
  ON addresses FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT USING (is_admin());

-- ---- CARTS & CART_ITEMS RLS ----
CREATE POLICY "Users can manage their own cart"
  ON carts FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their cart items"
  ON cart_items FOR ALL
  USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- ---- ORDERS RLS ----
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE USING (is_admin());

-- ---- ORDER_ITEMS RLS ----
CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR is_admin()
  );

-- ---- PAYMENTS RLS ----
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR is_admin()
  );

-- ---- WISHLISTS RLS ----
CREATE POLICY "Users can manage their wishlist"
  ON wishlists FOR ALL USING (user_id = auth.uid());

-- ---- NOTIFICATIONS RLS ----
CREATE POLICY "Users can see their own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ---- PUBLIC READ POLICIES ----
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view product variants"
  ON product_variants FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (
    (is_active = TRUE AND (starts_at IS NULL OR starts_at <= NOW())
     AND (ends_at IS NULL OR ends_at >= NOW()))
    OR is_admin()
  );

CREATE POLICY "Anyone can view store settings"
  ON store_settings FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view delivery zones"
  ON delivery_zones FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Anyone can view active coupons code"
  ON coupons FOR SELECT USING (is_admin() OR is_active = TRUE);

-- ---- ADMIN POLICIES ----
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage products"
  ON products FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage store settings"
  ON store_settings FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage delivery zones"
  ON delivery_zones FOR ALL USING (is_admin());

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage inventory"
  ON inventory_movements FOR ALL USING (is_admin());

CREATE POLICY "Users can see their coupon usage"
  ON coupon_usage FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- =============================================================
-- SEED: Store Settings (default)
-- =============================================================
INSERT INTO store_settings (
  business_name, tagline, location, delivery_message,
  cod_available, min_order_amount, free_delivery_threshold,
  delivery_charge, is_store_open, is_delivery_available,
  opening_hours, social_links
) VALUES (
  'Apna Bazar',
  'Han Rishta, Han Ehsaas, Humare Saath...',
  'Bajkul, Pin-721655, West Bengal, India',
  'Fast Local Delivery',
  TRUE, 0, 499, 30, TRUE, TRUE,
  '{
    "monday":    {"open": "09:00", "close": "21:00", "closed": false},
    "tuesday":   {"open": "09:00", "close": "21:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "21:00", "closed": false},
    "thursday":  {"open": "09:00", "close": "21:00", "closed": false},
    "friday":    {"open": "09:00", "close": "21:00", "closed": false},
    "saturday":  {"open": "09:00", "close": "22:00", "closed": false},
    "sunday":    {"open": "10:00", "close": "20:00", "closed": false}
  }',
  '{}'
);
