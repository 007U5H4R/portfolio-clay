import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HideOnLab } from "@/components/layout/HideOnLab";

/** TASK-143 — the band footer is not rendered under the Gummy Lab (its animations starved the lab's boot). */
const mockPath = { current: "/" };
vi.mock("next/navigation", () => ({ usePathname: () => mockPath.current }));

describe("HideOnLab", () => {
  it.each(["/", "/about", "/card", "/laboratory"])("renders its children on %s", (path) => {
    mockPath.current = path;
    render(<HideOnLab><p>footer</p></HideOnLab>);
    expect(screen.getByText("footer")).toBeTruthy();
  });

  it.each(["/lab", "/lab/x"])("renders nothing on %s", (path) => {
    mockPath.current = path;
    const { container } = render(<HideOnLab><p>footer</p></HideOnLab>);
    expect(container.innerHTML).toBe("");
  });
});
