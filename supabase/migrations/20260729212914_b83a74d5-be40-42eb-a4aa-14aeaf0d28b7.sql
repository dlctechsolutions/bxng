
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  banner_image text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Collections are public" ON public.collections FOR SELECT USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Boxing Gloves',
  description text,
  details text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  has_variants boolean NOT NULL DEFAULT true,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL,
  fastening text NOT NULL DEFAULT 'Velcro',
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants are public" ON public.product_variants FOR SELECT USING (true);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own wishlist" ON public.wishlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text NOT NULL UNIQUE DEFAULT ('44-' || upper(substr(md5(random()::text), 1, 8))),
  status text NOT NULL DEFAULT 'processing',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  email text,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  name text NOT NULL,
  variant_label text,
  image text,
  unit_price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Own order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Seed collections
INSERT INTO public.collections (slug, name, tagline, description, banner_image, sort_order) VALUES
('luxe', 'Luxe Collection', 'The Founding Collection', 'Full-grain leather, hand-stitched. The last of the first.', '/images/banner-luxe.jpg', 1),
('maverick', 'Maverick Collection', 'Built To Break Rules', 'Everyday workhorse gloves engineered for volume training.', '/images/banner-maverick.jpg', 2),
('nova', 'Nova Collection', 'The New Standard', 'Lightweight, responsive, made for speed.', '/images/banner-nova.jpg', 3);

-- Luxe products
INSERT INTO public.products (collection_id, slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, featured, sort_order)
SELECT c.id, v.slug, v.name, v.category, v.description, v.details, v.price, v.sale_price, v.images::jsonb, true, true, true, v.sort_order
FROM public.collections c, (VALUES
  ('luxe-onyx-16oz', 'Luxe Onyx 16oz', 'Sparring Gloves', 'Full-grain cowhide shell with a triple-density foam core. Built for long rounds and heavy hands.', 'Full-grain leather. Triple-density foam. Attached thumb. Hand-stitched in a 12-step process.', 189.00, 139.00, '["/images/prod-luxe-onyx.jpg","/images/prod-luxe-bone.jpg"]', 1),
  ('luxe-bone-14oz', 'Luxe Bone 14oz', 'Training Gloves', 'Off-white full-grain leather with tonal 44 embossing. Understated, uncompromising.', 'Full-grain leather. Triple-density foam. Moisture-wicking lining.', 179.00, 129.00, '["/images/prod-luxe-bone.jpg","/images/prod-luxe-onyx.jpg"]', 2),
  ('luxe-oxblood-12oz', 'Luxe Oxblood 12oz', 'Bag Gloves', 'Deep oxblood leather, laced for a locked-in fit. The founding silhouette.', 'Full-grain leather. Lace-up closure. Reinforced knuckle panel.', 169.00, 124.00, '["/images/prod-luxe-oxblood.jpg","/images/prod-luxe-onyx.jpg"]', 3)
) AS v(slug, name, category, description, details, price, sale_price, images, sort_order)
WHERE c.slug = 'luxe';

