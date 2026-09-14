import { useRef } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EASE, gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { listPublishedProjects } from "@/lib/projects.functions";
import { Reveal } from "@/components/site/reveal";
import { Magnetic } from "@/components/site/magnetic";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const all = await listPublishedProjects();
    const i = all.findIndex((p) => p.slug === params.slug);
    if (i === -1) throw notFound();
    return { project: all[i]!, next: all[(i + 1) % all.length], total: all.length };
  },
  errorComponent: () => (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
      <h1 className="font-display text-5xl">Couldn't load this case study.</h1>
      <p className="mt-4 text-muted-foreground">Please refresh the page.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
      <h1 className="font-display text-5xl">Project not found</h1>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Project not found — Alph@ Media" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { project } = loaderData;
    const title = `${project.title} — Alph@ Media Case Study`;
    return {
      meta: [
        { title },
        { name: "description", content: project.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: project.blurb },
      ],
    };
  },
  component: CaseStudy,
});

function CaseStudy() {
  const { project, next, total } = Route.useLoaderData();
  const cover = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = cover.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(8% 5% 8% 5%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
      gsap.fromTo(
        el.querySelector("img"),
        { scale: 1.28 },
        {
          scale: 1,
          duration: 1.6,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [project.slug]);

  return (
    <article>
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10">
        <Link
          to="/work"
          className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeft className="size-4" /> All work
        </Link>

        <Reveal className="mt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {project.category} · {project.year}
            </p>
          </div>
          <h1 className="mt-6 font-display text-6xl leading-[0.9] md:text-[7.5rem]">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.blurb}</p>
        </Reveal>
      </div>

      <div ref={cover} className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <img
            src={project.cover}
            alt={`${project.title} cover artwork`}
            width={project.width}
            height={project.height}
            className="max-h-[80vh] w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr] md:px-10">
        <Reveal className="glass-card rounded-3xl p-8 md:p-12">
          <h2 className="font-display text-4xl text-foreground">The brief</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{project.brief}</p>
        </Reveal>
        <Reveal delay={0.1} className="glass-card rounded-3xl p-8 md:p-12 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Client</p>
            <p className="mt-2 text-lg text-foreground font-medium">{project.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Role</p>
            <ul className="mt-2 space-y-1.5 text-foreground/90">
              {project.role.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary/70" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Deliverables
            </p>
            <ul className="mt-2 space-y-1.5 text-foreground/90">
              {project.deliverables.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary/70" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Key Results Metrics */}
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <div className="grid gap-0 sm:grid-cols-3">
            {project.results.map((r) => (
              <div
                key={r.label}
                className="border-b border-white/10 p-8 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="font-display text-6xl text-primary drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]">{r.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {r.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
        <h2 className="font-display text-4xl">Process & artefacts</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {project.gallery.map((src, i) => (
            <Reveal key={`${src}-${i}`} delay={i * 0.06} className={i === 0 ? "md:col-span-2" : ""}>
              <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl">
                <img
                  src={src}
                  alt={`${project.title} process image ${i + 1}`}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {next && (
        <div className="mx-auto max-w-[1600px] px-5 py-8 md:px-10">
          <Link
            to="/work/$slug"
            params={{ slug: next.slug }}
            className="glass-panel group flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-primary/30 p-8 md:p-14 shadow-[0_0_35px_rgba(255,107,0,0.15)] transition-all hover:border-primary/60 hover:shadow-[0_0_50px_rgba(255,107,0,0.3)]"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Next project
              </p>
              <p className="mt-3 font-display text-5xl md:text-7xl text-foreground">{next.title}</p>
            </div>
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,107,0,0.5)] transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className="size-8" />
            </div>
          </Link>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-5 py-16 text-center md:px-10">
        <p className="font-display text-4xl">Got a project like this one?</p>
        <div className="mt-6">
          <Magnetic to="/contact">Start a project</Magnetic>
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {total} case studies in the archive
        </p>
      </div>
    </article>
  );
}
