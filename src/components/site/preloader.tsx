import { useRef } from "react";
import { EASE, gsap, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WORD = "Alph@ Media";

/** First-visit intro: wordmark cascade + counter, then lifts like a curtain. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const num = el.querySelector("[data-pl-num]");
      gsap
        .timeline({ onComplete: () => done.current() })
        .fromTo(
          el.querySelectorAll("[data-pl-char]"),
          { yPercent: 115 },
          { yPercent: 0, duration: 0.85, stagger: 0.035, ease: EASE },
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.15,
            ease: "power2.inOut",
            onUpdate: () => {
              if (num) num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          "-=0.45",
        )
        .to(
          "[data-pl-fade]",
          { autoAlpha: 0, y: -24, duration: 0.4, ease: "power2.in" },
          "+=0.1",
        )
        .to(el, { yPercent: -100, duration: 0.85, ease: EASE }, "-=0.1");
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[95] flex flex-col justify-between bg-foreground px-5 py-8 text-background md:px-10 md:py-10"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">
        Graphic design studio
      </p>
      <div data-pl-fade>
        <h1 className="overflow-hidden font-display text-[15vw] leading-[1.05] md:text-[9vw]">
          {WORD.split("").map((c, i) => (
            <span
              key={i}
              data-pl-char
              className={cn("inline-block will-change-transform", c === "@" && "text-primary")}
            >
              {c === " " ? " " : c}
            </span>
          ))}
        </h1>
        <div className="mt-6 flex items-end justify-between gap-6">
          <p className="pb-2 text-xs font-semibold uppercase tracking-[0.3em] opacity-70">
            Lagos / Remote
          </p>
          <p data-pl-num className="font-display text-7xl leading-none md:text-8xl">
            000
          </p>
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">
        Brand · Print · Motion
      </p>
    </div>
  );
}
