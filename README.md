# 44 Boxing

Build an ecommerce storefront for a boxing equipment brand called "44 Boxing." Dark, premium, minimalist aesthetic — black background, white/off-white text, bold uppercase headings, generous spacing, editorial photography-led layout (similar to a modern DTC sportswear brand).

Pages / structure:

Header — logo (centered or left), nav: "The 44 Story", "Boxing Gloves" (dropdown: Luxe Collection / Maverick Collection / Nova Collection), "My Account" (dropdown: Login/Sign Up, My Account, Wishlist, Orders, Account Details), cart icon with item count + running total.

Homepage sections, in order:

Hero banner: full-width image, headline "Founding Collection — Last of the First", subtext "Browse the last of the first", CTA "Explore All Boxing Gloves"

Product grid: 3 featured "Luxe" products — image, name, sale price (strikethrough original + reduced price), "Select Options" button, wishlist heart icon, "Quick View" link, discount badge (e.g. "Up to -27%")

"Maverick Range" banner section with CTA

Maverick product grid (10 products) — same card pattern, some "Out of Stock", some "Add to Cart" directly (no variants)

"Nova Range" banner section with CTA

Nova product grid (3 products) — same pattern

Brand story section: full-bleed image + copy block ("Driven by discipline... top quality, affordable boxing gloves"), bullet list (Driven by Discipline / Backed by Quality / For Those That Never Settle), CTA buttons "Our Story" + "Shop Now"

Footer: logo + tagline, company info, "Useful Links" nav (mirrors header), social icons (Instagram, Facebook, TikTok, LinkedIn), copyright line

Product listing pages per collection (Luxe / Maverick / Nova) with filter by category

Product detail page — gallery, variant selector (color/lacing type), price, add-to-cart, description tabs, related products

Cart page / cart drawer — line items, quantity edit, subtotal, checkout CTA

Checkout — shipping + payment (Stripe)

Account pages — login/signup, order history, edit account details, password reset

Wishlist page — saved products with add-to-cart

Functionality:

Use Supabase for products, variants, inventory, wishlist, and order storage

Supabase Auth for login/signup/account pages

Stripe for checkout/payment

Product variants (color + fastening type: laced/velcro) with per-variant stock and "Out of Stock" state

Sale pricing support (original price strikethrough + discounted price + % off badge)

Wishlist persisted per logged-in user

Responsive, mobile-first

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bxng.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f1c1ac19-b926-46f1-953c-36f2ebe56e3b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
