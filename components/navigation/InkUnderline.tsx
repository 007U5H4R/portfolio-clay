/**
 * The navy ink-stroke underline under a nav item (Design.md §4.1; mockup `.nav a::after`). The
 * mockup painted it as a `::after` background data-URI with a hex stroke; here it is an inline
 * `aria-hidden` SVG in `currentColor` so no colour literal leaves `globals.css` (EVAL-020). CSS
 * (`.ink-underline`, TKT-71 banner) positions it under the link and drives its opacity:
 * `aria-current="page"` → 1, hover → .45, current + hover → 1 — instant, no transition (§8).
 * Not a `data-decor` object: it is link chrome, not a counted decoration (§3.1).
 */
export function InkUnderline() {
  return (
    <svg
      className="ink-underline"
      viewBox="0 0 60 6"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 4 C 12 1, 22 5, 32 3 S 50 1, 59 3" />
    </svg>
  );
}
