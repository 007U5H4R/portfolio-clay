import type { ReactNode } from "react";
import { ROTATION_CAP, rotationStyle } from "./rotation";
import { ANNOTATION_ARROWS, type AnnotationArrow } from "./sketch-paths";

/** No HTML-attribute spread — the props type has no `aria-hidden` (Design.md §3.2 rule 6). */
export type AnnotationProps = {
  /** Optional arrow drawn inside the annotation (it is part of the same counted object). */
  arrow?: AnnotationArrow | undefined;
  /** Degrees; clamped to ±4 (Design.md §3.1). */
  rotate?: number | undefined;
  /** sm 17 px · md 20 px · lg 22 px · hero clamp(26px, 2.6vw, 34px) (Design.md §2.2). */
  size?: "sm" | "md" | "lg" | "hero" | undefined;
  as?: "p" | "figcaption" | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * Hand-written caption / aside / margin note (Design.md §3.1; S70.02) — one counted decoration,
 * Caveat, always `aria-hidden`. The arrow `<svg>` sits *inside* the element and carries no
 * `data-decor` of its own.
 */
export function Annotation({ arrow, rotate, size = "md", as: Tag = "p", className, children }: AnnotationProps) {
  const drawing = arrow ? ANNOTATION_ARROWS[arrow] : undefined;
  const [, , width, height] = drawing ? drawing.viewBox.split(" ") : [];
  const paths = drawing?.paths.map((p) => <path key={p.d} d={p.d} className={p.className} />);
  return (
    <Tag
      data-decor="annotation"
      aria-hidden="true"
      data-size={size}
      className={["paper-annotation font-hand", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, 0, ROTATION_CAP.annotation)}
    >
      {children}
      {drawing ? (
        <svg
          className="annotation-arrow"
          data-arrow={arrow}
          viewBox={drawing.viewBox}
          width={width}
          height={height}
          focusable="false"
        >
          {drawing.transform ? <g transform={drawing.transform}>{paths}</g> : paths}
        </svg>
      ) : null}
    </Tag>
  );
}
