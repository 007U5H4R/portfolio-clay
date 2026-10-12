/**
 * TASK-199: 50 random launches on each table, headless (tests/unit/lab-sim.ts, the real colliders and the controller's rules).
 * For each launch the plunger fires at a random force in [MIN_FORCE, MAX_FORCE] and nothing else is touched (no flippers), so
 * the run is what the layout alone does with a shot. We record where it ends up:
 *   - "flippers": the gummy came down into the flipper zone (left the lane, below the pivots + 0.4, inside the table walls);
 *   - "hole": it fell into the black hole's sensor first (the exit; a skill shot);
 *   - "neither": it was still somewhere else after 45 s (a failure).
 * And the longest stretch it stayed within STILL_R of one spot away from a flipper, with the anti-stall ON as in the game
 * (no stillness longer than 2 s).
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MAX_FORCE, MIN_FORCE } from "@/lib/lab/plunger";
import { FLIPPER_PIVOT_Y } from "@/lib/lab/arena";
import { LabSim, initRapier } from "./lab-sim";

vi.setConfig({ testTimeout: 180_000, hookTimeout: 180_000 });
beforeAll(async () => {
  await initRapier();
});

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const STILL_R = 0.12;

export interface Launch {
  force: number;
  end: "flippers" | "hole" | "neither";
  /** Longest time (s) the gummy stayed within STILL_R of one spot while not in the lane and not on a flipper. */
  stillMax: number;
  /** Which bumper kinds and slingshots kicked the gummy on the way. */
  kinds: string[];
  slings: string[];
}

export function randomLaunches(hw: number, n: number, seed: number, spinner = false): Launch[] {
  const r = rng(seed);
  const out: Launch[] = [];
  for (let i = 0; i < n; i += 1) {
    const force = MIN_FORCE + r() * (MAX_FORCE - MIN_FORCE);
    const s = new LabSim(hw, undefined, [], spinner);
    const a = s.arena;
    s.launch(force);
    let anchor = { x: s.x, y: s.y, t: 0 };
    let stillMax = 0;
    let end: Launch["end"] = "neither";
    s.run(45, undefined, () => {
      const inLane = s.x > a.lane.xIn - 0.05 && s.y < a.lane.dividerTop - 0.3;
      if (inLane || Math.hypot(s.x - anchor.x, s.y - anchor.y) > STILL_R) anchor = { x: s.x, y: s.y, t: s.t };
      else stillMax = Math.max(stillMax, s.t - anchor.t);
      if (s.portalAt !== null) {
        end = "hole";
        return true;
      }
      if (s.gateShut && s.y < FLIPPER_PIVOT_Y + 0.4 && s.x < a.lane.xIn - 0.3 && s.x > -a.halfW) {
        end = "flippers";
        return true;
      }
      return false;
    });
    out.push({ force, end, stillMax, kinds: s.bumperHits.map((h) => h.kind), slings: s.slingHits.map((h) => h.id) });
  }
  return out;
}

describe.each([
  { name: "desktop table", hw: 5, spinner: false },
  { name: "desktop table with the spinner turning (phase 1+)", hw: 5, spinner: true },
  { name: "phone table", hw: 2.7, spinner: false },
])("50 random launches on the $name", ({ name, hw, spinner }) => {
  let runs: Launch[] = [];
  beforeAll(() => {
    runs = randomLaunches(hw, 50, hw > 4 ? 199 : 991, spinner);
    const n = (e: Launch["end"]) => runs.filter((l) => l.end === e).length;
    console.info(
      `[pinball-sim] ${name}: flippers ${n("flippers")}/50, hole ${n("hole")}/50, neither ${n("neither")}/50, longest stillness ${Math.max(...runs.map((l) => l.stillMax)).toFixed(2)} s`,
    );
  });

  it("reaches the flippers (or the black hole) in at least 95 % of launches", () => {
    expect(runs.filter((l) => l.end !== "neither").length / runs.length).toBeGreaterThanOrEqual(0.95);
  });
  it("reaches the flippers in at least 80 % of launches (the rest are the black hole, which ends the run by design)", () => {
    expect(runs.filter((l) => l.end === "flippers").length / runs.length).toBeGreaterThanOrEqual(0.8);
  });
  it("the black hole is a skill shot: some launches reach it, but at most a fifth of them", () => {
    const hole = runs.filter((l) => l.end === "hole").length / runs.length;
    expect(hole).toBeGreaterThan(0);
    expect(hole).toBeLessThanOrEqual(0.2);
  });
  it("kicks the gummy with every bumper type on the table and with the side slingshots, so none of them is a dead part", () => {
    const kinds = new Set(runs.flatMap((l) => l.kinds));
    const slings = new Set(runs.flatMap((l) => l.slings));
    expect([...kinds].sort()).toEqual(hw > 4 ? ["jet", "pop", "thumper", "turbo"] : ["pop", "turbo"]);
    expect(slings.has("WL") || slings.has("WR")).toBe(true);
    console.info(`[pinball-sim] ${name}: bumper types hit ${[...kinds].sort().join("/")}; slings hit ${[...slings].sort().join("/")}`);
  });
  it("never sits still for more than 2 s", () => {
    expect(Math.max(...runs.map((l) => l.stillMax))).toBeLessThanOrEqual(2);
  });
});
