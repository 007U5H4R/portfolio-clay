// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { EVENTS, TOUR_STEP_IDS } from "@/lib/analytics/events";
import { validateProps, type Schema } from "@/lib/analytics/schema";
import {
  NOTE_GUTTER,
  TOUR_INVITE_KEY,
  TOUR_START_EVENT,
  TOUR_STEPS,
  clampStep,
  phoneScrollY,
  placeNote,
  readInvite,
  requestTour,
  setPendingStart,
  shouldInvite,
  takePendingStart,
  writeInvite,
} from "@/lib/tour";

/** TASK-170 — the guided tour's pure logic and its four analytics events. */

describe("tour stops", () => {
  it("are the six briefed stops, in order, and match the analytics step ids", () => {
    expect(TOUR_STEPS.map((s) => s.id)).toEqual(["hero", "work", "ask", "credentials", "theme", "brand"]);
    expect(TOUR_STEPS.map((s) => s.id)).toEqual([...TOUR_STEP_IDS]);
  });

  it("ends on the brand with the exact hint, and never links to or names the game (S30, EXE-82)", () => {
    const last = TOUR_STEPS.at(-1)!;
    expect(last.id).toBe("brand");
    expect(last.body).toBe("Psst, tap my name 5 times, fast.");
    expect(last.targets).toEqual(["[data-site-header] .header-brand"]);
    const all = JSON.stringify(TOUR_STEPS).toLowerCase();
    expect(all).not.toContain("/lab");
    expect(all).not.toContain("gummy");
    expect(all).not.toContain("game");
  });

  it("every stop has a title, a body and at least one target", () => {
    for (const s of TOUR_STEPS) {
      expect(s.title.length, s.id).toBeGreaterThan(0);
      expect(s.body.length, s.id).toBeGreaterThan(0);
      expect(s.targets.length, s.id).toBeGreaterThan(0);
    }
  });
});

describe("clampStep", () => {
  it("keeps the index inside the stops", () => {
    expect(clampStep(-1, 6)).toBe(0);
    expect(clampStep(0, 6)).toBe(0);
    expect(clampStep(5, 6)).toBe(5);
    expect(clampStep(9, 6)).toBe(5);
    expect(clampStep(2.7, 6)).toBe(2);
    expect(clampStep(Number.NaN, 6)).toBe(0);
    expect(clampStep(3, 0)).toBe(0);
  });
});

describe("shouldInvite", () => {
  const base = { webdriver: false, optIn: false, stored: null, pathname: "/" };
  it("invites a first-time human visitor on the home page", () => {
    expect(shouldInvite(base)).toBe(true);
  });
  it("never invites again once answered", () => {
    expect(shouldInvite({ ...base, stored: "dismissed" })).toBe(false);
    expect(shouldInvite({ ...base, stored: "accepted" })).toBe(false);
  });
  it("only on the home page", () => {
    expect(shouldInvite({ ...base, pathname: "/work" })).toBe(false);
    expect(shouldInvite({ ...base, pathname: null })).toBe(false);
  });
  it("never in an automated browser unless the test opts in", () => {
    expect(shouldInvite({ ...base, webdriver: true })).toBe(false);
    expect(shouldInvite({ ...base, webdriver: true, optIn: true })).toBe(true);
  });
});

describe("invite storage", () => {
  it("round-trips through storage", () => {
    const m = new Map<string, string>();
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
    expect(readInvite(storage)).toBeNull();
    writeInvite("dismissed", storage);
    expect(m.get(TOUR_INVITE_KEY)).toBe("dismissed");
    expect(readInvite(storage)).toBe("dismissed");
  });
  it("never throws when storage is blocked", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readInvite(broken)).toBeNull();
    expect(() => writeInvite("accepted", broken)).not.toThrow();
  });
});

