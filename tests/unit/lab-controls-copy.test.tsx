import { describe, expect, it } from "vitest";
import { CONTROL_LABELS, HOW_TO_PLAY, KEYBOARD_LABEL } from "@/components/lab/controls-copy";

/** TASK-168 — every control instruction lives in one module so the controls can change without touching components. */
describe("controls copy", () => {
  it("tells the pinball story in four instructions, each with an icon", () => {
    expect(HOW_TO_PLAY.map((h) => [h.main, h.sub].filter(Boolean).join(" "))).toEqual(["Hold Space to launch", "Tap left / right to flip", "Hit bumpers & targets", "Don't let it drain"]);
    expect(HOW_TO_PLAY.every((h) => h.icon)).toBe(true);
  });
  it("has the flipper keyboard label, the live-region hint and the accessible names", () => {
    expect(KEYBOARD_LABEL.rows).toEqual(["← → flip · Space launch · P pause · Esc exit"]);
    expect(CONTROL_LABELS.flipLive).toBe("Left and right flip");
    expect(CONTROL_LABELS.pause).toBe("Pause");
    expect(CONTROL_LABELS.soundOff).toMatch(/sound is off/i);
    expect(CONTROL_LABELS.plunger).toMatch(/hold to charge, release to launch/i);
    expect(CONTROL_LABELS.back).toBe("Back to Portfolio");
  });
});
