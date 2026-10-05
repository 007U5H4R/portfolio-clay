import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { MediaGate, mediaGateQuery } from "@/components/paper/MediaGate";

function mockMatchMedia(matches: boolean) {
  const mql = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("matchMedia", mql);
  return mql;
}

// TC-131 step 3 / decision TP14 (technical-plan E-16): width-gated decorations are absent from the
// SSR HTML, mounted after hydration only while the query matches, evaluated once (no subscription).
describe("MediaGate (TP14, TKT-71)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the min/max query", () => {
    expect(mediaGateQuery(640)).toBe("(min-width: 640px)");
    expect(mediaGateQuery(undefined, 1023)).toBe("(max-width: 1023px)");
    expect(mediaGateQuery(640, 1023)).toBe("(min-width: 640px) and (max-width: 1023px)");
  });

  it("renders nothing on the server (static markup never carries the gated decoration)", () => {
    const html = renderToStaticMarkup(
      <MediaGate min={640}>
        <p data-decor="annotation">gated</p>
      </MediaGate>,
    );
    expect(html).toBe("");
  });

  it("mounts the children once matchMedia matches", () => {
    const mql = mockMatchMedia(true);
    const { container } = render(
      <MediaGate min={640}>
        <p data-decor="annotation">gated</p>
      </MediaGate>,
    );
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(1);
    expect(mql).toHaveBeenCalledWith("(min-width: 640px)");
  });

  it("renders nothing when the query does not match", () => {
    mockMatchMedia(false);
    const { container } = render(
      <MediaGate min={640}>
        <p data-decor="annotation">gated</p>
      </MediaGate>,
    );
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(0);
  });

  it("evaluates once — no `change` subscription (a resize never re-decides)", () => {
    const mql = mockMatchMedia(true);
    render(
      <MediaGate min={640}>
        <span />
      </MediaGate>,
    );
    const instance = mql.mock.results[0]!.value as { addEventListener: ReturnType<typeof vi.fn> };
    expect(instance.addEventListener).not.toHaveBeenCalled();
  });

  it("renders nothing and does not throw when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    const { container } = render(
      <MediaGate min={640}>
        <span data-x="" />
      </MediaGate>,
    );
    expect(container.querySelectorAll("[data-x]")).toHaveLength(0);
  });
});