describe("placeNote", () => {
  const vp = { width: 1440, height: 900 };
  const note = { width: 320, height: 180 };
  const inside = (p: { top: number; left: number }) => {
    expect(p.left).toBeGreaterThanOrEqual(NOTE_GUTTER);
    expect(p.left + note.width).toBeLessThanOrEqual(vp.width - NOTE_GUTTER);
    expect(p.top + note.height).toBeLessThanOrEqual(vp.height - NOTE_GUTTER);
  };

  it("prefers below the target, centred on it", () => {
    const p = placeNote({ top: 200, left: 600, width: 240, height: 60 }, note, vp, 80);
    expect(p.side).toBe("below");
    expect(p.top).toBeGreaterThan(260);
    expect(p.left + note.width / 2).toBeCloseTo(720, 0);
    inside(p);
  });

  it("goes above when there is no room below", () => {
    const p = placeNote({ top: 700, left: 600, width: 240, height: 120 }, note, vp, 80);
    expect(p.side).toBe("above");
    expect(p.top + note.height).toBeLessThanOrEqual(700);
    inside(p);
  });

  it("goes beside a tall target", () => {
    const p = placeNote({ top: 100, left: 100, width: 600, height: 760 }, note, vp, 80);
    expect(p.side).toBe("right");
    expect(p.left).toBeGreaterThanOrEqual(700);
    inside(p);
  });

  it("pins to the bottom when nothing fits, still inside the gutter and below the header", () => {
    const p = placeNote({ top: 90, left: 0, width: 1440, height: 800 }, note, vp, 80);
    expect(p.side).toBe("pinned");
    expect(p.top).toBeGreaterThanOrEqual(80 + NOTE_GUTTER);
    inside(p);
  });

  it("never places the note off-screen when the target is still below the fold (desktop hero, 1440×900)", () => {
    const p = placeNote({ top: 1420, left: 124, width: 1192, height: 259 }, note, vp, 124);
    expect(p.side).not.toBe("above");
    expect(p.top).toBeGreaterThanOrEqual(124 + NOTE_GUTTER);
    inside(p);
  });

  it("clamps a target at the right edge into the gutter and keeps the arrow on the target", () => {
    const p = placeNote({ top: 20, left: 1380, width: 44, height: 44 }, note, vp, 0);
    expect(p.side).toBe("below");
    inside(p);
    expect(p.left + p.arrow).toBeGreaterThan(1340);
  });
});

describe("phoneScrollY", () => {
  it("puts the target just under the header, never above the page top", () => {
    expect(phoneScrollY(1200, 120, 12)).toBe(1068);
    expect(phoneScrollY(50, 120, 12)).toBe(0);
  });
});

describe("cross-page start + requestTour", () => {
  it("hands a pending start over exactly once", () => {
    setPendingStart("menu");
    expect(takePendingStart()).toBe("menu");
    expect(takePendingStart()).toBeNull();
  });

  it("dispatches the start event with the source and opener", () => {
    const spy = vi.fn();
    window.addEventListener(TOUR_START_EVENT, spy);
    const btn = document.createElement("button");
    requestTour("menu", btn);
    window.removeEventListener(TOUR_START_EVENT, spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ source: "menu", returnTo: btn });
  });
});

describe("tour analytics events", () => {
  const schema = (n: keyof typeof EVENTS) => EVENTS[n].props as Schema;

  it("tour_started takes the source only", () => {
    expect(validateProps(schema("tour_started"), { source: "invite" }).ok).toBe(true);
    expect(validateProps(schema("tour_started"), { source: "menu" }).ok).toBe(true);
    expect(validateProps(schema("tour_started"), { source: "footer" }).ok).toBe(false);
  });

  it("tour_step_viewed and tour_skipped take a known step and its index", () => {
    for (const n of ["tour_step_viewed", "tour_skipped"] as const) {
      expect(validateProps(schema(n), { step_id: "brand", step_index: 5 }).ok, n).toBe(true);
      expect(validateProps(schema(n), { step_id: "lab", step_index: 5 }).ok, n).toBe(false);
      expect(validateProps(schema(n), { step_id: "hero", step_index: -1 }).ok, n).toBe(false);
      expect(validateProps(schema(n), { step_id: "hero" }).ok, n).toBe(false);
    }
  });

  it("tour_completed takes the step count", () => {
    expect(validateProps(schema("tour_completed"), { step_count: 6 }).ok).toBe(true);
    expect(validateProps(schema("tour_completed"), { step_count: 0 }).ok).toBe(false);
  });

  it("all four live in the website group and point at the tour component", () => {
    for (const n of ["tour_started", "tour_step_viewed", "tour_completed", "tour_skipped"] as const) {
      expect(EVENTS[n].group).toBe("website");
      expect(EVENTS[n].where).toBe("components/tour/GuidedTour.tsx");
    }
  });
});
