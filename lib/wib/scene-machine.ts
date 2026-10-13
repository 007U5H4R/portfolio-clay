/**
 * TASK-203 · the shared "What I Bring" scene state machine. Pure and framework-free so it is unit-tested alone.
 *
 * Three things are kept apart (spec §6): INTERACTION (hover / focus / pin: `data-active`, owned by the journey) ·
 * SCENE PROGRESS (this machine: rest -> playing -> settled, per stage) · VISUAL TRANSFORMS (CSS only: the phase is a
 * `data-phase` attribute, the parts animate themselves). Hover never plays the sequence; a click, Enter or tap does.
 *
 *   rest      --ACTIVATE-->  playing   (reduced motion: straight to settled, nothing travels)
 *   playing   --DONE------>  settled   (or rest, when the stage was left meanwhile: the sequence is never cut mid-way)
 *   settled   --ACTIVATE-->  resetting (eases back to rest) --RESET_DONE--> playing   = a repeatable replay
 *   any       --LEAVE----->  rest      (a playing stage finishes first: `leaving`)
 *
 * `epoch` bumps on every transition into playing/resetting so a stale timer's DONE / RESET_DONE is ignored.
 */
export type Phase = "rest" | "playing" | "settled" | "resetting";
export type SceneState = { phase: Phase; epoch: number; leaving: boolean };
export type SceneAction =
  | { type: "ACTIVATE"; id: string; reduced?: boolean }
  | { type: "DONE"; id: string; epoch: number }
  | { type: "RESET_DONE"; id: string; epoch: number }
  | { type: "LEAVE"; id: string };
export type SceneStates = Record<string, SceneState>;

export const REST: SceneState = { phase: "rest", epoch: 0, leaving: false };
/** The ease-back before a replay, ms (the CSS return transition is 280 ms). */
export const RESET_MS = 300;

export function sceneOf(states: SceneStates, id: string): SceneState {
  return states[id] ?? REST;
}

export function sceneReducer(states: SceneStates, action: SceneAction): SceneStates {
  const cur = sceneOf(states, action.id);
  let next: SceneState = cur;
  switch (action.type) {
    case "ACTIVATE":
      if (cur.phase === "rest") next = action.reduced ? { phase: "settled", epoch: cur.epoch, leaving: false } : { phase: "playing", epoch: cur.epoch + 1, leaving: false };
      else if (cur.phase === "settled") next = action.reduced ? cur : { phase: "resetting", epoch: cur.epoch + 1, leaving: false };
      else if (cur.leaving) next = { ...cur, leaving: false }; // selected again while finishing: stay
      break;
    case "DONE":
      if (cur.phase === "playing" && cur.epoch === action.epoch) next = cur.leaving ? { phase: "rest", epoch: cur.epoch, leaving: false } : { phase: "settled", epoch: cur.epoch, leaving: false };
      break;
    case "RESET_DONE":
      if (cur.phase === "resetting" && cur.epoch === action.epoch) next = { phase: "playing", epoch: cur.epoch + 1, leaving: false };
      break;
    case "LEAVE":
      if (cur.phase === "playing") next = cur.leaving ? cur : { ...cur, leaving: true };
      else if (cur.phase !== "rest") next = { phase: "rest", epoch: cur.epoch, leaving: false };
      break;
  }
  return next === cur ? states : { ...states, [action.id]: next };
}