-- Maverick products
INSERT INTO public.products (collection_id, slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, featured, sort_order)
SELECT c.id, v.slug, v.name, v.category, v.description, v.details, v.price, v.sale_price, v.images::jsonb, v.has_variants, v.in_stock, false, v.sort_order
FROM public.collections c, (VALUES
  ('maverick-crimson-16oz', 'Maverick Crimson 16oz', 'Sparring Gloves', 'High-volume sparring glove with a shock-absorbing layered core.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 129.00, 94.00, '["/images/prod-mav-crimson.jpg"]', true, true, 1),
  ('maverick-crimson-12oz', 'Maverick Crimson 12oz', 'Bag Gloves', 'Lighter Crimson build for pads and bag work.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 109.00, 84.00, '["/images/prod-mav-crimson.jpg"]', false, true, 2),
  ('maverick-cobalt-16oz', 'Maverick Cobalt 16oz', 'Sparring Gloves', 'Cobalt colourway with the same proven Maverick core.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 129.00, 99.00, '["/images/prod-mav-cobalt.jpg"]', true, true, 3),
  ('maverick-cobalt-12oz', 'Maverick Cobalt 12oz', 'Bag Gloves', 'Fast, light and durable for daily rounds.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 109.00, NULL, '["/images/prod-mav-cobalt.jpg"]', false, true, 4),
  ('maverick-slate-16oz', 'Maverick Slate 16oz', 'Sparring Gloves', 'Muted slate grey. Quiet on the eye, loud on the pads.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 129.00, 94.00, '["/images/prod-mav-slate.jpg"]', true, false, 5),
  ('maverick-slate-12oz', 'Maverick Slate 12oz', 'Bag Gloves', 'The everyday Slate, trimmed down for speed.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 109.00, 79.00, '["/images/prod-mav-slate.jpg"]', false, true, 6),
  ('maverick-mono-14oz', 'Maverick Mono 14oz', 'Training Gloves', 'All-black training glove. No logos, no noise.', 'Engineered microfibre shell. Layered foam. Velcro wrist strap.', 119.00, 89.00, '["/images/prod-mav-mono.jpg"]', true, true, 7),
  ('maverick-mono-10oz', 'Maverick Mono 10oz', 'Competition Gloves', 'Competition weight, contest-ready.', 'Engineered microfibre shell. Lace-up closure. Competition padding.', 114.00, NULL, '["/images/prod-mav-mono.jpg"]', false, false, 8),
  ('maverick-sand-16oz', 'Maverick Sand 16oz', 'Sparring Gloves', 'Warm sand colourway with contrast palm venting.', 'Engineered microfibre shell. Layered foam. Mesh palm.', 129.00, 99.00, '["/images/prod-mav-sand.jpg"]', true, true, 9),
  ('maverick-sand-12oz', 'Maverick Sand 12oz', 'Bag Gloves', 'Sand, stripped back for bag rounds.', 'Engineered microfibre shell. Layered foam. Mesh palm.', 109.00, 84.00, '["/images/prod-mav-sand.jpg"]', false, true, 10)
) AS v(slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, sort_order)
WHERE c.slug = 'maverick';

-- Nova products
INSERT INTO public.products (collection_id, slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, featured, sort_order)
SELECT c.id, v.slug, v.name, v.category, v.description, v.details, v.price, v.sale_price, v.images::jsonb, true, true, false, v.sort_order
FROM public.collections c, (VALUES
  ('nova-ivory-14oz', 'Nova Ivory 14oz', 'Training Gloves', 'Featherweight ivory shell with an anatomical grip bar.', 'Anatomical grip bar. Dual-density foam. Antimicrobial lining.', 149.00, 109.00, '["/images/prod-nova-ivory.jpg"]', 1),
  ('nova-eclipse-12oz', 'Nova Eclipse 12oz', 'Bag Gloves', 'Matte black Nova built for explosive combinations.', 'Anatomical grip bar. Dual-density foam. Antimicrobial lining.', 139.00, 104.00, '["/images/prod-nova-eclipse.jpg"]', 2),
  ('nova-solar-16oz', 'Nova Solar 16oz', 'Sparring Gloves', 'Solar gold accents on a low-profile sparring shell.', 'Anatomical grip bar. Dual-density foam. Antimicrobial lining.', 159.00, 119.00, '["/images/prod-nova-solar.jpg"]', 3)
) AS v(slug, name, category, description, details, price, sale_price, images, sort_order)
WHERE c.slug = 'nova';

-- Variants for every product that has them
INSERT INTO public.product_variants (product_id, color, fastening, stock)
SELECT p.id, col.color, f.fastening,
  CASE WHEN p.in_stock = false THEN 0
       WHEN f.fastening = 'Laced' AND col.color = 'Bone' THEN 0
       ELSE 12 END
FROM public.products p
CROSS JOIN (VALUES ('Onyx'), ('Bone'), ('Oxblood')) AS col(color)
CROSS JOIN (VALUES ('Velcro'), ('Laced')) AS f(fastening)
WHERE p.has_variants = true;
