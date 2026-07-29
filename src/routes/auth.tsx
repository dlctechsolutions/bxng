import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/use-auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Login or Sign Up | 44 Boxing" },
      {
        name: "description",
        content: "Sign in to your 44 Boxing account to track orders and save your wishlist.",
      },
      { property: "og:title", content: "Login or Sign Up | 44 Boxing" },
      { property: "og:description", content: "Access your 44 Boxing account." },
    ],
  }),
  component: AuthPage,
});

function safePath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const target = safePath(search.redirect);

  useEffect(() => {
    if (!loading && user) navigate({ to: target, replace: true });
  }, [user, loading, navigate, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: target, replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: target, replace: true });
  }

  return (
    <section className="shell grid min-h-[70vh] items-center py-16 md:py-24">
      <div className="mx-auto w-full max-w-md">
        <p className="eyebrow">
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Join 44" : "Reset access"}
        </p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)]">
          {mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Forgot password"}
        </h1>

        <form onSubmit={submit} className="mt-10 space-y-5">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="my-7 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" className="w-full" size="lg" onClick={google}>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-8 space-y-2 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              <p>
                No account?{" "}
                <button type="button" className="link-underline text-foreground" onClick={() => setMode("signup")}>
                  Sign up
                </button>
              </p>
              <p>
                <button type="button" className="link-underline" onClick={() => setMode("forgot")}>
                  Forgot your password?
                </button>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{" "}
              <button type="button" className="link-underline text-foreground" onClick={() => setMode("login")}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
