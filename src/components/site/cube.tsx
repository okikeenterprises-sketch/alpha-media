import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const faces = [
  { label: "A", t: "translateZ(var(--cube-half))" },
  { label: "L", t: "rotateY(180deg) translateZ(var(--cube-half))" },
  { label: "P", t: "rotateY(90deg) translateZ(var(--cube-half))" },
  { label: "H", t: "rotateY(-90deg) translateZ(var(--cube-half))" },
  { label: "@", t: "rotateX(90deg) translateZ(var(--cube-half))" },
  { label: "M", t: "rotateX(-90deg) translateZ(var(--cube-half))" },
];

/** Pure 3D rotating wireframe cube — brutalist accent object, GSAP-driven. */
export function Cube({ className, size = 200 }: { className?: string; size?: number }) {
  const spin = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Slow endless tumble…
      gsap.to(spin.current, {
        rotationY: "+=360",
        duration: 14,
        repeat: -1,
        ease: "none",
      });
      gsap.to(spin.current, {
        rotationX: 18,
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      // …with a gentle hover float on the wrapper.
      gsap.to(float.current, {
        y: -14,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      ref={float}
      className={cn("[perspective:900px]", className)}
      style={
        {
          width: size,
          height: size,
          ["--cube-half" as string]: `${size / 2}px`,
        } as React.CSSProperties
      }
    >
      <div ref={spin} className="relative size-full [transform-style:preserve-3d]">
        {faces.map((f) => (
          <div
            key={f.label}
            className="absolute inset-0 flex items-center justify-center rounded-2xl border border-primary/40 bg-white/[0.03] backdrop-blur-md font-display text-6xl text-primary shadow-[inset_0_0_25px_rgba(255,107,0,0.2),0_0_20px_rgba(255,107,0,0.2)]"
            style={{ transform: f.t }}
          >
            <span className="drop-shadow-[0_0_15px_rgba(255,107,0,0.8)]">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
