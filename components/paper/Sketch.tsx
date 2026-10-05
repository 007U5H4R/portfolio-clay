import { Fragment } from "react";
import { FLOW_DEFAULT_ROWS, SKETCHES, type FlowRow, type SketchLineVariant } from "./sketch-paths";

export type SketchVariant = SketchLineVariant | "flow";

/** No HTML-attribute spread — the props type has no `aria-hidden` (Design.md §3.2 rule 6). */
export type SketchProps = {
  variant: SketchVariant;
  /** `flow` only: the boxes, row by row (defaults to the mockup's TeachSpark flow). */
  rows?: readonly FlowRow[] | undefined;
  className?: string | undefined;
};

/**
 * Only the headline underline draws in (Design.md §8: "Headline underline draw-in" is the one
 * sketch row in the motion table). The dashed variants keep their mockup dash pattern, which a
 * 400-unit draw-in dasharray would overwrite.
 */
const DRAWS_IN: ReadonlySet<SketchVariant> = new Set<SketchVariant>(["underline"]);

/**
 * Hand-drawn line art (Design.md §3.1; S70.03) — one counted decoration, always `aria-hidden`.
 * Line variants render `<svg data-decor="sketch" class="sketch">`; `flow` renders the TeachSpark
 * box diagram as `<div data-decor="sketch">` with Caveat box labels. Server component: the
 * draw-in is CSS-only (`.sketch[data-drawin]` in app/globals.css), complete under reduced motion.
 */
export function Sketch({ variant, rows = FLOW_DEFAULT_ROWS, className }: SketchProps) {
  const classes = ["sketch", variant === "flow" ? "sketch-flow font-hand" : "", className].filter(Boolean).join(" ");

  if (variant === "flow") {
    return (
      <div data-decor="sketch" aria-hidden="true" data-sketch="flow" className={classes}>
        {rows.map((row, i) => (
          <div key={i} className="flow-row">
            {row.indent ? (
              <span className="flow-arr" data-indent="">
                ↳
              </span>
            ) : null}
            {row.boxes.map((box, j) => (
              <Fragment key={box.label}>
                {j > 0 ? <span className="flow-arr">→</span> : null}
                <span className="flow-box" data-tone={box.tone}>
                  {box.label}
                </span>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const drawing = SKETCHES[variant];
  return (
    <svg
      data-decor="sketch"
      aria-hidden="true"
      data-sketch={variant}
      data-drawin={DRAWS_IN.has(variant) ? "" : undefined}
      className={classes}
      viewBox={drawing.viewBox}
      preserveAspectRatio={drawing.stretch ? "none" : undefined}
      focusable="false"
    >
      {drawing.paths.map((p) => (
        <path key={p.d} d={p.d} className={p.className} />
      ))}
      {drawing.circles?.map((c) => (
        <circle key={`${c.cx}-${c.cy}-${c.r}`} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </svg>
  );
}
