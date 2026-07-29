import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getStorefront } from "@/lib/catalog.functions";
import { useWishlist } from "@/lib/use-wishlist";

const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: () => getStorefront(),
});

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist | 44 Boxing" },
      { name: "description", content: "The 44 Boxing gloves you've saved for later." },
      { property: "og:title", content: "Wishlist | 44 Boxing" },
      { property: "og:description", content: "The 44 Boxing gloves you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { data } = useQuery(storefrontQuery);
  const wishlist = useWishlist();
  const saved = (data?.products ?? []).filter((p) => wishlist.productIds.includes(p.id));

  return (
    <section className="shell py-16 md:py-24">
      <p className="eyebrow">Saved</p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3.5rem)]">Wishlist</h1>

      {!wishlist.isSignedIn ? (
        <div className="mt-12 border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to save gloves to your wishlist and find them on any device.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth" search={{ redirect: "/wishlist" }}>
              Sign in
            </Link>
          </Button>
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-12 border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
          <Button asChild className="mt-6">
            <Link to="/collections/$slug" params={{ slug: "luxe" }}>
              Explore all boxing gloves
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12">
          <ProductGrid products={saved} columns={4} />
        </div>
      )}
    </section>
  );
}
