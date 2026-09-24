/**
 * The 40×40 hand-drawn "TP" monogram (Design.md §4.1; mockup `docs/redesign-mockups/m-009/home.html`
 * `.brand svg`). Authored strokes, `currentColor` so the ink is the brand link's text colour (no
 * literal — EVAL-020). Decorative: the link's `aria-label` carries the name.
 */
export function Monogram() {
  return (
    <svg className="header-monogram" viewBox="0 0 40 40" width={40} height={40} aria-hidden="true" focusable="false">
      <path d="M6 9 C 14 7, 22 8, 30 7" strokeWidth="2.4" />
      <path d="M17 8 C 15 16, 13 24, 12 33" strokeWidth="2.4" />
      <path d="M23 12 C 24 20, 22 27, 21 33" strokeWidth="2.2" />
      <path d="M23 12 C 30 10, 35 13, 34 18 C 33 23, 27 24, 22 22" strokeWidth="2.2" />
    </svg>
  );
}
