/**
 * TASK-305 — set false to restore the TASK-301 vertical carousel exactly.
 *
 * Kill switch for the origami paper selector: the desktop (>= 1024 px) vertical product carousel redrawn as a parchment / charcoal
 * panel with a "SELECT A PRODUCT 07 / 10" header, horizontal paper tiles and folded-paper arrows. It only has an effect while
 * `VERTICAL_CAROUSEL_ENABLED` is also true. Every rule is scoped under `.pf-psel` / `[data-paper-selector]`, which are only emitted
 * while this is true (and the marker only at desktop width). Same pattern as `vertical-carousel-flag.ts`.
 */
export const PAPER_SELECTOR_ENABLED = true;
