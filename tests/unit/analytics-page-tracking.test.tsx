import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startPage, type PageContext } from "@/lib/analytics/page-tracking";
import { createTracker } from "@/lib/analytics/tracker";

/** A controllable IntersectionObserver: tests decide when an element "is visible". */
class FakeIO {
  static all: FakeIO[] = [];
  elements = new Set<Element>();
  constructor(readonly cb: IntersectionObserverCallback, readonly options?: IntersectionObserverInit) { FakeIO.all.push(this); }
  observe(el: Element) { this.elements.add(el); }
  unobserve(el: Element) { this.elements.delete(el); }
  disconnect() { this.elements.clear(); }
  takeRecords() { return []; }
  fire(el: Element, rect: { height: number; boundingHeight?: number; ratio?: number; intersecting?: boolean }) {
    this.cb([{ target: el, isIntersecting: rect.intersecting ?? true, intersectionRatio: rect.ratio ?? 1, intersectionRect: { height: rect.height } as DOMRectReadOnly, boundingClientRect: { height: rect.boundingHeight ?? rect.height } as DOMRectReadOnly } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}
class FakeRO { constructor(readonly cb: () => void) {} observe() {} disconnect() {} }

const CTX: PageContext = { path: "/", navigationType: "direct", isLanding: true, sessionType: "new", theme: "light", previousPath: null };

function setup(ctx: Partial<PageContext> = {}) {
  const events: Array<[string, Record<string, unknown>]> = [];
  const tracker = createTracker({ sink: { track: (n, p) => void events.push([n, p]) }, onInvalid: "throw" });
  const stop = startPage(tracker, { ...CTX, ...ctx });
  return { events, stop, names: () => events.map(([n]) => n) };
}
const sections = (...ids: string[]) => { document.body.innerHTML = `<main>${ids.map((id) => `<section id="${id}"></section>`).join("")}</main>`; };

describe("page tracking (TASK-194)", () => {
  beforeEach(() => {
    FakeIO.all = [];
    vi.useFakeTimers();
    vi.stubGlobal("IntersectionObserver", FakeIO);
    vi.stubGlobal("ResizeObserver", FakeRO);
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 4000 });
    document.body.innerHTML = "<main></main>";
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sends page_viewed immediately with the canonical identity", () => {
    const { events } = setup({ path: "/projects", navigationType: "client_navigation", isLanding: false, theme: "dark" });
    expect(events).toEqual([["page_viewed", { page_name: "portfolio", page_path: "/projects", navigation_type: "client_navigation", is_landing: false, session_type: "new", theme: "dark" }]]);
  });

  it("omits theme when unknown rather than guessing", () => {
    const { events } = setup({ theme: undefined });
    expect(events[0]![1]).not.toHaveProperty("theme");
  });

  it("a case-study page also reports case_study_viewed once, with an honest entry point", () => {
    const a = setup({ path: "/work/teachspark", previousPath: "/projects" });
    expect(a.events[1]).toEqual(["case_study_viewed", { project_id: "teachspark", entry_point: "portfolio_page" }]);
    expect(setup({ path: "/work/nuptis", previousPath: null }).events[1]![1]).toEqual({ project_id: "nuptis", entry_point: "external_or_direct" });
    expect(setup({ path: "/work/velora", previousPath: "/work" }).events[1]![1]).toMatchObject({ entry_point: "experience_page" });
    expect(setup({ path: "/work/velora", previousPath: "/about" }).events[1]![1]).toMatchObject({ entry_point: "other_internal" });
  });

  it("emits section_viewed once per section, only when enough of it is visible, with its index", () => {
    sections("hero-copy", "credentials", "ask");
    const { names, events } = setup();
    const io = FakeIO.all[0]!;
    const [a, b] = [...io.elements];
    io.fire(a!, { height: 10, boundingHeight: 1000, ratio: 0.01 }); // 1 %: not meaningful yet
    expect(names()).toEqual(["page_viewed"]);
    io.fire(a!, { height: 450, boundingHeight: 1000, ratio: 0.45 });
    io.fire(a!, { height: 800, boundingHeight: 1000, ratio: 0.8 }); // and again: still once
    io.fire(b!, { height: 300, boundingHeight: 300, ratio: 1 });
    expect(events.filter(([n]) => n === "section_viewed")).toEqual([
      ["section_viewed", { section_name: "hero-copy", section_index: 0, page_name: "home" }],
      ["section_viewed", { section_name: "credentials", section_index: 1, page_name: "home" }],
    ]);
  });

  it("counts a very tall section as seen once 40 % of the viewport shows it", () => {
    sections("chapters");
    const { names } = setup();
    const io = FakeIO.all[0]!;
    io.fire([...io.elements][0]!, { height: 340, boundingHeight: 5000, ratio: 0.07 }); // 340 > 40 % of 800
    expect(names()).toContain("section_viewed");
  });

  it("ignores sections without a usable id and re-scans for lazy sections", () => {
    sections("bad id!");
    const { names } = setup();
    FakeIO.all[0]!.fire([...FakeIO.all[0]!.elements][0]!, { height: 500 });
    expect(names()).toEqual(["page_viewed"]);
    document.querySelector("main")!.insertAdjacentHTML("beforeend", '<section id="later"></section>');
    vi.advanceTimersByTime(900);
    expect([...FakeIO.all[0]!.elements].map((e) => e.id)).toContain("later");
  });

  it("reports the project carousel once, at 50 % visible, with the number of products", () => {
    document.body.innerHTML = `<main><div class="pf-carousel"><div role="tablist">${'<button role="tab"></button>'.repeat(6)}</div></div></main>`;
    const { events } = setup({ path: "/projects" });
    const io = FakeIO.all.find((o) => o.options?.threshold && (o.options.threshold as number[])[0] === 0.5)!;
    io.fire([...io.elements][0]!, { height: 10, ratio: 0.3 });
    expect(events.filter(([n]) => n === "project_carousel_viewed")).toHaveLength(0);
    io.fire([...io.elements][0]!, { height: 100, ratio: 0.8 });
    io.cb([], io as never);
    expect(events.filter(([n]) => n === "project_carousel_viewed")).toEqual([["project_carousel_viewed", { project_count: 6, page_name: "portfolio" }]]);
  });

  describe("scroll depth", () => {
    const sentinels = () => [...document.querySelectorAll<HTMLElement>("[data-analytics-sentinels] > div")];

    it("uses observed sentinels (no scroll listener) placed on the scrollable range, firing each milestone once", () => {
      const add = vi.spyOn(window, "addEventListener");
      const { events } = setup();
      vi.advanceTimersByTime(700);
      expect(add.mock.calls.filter(([type]) => ["scroll", "wheel", "touchmove", "mousemove"].includes(type as string))).toEqual([]);
      const blocks = sentinels();
      expect(blocks.map((b) => b.dataset.depth)).toEqual(["25", "50", "75", "90"]);
      // scrollHeight 4000, viewport 800: depth d sits at 800 + d % of 3200.
      expect(blocks.map((b) => b.style.top)).toEqual(["1600px", "2400px", "3200px", "3680px"]);
      expect(blocks.map((b) => b.style.height)).toEqual(["2400px", "1600px", "800px", "320px"]);

      const io = FakeIO.all.find((o) => o.elements.has(blocks[0]!))!;
      io.fire(blocks[0]!, { height: 800 });
      io.fire(blocks[0]!, { height: 800 });
      io.fire(blocks[1]!, { height: 800 });
      io.fire(blocks[3]!, { height: 800 }); // 90 % reported on its own (in a browser a jump to the bottom intersects all four)
      const depths = events.filter(([n]) => n === "scroll_depth_reached").map(([, p]) => p.depth_percent);
      expect(depths).toEqual([25, 50, 90]);
      add.mockRestore();
    });

    it("sends nothing before the visitor scrolls: no sentinel starts inside the viewport", () => {
      setup();
      vi.advanceTimersByTime(700);
      for (const b of sentinels()) expect(parseInt(b.style.top, 10)).toBeGreaterThan(window.innerHeight);
    });

    it("skips pages that are not meaningfully scrollable", () => {
      Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 850 });
      setup();
      vi.advanceTimersByTime(700);
      expect(sentinels()).toHaveLength(0);
    });
  });

  it("cleanup removes observers and sentinels; the same tracker then reports the next page view afresh", () => {
    sections("a");
    const events: Array<[string, Record<string, unknown>]> = [];
    const tracker = createTracker({ sink: { track: (n, p) => void events.push([n, p]) }, onInvalid: "throw" });
    const first = startPage(tracker, CTX);
    vi.advanceTimersByTime(700);
    const io1 = FakeIO.all[0]!;
    io1.fire([...io1.elements][0]!, { height: 500 });
    first();
    expect(document.querySelector("[data-analytics-sentinels]")).toBeNull();
    expect(FakeIO.all.every((io) => io.elements.size === 0)).toBe(true);

    startPage(tracker, { ...CTX, navigationType: "client_navigation", isLanding: false });
    const io2 = FakeIO.all.find((io) => io !== io1 && io.elements.size > 0)!;
    io2.fire([...io2.elements][0]!, { height: 500 });
    expect(events.filter(([n]) => n === "page_viewed")).toHaveLength(2);
    expect(events.filter(([n]) => n === "section_viewed")).toHaveLength(2);
  });
});
