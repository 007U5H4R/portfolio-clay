import type { ReactNode } from "react";
import { PLATFORM_MARKS } from "./logos";

/**
 * The per-row collage pieces for the `/work` timelines (TKT-101) — the small line doodles, the cloud
 * platform marks and the sticky notes on the right of each card in Tushar's references. Everything here
 * renders INSIDE `CollageTimeline`'s single `data-decor="collage" aria-hidden="true"` object, so none of
 * it is counted separately or read aloud; the sticky words are his reference copy (a flourish that
 * restates the card, EVAL-018 rule 6), the doodles are generic line art, the AWS / Google Cloud marks
 * are the official files (Dev-92; `alt=""` — decorative inside the aria-hidden layer).
 * Colours come from CSS classes (paper tokens / `color-mix`, EVAL-020) — no literals here.
 */

function Sticky({ lines, tone = "note", tilt }: { lines: string[]; tone?: "note" | "sage" | "rose" | "blue"; tilt: number }) {
  return (
    <span className="ct-sticky" data-tone={tone} style={{ rotate: `${tilt}deg` }}>
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </span>
  );
}

function Rays({ className }: { className?: string }) {
  return (
    <svg className={["ct-rays", className].filter(Boolean).join(" ")} viewBox="0 0 40 40" focusable="false">
      <path d="M6 30 L 16 22 M14 38 L 22 30 M4 18 L 16 16" />
    </svg>
  );
}

function Mark({ which }: { which: keyof typeof PLATFORM_MARKS }) {
  const m = PLATFORM_MARKS[which];
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="ct-mark" data-mark={which} src={m.src} alt="" width={m.width} height={m.height} loading="lazy" decoding="async" />;
}

const Db = () => (
  <svg className="ct-dd ct-db" viewBox="0 0 40 48" focusable="false">
    <ellipse className="ct-ln" cx="20" cy="8" rx="16" ry="5" />
    <path className="ct-ln" d="M4 8 V40 C 4 46, 36 46, 36 40 V8 M4 19 C 4 25, 36 25, 36 19 M4 30 C 4 36, 36 36, 36 30" />
  </svg>
);

const Gears = () => (
  <svg className="ct-dd ct-gears" viewBox="0 0 70 56" focusable="false">
    <circle className="ct-ln" cx="22" cy="22" r="11" />
    <circle className="ct-ln" cx="22" cy="22" r="4" />
    <path className="ct-ln" d="M22 5 V9 M22 35 V39 M5 22 H9 M35 22 H39 M10 10 L13 13 M31 31 L34 34 M10 34 L13 31 M31 13 L34 10" />
    <circle className="ct-ln" cx="52" cy="40" r="7" />
    <path className="ct-ln" d="M52 29 V32 M52 48 V51 M41 40 H44 M60 40 H63" />
  </svg>
);

const Flow = () => (
  <svg className="ct-dd ct-flow" viewBox="0 0 56 52" focusable="false">
    <rect className="ct-ln" x="4" y="4" width="16" height="14" />
    <rect className="ct-ln" x="36" y="4" width="16" height="14" />
    <rect className="ct-ln" x="20" y="34" width="16" height="14" />
    <path className="ct-ln" d="M12 18 V26 H44 V18 M28 26 V34" />
  </svg>
);

const CloudGenAI = () => (
  <svg className="ct-dd ct-cloud" viewBox="0 0 110 64" focusable="false">
    <path className="ct-ln" d="M18 52 C 4 52, 2 34, 16 31 C 14 14, 38 8, 46 20 C 54 6, 80 10, 80 28 C 96 28, 98 52, 82 52 Z" />
    <text className="ct-dd-text" x="30" y="42">
      GenAI
    </text>
  </svg>
);

const CurvedArrow = () => (
  <svg className="ct-dd ct-curve" viewBox="0 0 40 50" focusable="false">
    <path className="ct-ln" d="M30 4 C 10 10, 6 28, 14 44" />
    <path className="ct-ln" d="M8 38 L 14 46 L 20 38" />
  </svg>
);

const ApiBubble = () => (
  <svg className="ct-dd ct-api" viewBox="0 0 52 50" focusable="false">
    <path className="ct-ln" d="M26 4 C 40 4, 48 12, 48 22 C 48 32, 40 38, 26 38 L 22 46 L 20 38 C 10 36, 4 30, 4 22 C 4 12, 12 4, 26 4 Z" />
    <text className="ct-dd-text ct-dd-small" x="12" y="27">
      API
    </text>
  </svg>
);

