import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

export function NewsletterSignup() {
  const subscribe = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      const res = await subscribe({ data: { email: value, source: "footer" } });
      if (res.ok) {
        setDone(true);
        setEmail("");
        toast.success(res.alreadySubscribed ? "You're already on the list." : "You're in.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h4 className="text-sm tracking-[0.2em] uppercase">Join the 44</h4>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Drops, restocks and ringside stories. No noise.
      </p>
      {done ? (
        <p className="mt-5 text-sm text-accent">Welcome to the 44. Check your inbox.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex max-w-sm border border-border focus-within:border-accent">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label="Subscribe to the newsletter"
            className="grid w-12 shrink-0 place-items-center border-l border-border transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60 focus-flash"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          </button>
        </form>
      )}
    </div>
  );
}
