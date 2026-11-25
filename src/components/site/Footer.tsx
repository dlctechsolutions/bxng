import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin, Music2 } from "lucide-react";
import { Logo } from "./Logo";
import { NewsletterSignup } from "./NewsletterSignup";

const links = [
  { to: "/the-44-story", label: "The 44 Story" },
  { to: "/collections/$slug", params: { slug: "nova" }, label: "Nova — Tier I" },
  { to: "/collections/$slug", params: { slug: "maverick" }, label: "Maverick — Tier II" },
  { to: "/collections/$slug", params: { slug: "luxe" }, label: "Luxe — Tier III" },
  { to: "/wishlist", label: "Wishlist" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/details", label: "Account Details" },
] as const;

const socials = [
  { label: "Instagram", Icon: Instagram, href: "https://instagram.com" },
  { label: "Facebook", Icon: Facebook, href: "https://facebook.com" },
  { label: "TikTok", Icon: Music2, href: "https://tiktok.com" },
  { label: "LinkedIn", Icon: Linkedin, href: "https://linkedin.com" },
];

export function Footer() {
  return (
    <footer className="mt-28 border-t border-border bg-surface">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Top quality, affordable boxing gloves for those that never settle. Built in the dark
            hours, tested in the ring.
          </p>
          <div className="mt-7 flex gap-3">
            {socials.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid size-10 place-items-center border border-border transition-colors hover:border-accent hover:text-accent focus-flash"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em]">Useful Links</h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {links.map((l) => (
              <li key={l.label}>
                {"params" in l ? (
                  <Link to={l.to} params={l.params} className="link-underline">
                    {l.label}
                  </Link>
                ) : (
                  <Link to={l.to} className="link-underline">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em]">Company</h4>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <p>44 Boxing Ltd</p>
            <p>
              <a href="mailto:info@44bxng.com" className="link-underline">
                info@44bxng.com
              </a>
            </p>
            
          </div>
        </div>

        <NewsletterSignup />
      </div>

      <div className="border-t border-border">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 44 Boxing. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">Driven by discipline</p>
        </div>
      </div>
    </footer>
  );
}