const Bulb = () => (
  <svg className="ct-dd ct-bulb" viewBox="0 0 64 70" focusable="false">
    <path d="M26 50 C 26 42, 14 38, 14 26 C 14 16, 22 10, 32 10 C 42 10, 50 16, 50 26 C 50 38, 38 42, 38 50 Z" />
    <path d="M26 56 H38 M27 61 H37 M29 66 H35 M28 42 L32 30 L36 42" />
    <path className="ct-bulb-rays" d="M32 1 V5 M10 8 L14 12 M54 8 L50 12 M2 26 H7 M57 26 H62" />
  </svg>
);

const Atom = () => (
  <svg className="ct-dd ct-atom" viewBox="0 0 80 64" focusable="false">
    <ellipse className="ct-ln" cx="40" cy="32" rx="34" ry="11" />
    <ellipse className="ct-ln" cx="40" cy="32" rx="34" ry="11" transform="rotate(60 40 32)" />
    <ellipse className="ct-ln" cx="40" cy="32" rx="34" ry="11" transform="rotate(-60 40 32)" />
    <circle className="ct-atom-core" cx="40" cy="32" r="5" />
  </svg>
);

const Microscope = () => (
  <svg className="ct-dd ct-scope" viewBox="0 0 60 72" focusable="false">
    <path className="ct-ln" d="M26 6 L 36 2 L 44 20 L 34 24 Z M34 24 L 38 32 M22 30 C 12 36, 12 52, 24 58 M10 66 H52 M24 58 H40 M40 58 V46 M30 40 H46" />
    <circle className="ct-ln" cx="40" cy="34" r="3" />
  </svg>
);

const Network = () => (
  <svg className="ct-dd ct-net" viewBox="0 0 70 64" focusable="false">
    <path className="ct-ln" d="M35 32 L 12 10 M35 32 L 58 10 M35 32 L 12 54 M35 32 L 58 54" />
    <circle className="ct-node" cx="35" cy="32" r="6" />
    {[
      [12, 10],
      [58, 10],
      [12, 54],
      [58, 54],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} className="ct-node" cx={x} cy={y} r="6" />
    ))}
  </svg>
);

function Stack({ children, k }: { children: ReactNode; k: string }) {
  return (
    <div className="ct-doodles" data-wide="" data-k={k}>
      {children}
    </div>
  );
}

/** Work Experience rows (keys = `data/experience.ts` ids). */
export const WORK_DOODLES: Record<string, ReactNode> = {
  amex: (
    <Stack k="amex">
      <Rays className="ct-rays-tr" />
      <div className="ct-dd-row">
        <CloudGenAI />
      </div>
      <div className="ct-dd-row">
        <CurvedArrow />
        <Db />
      </div>
      <Sticky lines={["From", "legacy to", "modern."]} tilt={-6} />
    </Stack>
  ),
  shellkode: (
    <Stack k="shellkode">
      <Rays className="ct-rays-tr" />
      <Mark which="aws" />
      <div className="ct-dd-row">
        <Gears />
        <Flow />
      </div>
      <Sticky lines={["Build", "Deploy", "Scale"]} tilt={-5} />
    </Stack>
  ),
  quantiphi: (
    <Stack k="quantiphi">
      <Rays className="ct-rays-tr" />
      <Mark which="googleCloud" />
      <div className="ct-dd-row">
        <div className="ct-dd-col">
          <ApiBubble />
          <Db />
        </div>
        <Sticky lines={["Data", "APIs", "AI", "Scale"]} tilt={4} />
      </div>
    </Stack>
  ),
  godrej: (
    <Stack k="godrej">
      <Bulb />
      <Sticky lines={["From", "ideas to", "impact"]} tilt={-7} />
    </Stack>
  ),
};

/** Education rows (keys = `data/credentials.ts` education ids). */
export const EDU_DOODLES: Record<string, ReactNode> = {
  "mtech-nitc": (
    <Stack k="nitc">
      <Rays className="ct-rays-tr" />
      <Atom />
      <Microscope />
      <Sticky lines={["Research"]} tone="sage" tilt={-5} />
      <Sticky lines={["Publications"]} tilt={-3} />
      <Sticky lines={["Patent"]} tone="rose" tilt={-4} />
      <Network />
    </Stack>
  ),
  "be-bitd": (
    <Stack k="bitd">
      <Bulb />
      <Sticky lines={["Engineering", "foundation"]} tone="blue" tilt={-5} />
      <Sticky lines={["Problem", "solving"]} tilt={-4} />
      <Gears />
    </Stack>
  ),
};
