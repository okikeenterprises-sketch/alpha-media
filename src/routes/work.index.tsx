import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EASE, gsap, prefersReducedMotion } from "@/lib/gsap";
import { listPublishedProjects } from "@/lib/projects.functions";
import { WorkGrid } from "@/components/site/work-grid";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work/")({
  loader: () => listPublishedProjects(),
  errorComponent: () => (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
      <h1 className="font-display text-5xl">Couldn't load the portfolio.</h1>
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
      { title: "Work — Alph@ Media Portfolio" },
      {
        name: "description",
        content:
          "Selected branding, logo, poster, packaging, social, motion and illustration projects by Alph@ Media.",
      },
      { property: "og:title", content: "Work — Alph@ Media Portfolio" },
      {
        property: "og:description",
        content: "Selected graphic design case studies across brand, print, packaging and motion.",
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  const projects = Route.useLoaderData();
  const [filter, setFilter] = useState<string>("All");
  const grid = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category))),
    [projects],
  );

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects],
  );

  // Staggered re-entry whenever the filter changes.
  useEffect(() => {
    const el = grid.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: EASE, overwrite: "auto" },
      );
    }, el);
    return () => ctx.revert();
  }, [filter]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
      <Reveal>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Portfolio — {projects.length} projects
          </p>
        </div>
        <h1 className="mt-6 font-display text-6xl leading-[0.9] md:text-[8rem]">
          Selected <span className="italic text-primary drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">work</span>
        </h1>
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-2.5 border-y border-white/10 py-6">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
              filter === c
                ? "glass-pill-active text-primary"
                : "glass-pill text-muted-foreground hover:text-foreground hover:bg-white/10",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div ref={grid} className="mt-12">
        {filtered.length ? (
          <WorkGrid items={filtered} />
        ) : (
          <div className="glass-panel mx-auto my-12 max-w-lg rounded-3xl p-12 text-center">
            <p className="font-display text-3xl text-muted-foreground">
              Nothing here yet — new {filter.toLowerCase()} work is in production.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
