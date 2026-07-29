import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag | 44 Boxing" },
      { name: "description", content: "Review the boxing gloves in your 44 Boxing bag." },
      { property: "og:title", content: "Your Bag | 44 Boxing" },
      { property: "og:description", content: "Review your 44 Boxing bag before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const shipping = cart.subtotal > 100 || cart.subtotal === 0 ? 0 : 4.95;

  return (
    <section className="shell py-16 md:py-24">
      <h1 className="text-[clamp(2rem,5vw,3.5rem)]">Your bag</h1>

      {cart.items.length === 0 ? (
        <div className="mt-12 border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Button asChild className="mt-6">
            <Link to="/collections/$slug" params={{ slug: "luxe" }}>
              Explore all boxing gloves
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="divide-y divide-border border-y border-border">
            {cart.items.map((item) => (
              <div key={item.key} className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-5 py-6">
                <Link to="/product/$slug" params={{ slug: item.slug }}>
                  <img
                    src={item.image ?? "/images/prod-luxe-onyx.jpg"}
                    alt={item.name}
                    loading="lazy"
                    width={192}
                    height={192}
                    className="size-24 object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <h2 className="truncate text-base">
                    <Link to="/product/$slug" params={{ slug: item.slug }} className="link-underline">
                      {item.name}
                    </Link>
                  </h2>
                  {item.variantLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <p className="mt-2 text-sm">{money(item.unitPrice)}</p>
                  <div className="mt-3 inline-flex items-center border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="grid size-8 place-items-center hover:bg-secondary"
                      onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-9 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="grid size-8 place-items-center hover:bg-secondary"
                      onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => cart.remove(item.key)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                  <span className="text-sm font-semibold tabular-nums">
                    {money(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-border p-7">
            <h2 className="text-lg">Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
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
                <dd className="tabular-nums">{money(cart.subtotal + shipping)}</dd>
              </div>
            </dl>
            <Button asChild className="mt-7 w-full" size="lg">
              <Link to="/checkout">Checkout</Link>
            </Button>
            <button
              type="button"
              onClick={cart.clear}
              className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Clear bag
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
