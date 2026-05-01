DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'product_status'
  ) THEN
    CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_store_parent_position_idx
  ON categories (store_id, parent_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS categories_store_slug_unique
  ON categories (store_id, slug);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS cost_price integer,
  ADD COLUMN IF NOT EXISTS weight integer,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS featured_image_url text,
  ADD COLUMN IF NOT EXISTS total_stock integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_id_categories_id_fk'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_categories_id_fk
      FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE products
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE products
  ALTER COLUMN status TYPE product_status
  USING CASE
    WHEN status IN ('draft', 'active', 'archived') THEN status::product_status
    WHEN is_active = true THEN 'active'::product_status
    ELSE 'archived'::product_status
  END;

ALTER TABLE products
  ALTER COLUMN status SET DEFAULT 'active';

UPDATE products
SET total_stock = stock
WHERE total_stock IS DISTINCT FROM stock;

UPDATE products AS p
SET
  total_stock = variant_totals.total_stock,
  stock = variant_totals.total_stock
FROM (
  SELECT
    product_id,
    COALESCE(SUM(stock), 0)::integer AS total_stock
  FROM product_variants
  GROUP BY product_id
) AS variant_totals
WHERE p.id = variant_totals.product_id;

UPDATE products AS p
SET
  images = image_rollup.image_urls,
  featured_image_url = image_rollup.primary_url
FROM (
  SELECT
    product_id,
    COALESCE(
      jsonb_agg(url ORDER BY is_primary DESC, sort_order ASC, created_at ASC),
      '[]'::jsonb
    ) AS image_urls,
    (array_agg(url ORDER BY is_primary DESC, sort_order ASC, created_at ASC))[1] AS primary_url
  FROM product_images
  GROUP BY product_id
) AS image_rollup
WHERE p.id = image_rollup.product_id;

CREATE INDEX IF NOT EXISTS products_store_status_idx
  ON products (store_id, status);

CREATE INDEX IF NOT EXISTS products_store_category_idx
  ON products (store_id, category_id);

CREATE INDEX IF NOT EXISTS products_store_price_idx
  ON products (store_id, price);

CREATE UNIQUE INDEX IF NOT EXISTS products_store_slug_unique
  ON products (store_id, slug);

ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS product_variants_store_product_position_idx
  ON product_variants (store_id, product_id, position);

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS variant_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_images_variant_id_product_variants_id_fk'
  ) THEN
    ALTER TABLE product_images
      ADD CONSTRAINT product_images_variant_id_product_variants_id_fk
      FOREIGN KEY (variant_id)
      REFERENCES product_variants(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS product_images_store_variant_idx
  ON product_images (store_id, variant_id);
