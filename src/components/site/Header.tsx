import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Heart, Menu, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { money } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

const collections = [
  { slug: "luxe", label: "Luxe Collection" },
  { slug: "maverick", label: "Maverick Collection" },
  { slug: "nova", label: "Nova Collection" },
];

export function Header() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:h-20">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid size-9 shrink-0 place-items-center lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] border-border bg-background sm:w-80">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-10 flex flex-col gap-6 px-5">
                <Link
                  to="/the-44-story"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-2xl uppercase"
                >
                  The 44 Story
                </Link>
                <div>
                  <p className="eyebrow">Boxing Gloves</p>
                  <div className="mt-3 flex flex-col gap-3">
                    {collections.map((c) => (
                      <Link
                        key={c.slug}
                        to="/collections/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setMobileOpen(false)}
                        className="font-display text-xl uppercase text-muted-foreground"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow">My Account</p>
                  <div className="mt-3 flex flex-col gap-3 text-sm">
                    {user ? (
                      <>
                        <Link to="/account" onClick={() => setMobileOpen(false)}>
                          My Account
                        </Link>
                        <Link to="/orders" onClick={() => setMobileOpen(false)}>
                          Orders
                        </Link>
                        <Link to="/account-details" onClick={() => setMobileOpen(false)}>
                          Account Details
                        </Link>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileOpen(false)}>
                        Login / Sign Up
                      </Link>
                    )}
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                      Wishlist
                    </Link>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Logo />
        </div>

        <nav className="hidden items-center justify-center gap-9 lg:flex">
          <Link
            to="/the-44-story"
            className="nav-link text-[0.7rem] font-bold uppercase tracking-[0.22em]"
          >
            The 44 Story
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] outline-none data-[state=open]:text-accent [&[data-state=open]_svg]:rotate-180">
              Boxing Gloves{" "}
              <ChevronDown className="size-3.5 transition-transform duration-300" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="border-border bg-popover">
              {collections.map((c) => (
                <DropdownMenuItem key={c.slug} asChild>
                  <Link to="/collections/$slug" params={{ slug: c.slug }}>
                    {c.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center justify-end gap-1 md:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="My account"
              className="hidden size-9 place-items-center outline-none sm:grid"
            >
              <User className="size-[1.15rem]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-border bg-popover">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account-details">Account Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth">Login / Sign Up</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/wishlist" aria-label="Wishlist" className="hidden size-9 place-items-center sm:grid">
            <Heart className="size-[1.15rem]" />
          </Link>

          <Button
            variant="ghost"
            onClick={() => cart.setOpen(true)}
            className="gap-2 px-2 md:px-3"
            aria-label={`Cart, ${cart.count} items`}
          >
            <span className="relative">
              <ShoppingBag className="size-[1.15rem]" />
              {cart.count > 0 && (
                <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-accent text-[0.5625rem] font-bold text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </span>
            <span className="hidden text-xs font-semibold tabular-nums md:inline">
              {money(cart.subtotal)}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
