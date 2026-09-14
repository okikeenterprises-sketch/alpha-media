import { useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  type?: "button" | "submit";
};

/** Button/link that leans toward the cursor. */
export function Magnetic({
  to,
  href,
  onClick,
  children,
  className,
  variant = "solid",
  type = "button",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const setters = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setters.current = {
      x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
    };
  }, []);

  const handleMove = (e: React.MouseEvent) => {
    const fn = setters.current;
    const rect = ref.current?.getBoundingClientRect();
    if (!fn || !rect) return;
    fn.x((e.clientX - (rect.left + rect.width / 2)) * 0.28);
    fn.y((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };

  const handleLeave = () => {
    const fn = setters.current;
    const el = ref.current;
    if (!fn || !el) return;
    // Elastic snap-back — the juicy bit motion couldn't do cheaply.
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
  };

  const classes = cn(
    "relative inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300",
    variant === "solid"
      ? "bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-[0_0_25px_rgba(255,107,0,0.35)] hover:shadow-[0_0_35px_rgba(255,107,0,0.6)] hover:scale-105"
      : "glass-pill border border-white/15 text-foreground hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(255,107,0,0.25)] hover:scale-105",
    className,
  );

  const inner = to ? (
    <Link to={to as never} className={classes}>
      {children}
    </Link>
  ) : href ? (
    <a href={href} className={classes}>
      {children}
    </a>
  ) : (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );

  return (
    <span
      ref={ref}
      className="inline-block"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {inner}
    </span>
  );
}
