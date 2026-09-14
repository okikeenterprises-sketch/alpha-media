import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
// Pinned sections + h-screen layouts: don't let mobile URL-bar resizes shift triggers.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

/** Signature expo ease used across the site — mirrors the old [0.22, 1, 0.36, 1]. */
export const EASE = "expo.out";

/** Layout effect on the client, plain effect during SSR (avoids useLayoutEffect warnings). */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
