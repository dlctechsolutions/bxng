CREATE TABLE public.product_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text,
  rating integer NOT NULL,
  title text,
  body text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT product_reviews_status_check CHECK (status IN ('pending','approved','rejected')),
  CONSTRAINT product_reviews_unique_per_user UNIQUE (product_id, user_id)
);

GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are public"
  ON public.product_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Own reviews read"
  ON public.product_reviews FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Own reviews insert"
  ON public.product_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own reviews update"
  ON public.product_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own reviews delete"
  ON public.product_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all reviews"
  ON public.product_reviews FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage reviews"
  ON public.product_reviews FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX product_reviews_product_status_idx ON public.product_reviews (product_id, status);