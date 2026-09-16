import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/interactions/ProgressBar";

describe("ProgressBar (S05.03)", () => {
  it("exposes an aria-valuenow on a role=progressbar", () => {
    render(<ProgressBar />);
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar.getAttribute("aria-valuenow")).not.toBeNull();
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });
});
