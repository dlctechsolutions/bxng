import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { amIAdmin, claimAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Admin Console | 44 Boxing" },
      { name: "description", content: "Manage 44 Boxing products, collections, orders and customers." },
      { property: "og:title", content: "Admin Console | 44 Boxing" },
      { property: "og:description", content: "Internal console for the 44 Boxing storefront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/users", label: "Users" },
] as const;

function AdminLayout() {
  const check = useServerFn(amIAdmin);
  const claim = useServerFn(claimAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "me"], queryFn: () => check({}) });

  if (isLoading) {
    return <section className="shell py-24 text-sm text-muted-foreground">Checking access…</section>;
  }

  if (!data?.isAdmin) {
    return (
      <section className="shell max-w-xl py-24">
        <p className="eyebrow">Restricted</p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)]">Admin access required</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This account isn't an administrator. If this is a brand new store and no admin exists yet, you can
          claim ownership once.
        </p>
        <Button
          className="mt-8"
          onClick={async () => {
            try {
              const res = await claim({});
              if (res.claimed) {
                toast.success("Admin access granted.");
                await queryClient.invalidateQueries({ queryKey: ["admin"] });
              } else {
                toast.error("An admin already exists — ask them to grant you access.");
              }
            } catch {
              toast.error("Could not claim admin access.");
            }
          }}
        >
          Claim admin access
        </Button>
      </section>
    );
  }

  return (
    <section className="shell py-14 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">44 Boxing</p>
          <h1 className="mt-3 text-[clamp(1.8rem,4vw,3rem)]">Admin console</h1>
        </div>
        <Link to="/" className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
          View storefront
        </Link>
      </div>
      <nav className="mt-8 flex flex-wrap gap-6 border-b border-border pb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/admin" }}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
            className="transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="pt-10">
        <Outlet />
      </div>
    </section>
  );
}
