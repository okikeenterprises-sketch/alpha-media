import { useRef } from "react";
import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  reverse?: boolean;
  className?: string;
  separator?: string;
  /** Base travel speed in px/s. */
  speed?: number;
};

export function Marquee({ items, reverse, className, separator = "✳", speed = 110 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const signature = items.join("|");

  useIsomorphicLayoutEffect(() => {
    const el = track.current;
    const container = wrap.current;
    if (!el || !container || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const distance = el.scrollWidth / 2 || 1;
      const tween = gsap.fromTo(
        el,
        { xPercent: reverse ? -50 : 0 },
        {
          xPercent: reverse ? 0 : -50,
          ease: "none",
          duration: distance / speed,
          repeat: -1,
        },
      );

      // Pause while offscreen — no point burning frames.
      ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      });

      // Scroll velocity → time-scale boost + skew, easing back to cruise.
      let settle: ReturnType<typeof gsap.delayedCall> | undefined;
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const boost = gsap.utils.clamp(0, 2.5, Math.abs(v) / 2200);
          tween.timeScale(1 + boost * 2);
          gsap.to(el, {
            skewX: gsap.utils.clamp(-10, 10, v / -260),
            duration: 0.3,
            overwrite: "auto",
          });
          settle?.kill();
          settle = gsap.delayedCall(0.15, () => {
            gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: "auto" });
            gsap.to(el, { skewX: 0, duration: 0.6, overwrite: "auto" });
          });
        },
      });
    }, container);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reverse, speed, signature]);

  const row = [...items, ...items];
  return (
    <div ref={wrap} className={cn("overflow-hidden border-y border-white/10 bg-white/[0.02] backdrop-blur-md py-5", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-6 px-6 font-display text-3xl uppercase leading-none md:text-5xl"
          >
            {item}
            <span className="text-primary">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
