import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the signed-in user's role. Every account gets the base "user"
 * (shopper) role on first call; "admin" is only ever granted by an admin.
 */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw error;

    const roles = (data ?? []).map((r: { role: string }) => r.role);

    if (!roles.includes("user")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "user" })
        .select()
        .maybeSingle();
      roles.push("user");
    }

    const isAdmin = roles.includes("admin");
    return { isAdmin, role: isAdmin ? ("admin" as const) : ("user" as const) };
  });
