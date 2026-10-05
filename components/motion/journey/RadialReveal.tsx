import type { ReactNode } from "react";

/**
 * The board's backdrop layer, revealed centre-out (TKT-110, spec §1). A positioned box the size of
 * the board (`inset: 0`) wrapping the decorative backdrop; while the choreography is armed the CSS
 * clips it with `circle(0% at 50% 50%)` and grows it to `circle(100%)` when the runner leaves `idle`.
 * No client code, `aria-hidden` (it only ever holds decoration). Final state = no clip at all.
 */
export function RadialReveal({ children }: { children: ReactNode }) {
  return (
    <div data-journey-radial="" aria-hidden="true" className="jr-radial">
      {children}
    </div>
  );
}
