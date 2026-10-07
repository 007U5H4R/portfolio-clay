/**
 * Opposite-theme art warm-up (dark-mode.md §44, EVAL-026; TASK-155 changed idle -> intent). A paired scene
 * carries its inactive twin `[data-theme-art]`, `display: none` and lazy, so it is never fetched. Called from
 * the theme toggle on hover / focus / pointerdown (the visitor is about to switch), it flips that twin to
 * eager (fetch) and decodes it, so the switch itself is instant without every page downloading and decoding
 * two full scenes per slot up front. Route-aware by construction: it only touches `[data-theme-art]` images
 * that exist on the current page. The twin's own `srcset`/`sizes` pick the file (a phone warms the narrow crop).
 */
export function warmOppositeThemeArt(): void {
  const active = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  for (const el of document.querySelectorAll<HTMLImageElement>("img[data-theme-art], picture[data-theme-art] img")) {
    const own = el.closest("[data-theme-art]")?.getAttribute("data-theme-art");
    if (own && own !== active && el.getAttribute("loading") === "lazy") {
      el.setAttribute("loading", "eager");
      // Decode off-thread now (the img is display:none, so nothing else would), not on the frame of the switch.
      el.decode?.().catch(() => undefined);
    }
  }
}
