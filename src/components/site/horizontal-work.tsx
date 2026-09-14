import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import type { ProjectRecord } from "@/lib/project-types";

/**
 * Pinned horizontal-scroll strip. Deliberately uses NO hidden initial states —
 * every child is visible by default, so a missed trigger can never blank the section.
 */
export function HorizontalWork({ items }: { items: ProjectRecord[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const featured = items.slice(0, 6);

  useIsomorphicLayoutEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr || featured.length === 0 || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const amount = () => Math.max(0, tr.scrollWidth - window.innerWidth);
      // The journey everything else keys off.
      const travel = gsap.to(tr, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${amount()}`,
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) gsap.set(bar.current, { scaleX: self.progress });
          },
        },
      });

      // Photos subtle drift while traveling
      tr.querySelectorAll("[data-hcard]").forEach((card) => {
        const img = card.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -5 },
            {
              xPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: travel,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        }
      });
    }, sec);

    // Refresh after DOM and layout calculate
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Reduced motion / SSR-safe fallback: plain sideways scroll.
  if (prefersReducedMotion()) {
    return (
      <section className="border-b border-white/10 py-20">
        <HeaderRow count={items.length} />
        <div className="mt-10 flex snap-x gap-6 overflow-x-auto px-5 md:px-10">
          {featured.map((p) => (
            <Card key={p.slug} project={p} />
          ))}
          <EndCard count={items.length} />
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section ref={section} className="relative overflow-hidden border-b border-white/10 min-h-screen">
      <div className="flex min-h-screen flex-col justify-between pt-24 pb-8 md:pt-28 md:pb-12">
        <div className="px-5 md:px-10">
          <HeaderRow count={items.length} />
        </div>
        <div ref={track} className="my-auto flex w-max items-stretch gap-6 px-5 py-3 will-change-transform md:gap-8 md:px-10 md:py-4">
          {featured.map((p) => (
            <Card key={p.slug} project={p} />
          ))}
          <EndCard count={items.length} />
        </div>
        <div className="px-5 md:px-10">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
            <div ref={bar} className="h-full origin-left rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary shadow-[0_0_12px_rgba(255,107,0,0.6)]" style={{ transform: "scaleX(0)" }} />
          </div>
          <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Scroll to travel — {featured.length} highlights
          </p>
        </div>
      </div>
    </section>
  );
}

function HeaderRow({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
          Selected work — {count} projects
        </p>
        <h2 className="mt-1 font-display text-3xl leading-none md:text-5xl lg:text-6xl">
          Fresh off the <span className="italic text-primary">desk</span>
        </h2>
      </div>
      <Link
        to="/work"
        className="glass-pill group/roll inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all hover:border-primary/50 hover:text-primary"
      >
        View archive
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function Card({ project }: { project: ProjectRecord }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      data-cursor="View"
      data-hcard
      className="glass-card-interactive group block w-[74vw] shrink-0 overflow-hidden rounded-3xl sm:w-[46vw] lg:w-[28vw]"
    >
      <div className="overflow-hidden">
        <img
          src={project.cover}
          alt={`${project.title} — ${project.category} project by Alph@ Media`}
          width={project.width}
          height={project.height}
          loading="lazy"
          onLoad={() => ScrollTrigger.refresh()}
          className="h-[30vh] min-h-[190px] max-h-[290px] w-full scale-[1.08] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.18] md:h-[34vh] md:max-h-[330px]"
        />
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-white/10 bg-black/40 p-3.5 md:p-4 backdrop-blur-md">
        <div>
          <p className="font-display text-xl md:text-2xl leading-none transition-colors group-hover:text-primary">{project.title}</p>
          <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {project.category} · {project.year}
          </p>
        </div>
        <span className="flex size-8 md:size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 font-display text-sm md:text-base text-primary shadow-[0_0_10px_rgba(255,107,0,0.2)] transition-all group-hover:scale-110 group-hover:border-primary/60 group-hover:bg-primary group-hover:text-primary-foreground">
          →
        </span>
      </div>
    </Link>
  );
}

function EndCard({ count }: { count: number }) {
  return (
    <Link
      to="/work"
      data-hcard
      className="glass-panel group flex w-[70vw] shrink-0 flex-col items-start justify-center rounded-3xl border border-primary/30 p-8 text-foreground shadow-[0_0_30px_rgba(255,107,0,0.15)] transition-all hover:border-primary/60 hover:shadow-[0_0_40px_rgba(255,107,0,0.3)] sm:w-[40vw] lg:w-[26vw]"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        {count} case studies
      </p>
      <p className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">
        See the full <span className="italic text-primary">archive</span>
      </p>
      <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all group-hover:scale-105">
        Open work <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
