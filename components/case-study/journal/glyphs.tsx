import type { ReactNode } from "react";

/**
 * TASK-130 journal · hand-drawn story glyphs for the diagrams (brief §46: not a generic icon
 * library). A 40 × 40 pen drawing: `currentColor` ink strokes plus `.jx-gf` fills that each theme
 * tints through `--jx-glyph-fill` (EVAL-020: no colour literals here). Always decorative — the step
 * label next to a glyph is the text.
 */
const G: Record<string, ReactNode> = {
  // ── Velora ──────────────────────────────────────────────────────────────────────────────
  bizcard: (
    <>
      <rect className="jx-gf" x="4" y="10" width="28" height="18" rx="2" transform="rotate(-6 18 19)" />
      <rect x="8" y="13" width="28" height="18" rx="2" />
      <circle cx="15" cy="21" r="3" />
      <path d="M21 19h10M21 24h7" />
    </>
  ),
  badge: (
    <>
      <path d="M14 3l6 9 6-9" />
      <rect className="jx-gf" x="9" y="12" width="22" height="25" rx="3" />
      <rect x="9" y="12" width="22" height="25" rx="3" />
      <path d="M17 12v4h6v-4M14 23h12M14 28h12M14 32h7" />
    </>
  ),
  directory: (
    <>
      <path className="jx-gf" d="M8 5h22v30H8Z" />
      <path d="M8 5h22v30H8ZM12 5v30M16 11h10M16 16h10M16 21h10M16 26h6" />
    </>
  ),
  unverified: (
    <>
      <circle className="jx-gf" cx="20" cy="20" r="15" />
      <circle cx="20" cy="20" r="15" strokeDasharray="4 3" />
      <path d="M16 16.5c0-2.4 1.8-4 4.1-4s4 1.5 4 3.5c0 2.9-4 3.1-4 6.4M20.1 27.5v.4" />
    </>
  ),
  notravel: (
    <>
      <path className="jx-gf" d="M10 12h16l8 8-8 8H10Z" />
      <path d="M10 12h16l8 8-8 8H10ZM4 20h6M15 20h.1" />
      <path d="M6 36L34 4" />
    </>
  ),
  match: (
    <>
      <circle className="jx-gf" cx="14" cy="20" r="9" />
      <circle cx="14" cy="20" r="9" />
      <circle cx="26" cy="20" r="9" />
      <path d="M20 14.5v11" />
    </>
  ),
  rfp: (
    <>
      <path className="jx-gf" d="M9 5h22v30H9Z" />
      <path d="M9 5h22v30H9ZM13 12h14M13 17h14M13 22h8M13 29l3 3 6-7" />
    </>
  ),
  bid: (
    <>
      <path className="jx-gf" d="M6 18L18 6h16v16L22 34Z" />
      <path d="M6 18L18 6h16v16L22 34ZM27 13h.1M16 21l5-5M15 16h1M21 22h1" />
    </>
  ),
  scissors: (
    <>
      <circle className="jx-gf" cx="10" cy="29" r="5" />
      <circle className="jx-gf" cx="10" cy="11" r="5" />
      <circle cx="10" cy="29" r="5" />
      <circle cx="10" cy="11" r="5" />
      <path d="M14 26L36 9M14 14l22 17" />
    </>
  ),
  handoff: (
    <>
      <rect className="jx-gf" x="3" y="8" width="12" height="12" rx="2" />
      <rect x="3" y="8" width="12" height="12" rx="2" />
      <rect x="25" y="20" width="12" height="12" rx="2" />
      <path d="M15 14h6c3 0 4 2 4 4v2M22 17l3 3 3-3M9 24v6M7 32h4" />
    </>
  ),
  label: (
    <>
      <path className="jx-gf" d="M5 8h20l10 12-10 12H5Z" />
      <path d="M5 8h20l10 12-10 12H5ZM26 20h.1M10 16h10M10 22h7" />
    </>
  ),
  check: <path d="M8 21l7 7 17-17" />,
};

export type GlyphName = keyof typeof G;

export function Glyph({ name, className }: { name: string; className?: string }) {
  const body = G[name];
  if (!body) return null;
  return (
    <svg className={["jx-glyph", className].filter(Boolean).join(" ")} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}
