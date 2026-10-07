import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chrome, Hud } from "@/components/lab/LabUi";
import { createLabStore } from "@/lib/lab/store";

/** TASK-168 — the paper HUD: live text on blank plates, real accessible buttons. */
vi.mock("next/link", () => ({ default: ({ children, ...p }: { children: React.ReactNode }) => <a {...p}>{children}</a> }));

function setup(patch: Record<string, unknown> = {}) {
  const store = createLabStore();
  store.setState({ state: "PLAYING", score: 1280, combo: 3, timeS: 24, ...patch });
  return store;
}

describe("Hud (paper plates)", () => {
  it("renders the live score, combo and time as text with their labels", () => {
    render(<Hud store={setup()} onPause={() => {}} />);
    expect(screen.getByText("Score")).toBeTruthy();
    expect(screen.getByText("Combo")).toBeTruthy();
    expect(screen.getByText("Time")).toBeTruthy();
    expect(document.querySelector("[data-lab-score]")?.textContent).toBe("1,280");
    expect(document.querySelector("[data-lab-combo]")?.textContent).toBe("x3");
    expect(document.querySelector("[data-lab-time]")?.textContent).toBe("00:24");
  });

  it("updates when the store changes, and labels the TP combo", () => {
    const store = setup();
    render(<Hud store={store} onPause={() => {}} />);
    act(() => store.setState({ score: 2400, combo: 4, timeS: 61, tpMode: true }));
    expect(document.querySelector("[data-lab-score]")?.textContent).toBe("2,400");
    expect(document.querySelector("[data-lab-time]")?.textContent).toBe("01:01");
    expect(screen.getByText("Combo · TP")).toBeTruthy();
  });

  it("has a real Pause button that becomes Resume while paused", () => {
    const onPause = vi.fn();
    const store = setup();
    render(<Hud store={store} onPause={onPause} />);
    const pause = screen.getByRole("button", { name: "Pause" });
    expect(pause.tagName).toBe("BUTTON");
    fireEvent.click(pause);
    expect(onPause).toHaveBeenCalledTimes(1);
    act(() => store.setState({ state: "PAUSED" }));
    expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy();
  });

  it("replays the combo flutter by remounting the plate on each change, and only above x1", () => {
    const store = setup({ combo: 1 });
    render(<Hud store={store} onPause={() => {}} />);
    const plate = () => document.querySelector("[data-lab-combo-plate]") as HTMLElement;
    const first = plate();
    expect(first.className).not.toMatch(/flutter/);
    act(() => store.setState({ combo: 2 }));
    expect(plate()).not.toBe(first);
    expect(plate().className).toMatch(/flutter/);
  });
});

describe("Chrome (back tab + sound)", () => {
  it("has a labelled pressed-state sound button, off by default, and a Back link", () => {
    const onMute = vi.fn();
    render(<Chrome store={setup({ state: "INTRO" })} onExit={() => {}} onMute={onMute} />);
    const sound = screen.getByRole("button", { name: /sound is off/i });
    expect(sound.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(sound);
    expect(onMute).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /back to portfolio/i })).toBeTruthy();
  });
});
