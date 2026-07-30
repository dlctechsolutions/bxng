import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Variant = {
  id: string;
  product_id: string;
  color: string;
  fastening: string;
  size: string | null;
  sku: string | null;
  stock: number;
};


export type Product = {
  id: string;
  collection_id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  details: string | null;
  price: string | number;
  sale_price: string | number | null;
  images: string[];
  has_variants: boolean;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  collection?: { slug: string; name: string } | null;
  product_variants?: Variant[];
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  banner_image: string | null;
  sort_order: number;
};

function client() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const PRODUCT_FIELDS =
  "id, collection_id, slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, featured, sort_order, collection:collections(slug, name), product_variants(id, product_id, color, fastening, stock)";

export const getStorefront = createServerFn({ method: "GET" }).handler(async () => {
  const db = client();
  const [collections, products] = await Promise.all([
    db.from("collections").select("*").order("sort_order"),
    db.from("products").select(PRODUCT_FIELDS).order("sort_order"),
  ]);
  if (collections.error) throw collections.error;
  if (products.error) throw products.error;
  return {
    collections: (collections.data ?? []) as unknown as Collection[],
    products: (products.data ?? []) as unknown as Product[],
  };
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const db = client();
    const { data: product, error } = await db
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    if (!product) return null;
    const p = product as unknown as Product;
    const { data: related } = await db
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("collection_id", p.collection_id)
      .neq("id", p.id)
      .order("sort_order")
      .limit(3);
    return { product: p, related: (related ?? []) as unknown as Product[] };
  });
