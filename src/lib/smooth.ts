import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initSmooth() {
  if (typeof window === "undefined" || lenis) return lenis;
  lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  return lenis;
}

export function getSmooth() {
  return lenis;
}

export function stopSmooth() {
  lenis?.stop();
}

export function startSmooth() {
  lenis?.start();
}

const INTRO_KEY = "am-intro";

export function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "done";
  } catch {
    return true;
  }
}

/** Run cb now if the intro already played (or SSR), otherwise after it finishes. */
export function whenIntroDone(cb: () => void) {
  if (typeof window === "undefined" || hasSeenIntro()) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener("am:intro-done", handler, { once: true });
  return () => window.removeEventListener("am:intro-done", handler);
}

export function markIntroDone() {
  try {
    sessionStorage.setItem(INTRO_KEY, "done");
  } catch {
    /* private mode — intro simply replays */
  }
  window.dispatchEvent(new Event("am:intro-done"));
}
