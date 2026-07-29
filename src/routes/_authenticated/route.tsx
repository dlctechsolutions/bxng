import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AccountLayout,
});

const links = [
  { to: "/account", label: "Overview" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/details", label: "Account details" },
] as const;

function AccountLayout() {
  return (
    <section className="shell py-16 md:py-24">
      <p className="eyebrow">44 Boxing</p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)]">My account</h1>
      <nav className="mt-10 flex flex-wrap gap-6 border-b border-border pb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/account" }}
            activeProps={{ className: "text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
            className="transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="pt-12">
        <Outlet />
      </div>
    </section>
  );
}
