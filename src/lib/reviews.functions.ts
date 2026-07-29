import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Review = {
  id: string;
  product_id: string;
  author_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
};

const REVIEW_FIELDS = "id, product_id, author_name, rating, title, body, status, created_at";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Approved reviews for a product — public, safe for SSR. */
export const getProductReviews = createServerFn({ method: "GET" })
  .inputValidator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: rows, error } = await db
      .from("product_reviews")
      .select(REVIEW_FIELDS)
      .eq("product_id", data.productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const reviews = (rows ?? []) as unknown as Review[];
    const count = reviews.length;
    const average = count
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;
    return { reviews, count, average };
  });

/** The signed-in customer's own review for a product (any status). */
export const getMyReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { productId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("product_reviews")
      .select(REVIEW_FIELDS)
      .eq("product_id", data.productId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return (row ?? null) as unknown as Review | null;
  });

export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    productId: string;
    rating: number;
    title?: string;
    body?: string;
    authorName?: string;
  }) => {
    const rating = Math.round(Number(data.rating));
    if (!data.productId) throw new Error("Missing product.");
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }
    return {
      productId: data.productId,
      rating,
      title: (data.title ?? "").trim().slice(0, 120) || null,
      body: (data.body ?? "").trim().slice(0, 2000) || null,
      authorName: (data.authorName ?? "").trim().slice(0, 60) || null,
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("product_reviews").upsert(
      {
        product_id: data.productId,
        user_id: context.userId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        author_name: data.authorName,
        status: "pending",
      },
      { onConflict: "product_id,user_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const deleteMyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { productId: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("product_reviews")
      .delete()
      .eq("product_id", data.productId)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
