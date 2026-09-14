import { Link } from "@tanstack/react-router";
import { Marquee } from "./marquee";
import { RollingText } from "./rolling-text";
import { useSiteProfile } from "@/hooks/use-site-profile";
import { DEFAULT_PROFILE } from "@/lib/profile-types";

export function Footer() {
  const { data } = useSiteProfile();
  const profile = data ?? DEFAULT_PROFILE;
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <Marquee
        items={["Let's make something loud", "Available for freelance", "UI & Brand Systems"]}
        className="border-t-0 border-b border-white/10 bg-primary/10 text-primary"
        reverse
      />
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-display text-4xl leading-none">
            Alph<span className="text-primary drop-shadow-[0_0_12px_rgba(255,107,0,0.6)]">@</span> Media
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Independent graphic design studio. Brand identity, print, packaging and motion for
            people who refuse to blend in.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Pages
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/work", label: "Work" },
              { to: "/services", label: "Services" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="group/roll inline-block text-muted-foreground transition-colors hover:text-primary">
                  <RollingText text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Elsewhere
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`mailto:${profile.email}`} className="group/roll inline-block text-muted-foreground transition-colors hover:text-primary">
                <RollingText text={profile.email} />
              </a>
            </li>
            {profile.socials.slice(0, 3).map((s) => (
              <li key={s.label}>
                <a href={s.href} className="group/roll inline-block text-muted-foreground transition-colors hover:text-primary">
                  <RollingText text={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-5 py-6 text-xs uppercase tracking-[0.18em] text-muted-foreground md:px-10">
        © {new Date().getFullYear()} Alph@ Media — Designed in the open
      </div>
    </footer>
  );
}
