/**
 * eval-028.spec.ts (`@EVAL-028`, S29, TASK-142.5) — Paper Trail cursor gating + mobile in both themes.
 *
 *   • touch/coarse (the w390 project): 0 `[data-paper-cursor]`, the cursor chunk is never requested;
 *   • fine pointer: mounts only after `load`; never under reduced motion; never without JS;
 *   • exclusion zones (`input, textarea, select, button, video, iframe, [contenteditable],
 *     [data-no-trail]`, plus the open Ask drawer) compute a native cursor and never spawn trail nodes;
 *   • the trail starts only on a left-button hold-and-drag; ≤ 18 active nodes; transform/opacity only
 *     (cursor.md §45); no selection lock after release;
 *   • no horizontal scroll at 375 and 768 in both themes (the theme fixture lands with T2 — until then
 *     `documentElement.dataset.theme` is set directly).
 */
import { test, expect } from "./fixtures";
import type { Page, TestInfo } from "@playwright/test";

const MARKER = "cursor-trail-item";
const cursorEl = '[data-paper-cursor="cursor"]';
const isTouch = (info: TestInfo) => info.project.name === "w390";

/** URLs of every `/_next/static` script whose body carries the cursor module's marker. */
function watchCursorChunk(page: Page): string[] {
  const hits: string[] = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (!/\/_next\/static\/.*\.js/.test(url)) return;
    try {
      if ((await res.text()).includes(MARKER)) hits.push(url);
    } catch {
      /* body unavailable (redirect/abort) */
    }
  });
  return hits;
}

async function mounted(page: Page) {
  await page.waitForSelector(cursorEl, { state: "attached", timeout: 15_000 });
}

/** A full-viewport, non-zone drag surface so the trail checks do not depend on page content. */
async function addSurface(page: Page, theme?: string) {
  await page.evaluate((t) => {
    const el = document.createElement("div");
    el.id = "eval028-surface";
    el.style.cssText = "position:fixed;inset:0;z-index:50;background:transparent";
    if (t) el.dataset.cursorTheme = t;
    document.body.appendChild(el);
  }, theme ?? null);
}

const nodeCount = (page: Page) => page.locator(`#trail .${MARKER}`).count();

async function drag(page: Page, from: [number, number], to: [number, number], steps: number, button: "left" | "right" = "left") {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down({ button });
  await page.mouse.move(to[0], to[1], { steps });
  return async () => page.mouse.up({ button });
}

test.describe("@EVAL-028 touch / coarse pointer", () => {
  test("@EVAL-028 mounts nothing and never requests the cursor chunk", async ({ page }, info) => {
    test.skip(!isTouch(info), "touch project only");
    const hits = watchCursorChunk(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    expect(await page.locator("[data-paper-cursor]").count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.classList.contains("has-custom-cursor"))).toBe(false);
    expect(hits).toEqual([]);
  });
});

