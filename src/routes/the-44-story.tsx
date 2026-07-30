import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/the-44-story")({
  head: () => ({
    meta: [
      { title: "The 44 Story — Driven by Discipline | 44 Boxing" },
      {
        name: "description",
        content:
          "Why 44 Boxing exists: top quality, affordable boxing gloves built for those that never settle.",
      },
      { property: "og:title", content: "The 44 Story — Driven by Discipline" },
      {
        property: "og:description",
        content: "The story behind 44 Boxing and the founding collection.",
      },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src="/images/story.jpg"
          alt="44 Boxing athlete shadow boxing in the ring"
          width={1400}
          height={1200}
          className="h-[26rem] w-full object-cover object-center md:h-[34rem]"
        />
        <div className="pointer-events-none absolute inset-0 bg-background/25" />
        <div className="pointer-events-none absolute inset-0 editorial-overlay" />
        <div className="pointer-events-none absolute inset-0 vignette" />
        <div className="shell absolute inset-0 flex flex-col justify-end pb-14">
          <p className="eyebrow">Est. 44</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.25rem,7vw,5rem)]">The 44 Story</h1>
        </div>
      </section>

      <section className="shell grid gap-14 py-20 lg:grid-cols-[1fr_1.2fr] md:py-28">
        <div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)]">Driven by discipline</h2>
        </div>
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            At 44BXNG, we believe top-quality boxing gloves shouldn’t cost a fortune. Founded by a
            former boxer turned coach, we set out to create gear that’s built to perform, look good,
            and stay affordable—because boxing’s for everyone.
          </p>
          <p>
            We know the sport inside out. It’s about discipline, not just power. But great gloves
            were either overpriced or underwhelming—so we changed that. Our designs take inspiration
            from timeless styles, and we focus on the details. Clean looks, quality materials, and
            minimal branding for maximum impact.
          </p>
          <p>
            We’ve been fine-tuning our gloves from day one—listening to fighters, testing materials,
            and making improvements that matter.
          </p>
          <p>
            But 44BXNG is more than gloves. We’re building a community. From sponsoring local gyms
            to backing rising talent with free gear, we’re here to support the sport from the ground
            up.
          </p>
          <p>
            We’re learning, growing, and always looking for ways to give back. This is just the
            beginning.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="shell grid gap-10 py-16 md:grid-cols-3 md:py-24">
          {[
            {
              title: "Driven by Discipline",
              copy: "Every decision runs through one filter: does it help you train harder for longer?",
            },
            {
              title: "Backed by Quality",
              copy: "Full-grain leather, layered foam cores, and a two-year stitch warranty on every pair.",
            },
            {
              title: "For Those That Never Settle",
              copy: "Built for amateurs, pros and the 5am regulars who never asked for a medal.",
            },
          ].map((item, i) => (
            <div key={item.title}>
              <p className="font-display text-4xl text-accent">0{i + 1}</p>
              <h3 className="mt-5 text-lg">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-20 text-center md:py-28">
        <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,4vw,3rem)]">
          The founding run is nearly gone
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/collections/$slug" params={{ slug: "luxe" }}>
              Shop Luxe
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/collections/$slug" params={{ slug: "maverick" }}>
              Shop Maverick
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/collections/$slug" params={{ slug: "nova" }}>
              Shop Nova
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/collections/all">Shop All</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
