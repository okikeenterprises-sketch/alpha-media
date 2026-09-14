import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { EASE, gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import type { ProjectRecord } from "@/lib/project-types";

export function WorkGrid({ items }: { items: ProjectRecord[] }) {
  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
      {items.map((p, i) => (
        <ProjectTile key={p.slug} project={p} index={i} />
      ))}
    </div>
  );
}

function ProjectTile({ project, index }: { project: ProjectRecord; index: number }) {
  const tile = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = tile.current;
    if (!el || prefersReducedMotion()) return;
    const trigger = { trigger: el, start: "top 92%", once: true } as const;
    const ctx = gsap.context(() => {
      // Gentle settle…
      gsap.fromTo(
        el,
        { y: 28 },
        { y: 0, duration: 0.9, delay: (index % 3) * 0.08, ease: EASE, scrollTrigger: trigger },
      );
      // …while the frame wipes open and the photo settles from a zoom.
      if (media.current) {
        gsap.fromTo(
          media.current,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            delay: (index % 3) * 0.08,
            ease: EASE,
            scrollTrigger: trigger,
          },
        );
      }
      if (cover.current) {
        gsap.fromTo(
          cover.current,
          { scale: 1.38 },
          {
            scale: 1.16,
            duration: 1.4,
            delay: (index % 3) * 0.08,
            ease: EASE,
            scrollTrigger: trigger,
          },
        );
        // …then drifts against the scroll.
        gsap.fromTo(
          cover.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <div ref={tile} className="break-inside-avoid">
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        data-cursor="View"
        className="glass-card-interactive group block overflow-hidden rounded-3xl"
      >
        <div ref={media} className="relative overflow-hidden">
          <img
            ref={cover}
            src={project.cover}
            alt={`${project.title} — ${project.category} project by Alph@ Media`}
            width={project.width}
            height={project.height}
            loading="lazy"
            className="w-full scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-[1.18]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full p-5 transition-transform duration-400 ease-out group-hover:translate-y-0">
            <p className="font-display text-2xl text-foreground drop-shadow-[0_0_12px_rgba(255,107,0,0.5)]">{project.title}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-primary">
              {project.client}
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-white/10 bg-black/40 p-5 backdrop-blur-md">
          <div>
            <p className="font-display text-2xl leading-none transition-colors group-hover:text-primary">{project.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {project.category} · {project.year}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_15px_rgba(255,107,0,0.4)]">
            <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
