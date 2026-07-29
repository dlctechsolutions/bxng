import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return { isAdmin: Boolean(data) };
  });

/** Only succeeds while no admin exists yet (enforced in the database). */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_admin");
    if (error) throw error;
    return { claimed: Boolean(data) };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [products, collections, orders, profiles, variants] = await Promise.all([
      context.supabase.from("products").select("id", { count: "exact", head: true }),
      context.supabase.from("collections").select("id", { count: "exact", head: true }),
      context.supabase.from("orders").select("id, total, status, order_number, created_at, email"),
      context.supabase.from("profiles").select("id", { count: "exact", head: true }),
      context.supabase.from("product_variants").select("id, stock"),
    ]);
    if (orders.error) throw orders.error;
    if (variants.error) throw variants.error;

    const revenue = (orders.data ?? []).reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
    const recent = [...(orders.data ?? [])]
      .sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 6);

    return {
      productCount: products.count ?? 0,
      collectionCount: collections.count ?? 0,
      orderCount: orders.data?.length ?? 0,
      customerCount: profiles.count ?? 0,
      revenue,
      outOfStockVariants: (variants.data ?? []).filter((v: any) => Number(v.stock) <= 0).length,
      recent,
    };
  });

/* ---------------- Products ---------------- */

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select(
        "id, collection_id, slug, name, category, description, details, price, sale_price, images, has_variants, in_stock, featured, sort_order, product_variants(id, product_id, color, fastening, stock)",
      )
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  });

export type ProductInput = {
  id?: string;
  collection_id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  details: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
  has_variants: boolean;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
};

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ProductInput) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = { ...data };
    if (!payload.id) delete payload.id;
    const { data: row, error } = await context.supabase
      .from("products")
      .upsert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return row;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Variants ---------------- */

export const adminSaveVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { id?: string; product_id: string; color: string; fastening: string; stock: number }) =>
      data,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload: any = { ...data };
    if (!payload.id) delete payload.id;
    const { error } = await context.supabase.from("product_variants").upsert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("product_variants").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Collections ---------------- */

export const adminListCollections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("collections").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  });

export type CollectionInput = {
  id?: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  banner_image: string | null;
  sort_order: number;
};

export const adminSaveCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CollectionInput) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload: any = { ...data };
    if (!payload.id) delete payload.id;
    const { error } = await context.supabase.from("collections").upsert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("collections").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Orders ---------------- */

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, status, subtotal, shipping, total, email, shipping_address, created_at, user_id, order_items(id, name, variant_label, unit_price, quantity, image)",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!allowed.includes(data.status)) throw new Error("Unknown status");
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ---------------- Users ---------------- */

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: authUsers, error: authError }, profiles, roles, orders] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      context.supabase.from("profiles").select("id, full_name, phone, created_at"),
      context.supabase.from("user_roles").select("user_id, role"),
      context.supabase.from("orders").select("user_id, total"),
    ]);
    if (authError) throw authError;

    const profileById = new Map((profiles.data ?? []).map((p: any) => [p.id, p]));
    const rolesById = new Map<string, string[]>();
    for (const r of roles.data ?? []) {
      rolesById.set(r.user_id, [...(rolesById.get(r.user_id) ?? []), r.role]);
    }
    const spendById = new Map<string, { count: number; total: number }>();
    for (const o of orders.data ?? []) {
      const prev = spendById.get(o.user_id) ?? { count: 0, total: 0 };
      spendById.set(o.user_id, { count: prev.count + 1, total: prev.total + Number(o.total ?? 0) });
    }

    return (authUsers?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      fullName: (profileById.get(u.id) as any)?.full_name ?? null,
      phone: (profileById.get(u.id) as any)?.phone ?? null,
      roles: rolesById.get(u.id) ?? [],
      orderCount: spendById.get(u.id)?.count ?? 0,
      spend: spendById.get(u.id)?.total ?? 0,
    }));
  });

export const adminSetAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; makeAdmin: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && !data.makeAdmin) {
      throw new Error("You cannot remove your own admin access.");
    }
    if (data.makeAdmin) {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw error;
    }
    return { ok: true };
  });

export const adminListReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("product_reviews")
      .select("id, product_id, user_id, author_name, rating, title, body, status, created_at, product:products(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSetReviewStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => {
    if (!["pending", "approved", "rejected"].includes(data.status)) {
      throw new Error("Invalid review status.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("product_reviews")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("product_reviews").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
