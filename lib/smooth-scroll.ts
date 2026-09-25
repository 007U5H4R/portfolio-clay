/**
 * lib/smooth-scroll.ts (TKT-94, decision EXE-16, Design.md §11 Dev-22) — the module-level handle on
 * the single Lenis instance `components/interactions/SmoothScroll.tsx` mounts for fine pointers
 * without `prefers-reduced-motion`. Every helper here is a no-op when Lenis is not mounted (touch,
 * reduced motion, SSR, jsdom), so callers keep native behaviour for free.
 *
 * Type-only import: the `lenis` runtime is loaded by a dynamic `import()` inside SmoothScroll's mount
 * effect, so it never lands in first-load JS and is never fetched on touch / reduced-motion visits.
 */
import type Lenis from "lenis";

let instance: Lenis | null = null;
let stopCount = 0;

/** SmoothScroll registers (or clears, on unmount) the one instance. */
export function setLenis(next: Lenis | null): void {
  instance = next;
  stopCount = 0;
}

/** The live instance, or `null` when native scroll is in charge. */
export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Pause smoothing while a modal surface (MobileMenu sheet, AskPanel) is open. Ref-counted so nested
 * surfaces (the Ask row inside the open menu opens the panel) only restart Lenis once the last one
 * closes. Returns an idempotent release function shaped for an effect cleanup.
 */
export function stopSmoothScroll(): () => void {
  const lenis = instance;
  if (!lenis) return () => {};
  stopCount += 1;
  lenis.stop();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    // The instance may have been destroyed/replaced while the surface was open.
    if (instance !== lenis) return;
    stopCount = Math.max(0, stopCount - 1);
    if (stopCount === 0) lenis.start();
  };
}

/** Sticky-header height, read live (it is one height, D12, but the safe-area inset can vary). */
function headerHeight(): number {
  const header = document.querySelector<HTMLElement>("header[data-site-header]");
  return header ? header.getBoundingClientRect().height : 0;
}

/**
 * Smooth-scroll to an in-page target, clear of the sticky header, then move focus to it. Lenis already
 * subtracts a target's own `scroll-margin-top` (e.g. case-study chapters' `scroll-mt-[7rem]`, which
 * already includes the header), so the header offset is applied only when the target sets none.
 * Focus moves with `preventScroll` so it never fights the animation; non-focusable targets get
 * `tabindex="-1"` (programmatic focus only, not a tab stop). Returns `false` when Lenis is not
 * mounted so the caller leaves the browser's native behaviour alone.
 */
export function scrollToTarget(target: HTMLElement, { immediate = false } = {}): boolean {
  const lenis = instance;
  if (!lenis) return false;
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop);
  const offset = Number.isFinite(margin) && margin > 0 ? 0 : -headerHeight();
  // Lenis measures an element target as `rect.top + its own animatedScroll`. After a native scroll it
  // has not yet seen (keyboard, a focus/scrollIntoView in the same frame — e.g. Playwright scrolling
  // the link into view before clicking) that internal value is stale and the jump falls short. Sync it
  // to the real position first; an immediate scroll to where we already are moves nothing.
  if (Math.abs(lenis.animatedScroll - window.scrollY) > 1) lenis.scrollTo(window.scrollY, { immediate: true });
  lenis.scrollTo(target, { offset, immediate });
  if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
  return true;
}
