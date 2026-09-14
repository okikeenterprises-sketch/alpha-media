import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "../lib/gsap";
import {
  getSmooth,
  hasSeenIntro,
  initSmooth,
  markIntroDone,
  startSmooth,
  stopSmooth,
} from "../lib/smooth";
import { Curtain, type CurtainHandle } from "@/components/site/curtain";
import { Preloader } from "@/components/site/preloader";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CustomCursor } from "@/components/site/cursor";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="glass-panel w-full max-w-md rounded-3xl p-10 text-center shadow-2xl">
        <h1 className="font-display text-8xl text-primary drop-shadow-[0_0_25px_rgba(255,107,0,0.4)]">404</h1>
        <h2 className="mt-4 text-2xl font-medium tracking-tight">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="glass-pill-active inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:scale-105"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="glass-panel w-full max-w-md rounded-3xl p-10 text-center shadow-2xl">
        <h1 className="font-display text-4xl font-medium text-destructive">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="glass-pill-active inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:scale-105"
          >
            Try again
          </button>
          <a
            href="/"
            className="glass-pill inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:bg-white/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alph@ Media — Graphic Design Studio" },
      {
        name: "description",
        content:
          "Independent graphic design studio building loud brand identities, packaging, posters and motion for ambitious clients.",
      },
      { name: "author", content: "Alph@ Media" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Alph@ Media — Graphic Design Studio" },
      { name: "twitter:title", content: "Alph@ Media — Graphic Design Studio" },
      { property: "og:description", content: "Independent graphic design studio building loud brand identities, packaging, posters and motion for ambitious clients." },
      { name: "twitter:description", content: "Independent graphic design studio building loud brand identities, packaging, posters and motion for ambitious clients." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        {/* Ambient Glow Lights in Background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 size-[600px] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 size-[700px] rounded-full bg-indigo-500/10 blur-[160px]" />
          <div className="absolute -bottom-40 left-1/4 size-[650px] rounded-full bg-amber-500/8 blur-[150px]" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const curtain = useRef<CurtainHandle>(null);
  const [intro, setIntro] = useState(false);

  // First visit: lock scroll and show the preloader (client only, post-hydration).
  useIsomorphicLayoutEffect(() => {
    if (!prefersReducedMotion() && !hasSeenIntro()) {
      setIntro(true);
      document.body.style.overflow = "hidden";
    }
  }, []);

  // Lenis smooth scroll, wired directly into GSAP ticker and ScrollTrigger.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = initSmooth();
    if (!lenis) return;
    if (!hasSeenIntro()) lenis.stop();

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // Sync Lenis animation loop with GSAP's ticker to eliminate any pin jitter/delays
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    // Webfont swaps shift every trigger position — re-measure once they're in.
    document.fonts?.ready.then(onLoad).catch(() => undefined);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerUpdate);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const handleIntroDone = useCallback(() => {
    markIntroDone();
    setIntro(false);
    document.body.style.overflow = "";
    startSmooth();
    ScrollTrigger.refresh();
  }, []);

  // Curtain transition to an internal href.
  const go = useCallback(
    async (href: string) => {
      stopSmooth();
      try {
        await curtain.current?.play(async () => {
          router.history.push(href);
          await new Promise((r) => setTimeout(r, 80));
          getSmooth()?.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
        });
      } finally {
        startSmooth();
      }
    },
    [router],
  );

  // Intercept internal link clicks → curtain transition.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement).closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("data-no-transition")) return;
      if (anchor.getAttribute("target") === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.pathname === window.location.pathname && !url.search) return;
      e.preventDefault();
      void go(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [go]);

  return (
    <QueryClientProvider client={queryClient}>
      <CustomCursor />
      <Header />
      <main className="pt-24 md:pt-28">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <Toaster />
      <Curtain ref={curtain} />
      {intro && <Preloader onDone={handleIntroDone} />}
    </QueryClientProvider>
  );
}

/** Page-enter animation on every navigation + ScrollTrigger housekeeping. Opacity-only to avoid CSS transform on parent. */
function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const tw = gsap.fromTo(
      el,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          gsap.set(el, { clearProps: "all" });
          ScrollTrigger.refresh();
        },
      },
    );
    return () => {
      tw.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
