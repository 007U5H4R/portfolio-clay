/**
 * origami-idle.spec.ts (TASK-271) — the origami layer's six time-based loops cost nothing at rest. They play while the reader
 * scrolls / touches and for ~7 s afterwards (`data-live` on .ob-root), then sit `paused` (no position jump on resume); never in a
 * hidden tab; nothing at all under reduced motion or in the /projects product detail view. Phone only (w390).
 * The real signal is compositor frames: idle 3 s used to draw ~180 frames (60 fps) under the glass cards.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const SETTLE_MS = 8500; // ORIGAMI_LIVE_MS (7000) + margin

/** Time-based (DocumentTimeline) animations inside .ob-root — the scroll-driven parallax is not one of them. */
const loops = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.timeline instanceof DocumentTimeline && (a.effect as KeyframeEffect | null)?.target?.closest?.(".ob-root"))
      .map((a) => ({ state: a.playState, t: Number(a.currentTime) })),
  );
const states = async (page: Page) => (await loops(page)).map((l) => l.state);

test.describe("origami loops pause at rest (TASK-271)", () => {
  test("six loops run after load, pause after the idle timeout, resume on scroll without a jump", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/about", { waitUntil: "load" });
    await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
    await expect.poll(async () => (await states(page)).filter((s) => s === "running").length).toBe(6);

    await page.waitForTimeout(SETTLE_MS);
    const paused = await loops(page);
    expect(paused).toHaveLength(6);
    expect(paused.every((l) => l.state === "paused")).toBe(true);
    await expect(page.locator(".ob-root")).not.toHaveAttribute("data-live", /.*/);

    // paused means paused: the clock does not advance
    await page.waitForTimeout(600);
    const still = await loops(page);
    expect(still.map((l) => l.t)).toEqual(paused.map((l) => l.t));

    // a scroll wakes them, from where they stopped
    await page.evaluate(() => scrollBy(0, 300));
    await expect.poll(async () => (await states(page)).every((s) => s === "running")).toBe(true);
    const resumed = await loops(page);
    resumed.forEach((l, i) => {
      expect(l.t).toBeGreaterThanOrEqual(paused[i]!.t);
      expect(l.t - paused[i]!.t).toBeLessThan(2000); // no jump to a different position
    });

    // and they go back to sleep after the next quiet spell
    await page.waitForTimeout(SETTLE_MS);
    expect((await states(page)).every((s) => s === "paused")).toBe(true);
  });

  test("a touch wakes them; a hidden tab never does", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/", { waitUntil: "load" });
    await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
    await page.waitForTimeout(SETTLE_MS);
    expect((await states(page)).every((s) => s === "paused")).toBe(true);

    await page.evaluate(() => document.dispatchEvent(new Event("touchstart", { bubbles: true })));
    await expect.poll(async () => (await states(page)).every((s) => s === "running")).toBe(true);

    // tab hidden: paused at once, and activity does not wake it
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(async () => (await states(page)).every((s) => s === "paused")).toBe(true);
    await page.evaluate(() => scrollBy(0, 200));
    await page.waitForTimeout(300);
    expect((await states(page)).every((s) => s === "paused")).toBe(true);
  });

  test("reduced motion: no loops at all; product detail view: layer hidden, nothing animates", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about", { waitUntil: "load" });
    await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
    expect(await loops(page)).toHaveLength(0);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".pf-showcase")!).some((k) => k.startsWith("__react")));
    await page.locator(".pf-m-card").first().click();
    await expect(page.locator(".pf-showcase")).toHaveAttribute("data-view", "detail");
    await expect.poll(async () => (await states(page)).filter((s) => s === "running").length).toBe(0);
  });

  test("idle compositor frames: ~0 per 3 s at rest, 60 fps while scrolling", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/certifications", { waitUntil: "load" });
    await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
    await page.evaluate(() => scrollTo(0, 1200));
    await page.waitForTimeout(SETTLE_MS);
    const cdp = await page.context().newCDPSession(page);
    const frames = async (ms: number, during?: () => Promise<void>) => {
      let n = 0;
      const onData = (d: { value: { name?: string }[] }) => {
        for (const e of d.value) if (e.name === "DrawFrame") n++;
      };
      cdp.on("Tracing.dataCollected", onData);
      await cdp.send("Tracing.start", { categories: "disabled-by-default-devtools.timeline.frame,devtools.timeline,cc", transferMode: "ReportEvents" });
      if (during) await during();
      await page.waitForTimeout(ms);
      const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
      await cdp.send("Tracing.end");
      await done;
      cdp.off("Tracing.dataCollected", onData);
      return n;
    };
    const idle = await frames(3000);
    expect(idle, `idle DrawFrames over 3 s: ${idle}`).toBeLessThan(15); // was ~180
    const active = await frames(1500, () => page.evaluate(() => scrollBy(0, 40)));
    expect(active, `DrawFrames over 1.5 s right after a scroll: ${active}`).toBeGreaterThan(40); // loops running again
  });
});
