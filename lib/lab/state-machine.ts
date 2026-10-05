/**
 * The Gummy Lab state machine (gummy-bear.md §42): explicit states, no loose boolean flags. Pure,
 * table-driven and tested (tests/unit/lab-state-machine.test.ts).
 *
 *   IDLE → DISCOVERED → INTRO → COUNTDOWN → PLAYING ⇄ DANGER → GAME_OVER → RESULTS → (REPLAY) COUNTDOWN
 *                                   PLAYING/DANGER ⇄ PAUSED         any state —EXIT→ EXITING (terminal)
 */
export type GameState =
  | "IDLE"
  | "DISCOVERED"
  | "INTRO"
  | "COUNTDOWN"
  | "PLAYING"
  | "PAUSED"
  | "DANGER"
  | "GAME_OVER"
  | "RESULTS"
  | "EXITING";

export type GameEvent =
  | "DISCOVER"
  | "INTRO_READY"
  | "PLAY"
  | "COUNTDOWN_DONE"
  | "PAUSE"
  | "RESUME"
  | "DANGER_ENTER"
  | "DANGER_EXIT"
  | "TIME_UP"
  | "SHOW_RESULTS"
  | "REPLAY"
  | "EXIT";

const TABLE: Record<GameState, Partial<Record<GameEvent, GameState>>> = {
  IDLE: { DISCOVER: "DISCOVERED" },
  DISCOVERED: { INTRO_READY: "INTRO" },
  INTRO: { PLAY: "COUNTDOWN" },
  COUNTDOWN: { COUNTDOWN_DONE: "PLAYING" },
  PLAYING: { PAUSE: "PAUSED", DANGER_ENTER: "DANGER" },
  DANGER: { PAUSE: "PAUSED", DANGER_EXIT: "PLAYING", TIME_UP: "GAME_OVER" },
  PAUSED: {}, // RESUME is resolved against the remembered state
  GAME_OVER: { SHOW_RESULTS: "RESULTS" },
  RESULTS: { REPLAY: "COUNTDOWN" },
  EXITING: {},
};

/** The states from which EXIT is accepted: everything but the terminal EXITING itself. */
export const TERMINAL: GameState = "EXITING";

export function nextState(state: GameState, event: GameEvent): GameState | null {
  if (event === "EXIT") return state === TERMINAL ? null : TERMINAL;
  return TABLE[state][event] ?? null;
}

export class GameMachine {
  state: GameState = "IDLE";
  private pausedFrom: "PLAYING" | "DANGER" = "PLAYING";

  /** Apply an event; illegal events are ignored (the state is returned unchanged). */
  send(event: GameEvent): GameState {
    if (event === "RESUME") {
      if (this.state === "PAUSED") this.state = this.pausedFrom;
      return this.state;
    }
    if (event === "PAUSE" && (this.state === "PLAYING" || this.state === "DANGER")) this.pausedFrom = this.state;
    const next = nextState(this.state, event);
    if (next) this.state = next;
    return this.state;
  }

  /** Time passes only while the bear is in play. */
  get running(): boolean {
    return this.state === "PLAYING" || this.state === "DANGER";
  }

  /** The bear is under physics control (not parked for the intro/countdown/results). */
  get live(): boolean {
    return this.running || this.state === "PAUSED" || this.state === "GAME_OVER";
  }
}
