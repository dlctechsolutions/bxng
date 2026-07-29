import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password | 44 Boxing" },
      { name: "description", content: "Choose a new password for your 44 Boxing account." },
      { property: "og:title", content: "Set a New Password | 44 Boxing" },
      { property: "og:description", content: "Choose a new password for your 44 Boxing account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/account", replace: true });
  }

  return (
    <section className="shell grid min-h-[70vh] items-center py-16">
      <form onSubmit={submit} className="mx-auto w-full max-w-md">
        <p className="eyebrow">Account security</p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)]">New password</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Open this page from the reset link in your email, then choose a new password.
        </p>
        <div className="mt-8 space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
          Update password
        </Button>
      </form>
    </section>
  );
}
