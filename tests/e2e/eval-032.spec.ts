/**
 * eval-032.spec.ts (`@EVAL-032`, evaluation-plan §10, M-011 P0 / TASK-156.5) — Paper World parallax correctness,
 * on the `/dev/primitives` fixture scene (`hero-home`, 4 layers). Viewports w390 (touch) / w768 / w1440; w1024 skips.
 * Needs a build with `ALLOW_DEV_ROUTES=1` (skips, never fails, otherwise). Attribution of listeners and frames to
 * `paperMotion` is by the built chunk that contains the motion source (tests/e2e/paper-world-lib.ts).
 *
 * Alpha-probe screenshots of the frame edges are replaced by the equivalent geometry check: at every pointer
 * extreme each layer's image box still covers the scene frame (the bleed contract).
 */
import { test, expect } from "./fixtures";
import {
  gotoBoard,
  instrument,
  layerTranslates,
  liveMotionListeners,
  motionChunks,
  scrollSceneIntoView,
  SCENE,
  settled,
  type PwRecord,
} from "./paper-world-lib";

const width = (page: { viewportSize(): { width: number } | null }) => page.viewportSize()!.width;
const FINE_WIDTHS = [768, 1440];
const TOL_PX = 1;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(instrument);
});

/** Expected |offset| for a layer at full pointer deflection: factor × range (±12; ±25 for factor ≥ .40), × .5 below 1024. */
const expected = (depth: number, w: number) => depth * (depth >= 0.4 ? 25 : 12) * (w < 1024 ? 0.5 : 1);

test.describe("@EVAL-032 pointer parallax", () => {
  test.beforeEach(({ page }) => {
    test.skip(!FINE_WIDTHS.includes(width(page)), "pointer parallax is measured at w768 / w1440 (w390 is touch; see the touch test)");
  });

  test("each layer's max offset equals factor × range within 1 px, by translate only", async ({ page }) => {
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    const { width: w, height: h } = page.viewportSize()!;
    // Sample layout-bearing properties on every frame while moving; they must never change.
    await page.evaluate((sel) => {
      const props = ["top", "left", "width", "height", "filter", "box-shadow"];
      const seen = new Map<string, Set<string>>();
      const els = [...document.querySelectorAll(`${sel}, ${sel} [data-layer], ${sel} img`)];
      const sample = () => {
        els.forEach((el, i) => {
          const cs = getComputedStyle(el);
          props.forEach((p) => {
            const k = `${i}:${p}`;
            (seen.get(k) ?? seen.set(k, new Set()).get(k)!).add(cs.getPropertyValue(p));
          });
        });
        requestAnimationFrame(sample);
      };
      sample();
      (window as unknown as { __layoutSeen: Map<string, Set<string>> }).__layoutSeen = seen;
    }, SCENE);
    const corners: Array<[number, number, number, number]> = [
      [w - 1, h - 1, 1, 1],
      [0, 0, -1, -1],
      [w - 1, 0, 1, -1],
      [0, h - 1, -1, 1],
    ];
    for (const [px, py, sx, sy] of corners) {
      await page.mouse.move(px, py, { steps: 6 });
      const t = await settled(page);
      for (const l of t) {
        const max = expected(l.depth, w);
        expect(Math.abs(l.x - sx * max), `${l.layer} x at ${sx},${sy}`).toBeLessThanOrEqual(TOL_PX);
        expect(Math.abs(l.y - sy * max), `${l.layer} y at ${sx},${sy}`).toBeLessThanOrEqual(TOL_PX);
      }
    }
    await page.mouse.move(w / 2, h / 2, { steps: 6 });
    for (const l of await settled(page)) {
      expect(Math.abs(l.x), `${l.layer} centre x`).toBeLessThanOrEqual(TOL_PX);
      expect(Math.abs(l.y), `${l.layer} centre y`).toBeLessThanOrEqual(TOL_PX);
    }
    const mutated = await page.evaluate(() => {
      const seen = (window as unknown as { __layoutSeen: Map<string, Set<string>> }).__layoutSeen;
      return [...seen].filter(([, v]) => v.size > 1).map(([k]) => k);
    });
    expect(mutated, "layout properties that changed during motion").toEqual([]);
    const css = await page.locator(SCENE).evaluate((el) => (el as HTMLElement).style.cssText);
    expect(css).not.toMatch(/\b(top|left|width|height|filter)\s*:/);
  });

  test("no gap at ±max: every layer's image still covers the scene frame", async ({ page }) => {
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    const { width: w, height: h } = page.viewportSize()!;
    for (const [px, py] of [[w - 1, h - 1], [0, 0], [w - 1, 0], [0, h - 1]] as const) {
      await page.mouse.move(px, py, { steps: 6 });
      await settled(page);
      const gaps = await page.evaluate((sel) => {
        const root = document.querySelector(sel)!.getBoundingClientRect();
        return [...document.querySelectorAll(`${sel} [data-layer]`)].flatMap((layer) => {
          const img = [...layer.querySelectorAll("img")].find((i) => (i as HTMLElement).offsetParent !== null)!.getBoundingClientRect();
          const out = [];
          if (img.left > root.left + 0.5) out.push("left");
          if (img.top > root.top + 0.5) out.push("top");
          if (img.right < root.right - 0.5) out.push("right");
          if (img.bottom < root.bottom - 0.5) out.push("bottom");
          return out.map((side) => `${(layer as HTMLElement).dataset.layer}:${side}`);
        });
      }, SCENE);
      expect(gaps, `edge gaps with the pointer at ${px},${py}`).toEqual([]);
    }
  });

  test("one pointermove listener and one loop for the page; the loop sleeps at rest, off-screen and hidden", async ({ page }) => {
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    const { width: w, height: h } = page.viewportSize()!;
    expect(await liveMotionListeners(page, "pointermove", "window")).toBe(1);

    const chunks = await motionChunks(page);
    expect(chunks.length).toBeGreaterThan(0);
    const motionRaf = (since: number) =>
      page.evaluate(
        ([t, cs]) => (window as unknown as { __pw: PwRecord }).__pw.raf.filter((r) => r.t > (t as number) && (cs as string[]).some((c) => r.stack.includes(c))).length,
        [since, chunks] as const,
      );
    const now = () => page.evaluate(() => performance.now());
    const writesSince = (since: number) => page.evaluate((t) => (window as unknown as { __pw: PwRecord }).__pw.writes.filter((x) => x > t).length, since);

    // Moving starts the loop…
    const t0 = await now();
    await page.mouse.move(w - 1, h - 1, { steps: 8 });
    expect(await motionRaf(t0)).toBeGreaterThan(0);
    // …and 1.5 s after input stops it has gone to sleep: no frame and no write in the next 600 ms.
    await page.waitForTimeout(1500);
    const idle = await now();
    await page.waitForTimeout(600);
    expect(await motionRaf(idle), "parallax rAF callbacks while idle").toBe(0);
    expect(await writesSince(idle), "--pp-* writes while idle").toBe(0);

    // Off-screen: scroll the scene away, move the pointer — nothing runs.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const off = await now();
    await page.mouse.move(5, 5, { steps: 6 });
    await page.mouse.move(w - 5, h - 5, { steps: 6 });
    await page.waitForTimeout(600);
    expect(await motionRaf(off), "parallax rAF callbacks while off-screen").toBe(0);
    expect(await writesSince(off), "--pp-* writes while off-screen").toBe(0);

    // Hidden tab: back on screen, then hidden — input does nothing.
    await scrollSceneIntoView(page);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const hid = await now();
    await page.mouse.move(10, 10, { steps: 6 });
    await page.mouse.move(w - 10, h - 10, { steps: 6 });
    await page.waitForTimeout(600);
    expect(await motionRaf(hid), "parallax rAF callbacks while hidden").toBe(0);
    expect(await writesSince(hid), "--pp-* writes while hidden").toBe(0);
  });
});

