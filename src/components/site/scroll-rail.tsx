import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Vertical progress rail that draws itself as its target list scrolls through.
 * Decorative only — the track stays visible even if the trigger never fires.
 */
export function ScrollRail({
  target,
  className,
}: {
  target: { current: HTMLElement | null };
  className?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const t = target.current;
    const r = rail.current;
    if (!t || !r || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        r,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: t, start: "top 72%", end: "bottom 55%", scrub: 0.4 },
        },
      );
    }, t);
    return () => ctx.revert();
  }, [target]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-2 left-0 top-2 w-[3px] bg-foreground/10",
        className,
      )}
    >
      <div ref={rail} className="h-full w-full origin-top bg-primary" />
    </div>
  );
}
