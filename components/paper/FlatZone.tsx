import type { ReactNode } from "react";

export type FlatZoneProps = {
  as?: "div" | "section" | "article" | "dl" | "table" | undefined;
  className?: string | undefined;
  children: ReactNode;
};

/**
 * A reading zone (Design.md §3.1 / §3.2 rule 4; S70.07): `<{as} data-flat>`. Holds **0**
 * `data-decor` descendants (EVAL-018 measures it); `data-hand="quote"` content is allowed inside.
 */
export function FlatZone({ as: Component = "div", className, children }: FlatZoneProps) {
  return (
    <Component data-flat="" className={className}>
      {children}
    </Component>
  );
}
