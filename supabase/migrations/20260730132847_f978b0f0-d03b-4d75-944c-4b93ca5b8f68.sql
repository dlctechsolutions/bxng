ALTER TABLE public.product_reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'site';