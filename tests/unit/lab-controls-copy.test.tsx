import { describe, expect, it } from "vitest";
import { CONTROL_LABELS, HOW_TO_PLAY, KEYBOARD_LABEL } from "@/components/lab/controls-copy";

/** TASK-168 — every control instruction lives in one module so the controls can change without touching components. */
describe("controls copy", () => {
  it("keeps today's four instructions, each with an icon", () => {
    expect(HOW_TO_PLAY.map((h) => h.main)).toEqual(["Drag", "Flick", "Collect", "Don't let it fall"]);
    expect(HOW_TO_PLAY.every((h) => h.icon)).toBe(true);
  });
  it("keeps today's keyboard label and accessible names", () => {
    expect(KEYBOARD_LABEL.rows).toEqual(["← → nudge", "Space bounce", "P pause", "Esc exit"]);
    expect(CONTROL_LABELS.pause).toBe("Pause");
    expect(CONTROL_LABELS.soundOff).toMatch(/sound is off/i);
  });
});
