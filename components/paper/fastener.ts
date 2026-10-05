import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { enforcing, paperViolation } from "./enforce";

/** A host carries at most this many fasteners (Design.md §3.2 rule 8). */
export const MAX_FASTENERS = 2;

/**
 * The static marker a fastener component carries (`Tape.isFastener`, `Pin.isFastener`). `Sheet`
 * scans its direct children for it (S70.05) — a fastener must be a **direct child** of its host.
 */
export const FASTENER: unique symbol = Symbol.for("paper.fastener");

/**
 * Internal prop `Sheet` sets on each fastener it hosts. Not part of any public props type; a
 * fastener rendered without it is outside a host and logs a warning (Design.md §3.2 rule 8).
 */
export const HOSTED_PROP = "__paperHosted";

type MaybeFastener = { isFastener?: symbol };

/** True for a `<Tape/>` (not `free`) or `<Pin/>` element. */
export function isFastenerElement(node: ReactNode): boolean {
  if (!isValidElement<{ free?: boolean }>(node)) return false;
  const type = node.type as MaybeFastener | string;
  return typeof type !== "string" && type.isFastener === FASTENER && node.props.free !== true;
}

/**
 * A host's children with each direct fastener child marked as hosted; counts them and reports a
 * violation above `MAX_FASTENERS` (throws in test, `console.error` in dev). Inert in production:
 * the children are returned untouched.
 */
export function hostFasteners(children: ReactNode, host: string): ReactNode {
  if (!enforcing()) return children;
  let count = 0;
  const hosted = Children.toArray(children).map((child) => {
    if (!isFastenerElement(child)) return child;
    count += 1;
    return cloneElement(child as ReactElement<Record<string, unknown>>, { [HOSTED_PROP]: true });
  });
  if (count > MAX_FASTENERS) {
    paperViolation(`<${host}> has ${count} fasteners; a host carries at most ${MAX_FASTENERS} (Design.md §3.2 rule 8).`);
  }
  return hosted;
}
