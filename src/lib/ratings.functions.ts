import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type RatingSummary = { average: number; count: number };

/** Approved-review rating summaries for every product — public, safe for SSR. */
export const getRatingSummaries = createServerFn({ method: "GET" }).handler(async () => {
  const db = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await db
    .from("product_reviews")
    .select("product_id, rating")
    .eq("status", "approved");
  if (error) throw error;

  const totals: Record<string, { sum: number; count: number }> = {};
  for (const row of data ?? []) {
    const t = (totals[row.product_id] ??= { sum: 0, count: 0 });
    t.sum += row.rating;
    t.count += 1;
  }
  const summaries: Record<string, RatingSummary> = {};
  for (const [id, t] of Object.entries(totals)) {
    summaries[id] = { average: Math.round((t.sum / t.count) * 10) / 10, count: t.count };
  }
  return summaries;
});
