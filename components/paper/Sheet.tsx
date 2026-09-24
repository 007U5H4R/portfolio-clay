import type { ReactNode } from "react";
import { hostFasteners } from "./fastener";
import { ROTATION_CAP, rotationStyle } from "./rotation";

export type SheetVariant = "card" | "index" | "postcard" | "notebook" | "photo" | "tag";

/** No HTML-attribute spread: `data-paper` is fixed by `variant`, never overridable. */
export type SheetProps = {
  as?: "article" | "div" | "figure" | "section" | undefined;
  variant: SheetVariant;
  /** Degrees; clamped to ±0.9 (photo ±2.4) — Design.md §3.1 / §2.3. */
  rotate?: number | undefined;
  /** Postcard stamp chrome (top-right, dashed kraft; `aria-hidden`). Ignored on other variants. */
  stamp?: ReactNode | undefined;
  className?: string | undefined;
  /** Content, plus up to two fasteners (`<Tape/>`, `<Pin/>`) as **direct** children. */
  children: ReactNode;
};

const NOTEBOOK_HOLES = 5;

/**
 * Content-bearing paper (Design.md §3.1 `Sheet` row; S70.05): an ivory card, index card, postcard,
 * notebook page, photo frame or kraft tag. `data-paper` marks a material, not a decoration — it is
 * never counted by EVAL-018 and stays in the accessibility tree. Fasteners are counted at render
 * (≤ 2; throws in test, `console.error` in dev, inert in production). Server component.
 */
export function Sheet({ as: Component = "div", variant, rotate, stamp, className, children }: SheetProps) {
  const cap = variant === "photo" ? ROTATION_CAP.photo : ROTATION_CAP.sheet;
  return (
    <Component
      data-paper={variant}
      className={["paper-sheet", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, 0, cap)}
    >
      {variant === "notebook" ? (
        <span className="paper-holes" aria-hidden="true">
          {Array.from({ length: NOTEBOOK_HOLES }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      ) : null}
      {variant === "postcard" && stamp !== undefined ? (
        <span className="paper-stamp" aria-hidden="true">
          {stamp}
        </span>
      ) : null}
      {hostFasteners(children, "Sheet")}
    </Component>
  );
}
