import { describe, expect, it } from "vitest";
import { observeLab } from "@/lib/analytics/lab";
import { createLabStore, type RunSummary } from "@/lib/lab/store";

/**
 * TASK-194 — the Gummy Lab observer. It watches the HUD store only, so the tests drive the real store
 * and state machine the way LabApp / the engine driver do and assert the resulting event stream.
 */
function harness() {
  const store = createLabStore();
  const events: Array<[string, Record<string, unknown>]> = [];
  const observer = observeLab(store, { track: ((n: string, p: Record<string, unknown>) => void events.push([n, p])) as never, input: "pointer", device: "desktop" });
  const names = () => events.map(([n]) => n);
  const summary = (over: Partial<RunSummary> = {}): RunSummary => ({ score: 1234, timeS: 41, combo: 3, targets: 1, powerUps: 0, saves: 1, newBest: false, best: { score: 2000, timeS: 60, combo: 5 }, status: "x", ...over });
  const s = () => store.getState();
  const toIntro = () => { s().send("DISCOVER"); s().send("INTRO_READY"); };
  const startRun = (event: "PLAY" | "REPLAY") => { s().send(event); store.setState({ runId: s().runId + 1, score: 0, combo: 1, timeS: 0, powers: [], tpMode: false, launched: false, summary: null }); };
  const play = () => { s().send("COUNTDOWN_DONE"); };
  /** The driver's GAME_OVER → (1.3 s) → finish(): state RESULTS with the engine's summary. */
  const gameOver = (sum: RunSummary) => { s().send("DANGER_ENTER"); s().send("TIME_UP"); const final = s().send("SHOW_RESULTS"); store.setState({ summary: sum, state: final }); };
  return { store, events, names, observer, summary, s, toIntro, startRun, play, gameOver };
}

describe("Gummy Lab analytics (TASK-194)", () => {
  it("emits the intro once and game_started on the first run only", () => {
    const h = harness();
    h.toIntro();
    h.s().patch({ timeS: 0 });
    expect(h.names()).toEqual(["game_intro_viewed"]);
    h.startRun("PLAY");
    h.play();
    expect(h.events.at(-1)).toEqual(["game_started", { input_method: "pointer", device_type: "desktop" }]);
    expect(h.names().filter((n) => n === "game_started")).toHaveLength(1);
  });

  it("game_over fires exactly once per run, with the engine's final score and whole seconds", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.gameOver(h.summary({ score: 4821, timeS: 77 }));
    h.s().patch({ hint: null }); // later unrelated store updates must not re-report
    h.s().patch({ score: 99 });
    const overs = h.events.filter(([n]) => n === "game_over");
    expect(overs).toEqual([["game_over", { survival_time_seconds: 77, score: 4821, end_reason: "drained" }]]);
  });

  it("game_replayed carries the previous run's score; a second run reports its own game_over", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.gameOver(h.summary({ score: 500, timeS: 20 }));
    h.startRun("REPLAY");
    expect(h.events.at(-1)).toEqual(["game_replayed", { previous_score: 500 }]);
    h.play();
    h.gameOver(h.summary({ score: 900, timeS: 35 }));
    expect(h.events.filter(([n]) => n === "game_over").map(([, p]) => p.score)).toEqual([500, 900]);
    expect(h.names().filter((n) => n === "game_started")).toHaveLength(1);
  });

  it("interactions and milestones are first-of-kind per run, bounded, and re-arm on a replay", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.s().patch({ launched: true });
    h.s().patch({ nudgeRun: 1 }); h.s().patch({ nudgeRun: 2 }); h.s().patch({ nudgeRun: 3 });
    h.s().patch({ powers: [{ type: "RAINBOW", left: 5 }] });
    h.s().patch({ powers: [{ type: "RAINBOW", left: 5 }, { type: "GOLDEN", left: 5 }] });
    for (let t = 0; t <= 70; t += 0.1) h.s().patch({ timeS: Math.round(t * 10) / 10 });
    h.s().patch({ combo: 5 }); h.s().patch({ combo: 6 }); h.s().patch({ combo: 5 });
    h.s().patch({ tpMode: true });
    const inter = h.events.filter(([n]) => n === "game_interaction_performed").map(([, p]) => p.interaction_type);
    expect(inter).toEqual(["launch", "nudge", "power_up"]);
    const miles = h.events.filter(([n]) => n === "game_milestone_reached").map(([, p]) => p.milestone_type);
    expect(miles).toEqual(["survived_30s", "survived_60s", "combo_5", "tp_mode"]);

    h.gameOver(h.summary());
    h.startRun("REPLAY"); h.play();
    h.s().patch({ launched: true });
    expect(h.events.filter(([n]) => n === "game_interaction_performed")).toHaveLength(4);
  });

  it("escaping the danger zone is a danger_escape interaction (once per run)", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.s().send("DANGER_ENTER"); h.s().send("DANGER_EXIT");
    h.s().send("DANGER_ENTER"); h.s().send("DANGER_EXIT");
    expect(h.events.filter(([, p]) => p.interaction_type === "danger_escape")).toHaveLength(1);
  });

  it("leaving between GAME_OVER and the results card still reports that run once, from the last HUD values", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.s().patch({ score: 700, timeS: 19.7 });
    h.s().send("DANGER_ENTER"); h.s().send("TIME_UP");
    expect(h.s().state).toBe("GAME_OVER");
    h.observer.exit("button");
    h.s().send("EXIT");
    expect(h.events.filter(([n]) => n === "game_over")).toEqual([["game_over", { survival_time_seconds: 19, score: 700, end_reason: "drained" }]]);
    expect(h.events.at(-1)).toEqual(["game_exited_to_portfolio", { exit_location: "playing" }]);
  });

  it.each([
    ["portal", "PLAYING", "portal"],
    ["button", "INTRO", "intro"],
    ["button", "PAUSED", "paused"],
    ["button", "RESULTS", "results"],
  ] as const)("exit via %s from %s reports %s, once", (via, state, location) => {
    const h = harness();
    h.toIntro();
    if (state !== "INTRO") { h.startRun("PLAY"); h.play(); }
    if (state === "PAUSED") h.s().send("PAUSE");
    if (state === "RESULTS") h.gameOver(h.summary());
    if (state === "PLAYING") expect(h.s().state).toBe("PLAYING");
    h.observer.exit(via);
    h.observer.exit(via);
    expect(h.events.filter(([n]) => n === "game_exited_to_portfolio")).toEqual([["game_exited_to_portfolio", { exit_location: location }]]);
  });

  it("the no-WebGL fallback exit is its own location", () => {
    const h = harness();
    h.observer.exit("button", true);
    expect(h.events).toEqual([["game_exited_to_portfolio", { exit_location: "fallback" }]]);
  });

  it("stops observing after dispose", () => {
    const h = harness();
    h.observer.dispose();
    h.toIntro();
    expect(h.events).toEqual([]);
  });

  it("emits nothing for HUD updates that change no tracked field (cheap on every store write)", () => {
    const h = harness();
    h.toIntro(); h.startRun("PLAY"); h.play();
    h.events.length = 0;
    for (let i = 0; i < 500; i++) h.s().patch({ score: i, hint: i % 2 ? "x" : null, dangerLeft: null });
    expect(h.events).toEqual([]);
  });
});
