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
            44 Boxing started in a cold gym at 4am with one problem: the gloves that felt right
            cost too much, and the gloves that were affordable fell apart before the season ended.
          </p>
          <p>
            So we built our own. We worked with a family workshop that had been cutting leather for
            three decades, spent two years on foam density and hand shape, and refused to ship
            anything we wouldn't spar in ourselves.
          </p>
          <p>
            The result is a range that does one thing well — top quality, affordable boxing gloves
            for the people who show up when nobody is watching. No hype cycles, no seasonal
            gimmicks. Just gloves that last.
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
        </div>
      </section>
    </>
  );
}
