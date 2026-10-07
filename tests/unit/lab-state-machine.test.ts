/** TASK-143.4 — the explicit game state machine (gummy-bear.md §42). */
import { describe, expect, it } from "vitest";
import { GameMachine, nextState, type GameEvent, type GameState } from "@/lib/lab/state-machine";

const ALL: GameState[] = ["IDLE", "DISCOVERED", "INTRO", "COUNTDOWN", "PLAYING", "PAUSED", "DANGER", "GAME_OVER", "RESULTS", "EXITING"];

describe("GameMachine", () => {
  it("walks the happy path from discovery to results and replay", () => {
    const m = new GameMachine();
    const path: [GameEvent, GameState][] = [
      ["DISCOVER", "DISCOVERED"],
      ["INTRO_READY", "INTRO"],
      ["PLAY", "COUNTDOWN"],
      ["COUNTDOWN_DONE", "PLAYING"],
      ["DANGER_ENTER", "DANGER"],
      ["DANGER_EXIT", "PLAYING"],
      ["DANGER_ENTER", "DANGER"],
      ["TIME_UP", "GAME_OVER"],
      ["SHOW_RESULTS", "RESULTS"],
      ["REPLAY", "COUNTDOWN"],
    ];
    for (const [event, state] of path) expect(m.send(event)).toBe(state);
  });

  it("pause remembers whether it interrupted PLAYING or DANGER", () => {
    const m = new GameMachine();
    ["DISCOVER", "INTRO_READY", "PLAY", "COUNTDOWN_DONE"].forEach((e) => m.send(e as GameEvent));
    m.send("PAUSE");
    expect(m.state).toBe("PAUSED");
    m.send("RESUME");
    expect(m.state).toBe("PLAYING");
    m.send("DANGER_ENTER");
    m.send("PAUSE");
    m.send("RESUME");
    expect(m.state).toBe("DANGER");
  });

  it("ignores illegal events instead of corrupting the state", () => {
    const m = new GameMachine();
    expect(m.send("PLAY")).toBe("IDLE");
    expect(m.send("TIME_UP")).toBe("IDLE");
    m.send("DISCOVER");
    expect(m.send("DANGER_ENTER")).toBe("DISCOVERED");
    expect(m.send("RESUME")).toBe("DISCOVERED");
  });

  it("danger cannot be entered while paused, and time cannot run out outside danger", () => {
    const m = new GameMachine();
    ["DISCOVER", "INTRO_READY", "PLAY", "COUNTDOWN_DONE", "PAUSE"].forEach((e) => m.send(e as GameEvent));
    expect(m.send("DANGER_ENTER")).toBe("PAUSED");
    m.send("RESUME");
    expect(m.send("TIME_UP")).toBe("PLAYING");
  });

  it("EXIT is accepted from every state and EXITING is terminal", () => {
    for (const s of ALL) {
      if (s === "EXITING") continue;
      expect(nextState(s, "EXIT")).toBe("EXITING");
    }
    const m = new GameMachine();
    m.send("EXIT");
    for (const e of ["DISCOVER", "PLAY", "REPLAY", "RESUME", "PAUSE"] as GameEvent[]) expect(m.send(e)).toBe("EXITING");
  });

  it("exposes whether time runs and whether the bear is under physics", () => {
    const m = new GameMachine();
    expect([m.running, m.live]).toEqual([false, false]);
    ["DISCOVER", "INTRO_READY", "PLAY", "COUNTDOWN_DONE"].forEach((e) => m.send(e as GameEvent));
    expect([m.running, m.live]).toEqual([true, true]);
    m.send("PAUSE");
    expect([m.running, m.live]).toEqual([false, true]);
  });
});
