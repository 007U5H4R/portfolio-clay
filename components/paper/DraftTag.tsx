import type { ReactNode } from "react";
import { ROTATION_CAP, rotationStyle } from "./rotation";

export type DraftTagProps = {
  /** Degrees; clamped to ±4 (Design.md §3.1 — the one tag allowed a tilt). */
  rotate?: number | undefined;
  className?: string | undefined;
  children?: ReactNode;
};

/**
 * The site's "not signed off yet" marker (Design.md §3.1 `DraftTag` row, §3.4 — never Caveat;
 * S70.07). `<span data-paper="tag">` in Inter 12 px uppercase terracotta with a hairline border:
 * content paper, in the accessibility tree, not counted. Server component.
 */
export function DraftTag({ rotate, className, children = "Draft — pending sign-off" }: DraftTagProps) {
  return (
    <span
      data-paper="tag"
      className={[
        "draft-tag font-body text-[12px] font-semibold uppercase tracking-[.12em] text-terracotta",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rotationStyle(rotate, 0, ROTATION_CAP.draftTag)}
    >
      {children}
    </span>
  );
}
