ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS sku text;

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_unique_combo
  ON public.product_variants (product_id, color, fastening, coalesce(size, ''));