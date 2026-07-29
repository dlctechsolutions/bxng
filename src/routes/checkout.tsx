import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { money } from "@/lib/format";
import { placeOrder } from "@/lib/account.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | 44 Boxing" },
      { name: "description", content: "Complete your 44 Boxing order — shipping and payment." },
      { property: "og:title", content: "Checkout | 44 Boxing" },
      { property: "og:description", content: "Complete your 44 Boxing order." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const submitOrder = useServerFn(placeOrder);
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    phone: "",
  });

  const shipping = cart.subtotal > 100 || cart.subtotal === 0 ? 0 : 4.95;
  const total = cart.subtotal + shipping;

  const mutation = useMutation({
    mutationFn: () =>
      submitOrder({
        data: {
          email: form.email || user?.email || "",
          shippingAddress: {
            fullName: form.fullName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            postcode: form.postcode,
            country: form.country,
            phone: form.phone,
          },
          items: cart.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            variantLabel: i.variantLabel,
            image: i.image,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
          })),
        },
      }),
    onSuccess: (result) => {
      cart.clear();
      toast.success(`Order ${result.orderNumber} placed`);
      navigate({ to: "/account/orders" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (cart.items.length === 0) {
    return (
      <section className="shell py-24 text-center">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)]">Checkout</h1>
        <p className="mt-6 text-sm text-muted-foreground">Your bag is empty.</p>
        <Button asChild className="mt-6">
          <Link to="/collections/$slug" params={{ slug: "luxe" }}>
            Explore all boxing gloves
          </Link>
        </Button>
      </section>
    );
  }

  if (!loading && !user) {
    return (
      <section className="shell py-24 text-center">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)]">Checkout</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Sign in to complete your order and keep track of it in your account.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/checkout" }}>
            Sign in to continue
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="shell py-16 md:py-24">
      <h1 className="text-[clamp(2rem,5vw,3.5rem)]">Checkout</h1>
      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <h2 className="eyebrow">Contact</h2>
            <div className="mt-5 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email || user?.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h2 className="eyebrow">Shipping address</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="line2">Address line 2 (optional)</Label>
                <Input id="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" required value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="eyebrow">Payment</h2>
            <p className="mt-5 border border-border p-6 text-sm leading-relaxed text-muted-foreground">
              Card payment is not live yet. Place the order now and it will be saved to your account
              as pending — once card payments are switched on, checkout will hand off to the secure
              payment page before confirming.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Placing order…" : `Place order · ${money(total)}`}
          </Button>
        </form>

        <aside className="h-fit border border-border p-7">
          <h2 className="text-lg">Your bag</h2>
          <ul className="mt-6 space-y-4">
            {cart.items.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.variantLabel ? `${item.variantLabel} · ` : ""}Qty {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{money(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-7 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{money(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{shipping === 0 ? "Free" : money(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
