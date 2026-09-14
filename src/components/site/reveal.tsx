import { useRef, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";

export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
  duration = 1,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, autoAlpha: 0, filter: "blur(8px)" },
        {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration,
          delay,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [y, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