test.describe("@EVAL-032 reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("attaches no motion listener, layers sit at rest and the composition is complete", async ({ page }) => {
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    const { width: w, height: h } = page.viewportSize()!;
    await page.mouse.move(w - 1, h - 1, { steps: 6 });
    await page.waitForTimeout(500);
    for (const type of ["pointermove", "deviceorientation"]) {
      expect(await liveMotionListeners(page, type, "window"), `${type} listeners under reduced motion`).toBe(0);
    }
    expect(await liveMotionListeners(page, "visibilitychange", "document")).toBe(0);
    for (const l of await layerTranslates(page)) {
      expect(l.x, `${l.layer} x`).toBe(0);
      expect(l.y, `${l.layer} y`).toBe(0);
    }
    const chunks = await motionChunks(page);
    const frames = await page.evaluate((cs) => (window as unknown as { __pw: PwRecord }).__pw.raf.filter((r) => cs.some((c) => r.stack.includes(c))).length, chunks);
    expect(frames, "parallax rAF registrations under reduced motion").toBe(0);
    // Complete at rest: every visible layer image decoded (lazy layers loaded because the scene is in view).
    await page.waitForFunction((sel) => [...document.querySelectorAll(`${sel} img`)].filter((i) => i.offsetParent !== null).every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0), SCENE);
    // Scroll depth is off too: the depth wrapper carries no animation.
    const animated = await page.locator(`${SCENE} [data-layer] > div`).evaluateAll((els) => els.filter((e) => getComputedStyle(e).animationName !== "none").length);
    expect(animated).toBe(0);
  });
});

test.describe("@EVAL-032 scroll depth", () => {
  test("never hijacks scroll: no parallax code calls preventDefault and the page scrolls", async ({ page }) => {
    await gotoBoard(page);
    const chunks = await motionChunks(page);
    await page.mouse.move(200, 200);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const prevented = await page.evaluate((cs) => (window as unknown as { __pw: PwRecord }).__pw.prevent.filter((p) => cs.some((c) => p.stack.includes(c))).length, chunks);
    expect(prevented, "preventDefault calls from the parallax chunk").toBe(0);
    // Scroll depth is CSS-only: the layers' depth wrappers run a scroll-timeline animation (where supported).
    const timelines = await page.locator(`${SCENE} [data-layer] > div`).evaluateAll((els) => els.map((e) => getComputedStyle(e).getPropertyValue("animation-timeline")));
    expect(timelines.every((t) => t.includes("view") || t === "auto"), `animation-timeline: ${timelines.join(", ")}`).toBe(true);
  });
});

test.describe("@EVAL-032 touch", () => {
  test("a touch viewport (w390) attaches no pointermove listener and layers stay at rest until tilt", async ({ page }) => {
    test.skip(width(page) !== 390, "touch profile");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    expect(await liveMotionListeners(page, "pointermove", "window")).toBe(0);
    for (const l of await layerTranslates(page)) {
      expect(l.x).toBe(0);
      expect(l.y).toBe(0);
    }
  });
});
