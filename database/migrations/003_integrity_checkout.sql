-- Migration: Integrity, inventory atomicity, and cart price enforcement

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS singleton BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
  ALTER TABLE store_settings
    ADD CONSTRAINT store_settings_singleton UNIQUE (singleton);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE store_settings
    ADD CONSTRAINT store_settings_singleton_true CHECK (singleton);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager', 'staff')
    AND is_active = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - p_quantity
    WHERE id = p_product_id AND stock_quantity >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE id = p_coupon_id;
END;
$$;

-- Deduct stock for every cart line in a single transaction.
CREATE OR REPLACE FUNCTION checkout_deduct_stock(p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
    updated integer;
BEGIN
    IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
        RAISE EXCEPTION 'Invalid checkout items';
    END IF;

    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        UPDATE products
        SET stock_quantity = stock_quantity - (item->>'quantity')::integer
        WHERE id = (item->>'product_id')::uuid
          AND stock_quantity >= (item->>'quantity')::integer;

        GET DIAGNOSTICS updated = ROW_COUNT;
        IF updated = 0 THEN
            RAISE EXCEPTION 'Insufficient stock for product %', item->>'product_id';
        END IF;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_cart_item_catalog_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    catalog_price numeric;
    modifier numeric := 0;
BEGIN
    SELECT price INTO catalog_price FROM products WHERE id = NEW.product_id;
    IF catalog_price IS NULL THEN
        RAISE EXCEPTION 'Invalid product';
    END IF;

    IF NEW.variant_id IS NOT NULL THEN
        SELECT COALESCE(price_modifier, 0) INTO modifier
        FROM product_variants
        WHERE id = NEW.variant_id AND product_id = NEW.product_id;
    END IF;

    NEW.unit_price := catalog_price + modifier;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cart_items_catalog_price ON cart_items;
CREATE TRIGGER trg_cart_items_catalog_price
  BEFORE INSERT OR UPDATE OF product_id, variant_id, unit_price, quantity
  ON cart_items
  FOR EACH ROW EXECUTE FUNCTION enforce_cart_item_catalog_price();

REVOKE ALL ON FUNCTION checkout_deduct_stock(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION checkout_deduct_stock(jsonb) TO service_role;

REVOKE ALL ON FUNCTION decrement_stock(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION decrement_stock(uuid, integer) TO service_role;
