import type { ReactNode } from "react";

/**
 * TASK-130 journal · hand-drawn story glyphs for the diagrams (brief §46: not a generic icon
 * library). A 40 × 40 pen drawing: `currentColor` ink strokes plus `.jx-gf` fills that each theme
 * tints through `--jx-glyph-fill` (EVAL-020: no colour literals here). Always decorative — the step
 * label next to a glyph is the text.
 */
const G: Record<string, ReactNode> = {
  // ── Cubicle ──────────────────────────────────────────────────────────────────────────────
  idea: (
    <>
      <path className="jx-gf" d="M20 5c-6.5 0-11 4.8-11 10.6 0 4.2 2.4 6.6 4 8.6 1.2 1.5 1.6 3 1.6 4.8h10.8c0-1.8.4-3.3 1.6-4.8 1.6-2 4-4.4 4-8.6C31 9.8 26.5 5 20 5Z" />
      <path d="M20 5c-6.5 0-11 4.8-11 10.6 0 4.2 2.4 6.6 4 8.6 1.2 1.5 1.6 3 1.6 4.8h10.8c0-1.8.4-3.3 1.6-4.8 1.6-2 4-4.4 4-8.6C31 9.8 26.5 5 20 5Z" />
      <path d="M15.4 33.2h9.2M16.6 36.8h6.8M17 22l3-4 3 4" />
    </>
  ),
  prompt: (
    <>
      <rect className="jx-gf" x="5" y="8" width="30" height="20" rx="4" />
      <rect x="5" y="8" width="30" height="20" rx="4" />
      <path d="M12 28l-3 6 8-6M11 15h14M11 20.5h9M28 18v6" />
    </>
  ),
  doc: (
    <>
      <path className="jx-gf" d="M9 5h16l6 6v24H9Z" />
      <path d="M9 5h16l6 6v24H9ZM25 5v6h6M13 17h14M13 22h14M13 27h9" />
    </>
  ),
  lowtrust: (
    <>
      <path className="jx-gf" d="M20 5l12 4.5v9c0 8.4-5.4 13.6-12 16.5-6.6-2.9-12-8.1-12-16.5v-9Z" />
      <path d="M20 5l12 4.5v9c0 8.4-5.4 13.6-12 16.5-6.6-2.9-12-8.1-12-16.5v-9Z" />
      <path d="M16.4 15.4c0-2.2 1.6-3.6 3.7-3.6s3.6 1.3 3.6 3.2c0 2.6-3.6 2.8-3.6 5.8M20.1 25.2v.4" />
    </>
  ),
  nothing: (
    <>
      <path className="jx-gf" d="M5 22l5-12h20l5 12v11H5Z" />
      <path d="M5 22l5-12h20l5 12v11H5ZM5 22h9l2 4h8l2-4h9" />
      <path d="M17 4l6 6M23 4l-6 6" />
    </>
  ),
  orchestrator: (
    <>
      <circle className="jx-gf" cx="20" cy="20" r="7" />
      <circle cx="20" cy="20" r="7" />
      <path d="M20 5v6M20 29v6M5 20h6M29 20h6M9.4 9.4l4.2 4.2M26.4 26.4l4.2 4.2M9.4 30.6l4.2-4.2M26.4 13.6l4.2-4.2" />
    </>
  ),
  team: (
    <>
      <circle className="jx-gf" cx="12" cy="13" r="4.5" />
      <circle className="jx-gf" cx="28" cy="13" r="4.5" />
      <circle cx="12" cy="13" r="4.5" />
      <circle cx="28" cy="13" r="4.5" />
      <path d="M4 32c0-5 3.6-8.4 8-8.4s8 3.4 8 8.4M20 32c0-5 3.6-8.4 8-8.4s8 3.4 8 8.4" />
      <path d="M17 5.5h6l-3 3.5Z" />
    </>
  ),
  stop: (
    <>
      <path className="jx-gf" d="M14 5h12l9 9v12l-9 9H14l-9-9V14Z" />
      <path d="M14 5h12l9 9v12l-9 9H14l-9-9V14Z" />
      <path d="M20 12v9l5 4" />
    </>
  ),
  artifacts: (
    <>
      <path className="jx-gf" d="M13 9h18v25H13Z" />
      <path d="M9 5h18v4M13 9h18v25H13ZM9 5v25h4M17 16h10M17 21h10M17 26h6" />
    </>
  ),
  database: (
    <>
      <path className="jx-gf" d="M8 10v20c0 2.8 5.4 5 12 5s12-2.2 12-5V10" />
      <ellipse cx="20" cy="10" rx="12" ry="5" />
      <path d="M8 10v20c0 2.8 5.4 5 12 5s12-2.2 12-5V10M8 20c0 2.8 5.4 5 12 5s12-2.2 12-5" />
    </>
  ),
  browser: (
    <>
      <rect className="jx-gf" x="4" y="7" width="32" height="26" rx="3" />
      <rect x="4" y="7" width="32" height="26" rx="3" />
      <path d="M4 14h32M8.5 10.5h.1M12 10.5h.1M15.5 10.5h.1M10 20h12M10 25h18" />
    </>
  ),
  eye: (
    <>
      <path className="jx-gf" d="M3 20s6-10 17-10 17 10 17 10-6 10-17 10S3 20 3 20Z" />
      <path d="M3 20s6-10 17-10 17 10 17 10-6 10-17 10S3 20 3 20Z" />
      <circle cx="20" cy="20" r="5" />
      <path d="M20 4v3M9 7l2 2.5M31 7l-2 2.5" />
    </>
  ),
  bounded: (
    <>
      <path className="jx-gf" d="M11 5h18c0 8-9 11-9 15s9 7 9 15H11c0-8 9-11 9-15S11 13 11 5Z" />
      <path d="M8 5h24M8 35h24M11 5c0 8 9 11 9 15s-9 7-9 15M29 5c0 8-9 11-9 15s9 7 9 15M15 31h10" />
    </>
  ),
  diff: (
    <>
      <path className="jx-gf" d="M6 5h18v26H6Z" />
      <path d="M6 5h18v26H6ZM10 11h4M10 16h10M10 21h6" />
      <circle cx="27" cy="25" r="6" />
      <path d="M31.4 29.4L36 34M25 25h4M27 23v4" />
    </>
  ),
  // ── Dino Arcade ─────────────────────────────────────────────────────────────────────────
  homescreen: (
    <>
      <rect className="jx-gf" x="10" y="3" width="20" height="34" rx="4" />
      <rect x="10" y="3" width="20" height="34" rx="4" />
      <rect x="14" y="9" width="5" height="5" rx="1.2" />
      <rect x="21" y="9" width="5" height="5" rx="1.2" />
      <rect x="14" y="16" width="5" height="5" rx="1.2" />
      <path d="M22 17.5h3M23.5 16v3M17.5 32h5" />
    </>
  ),
  file: (
    <>
      <path className="jx-gf" d="M8 7h20l4 4v22H8Z" />
      <path d="M8 7h20l4 4v22H8ZM13 7v8h12V7M13 22h14v11H13Z" />
    </>
  ),
  slot: (
    <>
      <rect className="jx-gf" x="5" y="14" width="30" height="20" rx="3" />
      <rect x="5" y="14" width="30" height="20" rx="3" />
      <path d="M11 20h18v4H11ZM14 4h12v14H14ZM17 8h6" />
    </>
  ),
  offline: (
    <>
      <path className="jx-gf" d="M11 29h19a6.5 6.5 0 0 0 0-13 9 9 0 0 0-17-2.4A7.5 7.5 0 0 0 11 29Z" />
      <path d="M11 29h19a6.5 6.5 0 0 0 0-13 9 9 0 0 0-17-2.4A7.5 7.5 0 0 0 11 29ZM7 35L33 6" />
    </>
  ),
  power: (
    <>
      <rect className="jx-gf" x="7" y="7" width="26" height="26" rx="5" />
      <rect x="7" y="7" width="26" height="26" rx="5" />
      <path d="M20 12v8M14.6 15.2a8 8 0 1 0 10.8 0" />
    </>
  ),
  board: (
    <>
      <rect className="jx-gf" x="6" y="8" width="28" height="24" rx="2" />
      <rect x="6" y="8" width="28" height="24" rx="2" />
      <rect x="14" y="14" width="12" height="12" rx="1" />
      <path d="M17 8V4M23 8V4M17 36v-4M23 36v-4M6 17H2M6 23H2M38 17h-4M38 23h-4M17 20h6" />
    </>
  ),
  bezel: (
    <>
      <rect className="jx-gf" x="5" y="4" width="30" height="8" rx="2" />
      <rect x="5" y="4" width="30" height="8" rx="2" />
      <rect x="7" y="14" width="26" height="22" rx="4" />
      <rect x="11" y="18" width="18" height="12" rx="2" />
      <path d="M11 8h18" />
    </>
  ),
  joystick: (
    <>
      <circle className="jx-gf" cx="15" cy="9" r="5" />
      <circle cx="15" cy="9" r="5" />
      <path d="M15 14v11M4 27h32v8H4ZM27 21.5h.1M32 21.5h.1" />
      <ellipse cx="15" cy="27" rx="6" ry="2" />
    </>
  ),
  cartridgeX: (
    <>
      <path className="jx-gf" d="M9 6h22v24l-3 4H12l-3-4Z" />
      <path d="M9 6h22v24l-3 4H12l-3-4ZM14 12h12v8H14ZM14 34v-4h12v4" />
      <path d="M4 4l32 32M36 4L4 36" />
    </>
  ),
  serverX: (
    <>
      <rect className="jx-gf" x="7" y="5" width="26" height="12" rx="2" />
      <rect x="7" y="5" width="26" height="12" rx="2" />
      <rect x="7" y="21" width="26" height="12" rx="2" />
      <path d="M11 11h.1M11 27h.1M4 4l32 32" />
    </>
  ),
  barrier: (
    <>
      <path className="jx-gf" d="M3 12h34v10H3Z" />
      <path d="M3 12h34v10H3ZM9 12l-6 10M17 12l-6 10M25 12l-6 10M33 12l-6 10M8 22v14M32 22v14M5 36h6M29 36h6" />
    </>
  ),
  coin: (
    <>
      <circle className="jx-gf" cx="20" cy="20" r="14" />
      <circle cx="20" cy="20" r="14" />
      <circle cx="20" cy="20" r="9" />
      <path d="M20 14v12M17 17h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5" />
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
