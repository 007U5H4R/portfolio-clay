/**
 * lib/focus.ts (technical-plan.md §B S11.02, EVAL-007) — the background-locking half of the
 * AskPanel's modal behaviour.
 *
 * The focus TRAP itself is the browser's: `AskPanel` opens via `<dialog>.showModal()`, which puts
 * the dialog in the top layer, keeps Tab cycling inside it, and routes `Esc` through `cancel` →
 * `close`. This helper adds the two things `showModal()` does not guarantee across engines:
 *
 *   1. `overflow: hidden` on `<html>` so the page behind cannot scroll while the panel is open
 *      (native modal dialogs do NOT lock background scroll on their own).
 *   2. `inert` on the background regions (`#main`, `header`, `footer`) as belt-and-suspenders over
 *      the top-layer inerting — so assistive tech and pointer events never reach the dimmed page.
 *
 * `lockBackground()` applies both and returns an idempotent restore function; the caller runs it in
 * an effect cleanup. It captures the previous `overflow` value and only removes `inert` from the
 * elements it actually added it to, so nesting (e.g. the MobileMenu <dialog> already open behind the
 * panel) never clobbers a value it did not set.
 *
 * (The plan sketched a `withInert(elements, fn)` helper; a returns-a-restore function composes far
 * better with React effect cleanup than a synchronous scoped-run wrapper, so the surface is
 * `lockBackground()` — same responsibility, effect-shaped. Deviation noted in docs/reports/TKT-11.md.)
 */

/** Background regions inerted while a modal panel is open. The panel itself is mounted OUTSIDE these. */
const BACKGROUND_SELECTORS = ["#main", "header", "footer"] as const;

/**
 * Lock the page behind a modal surface: hide `<html>` overflow and mark the background regions
 * `inert`. Returns a restore function that undoes exactly what it changed. Safe to call in a browser
 * only (guards `document`); no-op restore when there is no `document`.
 */
export function lockBackground(): () => void {
  if (typeof document === "undefined") return () => {};

  const html = document.documentElement;
  const previousOverflow = html.style.overflow;
  html.style.overflow = "hidden";

  const inerted: HTMLElement[] = [];
  for (const selector of BACKGROUND_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      // Only touch elements that are not already inert, so a restore never clears an `inert` that
      // another open surface (or the app) set.
      if (!el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el);
      }
    });
  }

  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    html.style.overflow = previousOverflow;
    for (const el of inerted) el.removeAttribute("inert");
  };
}
