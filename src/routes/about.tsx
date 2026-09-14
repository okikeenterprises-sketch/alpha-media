import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import fallbackPortrait from "@/assets/alexx-portrait.png.asset.json";
import { getProfile } from "@/lib/profile.functions";
import { DEFAULT_PROFILE } from "@/lib/profile-types";
import { imageUrl } from "@/lib/project-types";
import { Reveal } from "@/components/site/reveal";
import { Magnetic } from "@/components/site/magnetic";
import { Marquee } from "@/components/site/marquee";
import { ScrollRail } from "@/components/site/scroll-rail";

export const Route = createFileRoute("/about")({
  loader: () => getProfile(),
  head: ({ loaderData }) => {
    const p = loaderData ?? DEFAULT_PROFILE;
    const title = `About ${p.name} — ${p.role_title}`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `${p.name} is a ${p.role_title.toLowerCase()} — ${p.location}. ${p.intro.slice(0, 140)}`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: p.bio.slice(0, 160) },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const timelineRef = useRef<HTMLOListElement>(null);
  const profile = Route.useLoaderData() ?? DEFAULT_PROFILE;
  const portraitUrl = profile.portrait ? imageUrl(profile.portrait) : fallbackPortrait.url;
  return (
    <div>
      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                About me
              </p>
            </div>
            <h1 className="mt-6 font-display text-6xl leading-[0.88] md:text-[7rem]">
              I&apos;m <span className="italic text-primary drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">{profile.name}</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground">{profile.intro}</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            <div className="mt-8">
              <Magnetic to="/work">See the portfolio</Magnetic>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
              <img
                src={portraitUrl}
                alt={`${profile.name}, ${profile.role_title}, in a studio portrait`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-[65%_30%] transition-transform duration-700 hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee items={profile.services} />

      {/* Principles Grid */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
        <Reveal>
          <h2 className="font-display text-5xl leading-none md:text-7xl">Principles</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {profile.principles.map((p) => (
            <div key={p.title} className="glass-card-interactive rounded-3xl p-8">
              <h3 className="font-display text-3xl leading-none text-foreground">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toolkit */}
      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
        <div className="glass-panel rounded-3xl p-8 md:p-14">
          <Reveal>
            <h2 className="font-display text-5xl leading-none md:text-7xl">Toolkit</h2>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-4">
            {profile.toolkit.map((t, i) => (
              <Reveal key={t.group} delay={i * 0.06}>
                <h3 className="border-b border-primary/30 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]">
                  {t.group}
                </h3>
                <ul className="mt-4 space-y-2.5 text-lg text-foreground/90">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-10">
        <Reveal>
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            The <span className="italic text-primary drop-shadow-[0_0_12px_rgba(255,107,0,0.4)]">timeline</span>
          </h2>
        </Reveal>
        <ol ref={timelineRef} className="relative mt-10 pl-8 md:pl-12">
          <ScrollRail target={timelineRef} />
          {profile.timeline.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.05}>
              <li className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-[140px_1fr_1.4fr]">
                <span className="font-display text-4xl text-primary drop-shadow-[0_0_10px_rgba(255,107,0,0.4)]">{t.year}</span>
                <h3 className="font-display text-3xl leading-none text-foreground">{t.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{t.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Services Grid */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="glass-card rounded-3xl p-8 md:p-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">What I do</h2>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {profile.services.map((c) => (
              <p key={c} className="font-display text-3xl leading-none text-foreground md:text-4xl">
                {c}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Glass Banner */}
      <section className="mx-auto max-w-[1600px] px-5 py-12 md:px-10">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-primary/30 p-10 shadow-[0_0_40px_rgba(255,107,0,0.15)] md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-5xl leading-[0.9] md:text-7xl">
              Let's make something <span className="italic text-primary">loud.</span>
            </h2>
            <Magnetic to="/contact">Start a project</Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
