import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

const lenisCtor = vi.fn();
const lenisStop = vi.fn();
const lenisStart = vi.fn();
const lenisDestroy = vi.fn();

vi.mock("lenis", () => ({
  default: class {
    constructor(options: unknown) {
      lenisCtor(options);
    }
    stop = lenisStop;
    start = lenisStart;
    destroy = lenisDestroy;
    scrollTo = vi.fn();
  },
}));

import { SmoothScroll } from "@/components/interactions/SmoothScroll";
import { getLenis, stopSmoothScroll } from "@/lib/smooth-scroll";

function mockMatchMedia({ fine, reduced }: { fine: boolean; reduced: boolean }) {
  const addEventListener = vi.fn();
  const mql = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("pointer: fine") ? fine : query.includes("reduced-motion") ? reduced : false,
    media: query,
    addEventListener,
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("matchMedia", mql);
  return { mql, addEventListener };
}

// TKT-94 / EXE-16 / Dev-22: Lenis only for a fine pointer without reduced motion, decided once.
describe("SmoothScroll (TKT-94)", () => {
  beforeEach(() => {
    lenisCtor.mockClear();
    lenisStop.mockClear();
    lenisStart.mockClear();
    lenisDestroy.mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mounts nothing under prefers-reduced-motion", async () => {
    mockMatchMedia({ fine: true, reduced: true });
    render(<SmoothScroll />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(lenisCtor).not.toHaveBeenCalled();
    expect(getLenis()).toBeNull();
  });

  it("mounts nothing for a coarse pointer (touch)", async () => {
    mockMatchMedia({ fine: false, reduced: false });
    render(<SmoothScroll />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(lenisCtor).not.toHaveBeenCalled();
    expect(getLenis()).toBeNull();
  });

  it("mounts exactly one instance for a fine pointer, with no media-query listeners, and destroys on unmount", async () => {
    const { addEventListener } = mockMatchMedia({ fine: true, reduced: false });
    const { unmount, rerender } = render(<SmoothScroll />);
    await waitFor(() => expect(lenisCtor).toHaveBeenCalledTimes(1));
    expect(lenisCtor).toHaveBeenCalledWith(expect.objectContaining({ autoRaf: true }));
    rerender(<SmoothScroll />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(lenisCtor).toHaveBeenCalledTimes(1);
    expect(addEventListener).not.toHaveBeenCalled();
    expect(getLenis()).not.toBeNull();
    unmount();
    expect(lenisDestroy).toHaveBeenCalledTimes(1);
    expect(getLenis()).toBeNull();
  });

  it("stopSmoothScroll is ref-counted: nested surfaces restart Lenis only after the last closes", async () => {
    mockMatchMedia({ fine: true, reduced: false });
    const { unmount } = render(<SmoothScroll />);
    await waitFor(() => expect(getLenis()).not.toBeNull());
    const releaseMenu = stopSmoothScroll();
    const releasePanel = stopSmoothScroll();
    expect(lenisStop).toHaveBeenCalledTimes(2);
    releasePanel();
    releasePanel(); // idempotent
    expect(lenisStart).not.toHaveBeenCalled();
    releaseMenu();
    expect(lenisStart).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("stopSmoothScroll is a no-op when Lenis is not mounted", () => {
    const release = stopSmoothScroll();
    release();
    expect(lenisStop).not.toHaveBeenCalled();
    expect(lenisStart).not.toHaveBeenCalled();
  });
});
