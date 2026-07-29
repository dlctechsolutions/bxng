import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";

export function CartDrawer() {
  const cart = useCart();

  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent side="right" className="flex w-full flex-col border-border bg-background sm:max-w-md">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle className="text-lg tracking-tight">
            Your bag ({cart.count})
          </SheetTitle>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button asChild onClick={() => cart.setOpen(false)}>
              <Link to="/collections/$slug" params={{ slug: "luxe" }}>
                Explore all boxing gloves
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {cart.items.map((item) => (
                <div key={item.key} className="grid grid-cols-[80px_minmax(0,1fr)_auto] gap-4">
                  <img
                    src={item.image ?? "/images/prod-luxe-onyx.jpg"}
                    alt={item.name}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-20 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    {item.variantLabel && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
                    <p className="mt-1 text-sm">{money(item.unitPrice)}</p>
                    <div className="mt-2 inline-flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="grid size-7 place-items-center hover:bg-secondary"
                        onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-xs tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="grid size-7 place-items-center hover:bg-secondary"
                        onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => cart.remove(item.key)}
                    className="self-start text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-border px-6 py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="eyebrow">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums">{money(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>
              <Button asChild className="w-full" onClick={() => cart.setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full"
                onClick={() => cart.setOpen(false)}
              >
                <Link to="/cart">View bag</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
