// @vitest-environment jsdom
/** TASK-143.4 — score, combo, danger/rescue, power-ups, TP MODE, achievements, replay (gummy-bear.md §15–23, §32–35). */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COMBO_MAX, DANGER_SECONDS, GameEngine, statusFor } from "@/lib/lab/engine";
import { GameMachine } from "@/lib/lab/state-machine";
import { loadStored } from "@/lib/lab/storage";

function setup() {
  const machine = new GameMachine();
  const engine = new GameEngine(machine);
  const events: string[] = [];
  engine.onEvent = (e) => events.push(e.type);
  machine.send("DISCOVER");
  machine.send("INTRO_READY");
  return { machine, engine, events };
}

/** Walk to PLAYING (play pressed, countdown elapsed). */
function play(machine: GameMachine, engine: GameEngine) {
  machine.send("PLAY");
  engine.beginRun();
  engine.update(10, { inDanger: false });
  expect(machine.state).toBe("PLAYING");
}

function tick(engine: GameEngine, seconds: number, inDanger = false, dt = 1 / 30) {
  for (let t = 0; t < seconds; t += dt) engine.update(dt, { inDanger });
}

beforeEach(() => window.localStorage.clear());
afterEach(() => window.localStorage.clear());

describe("run lifecycle", () => {
  it("counts down before play and only then runs the clock", () => {
    const { machine, engine } = setup();
    machine.send("PLAY");
    engine.beginRun();
    expect(machine.state).toBe("COUNTDOWN");
    expect(engine.snapshot().countdown).toBe(3);
    engine.update(1.1, { inDanger: false });
    expect(engine.snapshot().countdown).toBe(2);
    expect(engine.snapshot().timeS).toBe(0);
    engine.update(2.5, { inDanger: false });
    expect(machine.state).toBe("PLAYING");
    tick(engine, 2);
    expect(engine.snapshot().timeS).toBeCloseTo(2, 0);
  });

  it("time does not advance while paused", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 1);
    machine.send("PAUSE");
    const t = engine.snapshot().timeS;
    tick(engine, 5);
    expect(engine.snapshot().timeS).toBe(t);
  });
});

describe("scoring and combo", () => {
  it("survival time scores 10 points a second", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 5);
    expect(engine.snapshot().score).toBeGreaterThanOrEqual(48);
    expect(engine.snapshot().score).toBeLessThanOrEqual(52);
  });

  it("successive actions raise the combo x2 x3 x4 x5 and multiply points", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    const before = engine.snapshot().score;
    engine.action("pad", "P1");
    expect(engine.snapshot().combo).toBe(1);
    engine.action("ring", 1);
    expect(engine.snapshot().combo).toBe(2);
    engine.action("bumper", "B1");
    expect(engine.snapshot().combo).toBe(3);
    engine.action("star", 2);
    expect(engine.snapshot().combo).toBe(4);
    // 25*1 + 100*2 + 100*3 (a bumper is 100 since TASK-185) + 150*4
    expect(engine.snapshot().score - before).toBe(25 + 200 + 300 + 600);
  });

  it("the combo caps at x10 and unlocks WOBBLE MASTER", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    for (let i = 0; i < 14; i += 1) engine.action("ring", i);
    expect(engine.snapshot().combo).toBe(COMBO_MAX);
    expect(events).toContain("achievement");
    expect(loadStored().achievements).toContain("WOBBLE_MASTER");
  });

  it("the combo holds for 3 s of quiet, then decays slowly", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    for (let i = 0; i < 4; i += 1) engine.action("ring", i);
    expect(engine.snapshot().combo).toBe(4);
    tick(engine, 2.5);
    expect(engine.snapshot().combo).toBe(4);
    tick(engine, 2);
    expect(engine.snapshot().combo).toBeLessThan(4);
    tick(engine, 30);
    expect(engine.snapshot().combo).toBe(1);
  });

  it("re-hitting the same thing straight away does not farm the combo", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    engine.action("pad", "P1");
    const s1 = engine.snapshot();
    engine.action("pad", "P1");
    engine.action("pad", "P1");
    expect(engine.snapshot().combo).toBe(s1.combo);
    expect(engine.snapshot().score - s1.score).toBeLessThan(25);
  });
});

