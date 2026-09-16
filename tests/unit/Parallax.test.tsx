import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Parallax } from "@/components/interactions/Parallax";

/** All media queries resolve to `matches` — with `false`, `(pointer:fine)` is false so parallax is inactive. */
function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("Parallax (S05.01)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds no pointermove listener when the pointer is not fine (Design.md §4 — desktop-cursor only)", () => {
    mockMatchMedia(false); // pointer:fine false AND reduced-motion false → inactive
    const addSpy = vi.spyOn(window, "addEventListener");

    render(
      <Parallax depth={-1} maxPx={6}>
        <span>child</span>
      </Parallax>,
    );

    const pointerMoveCalls = addSpy.mock.calls.filter(([type]) => type === "pointermove");
    expect(pointerMoveCalls).toHaveLength(0);
    addSpy.mockRestore();
  });

  it("renders its children unmoved when inactive", () => {
    mockMatchMedia(false);
    render(
      <Parallax depth={0.5} maxPx={3}>
        <span>hero-tile</span>
      </Parallax>,
    );
    expect(screen.getByText("hero-tile")).toBeTruthy();
  });
});
