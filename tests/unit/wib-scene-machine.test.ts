import { describe, expect, it } from "vitest";
import { REST, sceneOf, sceneReducer, type SceneStates } from "@/lib/wib/scene-machine";
import { wibScenes, wibStageIds } from "@/lib/wib/scenes";
import { wibStages } from "@/data/what-i-bring";

const run = (s: SceneStates, ...a: Parameters<typeof sceneReducer>[1][]) => a.reduce(sceneReducer, s);

describe("TASK-203 scene state machine", () => {
  it("starts at rest and a hover never plays (there is no hover action)", () => {
    expect(sceneOf({}, "ambiguity")).toEqual(REST);
  });

  it("ACTIVATE plays, DONE settles", () => {
    let s = run({}, { type: "ACTIVATE", id: "a" });
    expect(sceneOf(s, "a").phase).toBe("playing");
    s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch });
    expect(sceneOf(s, "a").phase).toBe("settled");
  });

  it("ignores a second ACTIVATE while playing, and a stale DONE", () => {
    let s = run({}, { type: "ACTIVATE", id: "a" });
    const e = sceneOf(s, "a").epoch;
    s = run(s, { type: "ACTIVATE", id: "a" });
    expect(sceneOf(s, "a")).toMatchObject({ phase: "playing", epoch: e });
    s = run(s, { type: "DONE", id: "a", epoch: e - 1 });
    expect(sceneOf(s, "a").phase).toBe("playing");
  });

  it("replays deterministically: settled -> resetting -> playing -> settled, every time", () => {
    let s: SceneStates = {};
    for (let i = 0; i < 4; i++) {
      s = run(s, { type: "ACTIVATE", id: "a" });
      if (sceneOf(s, "a").phase === "resetting") s = run(s, { type: "RESET_DONE", id: "a", epoch: sceneOf(s, "a").epoch });
      expect(sceneOf(s, "a").phase).toBe("playing");
      s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch });
      expect(sceneOf(s, "a").phase).toBe("settled");
    }
  });

  it("a stage left while playing finishes its sequence, then returns to rest", () => {
    let s = run({}, { type: "ACTIVATE", id: "a" }, { type: "LEAVE", id: "a" });
    expect(sceneOf(s, "a")).toMatchObject({ phase: "playing", leaving: true });
    s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch });
    expect(sceneOf(s, "a").phase).toBe("rest");
  });

  it("selecting a stage again while it finishes keeps it", () => {
    let s = run({}, { type: "ACTIVATE", id: "a" }, { type: "LEAVE", id: "a" }, { type: "ACTIVATE", id: "a" });
    s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch });
    expect(sceneOf(s, "a").phase).toBe("settled");
  });

  it("LEAVE resets settled and resetting stages at once; resetting is cancelled", () => {
    let s = run({}, { type: "ACTIVATE", id: "a" });
    s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch }, { type: "LEAVE", id: "a" });
    expect(sceneOf(s, "a").phase).toBe("rest");
    s = run(s, { type: "ACTIVATE", id: "a" });
    s = run(s, { type: "DONE", id: "a", epoch: sceneOf(s, "a").epoch }, { type: "ACTIVATE", id: "a" });
    const e = sceneOf(s, "a").epoch;
    expect(sceneOf(s, "a").phase).toBe("resetting");
    s = run(s, { type: "LEAVE", id: "a" }, { type: "RESET_DONE", id: "a", epoch: e });
    expect(sceneOf(s, "a").phase).toBe("rest");
  });

  it("reduced motion goes straight to the settled state and never plays or replays", () => {
    let s = run({}, { type: "ACTIVATE", id: "a", reduced: true });
    expect(sceneOf(s, "a").phase).toBe("settled");
    s = run(s, { type: "ACTIVATE", id: "a", reduced: true });
    expect(sceneOf(s, "a").phase).toBe("settled");
  });

  it("stages are independent", () => {
    const s = run({}, { type: "ACTIVATE", id: "a" }, { type: "ACTIVATE", id: "b" }, { type: "LEAVE", id: "a" });
    expect(sceneOf(s, "a").leaving).toBe(true);
    expect(sceneOf(s, "b").phase).toBe("playing");
  });
});

describe("TASK-203 scene config", () => {
  it("has one scene per stage, in the stage order", () => {
    expect(wibStageIds).toEqual(wibStages.map((s) => s.id));
  });

  it.each(wibStageIds)("%s: a base, unique parts, depth planes, a signature length in 450-2400 ms", (id) => {
    const sc = wibScenes[id];
    expect(sc.parts[0]!.id).toBe("base");
    const ids = sc.parts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sc.parts.map((p) => p.depth)).size).toBeGreaterThanOrEqual(2);
    expect(sc.duration).toBeGreaterThanOrEqual(450);
    expect(sc.duration).toBeLessThanOrEqual(2400);
    for (const s of sc.strokes) {
      if (s.on) expect(ids).toContain(s.on);
      if (s.before) expect(ids).toContain(s.before);
    }
    if (sc.shade) expect(ids).toContain(sc.shade.part);
  });
});