test.describe("@EVAL-028 fine pointer gating", () => {
  test.beforeEach(({}, info) => test.skip(isTouch(info), "fine-pointer projects only"));

  test("@EVAL-028 mounts after load, not before", async ({ page }) => {
    const hits = watchCursorChunk(page);
    await page.goto("/", { waitUntil: "commit" });
    await mounted(page);
    await page.waitForLoadState("load");
    expect(hits.length).toBe(1);
    const { loadStart, requestStart } = await page.evaluate((url) => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const res = performance.getEntriesByName(url)[0] as PerformanceResourceTiming | undefined;
      return { loadStart: nav.loadEventStart, requestStart: res?.requestStart ?? -1 };
    }, hits[0]!);
    expect(loadStart).toBeGreaterThan(0);
    expect(requestStart).toBeGreaterThanOrEqual(loadStart);
  });

  test("@EVAL-028 native cursor stays until the first pointer move, then the custom one takes over", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    expect(await page.evaluate(() => document.documentElement.classList.contains("has-custom-cursor"))).toBe(false);
    await page.mouse.move(300, 300);
    await expect(page.locator("html.has-custom-cursor")).toHaveCount(1);
    expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).toBe("none");
    await expect(page.locator(cursorEl)).toHaveAttribute("data-mode", "default");
  });

  test("@EVAL-028 never mounts under reduced motion", async ({ page, withReducedMotion }) => {
    await withReducedMotion(page);
    const hits = watchCursorChunk(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.mouse.move(300, 300);
    await page.waitForTimeout(1500);
    expect(await page.locator("[data-paper-cursor]").count()).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
    expect(hits).toEqual([]);
  });

  test("@EVAL-028 never mounts, and breaks nothing, without JS", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, ...(baseURL ? { baseURL } : {}) });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(await page.locator("[data-paper-cursor]").count()).toBe(0);
    await expect(page.locator("main")).toBeVisible(); // the page is intact, native cursor in charge
    expect(await page.content()).not.toContain("portfolio-cursor");
    await context.close();
  });

  test("@EVAL-028 a blocked cursor chunk leaves the native cursor (no no-cursor failure state)", async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js/, async (route) => {
      const res = await route.fetch();
      const body = await res.text();
      if (body.includes(MARKER)) return route.abort();
      return route.fulfill({ response: res, body });
    });
    await page.goto("/");
    await page.mouse.move(300, 300);
    await page.waitForTimeout(1500);
    expect(await page.locator("[data-paper-cursor]").count()).toBe(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
  });
});

test.describe("@EVAL-028 exclusion zones", () => {
  test.beforeEach(({}, info) => test.skip(isTouch(info), "fine-pointer projects only"));

  const ZONES: [string, string][] = [
    ["input", `<input id="z" style="width:360px;height:90px" aria-label="z">`],
    ["textarea", `<textarea id="z" style="width:360px;height:90px" aria-label="z"></textarea>`],
    ["select", `<select id="z" style="width:360px;height:90px" aria-label="z"><option>a</option></select>`],
    ["button", `<button id="z" style="width:360px;height:90px">b</button>`],
    ["video", `<video id="z" style="width:360px;height:90px" aria-label="z"></video>`],
    ["iframe", `<iframe id="z" style="width:360px;height:90px" title="z" srcdoc="<p>x</p>"></iframe>`],
    ["[contenteditable]", `<div id="z" contenteditable="true" style="width:360px;height:90px">e</div>`],
    ["[data-no-trail]", `<div id="z" data-no-trail style="width:360px;height:90px"><p style="margin:30px">child</p></div>`],
  ];

  for (const [name, markup] of ZONES) {
    test(`@EVAL-028 ${name}: native cursor, no trail nodes`, async ({ page }) => {
      await page.goto("/");
      await mounted(page);
      await page.mouse.move(200, 200);
      await page.evaluate((html) => {
        const host = document.createElement("div");
        host.style.cssText = "position:fixed;left:40px;top:40px;z-index:50";
        host.innerHTML = html;
        document.body.appendChild(host);
      }, markup);
      const zone = page.locator("#z");
      const box = (await zone.boundingBox())!;
      expect(await zone.evaluate((el) => getComputedStyle(el).cursor)).not.toBe("none");
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + 20, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 20, y, { steps: 20 });
      expect(await nodeCount(page)).toBe(0);
      await page.mouse.up();
      expect(await nodeCount(page)).toBe(0);
    });
  }

  test("@EVAL-028 the Ask drawer: native cursor, no trail, custom cursor hidden", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await page.mouse.move(300, 300);
    await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
    const dialog = page.locator("dialog.ask-panel");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(900); // the slide-over finishes before its box is measured
    const box = (await dialog.boundingBox())!;
    expect(await dialog.evaluate((el) => getComputedStyle(el).cursor)).not.toBe("none");
    expect(await page.locator("#ask-panel-input").evaluate((el) => getComputedStyle(el).cursor)).not.toBe("none");
    const x = box.x + 40;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + Math.min(300, box.width - 80), y + 40, { steps: 25 });
    expect(await nodeCount(page)).toBe(0);
    await page.mouse.up();
    await expect(page.locator(cursorEl)).toHaveAttribute("data-mode", /hidden|tag/);
  });
});

