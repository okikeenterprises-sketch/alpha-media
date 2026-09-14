import { useRef, useState, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Wraps children in a perspective container and tilts them in 3D toward the cursor. */
export function Tilt3D({
  children,
  className,
  max = 10,
  lift = 14,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const setters = useRef<{
    rx: (v: number) => void;
    ry: (v: number) => void;
    z: (v: number) => void;
  } | null>(null);
  const [glow, setGlow] = useState({ px: 50, py: 50, on: false });

  useIsomorphicLayoutEffect(() => {
    const el = inner.current;
    if (!el || prefersReducedMotion()) return;
    gsap.set(el, { transformPerspective: 1100 });
    setters.current = {
      rx: gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" }),
      ry: gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" }),
      z: gsap.quickTo(el, "z", { duration: 0.6, ease: "power3" }),
    };
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setters.current?.rx((0.5 - ny) * max * 2);
    setters.current?.ry((nx - 0.5) * max * 2);
    setters.current?.z(lift);
    setGlow({ px: nx * 100, py: ny * 100, on: true });
  };

  const onLeave = () => {
    const el = inner.current;
    if (el && !prefersReducedMotion()) {
      gsap.to(el, {
        rotationX: 0,
        rotationY: 0,
        z: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
      });
    }
    setGlow((g) => ({ ...g, on: false }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("[perspective:1100px]", className)}
    >
      <div
        ref={inner}
        className="relative [transform-style:preserve-3d] motion-reduce:!transform-none"
      >
        {children}
        {glare && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: glow.on ? 0.35 : 0,
              background: `radial-gradient(420px circle at ${glow.px}% ${glow.py}%, var(--color-accent), transparent 65%)`,
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>
    </div>
  );
}
