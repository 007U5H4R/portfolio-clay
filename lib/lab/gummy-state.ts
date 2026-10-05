/**
 * The gummy's physics state (gummy-bear.md §43): one explicit state drives its animation and face.
 * Priority order: DRAGGED > SQUISHED > DANGER > BOUNCING > POWERED > AIRBORNE > GROUND.
 */
export type GummyPhysicsState = "GROUND" | "AIRBORNE" | "DRAGGED" | "SQUISHED" | "BOUNCING" | "DANGER" | "POWERED";

export interface GummySignals {
  dragged: boolean;
  squishing: boolean;
  inDanger: boolean;
  /** Seconds since a launch/bounce, or Infinity. */
  sinceBounce: number;
  powered: boolean;
  grounded: boolean;
}

export const BOUNCING_WINDOW_S = 0.45;

export function physicsState(s: GummySignals): GummyPhysicsState {
  if (s.dragged) return "DRAGGED";
  if (s.squishing) return "SQUISHED";
  if (s.inDanger) return "DANGER";
  if (s.sinceBounce < BOUNCING_WINDOW_S) return "BOUNCING";
  if (s.powered) return "POWERED";
  return s.grounded ? "GROUND" : "AIRBORNE";
}
