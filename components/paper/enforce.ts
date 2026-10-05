import { Children, isValidElement, type ReactNode } from "react";

/**
 * Render-time enforcement of the paper limits (Design.md §3.2 rule 8 · §3.4; S70.05/S70.07).
 *   - test (`NODE_ENV === "test"`, Vitest): a violation **throws**, so a fixture fails its unit test.
 *   - development (`next dev`): `console.error` — the page still renders, the log names the rule.
 *   - production (`next build` / `next start`): inert — no check runs, nothing is logged.
 * EVAL-018 (`tests/e2e/eval-018.spec.ts`) measures the same rules in the built pages.
 */
export function paperViolation(message: string): void {
  const env = process.env.NODE_ENV;
  if (env === "production") return;
  const full = `[paper] ${message}`;
  if (env === "test") throw new Error(full);
  console.error(full);
}

/** A softer rule (a fastener outside a host): logged in development and test, inert in production. */
export function paperWarning(message: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.error(`[paper] ${message}`);
}

/** Whether render-time checks run at all (skip the work in production). */
export function enforcing(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** The plain text a React subtree renders (strings/numbers, recursively through element children). */
export function textOf(node: ReactNode): string {
  let out = "";
  Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number") out += String(child);
    else if (isValidElement<{ children?: ReactNode }>(child)) out += textOf(child.props.children);
  });
  return out;
}
