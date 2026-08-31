-- =============================================================
-- APNA BAZAR - Development Seed Data
-- Run AFTER schema.sql
-- This is for DEVELOPMENT AND TESTING ONLY.
-- Do NOT run in production with real data.
-- =============================================================

-- ============================================================
-- CATEGORIES (matching banner categories)
-- ============================================================

INSERT INTO categories (name, slug, display_order, is_active) VALUES
  ('Makeup',          'makeup',         1,  TRUE),
  ('Skin Care',       'skin-care',      2,  TRUE),
  ('Hair Care',       'hair-care',      3,  TRUE),
  ('Perfumes',        'perfumes',       4,  TRUE),
  ('Jewelry',         'jewelry',        5,  TRUE),
  ('Bangles',         'bangles',        6,  TRUE),
  ('Earrings',        'earrings',       7,  TRUE),
  ('Rings',           'rings',          8,  TRUE),
  ('Gift Items',      'gift-items',     9,  TRUE),
  ('Teddy & Toys',    'teddy-toys',     10, TRUE),
  ('Stationery',      'stationery',     11, TRUE),
  ('Birthday Gifts',  'birthday-gifts', 12, TRUE),
  ('Personal Care',   'personal-care',  13, TRUE),
  ('Food & Grocery',  'food-grocery',   14, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SAMPLE PRODUCTS (Development Only)
-- ============================================================

DO $$
DECLARE
  cat_makeup    UUID;
  cat_skincare  UUID;
  cat_jewelry   UUID;
  cat_gifts     UUID;
  cat_stationery UUID;
  cat_toys      UUID;
BEGIN
  SELECT id INTO cat_makeup    FROM categories WHERE slug = 'makeup';
  SELECT id INTO cat_skincare  FROM categories WHERE slug = 'skin-care';
  SELECT id INTO cat_jewelry   FROM categories WHERE slug = 'jewelry';
  SELECT id INTO cat_gifts     FROM categories WHERE slug = 'gift-items';
  SELECT id INTO cat_stationery FROM categories WHERE slug = 'stationery';
  SELECT id INTO cat_toys      FROM categories WHERE slug = 'teddy-toys';

  INSERT INTO products (
    name, slug, short_description, category_id, brand, sku,
    price, mrp, stock_quantity, low_stock_threshold, tax_percent,
    is_active, is_featured, is_bestseller, is_new_arrival
  ) VALUES
  -- Makeup
  ('Lakme Lipstick Absolute Matte',  'lakme-lipstick-absolute-matte',
   'Long lasting matte finish lipstick', cat_makeup, 'Lakme',
   'LKM-LIP-001', 299, 399, 50, 10, 0, TRUE, TRUE, TRUE, FALSE),

  ('MyGlamm LIT Liquid Eyeshadow',   'myglamm-lit-liquid-eyeshadow',
   'Metallic liquid eyeshadow', cat_makeup, 'MyGlamm',
   'MYG-EYE-001', 349, 499, 30, 5, 0, TRUE, FALSE, TRUE, FALSE),

  ('Maybelline Fit Me Foundation',   'maybelline-fit-me-foundation',
   'Natural finish foundation', cat_makeup, 'Maybelline',
   'MYB-FND-001', 399, 549, 40, 8, 0, TRUE, TRUE, FALSE, TRUE),

  -- Skin Care
  ('Himalaya Neem Face Wash 150ml',  'himalaya-neem-face-wash-150ml',
   'Purifying neem & turmeric face wash', cat_skincare, 'Himalaya',
   'HIM-FW-001', 120, 160, 100, 20, 0, TRUE, FALSE, TRUE, FALSE),

  ('Ponds White Beauty Cream 50g',   'ponds-white-beauty-cream-50g',
   'Brightening day cream with SPF', cat_skincare, 'Ponds',
   'PON-CR-001', 149, 195, 80, 15, 0, TRUE, TRUE, FALSE, FALSE),

  ('Nivea Moisturising Body Lotion',  'nivea-moisturising-body-lotion-400ml',
   'Deep nourishing body lotion', cat_skincare, 'Nivea',
   'NIV-LOT-001', 299, 395, 60, 10, 0, TRUE, FALSE, FALSE, TRUE),

  -- Jewelry
  ('Traditional Gold-plated Necklace Set', 'traditional-gold-plated-necklace-set',
   'Elegant traditional necklace with matching earrings', cat_jewelry, NULL,
   'JWL-NCK-001', 599, 899, 20, 5, 3, TRUE, TRUE, TRUE, FALSE),

  ('Stone Studded Bangle Set (6pcs)', 'stone-studded-bangle-set-6pcs',
   'Beautiful stone-studded bangles set of 6', cat_jewelry, NULL,
   'JWL-BNG-001', 249, 399, 35, 10, 3, TRUE, FALSE, TRUE, FALSE),

  ('Pearl Drop Earrings',            'pearl-drop-earrings',
   'Classic pearl drop earrings for all occasions', cat_jewelry, NULL,
   'JWL-EAR-001', 199, 299, 45, 10, 3, TRUE, TRUE, FALSE, TRUE),

  -- Gift Items
  ('Scented Candle Gift Set',        'scented-candle-gift-set',
   'Set of 3 aromatherapy candles in gift box', cat_gifts, NULL,
   'GFT-CND-001', 549, 799, 25, 5, 0, TRUE, TRUE, FALSE, TRUE),

  ('Message-in-a-Bottle Gift',       'message-in-a-bottle-gift',
   'Beautiful glass bottle with personalized note', cat_gifts, NULL,
   'GFT-BTL-001', 299, 449, 30, 8, 0, TRUE, FALSE, TRUE, FALSE),

  ('Photo Frame Collage 4-in-1',     'photo-frame-collage-4-in-1',
   '4-photo collage wooden frame', cat_gifts, NULL,
   'GFT-FRM-001', 399, 599, 20, 5, 0, TRUE, TRUE, FALSE, FALSE),

  -- Stationery
  ('Premium Ball Pen Set (10pcs)',   'premium-ball-pen-set-10pcs',
   'Smooth writing ball pens in assorted colors', cat_stationery, NULL,
   'STN-PEN-001', 99, 149, 200, 30, 0, TRUE, FALSE, TRUE, FALSE),

  ('A5 Ruled Notebook 200 Pages',    'a5-ruled-notebook-200-pages',
   'High quality ruled notebook for student & office', cat_stationery, NULL,
   'STN-NBK-001', 79, 120, 150, 30, 0, TRUE, FALSE, FALSE, TRUE),

  -- Toys
  ('Soft Teddy Bear 30cm',           'soft-teddy-bear-30cm',
   'Super soft huggable teddy bear', cat_toys, NULL,
   'TOY-TED-001', 299, 449, 40, 10, 0, TRUE, TRUE, TRUE, FALSE),

  ('Building Blocks Set 50pcs',      'building-blocks-set-50pcs',
   'Colorful building blocks for kids', cat_toys, NULL,
   'TOY-BLK-001', 349, 499, 30, 8, 0, TRUE, FALSE, FALSE, TRUE)

  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================================
-- DELIVERY ZONE (Local Bajkul area)
-- ============================================================

INSERT INTO delivery_zones (
  name, pincodes, delivery_charge, free_delivery_threshold,
  min_order_amount, estimated_minutes_min, estimated_minutes_max,
  is_active, cod_available
) VALUES (
  'Bajkul Local',
  ARRAY['721655', '721649', '721636'],
  30, 499, 0, 15, 45, TRUE, TRUE
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE COUPONS
-- ============================================================

INSERT INTO coupons (
  code, description, discount_type, discount_value,
  min_order_amount, max_discount_amount,
  usage_limit, per_user_limit,
  starts_at, expires_at, is_active
) VALUES
  ('WELCOME50',  'Welcome discount 50% off (max ₹100)', 'percentage', 50, 0, 100, 100, 1,
   NOW(), NOW() + INTERVAL '30 days', TRUE),
  ('FLAT100',    'Flat ₹100 off on orders above ₹499',  'fixed', 100, 499, NULL, 200, 2,
   NOW(), NOW() + INTERVAL '30 days', TRUE),
  ('FIRST20',    '20% off on first order',              'percentage', 20, 0, 150, 500, 1,
   NOW(), NOW() + INTERVAL '60 days', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SAMPLE BANNER (Homepage)
-- ============================================================

INSERT INTO banners (title, subtitle, image_url, button_text, button_link, display_order, is_active)
VALUES
  ('Jewelry That Shines, Bonds That Last',
   'Shop our exclusive jewelry collection',
   '/images/banner-jewelry.jpg', 'Shop Jewelry', '/categories/jewelry', 1, TRUE),
  ('Up to 50% OFF on Beauty Products',
   'Top brands at unbeatable prices',
   '/images/banner-beauty.jpg', 'Shop Now', '/categories/makeup', 2, TRUE),
  ('Fast Local Delivery',
   'Quick delivery across Bajkul & nearby areas',
   '/images/banner-delivery.jpg', 'Order Now', '/categories', 3, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RPC FUNCTIONS (for atomic operations)
-- ============================================================

-- Atomic stock decrement (prevents oversell)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_product_id AND stock_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic coupon usage increment
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- NOTE: This is sample data for development.
-- Replace with real data before going live.
-- ============================================================
