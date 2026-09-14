import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { EASE, ScrollTrigger, SplitText, gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { whenIntroDone } from "@/lib/smooth";
import { listPublishedProjects } from "@/lib/projects.functions";
import { HorizontalWork } from "@/components/site/horizontal-work";
import { Marquee } from "@/components/site/marquee";
import { Reveal } from "@/components/site/reveal";
import { Magnetic } from "@/components/site/magnetic";
import { Cube } from "@/components/site/cube";

export const Route = createFileRoute("/")({
  loader: () => listPublishedProjects(),
  errorComponent: () => (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
      <h1 className="font-display text-5xl">Something broke loading the work.</h1>
      <p className="mt-4 text-muted-foreground">Please refresh the page.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
      <h1 className="font-display text-5xl">Page not found</h1>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Alph@ Media — Graphic Design Studio" },
      {
        name: "description",
        content:
          "Independent graphic design studio building loud brand identities, packaging, posters and motion for ambitious clients.",
      },
      { property: "og:title", content: "Alph@ Media — Graphic Design Studio" },
      {
        property: "og:description",
        content:
          "Independent graphic design studio building loud brand identities, packaging, posters and motion for ambitious clients.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "4+ yrs", label: "Professional experience" },
  { value: "UI", label: "Design & web development" },
  { value: "Print", label: "Graphics & brand kits" },
  { value: "Events", label: "Media coverage" },
];

function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const sub = useRef<HTMLDivElement>(null);
  const cubeWrap = useRef<HTMLDivElement>(null);
  const tilt = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = section.current;
    if (!root || prefersReducedMotion()) return;

    let split: SplitText | undefined;
    let ctx: ReturnType<typeof gsap.context> | undefined;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    const h1 = headline.current;

    // Playful: hovered glyphs jump.
    const onOver = (e: MouseEvent) => {
      const ch = (e.target as HTMLElement).closest?.(".hero-char");
      if (!ch) return;
      gsap.fromTo(
        ch,
        { y: 0 },
        { y: -30, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto" },
      );
    };

    const revealAll = () => {
      gsap.set([eyebrow.current, sub.current, cubeWrap.current].filter(Boolean), {
        autoAlpha: 1,
        y: 0,
        yPercent: 0,
        scale: 1,
        clearProps: "transform",
      });
      if (split) {
        gsap.set(split.chars, { autoAlpha: 1, yPercent: 0, rotate: 0, clearProps: "transform" });
      }
    };

    // Wait for the preloader on first visit so the entrance isn't missed.
    const off = whenIntroDone(() => {
      try {
        ctx = gsap.context(() => {
          // Entrance: eyebrow → split headline chars → sub row → cube.
          const tl = gsap.timeline({ defaults: { ease: EASE } });
          tl.fromTo(
            eyebrow.current,
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8 },
          );
          if (headline.current) {
            split = new SplitText(headline.current, { type: "chars", charsClass: "hero-char" });
            tl.fromTo(
              split.chars,
              { yPercent: 70, autoAlpha: 0, rotate: 5 },
              { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 1, stagger: 0.022 },
              "-=0.5",
            );
          }
          tl.fromTo(
            sub.current,
            { y: 32, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9 },
            "-=0.7",
          );
          tl.fromTo(
            cubeWrap.current,
            { autoAlpha: 0, scale: 0.7 },
            { autoAlpha: 1, scale: 1, duration: 1.1 },
            "-=0.8",
          );

          // Scroll away: gentle parallax drift without turning into a blank black void.
          gsap.to(content.current, {
            y: 40,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
          });
          // Cube drifts gently with opacity fade — no section collisions.
          gsap.to(cubeWrap.current, {
            y: -40,
            autoAlpha: 0.4,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
          });

          // Refresh ScrollTriggers once layout is fully prepared
          ScrollTrigger.refresh();
        }, root);
      } catch {
        // GSAP context failed — make content visible as fallback.
        revealAll();
      }

      // Mouse tilt on the headline — outside the context (quickTos can't revert).
      if (headline.current) {
        tilt.current = {
          x: gsap.quickTo(headline.current, "x", { duration: 0.7, ease: "power3" }),
          y: gsap.quickTo(headline.current, "y", { duration: 0.7, ease: "power3" }),
        };
      }
      h1?.addEventListener("mouseover", onOver);

      // Safety net: if GSAP doesn't make things visible within 3s, force-show.
      safetyTimer = setTimeout(revealAll, 3000);
      ScrollTrigger.refresh();
    });

    return () => {
      off();
      h1?.removeEventListener("mouseover", onOver);
      tilt.current = null;
      clearTimeout(safetyTimer);
      ctx?.revert();
      split?.revert();
    };
  }, []);

  return (
    <section
      ref={section}
      onMouseMove={(e) => {
        const fn = tilt.current;
        const rect = e.currentTarget.getBoundingClientRect();
        if (!fn) return;
        fn.x(((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 24);
        fn.y(((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 14);
      }}
      onMouseLeave={() => {
        tilt.current?.x(0);
        tilt.current?.y(0);
      }}
      className="relative overflow-hidden border-b border-white/10"
    >
      <div ref={content} className="relative z-10 mx-auto max-w-[1600px] px-5 pt-8 pb-16 md:px-10 md:pt-12 md:pb-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <p ref={eyebrow} className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Graphic design studio — Lagos / remote
          </p>
        </div>

        <h1
          ref={headline}
          className="mt-6 md:mt-8 font-display text-[16vw] leading-[0.85] tracking-tight md:text-[11vw] lg:text-[9vw]"
        >
          Alph<span className="text-primary drop-shadow-[0_0_25px_rgba(255,107,0,0.6)]">@</span>
          <br />
          <span className="italic text-foreground/90">Media</span>
        </h1>

        <div
          ref={sub}
          className="mt-10 md:mt-16 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[1.3fr_1fr] md:items-center"
        >
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            I&apos;m <span className="font-medium text-foreground">Alexx</span> — a web designer and visual creative with 4+ years turning ideas into
            engaging digital and visual experiences: UI design, web development, graphics and event
            media coverage.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <Magnetic to="/work">See the work</Magnetic>
            <Magnetic to="/contact" variant="outline">
              Start a project
            </Magnetic>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-10 hidden size-96 rounded-full bg-primary/20 blur-[130px] md:block"
      />

      {/* 3D Glass Cube: Positioned in upper right area with dedicated breathing room */}
      <div
        ref={cubeWrap}
        className="pointer-events-none absolute top-12 right-8 lg:top-20 lg:right-24 hidden md:block z-0"
      >
        <Cube size={170} />
      </div>
    </section>
  );
}

function Home() {
  const projects = Route.useLoaderData();

  return (
    <div>
      <Hero />

      <Marquee
        items={["Brand identity", "Packaging", "Posters", "Motion", "Editorial", "Illustration"]}
        className="border-t-0"
      />

      <HorizontalWork items={projects} />

      {/* Glass Stats Section */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 p-8 shadow-2xl md:p-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <p className="font-display text-5xl leading-none text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] md:text-7xl">
                  {s.value}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Surfaces */}
      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
        <div className="glass-card rounded-3xl p-8 md:p-16">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
            <Reveal>
              <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
                One creative, <span className="italic text-primary drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]">many</span> surfaces.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed">
              <p className="text-foreground/90">
                Canva, Photoshop, Lightroom and CorelDRAW for the visuals; Figma and code for the
                interfaces. Same eye for detail whether it lands on a screen, a banner or a feed.
              </p>
              <p className="text-muted-foreground">
                I work with brands, businesses and individuals — from full websites and UI systems to
                social creatives and event media coverage.
              </p>
              <div className="pt-2">
                <Link
                  to="/services"
                  className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:border-primary/50 hover:text-primary"
                >
                  How we work <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA Glass Banner */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-primary/30 p-10 shadow-[0_0_40px_rgba(255,107,0,0.15)] md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-5xl leading-[0.9] md:text-8xl">
              Got something
              <br />
              <span className="italic text-primary">worth building?</span>
            </h2>
            <Magnetic to="/contact">Let's talk</Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
