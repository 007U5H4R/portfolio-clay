import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { useReducedMotionSafe } from "@/lib/motion";

function Probe() {
  const reduced = useReducedMotionSafe();
  return <span data-testid="reduced">{String(reduced)}</span>;
}

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

describe("useReducedMotionSafe (A6, S04.01)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true on first render — static server rendering never runs the mount effect that reads matchMedia", () => {
    // renderToStaticMarkup never flushes effects (there is no client to mount on), so this
    // captures exactly the hook's pre-effect seed value — the case Testing Library's render()
    // cannot observe because it flushes the mount effect synchronously (jsdom).
    const html = renderToStaticMarkup(<Probe />);
    expect(html).toContain("true");
  });

  it("swaps to the matchMedia value once mounted (OS prefers no reduced motion)", () => {
    mockMatchMedia(false);
    render(<Probe />);
    expect(screen.getByTestId("reduced").textContent).toBe("false");
  });

  it("swaps to the matchMedia value once mounted (OS prefers reduced motion)", () => {
    mockMatchMedia(true);
    render(<Probe />);
    expect(screen.getByTestId("reduced").textContent).toBe("true");
  });

  it("never throws when matchMedia is unavailable (older browser / non-DOM env) and stays true", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<Probe />);
    expect(screen.getByTestId("reduced").textContent).toBe("true");
  });
});
