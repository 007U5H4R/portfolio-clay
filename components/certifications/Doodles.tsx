/**
 * Line doodles for `/certifications` (TKT-102) — generic, unbranded line art redrawn from Tushar's
 * reference (certifications-target.png). Every piece is decorative: it renders inside an
 * `aria-hidden` object (the collage, the sticky notes, the footer note), so none carries a name.
 * Stroke / fill colours come from CSS classes (paper tokens, EVAL-020) — no literals here.
 */

type DoodleProps = { className?: string | undefined };
const cx = (...c: (string | undefined)[]) => c.filter(Boolean).join(" ");

/** The small line-art building before each issuer name. */
export function IssuerIcon() {
  return (
    <svg className="cert-issuer-icon" viewBox="0 0 16 18" aria-hidden="true" focusable="false">
      <path d="M2 17 V2 H11 V17 M11 7 H14 V17 M1 17 H15" />
      <path d="M4.5 5 H5.5 M7.5 5 H8.5 M4.5 8 H5.5 M7.5 8 H8.5 M4.5 11 H5.5 M7.5 11 H8.5 M5.5 17 V14 H7.5 V17" />
    </svg>
  );
}

/** Sticky-note doodles, keyed by the certification slug (the reference's per-note sketch). */
export function Lightbulb({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd", className)} viewBox="0 0 40 44" focusable="false">
      <path d="M20 8 C 11 8, 7 15, 9 21 C 10 25, 14 27, 14 32 H26 C 26 27, 30 25, 31 21 C 33 15, 29 8, 20 8 Z" />
      <path d="M15 36 H25 M16 40 H24 M20 32 V24 M17 21 L20 24 L23 21" />
      <path d="M3 17 H0 M20 3 V0 M37 17 H40 M7 6 L5 4 M33 6 L35 4" />
    </svg>
  );
}

export function People({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd", className)} viewBox="0 0 54 34" focusable="false">
      <circle cx="27" cy="9" r="5" />
      <path d="M17 32 C 17 22, 37 22, 37 32" />
      <circle cx="10" cy="14" r="4" />
      <path d="M2 32 C 2 24, 16 24, 17 28" />
      <circle cx="44" cy="14" r="4" />
      <path d="M52 32 C 52 24, 38 24, 37 28" />
    </svg>
  );
}

export function Gear({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd", className)} viewBox="0 0 40 40" focusable="false">
      <circle cx="20" cy="20" r="10" />
      <circle cx="20" cy="20" r="4" />
      <path d="M20 3 V9 M20 31 V37 M3 20 H9 M31 20 H37 M8 8 L12 12 M28 28 L32 32 M8 32 L12 28 M28 12 L32 8" />
    </svg>
  );
}

export function Cloud({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd", className)} viewBox="0 0 48 30" focusable="false">
      <path d="M12 27 C 4 27, 2 18, 9 16 C 9 8, 20 5, 24 12 C 28 6, 39 8, 38 16 C 46 16, 46 27, 38 27 Z" />
    </svg>
  );
}

export function Chart({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd", className)} viewBox="0 0 46 40" focusable="false">
      <path d="M4 38 H44 M9 38 V28 H15 V38 M20 38 V22 H26 V38 M31 38 V15 H37 V38" />
      <path d="M6 22 C 16 16, 26 12, 38 4 M31 4 H39 V11" />
    </svg>
  );
}

/** The mountain with a flag and the rising arrow under the aside (reference, top right). */
export function Mountain({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd cert-mountain", className)} viewBox="0 0 200 120" focusable="false">
      <circle className="cert-dd-sun" cx="150" cy="44" r="26" />
      <path d="M92 116 L138 40 L152 58 L160 48 L198 116" />
      <path className="cert-dd-hatch" d="M138 40 L130 70 M144 50 L140 80 M152 58 L150 90 M160 48 L168 86 M126 60 L118 96" />
      <path d="M138 40 V14 M138 14 L154 19 L138 24" />
      <path className="cert-dd-flag" d="M138 14 L154 19 L138 24 Z" />
      <path d="M2 104 C 30 96, 58 76, 94 42 M84 44 L95 41 L93 52" />
      <path className="cert-dd-tree" d="M100 116 L108 94 L116 116 Z M176 116 L184 96 L192 116 Z M104 116 V120 M184 116 V120" />
    </svg>
  );
}

export function Star({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd cert-star", className)} viewBox="0 0 30 30" focusable="false">
      <path d="M15 2 C 16 11, 19 14, 28 15 C 19 16, 16 19, 15 28 C 14 19, 11 16, 2 15 C 11 14, 14 11, 15 2 Z" />
    </svg>
  );
}

export function Sparks({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd cert-sparks", className)} viewBox="0 0 40 40" focusable="false">
      <path d="M6 30 L 16 22 M14 38 L 22 30 M4 18 L 16 16" />
    </svg>
  );
}

/** The stacked books (LEARN · BUILD · APPLY · GROW) at the foot of the page. */
export function Books({ className }: DoodleProps) {
  const books = [
    { word: "Learn", tone: "blue", w: 180, x: 16 },
    { word: "Build", tone: "sage", w: 196, x: 8 },
    { word: "Apply", tone: "rose", w: 206, x: 2 },
    { word: "Grow", tone: "note", w: 214, x: 0 },
  ];
  return (
    <svg className={cx("cert-books", className)} viewBox="0 0 220 176" focusable="false">
      {books.map((b, i) => {
        const y = 4 + i * 43;
        return (
          <g key={b.word} data-tone={b.tone}>
            <rect className="cert-book" x={b.x} y={y} width={b.w} height="38" rx="5" />
            <path className="cert-book-band" d={`M${b.x + 22} ${y + 2} V${y + 36} M${b.x + b.w - 26} ${y + 2} V${y + 36}`} />
            <text className="cert-book-word" x={b.x + b.w / 2} y={y + 26} textAnchor="middle">
              {b.word.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** The paper plane with its dashed looping trail. */
export function Plane({ className }: DoodleProps) {
  return (
    <svg className={cx("cert-dd cert-plane", className)} viewBox="0 0 260 90" focusable="false">
      <path className="cert-dd-dash" d="M2 70 C 40 88, 70 84, 96 64 C 118 46, 104 30, 92 40 C 80 52, 110 70, 160 58 C 180 54, 196 48, 206 44" />
      <path d="M206 44 L256 14 L226 62 L218 48 Z M218 48 L256 14" />
      <path className="cert-dd-flag" d="M206 44 L256 14 L218 48 Z" />
    </svg>
  );
}
