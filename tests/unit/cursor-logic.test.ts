/** TASK-142.2–142.4 — pure cursor logic: gating, exclusion zones, spacing, velocity, themes. */
import { describe, expect, it } from "vitest";
import { shouldMountCursor, isPrimaryMouseDown } from "@/lib/cursor/gate";
import { planSpawns, styleForSpeed, capActive } from "@/lib/cursor/trail-math";
import { MAX_ACTIVE, MAX_PER_MOVE, MAX_WIDTH, MIN_WIDTH, SPACING } from "@/lib/cursor/trail-config";
import { TRAIL_ASSETS, allTrailSrcs, pieceAt, themeFor, themeForPath, themeForSlug } from "@/lib/cursor/trail-assets";

describe("gating (EVAL-028)", () => {
  const ok = { finePointer: true, reducedMotion: false, loaded: true };
  it("mounts only for a fine pointer, no reduced motion, after load", () => {
    expect(shouldMountCursor(ok)).toBe(true);
    expect(shouldMountCursor({ ...ok, finePointer: false })).toBe(false);
    expect(shouldMountCursor({ ...ok, reducedMotion: true })).toBe(false);
    expect(shouldMountCursor({ ...ok, loaded: false })).toBe(false);
  });
  it("only a primary mouse left-button press starts a trail", () => {
    expect(isPrimaryMouseDown({ pointerType: "mouse", isPrimary: true, button: 0 })).toBe(true);
    expect(isPrimaryMouseDown({ pointerType: "touch", isPrimary: true, button: 0 })).toBe(false);
    expect(isPrimaryMouseDown({ pointerType: "mouse", isPrimary: true, button: 2 })).toBe(false);
    expect(isPrimaryMouseDown({ pointerType: "pen", isPrimary: true, button: 0 })).toBe(false);
    expect(isPrimaryMouseDown({ pointerType: "mouse", isPrimary: false, button: 0 })).toBe(false);
  });
});

describe("distance-based spacing", () => {
  it("spawns nothing under SPACING and carries the remainder", () => {
    const r = planSpawns({ x: 0, y: 0 }, { x: SPACING - 1, y: 0 });
    expect(r.points).toEqual([]);
    expect(r.anchor).toEqual({ x: 0, y: 0 });
  });
  it("fills evenly along the path and advances the anchor to the last spawn", () => {
    const r = planSpawns({ x: 0, y: 0 }, { x: SPACING * 3, y: 0 });
    expect(r.points.map((p) => p.x)).toEqual([SPACING, SPACING * 2, SPACING * 3]);
    expect(r.points.every((p) => p.y === 0)).toBe(true);
    expect(r.anchor.x).toBe(SPACING * 3);
  });
  it("caps one move at MAX_PER_MOVE and never piles on the pointer", () => {
    const r = planSpawns({ x: 0, y: 0 }, { x: SPACING * 40, y: 0 });
    expect(r.points).toHaveLength(MAX_PER_MOVE);
    expect(r.points[0]!.x).toBe(SPACING);
    expect(new Set(r.points.map((p) => p.x)).size).toBe(MAX_PER_MOVE);
  });
  it("exposes a unit direction", () => {
    const r = planSpawns({ x: 0, y: 0 }, { x: 0, y: SPACING * 2 });
    expect(r.dir).toEqual({ x: 0, y: 1 });
  });
});

describe("velocity response", () => {
  it("scales size and tilt with speed inside the spec ranges, never beyond", () => {
    const slow = styleForSpeed(0);
    const fast = styleForSpeed(99);
    expect(slow.width).toBeGreaterThanOrEqual(MIN_WIDTH);
    expect(slow.width).toBeLessThanOrEqual(95);
    expect(fast.width).toBeLessThanOrEqual(MAX_WIDTH);
    expect(fast.width).toBeGreaterThanOrEqual(100);
    expect(slow.maxTilt).toBeLessThanOrEqual(8);
    expect(fast.maxTilt).toBeLessThanOrEqual(20);
    expect(fast.maxTilt).toBeGreaterThan(slow.maxTilt);
    expect(fast.nudge).toBeGreaterThan(slow.nudge);
  });
});

describe("active cap", () => {
  it("returns the oldest items to evict so at most MAX_ACTIVE remain", () => {
    const items = Array.from({ length: MAX_ACTIVE + 3 }, (_, i) => i);
    expect(capActive(items, MAX_ACTIVE)).toEqual([0, 1, 2]);
    expect(capActive(items.slice(0, MAX_ACTIVE), MAX_ACTIVE)).toEqual([]);
  });
});

describe("themes + manifest", () => {
  it("falls back to default for unknown/missing themes", () => {
    expect(themeFor("railcite")).toBe("railcite");
    expect(themeFor("nope")).toBe("default");
    expect(themeFor(undefined)).toBe("default");
    expect(themeFor("constructor")).toBe("default");
  });
  it("derives themes from project slugs and the About route", () => {
    expect(themeForSlug("campfire-board")).toBe("campfire");
    expect(themeForSlug("slag-city")).toBe("slag-city");
    expect(themeForSlug("railcite")).toBe("railcite");
    expect(themeForSlug("teachspark")).toBe("default");
    expect(themeForPath("/about")).toBe("about");
    expect(themeForPath("/work")).toBe("default");
  });
  it("loops deterministically and wraps", () => {
    const n = TRAIL_ASSETS.railcite.length;
    expect(pieceAt("railcite", 0)).toBe(pieceAt("railcite", n));
    expect(pieceAt("tushky", 5)).toBe("/cursor/trail/paw.svg");
    expect(pieceAt("default", 0)).toBe("/cursor/trail/paw.svg");
  });
  it("every manifest file exists on disk", async () => {
    const { existsSync } = await import("node:fs");
    for (const src of allTrailSrcs()) expect(existsSync(`public${src}`), src).toBe(true);
  });
});

