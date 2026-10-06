import { describe, expect, it } from "vitest";
import { observeOffscreen } from "@/lib/offscreen-pause";

// TASK-155: one shared IntersectionObserver marks animated containers `data-offscreen` while outside the viewport.
type Cb = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
function fakeIO() {
  const state: { cb?: Cb; observed: Element[]; disconnected: boolean; options?: IntersectionObserverInit } = { observed: [], disconnected: false };
  class FakeIO {
    constructor(cb: Cb, options?: IntersectionObserverInit) {
      state.cb = cb;
      state.options = options;
    }
    observe(el: Element) {
      state.observed.push(el);
    }
    disconnect() {
      state.disconnected = true;
    }
  }
  return { IO: FakeIO as unknown as typeof IntersectionObserver, state };
}

describe("observeOffscreen", () => {
  it("observes every target with one observer and toggles data-offscreen", () => {
    document.body.innerHTML = `<div id="a" data-pause-offscreen></div><div id="b" data-band-ocean></div><div id="c"></div>`;
    const { IO, state } = fakeIO();
    const stop = observeOffscreen(document, IO);
    expect(state.observed.map((e) => e.id)).toEqual(["a", "b"]);
    expect(state.options?.rootMargin).toBe("200px 0px");
    const a = state.observed[0] as HTMLElement;
    state.cb!([{ target: a, isIntersecting: false }]);
    expect(a.hasAttribute("data-offscreen")).toBe(true);
    state.cb!([{ target: a, isIntersecting: true }]);
    expect(a.hasAttribute("data-offscreen")).toBe(false);
    stop();
    expect(state.disconnected).toBe(true);
  });
});
