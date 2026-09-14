import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/** Custom cursor that grows and inverts over interactive elements. Desktop only. */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const setters = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    setEnabled(true);

    const mx = window.innerWidth / 2;
    const my = window.innerHeight / 2;
    if (dot.current) {
      dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    }

    const onMove = (e: MouseEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      setters.current?.x(e.clientX);
      setters.current?.y(e.clientY);
      const el = e.target as HTMLElement | null;
      const tagged = el?.closest("[data-cursor]") as HTMLElement | null;
      const nextLabel = tagged?.getAttribute("data-cursor") || null;
      setLabel(nextLabel);
      setActive(!!nextLabel || !!el?.closest("a, button, input, textarea, select"));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // quickTos are built only once the ring DOM exists (post-enabled render).
  useEffect(() => {
    const el = ring.current;
    if (!enabled || !el) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setters.current = {
      x: gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" }),
    };
    return () => {
      setters.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = label ? 92 : pressed ? 40 : active ? 56 : 26;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <div
        ref={dot}
        className="fixed left-0 top-0 size-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,107,0,0.8)] transition-[opacity] duration-200"
        style={{ opacity: active ? 0 : 1 }}
      />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-200 ease-out"
        style={{
          width: size,
          height: size,
          backgroundColor: label ? "var(--color-primary)" : active ? "rgba(255, 107, 0, 0.15)" : "transparent",
          borderColor: label || active ? "var(--color-primary)" : "rgba(255, 255, 255, 0.3)",
          borderWidth: "1px",
          boxShadow: label || active ? "0 0 25px rgba(255, 107, 0, 0.4)" : "none",
          backdropFilter: active ? "blur(4px)" : "none",
        }}
      >
        {label && (
          <span className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground drop-shadow-sm">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