describe("danger and rescue", () => {
  it("briefly touching danger does not kill; a countdown starts from 1.2 s", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    engine.update(0.1, { inDanger: true });
    expect(machine.state).toBe("DANGER");
    expect(engine.snapshot().dangerLeft).toBeCloseTo(DANGER_SECONDS - 0.1, 1);
    engine.update(0.2, { inDanger: false });
    expect(machine.state).toBe("PLAYING");
    expect(engine.snapshot().dangerLeft).toBeNull();
  });

  it("leaving danger cancels the countdown and a late rescue is a 'save' bonus", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    const before = engine.snapshot().score;
    tick(engine, 0.7, true);
    expect(machine.state).toBe("DANGER");
    tick(engine, 0.1, false);
    expect(machine.state).toBe("PLAYING");
    expect(events).toContain("save");
    expect(engine.snapshot().score - before).toBeGreaterThan(90);
    expect(engine.summary().saves).toBe(1);
  });

  it("the countdown recovers while safe, so skimming the floor repeatedly is not free", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 0.8, true);
    tick(engine, 0.1, false);
    tick(engine, 0.1, true);
    // 0.8 s spent, recovered ~0.06 s: well under the full 1.2 s
    expect(engine.snapshot().dangerLeft!).toBeLessThan(0.55);
  });

  it("staying in danger past 1.2 s ends the run", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    tick(engine, 1.4, true);
    expect(machine.state).toBe("GAME_OVER");
    expect(events).toContain("game-over");
  });

  it("a gummy droplet restores danger time in danger and is a small bonus otherwise", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    const s0 = engine.snapshot().score;
    engine.collect("droplet", 1);
    expect(engine.snapshot().score - s0).toBe(50);
    expect(engine.snapshot().combo).toBe(1);
    tick(engine, 0.9, true);
    const left = engine.snapshot().dangerLeft!;
    engine.collect("droplet", 2);
    expect(engine.snapshot().dangerLeft!).toBeGreaterThan(left);
    expect(engine.snapshot().dangerLeft!).toBeLessThanOrEqual(DANGER_SECONDS);
  });
});

describe("power-ups", () => {
  it("Low Gravity lowers gravity for ~7 s then expires", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    const g = engine.env().gravityMul;
    engine.activate("LOW_GRAVITY");
    expect(engine.env().gravityMul).toBeLessThan(g * 0.6);
    expect(engine.env().lowGravity).toBe(1);
    tick(engine, 6.5);
    expect(engine.env().lowGravity).toBe(1);
    tick(engine, 1);
    expect(engine.env().lowGravity).toBe(0);
    expect(events).toContain("powerup-end");
  });

  it("Golden Gummy doubles action points while active", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    const a = engine.snapshot().score;
    engine.action("ring", 1);
    const plain = engine.snapshot().score - a;
    tick(engine, 25); // let the combo reset, ignore survival points below
    engine.activate("GOLDEN");
    const b = engine.snapshot().score;
    engine.action("ring", 2);
    expect(engine.snapshot().score - b).toBe(plain * 2);
    expect(engine.env().gold).toBe(1);
  });

  it("Rainbow adds a bonus multiplier and a little extra bounce", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    expect(engine.env().bounceMul).toBe(1);
    engine.activate("RAINBOW");
    expect(engine.env().rainbow).toBe(1);
    expect(engine.env().bounceMul).toBeGreaterThan(1);
    expect(engine.snapshot().powers.map((p) => p.type)).toContain("RAINBOW");
  });

  it("Super Squish is single use: consumed by the next squish", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    expect(engine.consumeSuperSquish()).toBe(1);
    engine.activate("SUPER_SQUISH");
    expect(engine.env().superSquish).toBe(true);
    expect(engine.consumeSuperSquish()).toBeGreaterThan(1.5);
    expect(engine.env().superSquish).toBe(false);
    expect(engine.consumeSuperSquish()).toBe(1);
  });

  it("Time Freeze (rare) slows the arena for ~3 s", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 25);
    const m = engine.env().motion;
    engine.activate("TIME_FREEZE");
    expect(engine.env().motion).toBeLessThan(m * 0.3);
    tick(engine, 3.2);
    expect(engine.env().motion).toBeGreaterThan(m * 0.3);
  });

  it("counts power-ups used for the results", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    engine.activate("GOLDEN");
    engine.activate("LOW_GRAVITY");
    expect(engine.summary().powerUps).toBe(2);
  });
});

