import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Check } from "@/components/site/icons";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getStorefront } from "@/lib/catalog.functions";
import { cn } from "@/lib/utils";

const storefrontQuery = queryOptions({
  queryKey: ["storefront"],
  queryFn: () => getStorefront(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "44 Boxing — Founding Collection, Last of the First" },
      {
        name: "description",
        content:
          "Premium boxing gloves built for those that never settle. Shop the Luxe, Maverick and Nova collections while the founding run lasts.",
      },
      { property: "og:title", content: "44 Boxing — Founding Collection, Last of the First" },
      {
        property: "og:description",
        content: "Premium boxing gloves built for those that never settle. Shop the Luxe, Maverick and Nova collections while the founding run lasts.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(storefrontQuery);
  },
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(storefrontQuery);
  const byCollection = (slug: string) =>
    data.products.filter((p) => p.collection?.slug === slug);

  const luxe = byCollection("luxe").slice(0, 3);
  const maverick = byCollection("maverick").slice(0, 10);
  const nova = byCollection("nova").slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[78vh] overflow-hidden md:min-h-[86vh]">
        <img
          src="/images/hero.jpg"
          alt="44BXNG athlete on a rooftop overlooking the city skyline"
          width={2200}
          height={1650}
          className="absolute inset-0 size-full object-cover object-center md:object-[center_top]"

        />
        <div className="pointer-events-none absolute inset-0 editorial-overlay" />
        <div className="pointer-events-none absolute inset-0 scrim-left" />
        <div className="pointer-events-none absolute inset-0 vignette" />
        <div className="shell relative flex min-h-[78vh] flex-col justify-end pt-28 pb-16 md:min-h-[86vh] md:pt-40 md:pb-24">
          <p className="eyebrow">Founding Collection</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.75rem,8vw,6.5rem)]">
            Founding Collection
            <span className="block text-muted-foreground">Last of the First</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            Browse the last of the first.
          </p>
          <div className="mt-9">
            <Button asChild size="lg">
              <Link to="/collections/$slug" params={{ slug: "luxe" }}>
                Explore all boxing gloves <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Luxe featured */}
      <section className="shell pt-24 md:pt-32">
        <SectionHead
          eyebrow="Luxe Collection"
          title="The Founding Three"
          href="luxe"
          cta="Shop Luxe"
        />
        <div className="mt-12">
          <ProductGrid products={luxe} />
        </div>
      </section>

      <RangeBanner
        image="/images/banner-maverick.jpg"
        eyebrow="Maverick Range"
        title="Built To Break Rules"
        copy="Ten silhouettes engineered for volume training. Same core, no compromise, sharper price."
        slug="maverick"
        align="left"
      />

      <section className="shell">
        <ProductGrid products={maverick} columns={4} />
      </section>

      <RangeBanner
        image="/images/banner-nova.jpg"
        eyebrow="Nova Range"
        title="The New Standard"
        copy="Lightweight, responsive and low-profile. Made for speed and the rounds that decide it."
        slug="nova"
        align="right"
      />

      <section className="shell">
        <ProductGrid products={nova} />
      </section>

      {/* Brand story */}
      <section className="mt-28 border-y border-border bg-surface">
        <div className="grid lg:grid-cols-2">
          <div className="relative isolate overflow-hidden">
            <img
              src="/images/story-alt.jpg"
              alt="44 Boxing athlete working the ring with a coach"
              loading="lazy"
              width={1400}
              height={1200}
              className="h-full max-h-[46rem] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 vignette-soft" />
          </div>
          <div className="flex flex-col justify-center gap-8 px-6 py-16 md:px-14 md:py-24">
            <div>
              <p className="eyebrow">The 44 Story</p>
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.5rem)]">
                Driven by discipline
              </h2>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              44 Boxing started in a cold gym at 4am with one problem: the gloves that felt right
              cost too much, and the gloves that were affordable fell apart. So we built our own —
              top quality, affordable boxing gloves, made for the people who show up when nobody
              is watching.
            </p>
            <ul className="space-y-4">
              {[
                "Driven by Discipline",
                "Backed by Quality",
                "For Those That Never Settle",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-accent" />
                  <span className="text-sm font-semibold uppercase tracking-[0.14em]">{point}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/the-44-story">Our story</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/collections/$slug" params={{ slug: "luxe" }}>
                  Shop now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-[clamp(1.75rem,4vw,3rem)]">{title}</h2>
      </div>
      <Link
        to="/collections/$slug"
        params={{ slug: href }}
        className="link-underline shrink-0 text-[0.7rem] font-bold uppercase tracking-[0.2em]"
      >
        {cta}
      </Link>
    </div>
  );
}

function RangeBanner({
  image,
  eyebrow,
  title,
  copy,
  slug,
  align,
}: {
  image: string;
  eyebrow: string;
  title: string;
  copy: string;
  slug: string;
  align: "left" | "right";
}) {
  return (
    <section className="relative isolate mt-28 mb-16 overflow-hidden">
      <img
        src={image}
        alt={title}
        loading="lazy"
        width={1600}
        height={900}
        className="h-[26rem] w-full object-cover md:h-[34rem]"
      />
      <div className="pointer-events-none absolute inset-0 bg-background/35" />
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          align === "right" ? "scrim-right" : "scrim-left",
        )}
      />
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div className="shell absolute inset-0 flex items-center">
        <div
          className={
            align === "right"
              ? "ml-auto max-w-lg text-left md:text-right"
              : "max-w-lg"
          }
        >
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 text-[clamp(2rem,5.5vw,4rem)]">{title}</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{copy}</p>
          <div className="mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/collections/$slug" params={{ slug }}>
                Shop the range <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
