import type { CSSProperties, ReactNode } from "react";

export interface StageRollProps {
  /** Position in the story (0-based) — the runner addresses stages in DOM order; this is for CSS/tests. */
  index: number;
  /**
   * Where the paper starts its roll relative to its final angle (spec §4: ±1–2°); interpolated to 0
   * during the rollout, so the card settles on the host Sheet's own final rotation (spec §11).
   */
  startTilt: number;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * One unrolling paper banner (TKT-110, spec §4, §5, §7, §8, §10). A plain wrapper — no client code:
 * the choreography root (`ProductThinkingJourney`) flips its `data-roll` (rolled → rolling → settled)
 * and the TKT-110 CSS does the clip-path unroll, recoil, pin landing and content stagger. With no
 * `data-roll` (SSR, no-JS, reduced motion) the card is simply in its final state.
 */
export function StageRoll({ index, startTilt, className, children }: StageRollProps) {
  return (
    <div
      data-journey-stage={index}
      className={["jr-roll", className].filter(Boolean).join(" ")}
      style={{ "--jr-tilt": `${startTilt}deg` } as CSSProperties}
    >
      {children}
    </div>
  );
}
