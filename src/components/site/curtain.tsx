import { forwardRef, useImperativeHandle, useRef } from "react";
import { EASE, gsap } from "@/lib/gsap";

export type CurtainHandle = {
  /** Cover the screen, run `mid` (navigation), then reveal. */
  play: (mid: () => Promise<void> | void) => Promise<void>;
};

/** Layered orange/black wipe for route transitions. Always mounted, hidden. */
export const Curtain = forwardRef<CurtainHandle>(function Curtain(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      async play(mid) {
        const el = root.current;
        if (!el || busy.current) {
          await mid();
          return;
        }
        busy.current = true;
        try {
          gsap.set(el, { display: "block" });
          const panels = el.querySelectorAll("[data-panel]");
          const word = el.querySelector("[data-word]");
          await gsap
            .timeline()
            .fromTo(
              panels,
              { scaleY: 0 },
              { scaleY: 1, transformOrigin: "bottom", duration: 0.55, stagger: 0.09, ease: EASE },
            )
            .fromTo(
              word,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE },
              "-=0.25",
            )
            .then();
          await mid();
          await gsap
            .timeline()
            .to(word, { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" })
            .to(
              panels,
              { scaleY: 0, transformOrigin: "top", duration: 0.7, stagger: 0.09, ease: EASE },
              "-=0.1",
            )
            .then();
        } finally {
          gsap.set(el, { display: "none" });
          busy.current = false;
        }
      },
    }),
    [],
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ display: "none" }}
    >
      <div data-panel className="absolute inset-0 origin-bottom bg-primary" />
      <div data-panel className="absolute inset-0 origin-bottom bg-foreground" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p data-word className="text-center font-display text-5xl text-background md:text-7xl">
          Alph<span className="text-primary">@</span> Media
        </p>
      </div>
    </div>
  );
});
