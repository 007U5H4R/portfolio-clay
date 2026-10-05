import { describe, expect, it } from "vitest";
import { flipReducer, flipLabel, initialFlip } from "@/lib/card/flip";

describe("card flip state (TASK-146.3, EVAL-029)", () => {
  it("starts on the front and toggles", () => {
    expect(initialFlip.side).toBe("front");
    const a = flipReducer(initialFlip, { type: "toggle" });
    expect(a.side).toBe("back");
    expect(flipReducer(a, { type: "toggle" }).side).toBe("front");
  });

  it("label names the action for the current side (§23)", () => {
    expect(flipLabel("front")).toBe("Show Tushar Pathak contact and links");
    expect(flipLabel("back")).toBe("Show the front of Tushar Pathak's business card");
  });

  it("tilt is ignored (neutral) while reduced motion is on", () => {
    const s = flipReducer(initialFlip, { type: "motion", reduced: true });
    expect(s.reduced).toBe(true);
    expect(flipReducer(s, { type: "toggle" }).side).toBe("back");
  });
});
