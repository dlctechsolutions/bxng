import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({
    meta: [
      { title: "My Account | 44 Boxing" },
      { name: "description", content: "Manage your 44 Boxing orders, details and wishlist." },
      { property: "og:title", content: "My Account | 44 Boxing" },
      { property: "og:description", content: "Manage your 44 Boxing account." },
    ],
  }),
  component: AccountOverview,
});

function AccountOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{user?.email}</span>
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/account/orders" className="border border-border p-6 transition-colors hover:border-foreground">
          <h2 className="text-lg">Orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track and review past purchases.</p>
        </Link>
        <Link to="/account/details" className="border border-border p-6 transition-colors hover:border-foreground">
          <h2 className="text-lg">Account details</h2>
          <p className="mt-2 text-sm text-muted-foreground">Update your name and contact number.</p>
        </Link>
        <Link to="/wishlist" className="border border-border p-6 transition-colors hover:border-foreground">
          <h2 className="text-lg">Wishlist</h2>
          <p className="mt-2 text-sm text-muted-foreground">Gloves you've saved for later.</p>
        </Link>
        <Link to="/reset-password" className="border border-border p-6 transition-colors hover:border-foreground">
          <h2 className="text-lg">Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">Set a new password for your account.</p>
        </Link>
      </div>
      <Button variant="outline" className="mt-10" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
