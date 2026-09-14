import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Magnetic } from "@/components/site/magnetic";
import { Marquee } from "@/components/site/marquee";
import { ScrollRail } from "@/components/site/scroll-rail";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Pricing — Alph@ Media" },
      {
        name: "description",
        content:
          "Brand identity, packaging, campaign design and motion services with clear pricing tiers and a four-step design process.",
      },
      { property: "og:title", content: "Services & Pricing — Alph@ Media" },
      {
        property: "og:description",
        content:
          "Identity systems, packaging, campaigns and motion — scoped in tiers, delivered on schedule.",
      },
    ],
  }),
  component: ServicesPage,
});

const tiers = [
  {
    name: "Mark",
    price: "from $1.8k",
    timeline: "2–3 weeks",
    summary: "A single, sharp logotype and the rules to use it well.",
    includes: [
      "Discovery call + moodboard",
      "2 logo directions, 1 refined",
      "Primary + secondary marks",
      "Colour & type specification",
      "Export pack (SVG, PNG, PDF)",
    ],
  },
  {
    name: "Identity",
    price: "from $6.5k",
    timeline: "5–8 weeks",
    summary: "A complete visual system your whole team can run with.",
    featured: true,
    includes: [
      "Positioning + naming support",
      "Full mark family & wordmark",
      "Type scale, colour, grid, pattern",
      "Packaging or print application",
      "Social & web templates",
      "30-page brand guidelines",
    ],
  },
  {
    name: "Campaign",
    price: "from $4k",
    timeline: "3–5 weeks",
    summary: "A launch, tour or drop, art-directed end to end.",
    includes: [
      "Concept & art direction",
      "Key visual + 6 adaptations",
      "Poster / OOH artwork",
      "Motion cut-downs (9:16, 1:1)",
      "Asset handover for print",
    ],
  },
];

const disciplines = [
  { title: "Brand identity", body: "Wordmarks, mark families, systems and guidelines." },
  { title: "Packaging", body: "Labels, cartons, dielines and print-ready artwork." },
  { title: "Print & editorial", body: "Posters, zines, reports, lookbooks, signage." },
  { title: "Motion", body: "Logo animation, social cut-downs, title sequences." },
  { title: "Illustration", body: "Custom marks, patterns and editorial spot art." },
  { title: "Web & UI direction", body: "Design systems and art direction for build teams." },
];

const process = [
  {
    step: "01",
    title: "Interrogate",
    body: "Brief, audience, competitors, and the one thing you should be known for.",
  },
  {
    step: "02",
    title: "Build",
    body: "Two directions max. Real applications, not floating logos on grey.",
  },
  {
    step: "03",
    title: "Stress-test",
    body: "Tiny, huge, embroidered, one colour, on a bottle, on a phone.",
  },
  {
    step: "04",
    title: "Hand over",
    body: "Organised files, guidelines, and a walkthrough with your team.",
  },
];

function ServicesPage() {
  const processRef = useRef<HTMLOListElement>(null);
  return (
    <div>
      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Services & pricing
          </p>
          <h1 className="mt-4 font-display text-6xl leading-[0.88] md:text-[8rem]">
            What we <span className="italic text-primary">make</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed">
            Fixed-scope engagements with named deliverables and dates. No hourly guessing, no
            surprise line items — you approve a scope, we ship it.
          </p>
        </Reveal>
      </section>

      <Marquee items={["Identity", "Packaging", "Posters", "Motion", "Editorial"]} reverse />

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={
                  tier.featured
                    ? "relative flex h-full flex-col rounded-3xl border border-primary/50 bg-gradient-to-b from-primary/15 via-white/[0.03] to-black/60 p-8 shadow-[0_0_40px_rgba(255,107,0,0.25)] backdrop-blur-xl"
                    : "glass-card-interactive flex h-full flex-col rounded-3xl p-8"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-4xl leading-none text-foreground">{tier.name}</h2>
                  {tier.featured && (
                    <span className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary shadow-[0_0_12px_rgba(255,107,0,0.3)]">
                      Most picked
                    </span>
                  )}
                </div>
                <p className="mt-4 text-3xl font-semibold text-primary">{tier.price}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {tier.timeline}
                </p>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{tier.summary}</p>
                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-foreground/90">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary drop-shadow-[0_0_6px_rgba(255,107,0,0.6)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-2">
                  <Magnetic
                    to="/contact"
                    variant={tier.featured ? "solid" : "outline"}
                    className="w-full"
                  >
                    Enquire
                  </Magnetic>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Disciplines Grid */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
        <Reveal>
          <h2 className="font-display text-5xl leading-none md:text-7xl">Disciplines</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {disciplines.map((d) => (
            <div key={d.title} className="glass-card-interactive rounded-3xl p-8">
              <h3 className="font-display text-3xl leading-none text-foreground">{d.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
        <Reveal>
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            The <span className="italic text-primary drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]">process</span>
          </h2>
        </Reveal>
        <ol ref={processRef} className="relative mt-10 space-y-0 pl-8 md:pl-12">
          <ScrollRail target={processRef} />
          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.06}>
              <li className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-[120px_1fr_1.4fr]">
                <span className="font-display text-4xl text-primary drop-shadow-[0_0_10px_rgba(255,107,0,0.5)]">{p.step}</span>
                <h3 className="font-display text-3xl leading-none text-foreground">{p.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* CTA Glass Banner */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-primary/30 p-10 shadow-[0_0_40px_rgba(255,107,0,0.15)] md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">
              Not sure which tier fits?
            </h2>
            <Magnetic to="/contact">Send the brief</Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