describe("TP MODE and achievements", () => {
  it("hitting all four special targets in one run triggers TP MODE (once)", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    for (const t of ["AI", "PRODUCT", "DESIGN"] as const) engine.hitTarget(t);
    expect(engine.snapshot().tpMode).toBe(false);
    engine.hitTarget("AI");
    expect(engine.snapshot().tpMode).toBe(false);
    engine.hitTarget("BUILD");
    expect(engine.snapshot().tpMode).toBe(true);
    expect(events.filter((e) => e === "tp-mode")).toHaveLength(1);
    expect(loadStored().achievements).toContain("PRODUCT_SENSE");
    expect(engine.summary().targets).toBe(4);
  });

  it("TP MODE raises the score multiplier and lights the environment", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    expect(engine.scoreMultiplier()).toBe(1);
    expect(engine.env().tpGlow).toBe(0);
    for (const t of ["AI", "PRODUCT", "DESIGN", "BUILD"] as const) engine.hitTarget(t);
    expect(engine.scoreMultiplier()).toBeGreaterThan(1);
    expect(engine.env().tpGlow).toBe(1);
    engine.activate("GOLDEN");
    expect(engine.scoreMultiplier()).toBeCloseTo(2 * 1.5, 5);
  });

  it("surviving 30 s unlocks GUMMY OPERATOR", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 30.5);
    expect(loadStored().achievements).toContain("GUMMY_OPERATOR");
  });

  it("entering the lab unlocks CURIOUS MIND once", () => {
    const { engine, events } = setup();
    engine.discover();
    engine.discover();
    expect(events.filter((e) => e === "achievement")).toHaveLength(1);
    expect(loadStored().achievements).toEqual(["CURIOUS_MIND"]);
  });
});

describe("game over, results and replay", () => {
  it("produces a results summary, saves the best score and reports new best", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 6);
    engine.action("ring", 1);
    tick(engine, 1.4, true);
    expect(machine.state).toBe("GAME_OVER");
    const r = engine.finish();
    expect(machine.state).toBe("RESULTS");
    expect(r.score).toBeGreaterThan(60);
    expect(r.newBest).toBe(true);
    expect(r.best.score).toBe(r.score);
    expect(loadStored().bestScore).toBe(r.score);
    expect(r.status.length).toBeGreaterThan(5);
  });

  it("replay resets all run state but keeps the stored best", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    tick(engine, 4);
    engine.action("star", 1);
    engine.activate("GOLDEN");
    tick(engine, 1.4, true);
    const first = engine.finish();
    machine.send("REPLAY");
    engine.beginRun();
    const s = engine.snapshot();
    expect(machine.state).toBe("COUNTDOWN");
    expect(s).toMatchObject({ score: 0, combo: 1, timeS: 0, dangerLeft: null, tpMode: false, powers: [] });
    expect(engine.env().gold).toBe(0);
    expect(engine.summary().targets).toBe(0);
    expect(loadStored().bestScore).toBe(first.score);
  });

  it("status lines escalate with survival time", () => {
    expect(statusFor({ timeS: 5, tpMode: false })).toMatch(/briefly/i);
    expect(statusFor({ timeS: 18, tpMode: false })).toMatch(/mostly/i);
    expect(statusFor({ timeS: 50, tpMode: false })).toBe("Certified Gummy Operator");
    expect(statusFor({ timeS: 5, tpMode: true })).toMatch(/TP/);
  });
});

describe("difficulty feeds the environment", () => {
  it("phase advances with time and the engine announces it", () => {
    const { machine, engine, events } = setup();
    play(machine, engine);
    expect(engine.env().phase).toBe(0);
    tick(engine, 21);
    expect(engine.env().phase).toBe(2);
    expect(events).toContain("phase");
  });
});

describe("pinball scoring (TASK-185)", () => {
  it("each target scores its own value and a bumper scores 100, fed through the same combo", () => {
    for (const [name, value] of [["AI", 150], ["DESIGN", 200], ["PRODUCT", 250], ["BUILD", 300]] as const) {
      const { machine, engine } = setup();
      play(machine, engine);
      const before = engine.snapshot().score;
      const pts = engine.hitTarget(name);
      expect(pts, name).toBe(value); // first action of the run: combo ×1
      expect(engine.snapshot().score - before, name).toBe(value);
    }
    const { machine, engine } = setup();
    play(machine, engine);
    const before = engine.snapshot().score;
    expect(engine.action("bumper", "B1")).toBe(100);
    expect(engine.snapshot().score - before).toBe(100);
  });

  it("the combo multiplies a target's own value: a second action doubles, a third triples", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    engine.action("bumper", "B1"); // ×1 → 100
    expect(engine.hitTarget("BUILD")).toBe(300 * 2);
    expect(engine.hitTarget("AI")).toBe(150 * 3);
  });

  it("hitting the same target again straight away is farming: 20% of its value, no combo", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    engine.hitTarget("PRODUCT");
    const combo = engine.snapshot().combo;
    expect(engine.hitTarget("PRODUCT")).toBeCloseTo(250 * 0.2 * combo, 6);
    expect(engine.snapshot().combo).toBe(combo);
  });

  it("a slingshot kick is a small scoring action (30)", () => {
    const { machine, engine } = setup();
    play(machine, engine);
    expect(engine.action("sling", "SL")).toBe(30);
  });
});