test.describe("@EVAL-028 paper trail behaviour", () => {
  test.beforeEach(({}, info) => test.skip(isTouch(info), "fine-pointer projects only"));

  test("@EVAL-028 moving without a button, or with the right button, spawns nothing", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await addSurface(page);
    await page.mouse.move(100, 200);
    await page.mouse.move(700, 260, { steps: 30 });
    expect(await nodeCount(page)).toBe(0);
    const up = await drag(page, [100, 300], [700, 360], 30, "right");
    expect(await nodeCount(page)).toBe(0);
    await up();
  });

  test("@EVAL-028 left-button hold-and-drag spawns spaced, decorative, non-blocking nodes that clean up", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await addSurface(page);
    const up = await drag(page, [60, 300], [660, 300], 40);
    const n = await nodeCount(page);
    expect(n).toBeGreaterThanOrEqual(5); // 1 on press + 600px / 110px
    expect(n).toBeLessThanOrEqual(7);
    const first = page.locator(`#trail .${MARKER}`).first();
    await expect(first).toHaveAttribute("alt", "");
    await expect(first).toHaveAttribute("aria-hidden", "true");
    expect(await first.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    expect(await page.locator("#trail").evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    expect(await page.locator(cursorEl).evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    await up();
    await expect.poll(() => nodeCount(page), { timeout: 4000 }).toBe(0);
  });

  test("@EVAL-028 a stroke that starts on a real image keeps trailing (no native image drag)", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    const hero = page.locator("main img").first();
    await hero.scrollIntoViewIfNeeded();
    const box = (await hero.boundingBox())!;
    const y = Math.min(box.y + box.height / 2, page.viewportSize()!.height - 40);
    const x0 = box.x + 40;
    await page.mouse.move(x0, y);
    await page.mouse.down();
    await page.mouse.move(x0 + 520, y + 30, { steps: 30 });
    expect(await nodeCount(page)).toBeGreaterThanOrEqual(4);
    await page.mouse.up();
  });

  test("@EVAL-028 ≤ 18 active nodes on a long fast stroke; only transform + opacity animate", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await addSurface(page);
    await page.evaluate(() => {
      const w = window as unknown as { __max: number };
      w.__max = 0;
      new MutationObserver(() => {
        w.__max = Math.max(w.__max, document.querySelectorAll("#trail .cursor-trail-item").length);
      }).observe(document.getElementById("trail")!, { childList: true });
    });
    await page.mouse.move(20, 100);
    await page.mouse.down();
    const width = page.viewportSize()!.width;
    for (let pass = 0; pass < 12; pass++) {
      await page.mouse.move(pass % 2 ? 20 : width - 20, 100 + pass * 40, { steps: 6 });
    }
    const props = await page.evaluate(() => {
      const el = document.querySelector("#trail .cursor-trail-item");
      const anim = el?.getAnimations()[0];
      const frames = (anim?.effect as KeyframeEffect | undefined)?.getKeyframes() ?? [];
      return Array.from(new Set(frames.flatMap((f) => Object.keys(f)))).filter((k) => !["offset", "easing", "composite", "computedOffset"].includes(k));
    });
    expect(props.sort()).toEqual(["opacity", "transform"]);
    await page.mouse.up();
    const max = await page.evaluate(() => (window as unknown as { __max: number }).__max);
    expect(max).toBeGreaterThan(5);
    expect(max).toBeLessThanOrEqual(18);
  });

  test("@EVAL-028 no selection lock after release, blur or tab switch", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await addSurface(page);
    const state = () =>
      page.evaluate(() => ({ cls: document.body.classList.contains("cursor-dragging"), sel: getComputedStyle(document.body).userSelect }));
    const up = await drag(page, [60, 300], [300, 320], 10);
    expect(await state()).toEqual({ cls: true, sel: "none" });
    await up();
    expect(await state()).toEqual({ cls: false, sel: "auto" });
    await page.mouse.down();
    await page.mouse.move(400, 330, { steps: 5 });
    expect((await state()).cls).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    expect((await state()).cls).toBe(false);
    await page.mouse.up();
    await page.mouse.down();
    await page.mouse.move(500, 330, { steps: 5 });
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect((await state()).cls).toBe(false);
    await page.mouse.up();
  });

  test("@EVAL-028 section themes: tushky is paw-only, railcite is its own set", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await addSurface(page, "tushky");
    const up = await drag(page, [60, 300], [700, 300], 30);
    const srcs = await page.locator(`#trail .${MARKER}`).evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute("src")));
    expect(srcs.length).toBeGreaterThan(3);
    expect(new Set(srcs)).toEqual(new Set(["/cursor/trail/paw.svg"]));
    await up();
    await page.evaluate(() => document.getElementById("eval028-surface")?.setAttribute("data-cursor-theme", "railcite"));
    await expect.poll(() => nodeCount(page), { timeout: 4000 }).toBe(0);
    const up2 = await drag(page, [60, 400], [700, 400], 30);
    const srcs2 = await page.locator(`#trail .${MARKER}`).evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute("src")));
    expect(srcs2[0]).toBe("/cursor/trail/rail-ticket.svg");
    await up2();
  });

  test("@EVAL-028 semantic labels: links get a chip, plain content none, the Tushky launcher says WOOF", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    const cursor = page.locator(cursorEl);
    await page.mouse.move(600, 500);
    await page.evaluate(() => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:40px;top:300px;z-index:50;display:flex;gap:20px";
      host.innerHTML = `<a id="a1" href="/about" style="padding:20px">about</a><a id="a2" href="/work/railcite" style="padding:20px">cs</a><a id="a3" href="https://example.com" style="padding:20px">ext</a>`;
      document.body.appendChild(host);
    });
    for (const [id, text] of [["a1", "OPEN →"], ["a2", "CASE STUDY →"], ["a3", "OPEN ↗"]] as const) {
      await page.locator(`#${id}`).hover();
      await expect(cursor).toHaveAttribute("data-mode", "link");
      await expect(cursor.locator(".pc-label")).toHaveText(text);
    }
    await page.mouse.move(700, 600);
    await expect(cursor).toHaveAttribute("data-mode", "default");
    await page.locator("header").getByRole("button", { name: "Ask AI" }).hover();
    await expect(cursor.locator(".pc-label")).toHaveText("WOOF 🐾");
    await expect(cursor).toHaveAttribute("data-paw", "true");
  });

  test("@EVAL-028 the cursor tracks the pointer 1:1 once settled", async ({ page }) => {
    await page.goto("/");
    await mounted(page);
    await page.mouse.move(412, 333);
    await expect
      .poll(async () => (await page.locator(cursorEl).evaluate((el) => (el as HTMLElement).style.transform)))
      .toBe("translate3d(412px, 333px, 0px)");
  });
});

test.describe("@EVAL-028 no horizontal scroll at 375 and 768, both themes", () => {
  for (const width of [375, 768]) {
    for (const theme of ["light", "dark"]) {
      test(`@EVAL-028 ${width}px · ${theme}`, async ({ page, noOverflow }, info) => {
        test.skip(isTouch(info), "viewport is set per test; run in a fine-pointer project");
        await page.setViewportSize({ width, height: 900 });
        for (const route of ["/", "/about", "/work", "/projects", "/contact"]) {
          await page.goto(route);
          await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
          await mounted(page);
          await page.mouse.move(40, 120);
          await page.mouse.down();
          await page.mouse.move(width - 10, 420, { steps: 25 });
          await noOverflow(page);
          await page.mouse.up();
          await noOverflow(page);
        }
      });
    }
  }
});
