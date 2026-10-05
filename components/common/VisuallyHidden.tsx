import type { ElementType, ReactNode } from "react";

/**
 * Props the polymorphic shell passes down. A bare `ElementType` is the union of every intrinsic
 * element — and `@react-three/fiber` (the lazy /lab game) augments JSX with three.js elements whose
 * `children` is `never`, which breaks that union. Narrowing to the props we actually pass keeps it
 * a DOM-tag-or-component type (type-only; no runtime change).
 */
type DomShellProps = { className?: string; children?: ReactNode; [attr: `data-${string}`]: string | undefined };

export interface VisuallyHiddenProps {
  children: ReactNode;
  /** Render as something other than a <span> (e.g. "div") when the context needs it. */
  as?: ElementType | undefined;
  className?: string | undefined;
}

/**
 * Screen-reader-only text (Design.md §3 "Common primitives"). Visually removed but kept in the
 * accessibility tree and the DOM — used for "opens in new tab" notes, icon-only action names, and
 * any label that must be announced but not seen. Tailwind's `sr-only` is the WCAG-standard clip
 * technique (not `display:none`, which would hide it from assistive tech too).
 */
export function VisuallyHidden({ children, as, className }: VisuallyHiddenProps) {
  const Component = (as ?? "span") as ElementType<DomShellProps>;
  return <Component className={["sr-only", className].filter(Boolean).join(" ")}>{children}</Component>;
}
