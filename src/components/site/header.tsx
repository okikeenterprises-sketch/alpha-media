import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import {
  EASE,
  gsap,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from "@/lib/gsap";
import { startSmooth, stopSmooth } from "@/lib/smooth";
import { RollingText } from "./rolling-text";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const progress = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  // Scroll progress bar — scrubbed, no re-renders.
  useIsomorphicLayoutEffect(() => {
    const bar = progress.current;
    if (!bar || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close (instantly) on navigation.
  useEffect(() => {
    setOpen(false);
    setMounted(false);
    startSmooth();
  }, [pathname]);

  // Entrance when the overlay mounts.
  useIsomorphicLayoutEffect(() => {
    const ov = overlay.current;
    if (!ov || !mounted) return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ov, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: EASE });
      gsap.fromTo(
        ov.querySelectorAll("[data-menu-link]"),
        { x: -32, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06, delay: 0.12, ease: EASE },
      );
    }, ov);
    return () => ctx.revert();
  }, [mounted]);

  const openMenu = () => {
    setMounted(true);
    setOpen(true);
    stopSmooth();
  };

  const closeMenu = () => {
    const ov = overlay.current;
    startSmooth();
    if (!ov || prefersReducedMotion()) {
      setOpen(false);
      setMounted(false);
      return;
    }
    gsap.to(ov, {
      yPercent: -100,
      duration: 0.35,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        setOpen(false);
        setMounted(false);
      },
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-8 md:pt-4">
      <div
        className={cn(
          "mx-auto max-w-[1600px] rounded-2xl transition-all duration-300",
          "glass-panel border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          scrolled ? "py-2.5 px-4 md:px-8" : "py-4 px-5 md:px-10",
        )}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-baseline gap-2">
            <span
              className={cn(
                "font-display leading-none tracking-tight transition-all duration-300",
                scrolled ? "text-2xl" : "text-3xl md:text-4xl",
              )}
            >
              Alph<span className="text-primary drop-shadow-[0_0_12px_rgba(255,107,0,0.6)]">@</span> Media
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.slice(1).map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group/roll relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all",
                    active
                      ? "text-primary bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(255,107,0,0.2)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  <RollingText text={item.label} />
                </Link>
              );
            })}
            <Link
              to="/contact"
              className="ml-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,107,0,0.7)]"
            >
              Start a project
            </Link>
          </nav>

          <button
            onClick={() => (mounted ? closeMenu() : openMenu())}
            aria-label={mounted ? "Close menu" : "Open menu"}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-foreground transition-colors hover:bg-white/10 md:hidden"
          >
            {mounted ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <div
          ref={progress}
          className="mt-2 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary"
          style={{ transform: prefersReducedMotion() ? undefined : "scaleX(0)" }}
          aria-hidden
        />
      </div>

      {mounted && (
        <div
          ref={overlay}
          className="fixed inset-0 top-[76px] z-40 flex flex-col justify-center bg-background/95 backdrop-blur-2xl px-6 md:hidden"
        >
          <div className="space-y-2">
            {nav.map((item) => (
              <div key={item.to} data-menu-link>
                <Link
                  to={item.to}
                  className="block rounded-2xl border border-white/5 p-5 font-display text-4xl text-foreground transition-all hover:border-primary/40 hover:bg-white/5 hover:text-primary"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
