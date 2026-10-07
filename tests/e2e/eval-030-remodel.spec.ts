/**
 * eval-030-remodel.spec.ts (`@EVAL-030`, TASK-168) — the Gummy Lab as a luxury paper-craft diorama:
 *   • the layered torn-paper frame (vignette + 3 sheets) and the 4-layer backdrop are present, carry the Paper
 *     World depth factors, and the canvas is not inside any moving layer (the world stays still);
 *   • the HUD is three paper plates with live score / combo / time text and a real Pause button;
 *   • sound is opt-in: off by default, 0 audio requests on /lab until the toggle is pressed, music-2 only after
 *     music-1, the choice persisted in localStorage, and a remembered "on" still loads nothing before a gesture;
 *   • dark theme uses the dark twins and keeps an edge on the outer sheet;
 *   • no infinite animation is running outside `[data-lab]` (TASK-143: they starve the WebGL boot).
 * Same SwiftShader launch as eval-030.spec.ts; canvas checks run on w1440 + w390.
 */
import { test, expect } from "./fixtures";
import type { Page, TestInfo } from "@playwright/test";
import { waitLab } from "./lab-helpers";

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] } });

const heavy = (info: TestInfo) => info.project.name === "w1440" || info.project.name === "w390";
const AUDIO_URL = /\/media\/lab\/(sfx|music)\//;

const labMode = (page: Page) => page.locator("[data-lab]").first().getAttribute("data-lab");

async function openGame(page: Page) {
  await page.goto("/lab?debug");
  await waitLab(page);
  test.skip((await labMode(page)) !== "canvas", "WebGL is unavailable on this host even with SwiftShader");
  await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 60_000 });
}

test.describe("@EVAL-030 the diorama (canvas path)", () => {
  test.beforeEach(({}, info) => {
    test.skip(!heavy(info), "canvas checks run on w1440 + w390");
    test.setTimeout(150_000);
  });

  test("@EVAL-030 the torn frame and backdrop layers are present with the Paper World depths, and the canvas does not move", async ({ page }) => {
    await openGame(page);
    await page.waitForSelector("[data-lab-diorama='ready']", { timeout: 30_000 });
    const info = await page.evaluate(() => {
      const layers = (sel: string) =>
        Array.from(document.querySelectorAll<HTMLElement>(`${sel} [data-layer]`)).map((el) => ({ name: el.dataset.layer!, depth: Number(el.dataset.depth) }));
      const canvas = document.querySelector("[data-lab-canvas] canvas")!;
      return {
        backdrop: layers("[data-lab-backdrop]"),
        frame: layers("[data-lab-frame]"),
        canvasInLayer: !!canvas.closest("[data-layer]"),
        // the visible theme's picture of every layer has loaded
        loaded: Array.from(document.querySelectorAll<HTMLImageElement>("[data-lab-diorama] img"))
          .filter((i) => i.offsetParent !== null)
          .map((i) => ({ src: i.src.split("/").pop(), ok: i.complete && i.naturalWidth > 0 })),
      };
    });
    expect(info.backdrop).toEqual([
      { name: "bg-1-sky", depth: 0 },
      { name: "bg-2-hills-far", depth: 0.05 },
      { name: "bg-3-hills-mid", depth: 0.12 },
      { name: "bg-4-hills-near", depth: 0.22 },
    ]);
    expect(info.frame).toEqual([
      { name: "frame-4-vignette", depth: 0 },
      { name: "frame-1-outer", depth: 0.22 },
      { name: "frame-2-secondary", depth: 0.4 },
      { name: "frame-3-inner", depth: 0.4 },
    ]);
    expect(info.canvasInLayer).toBe(false);
    expect(info.loaded.length).toBeGreaterThanOrEqual(8);
    expect(info.loaded.filter((l) => !l.ok)).toEqual([]);
    // the canvas sits inside the frame's opening, not the whole viewport
    const vp = page.viewportSize()!;
    const box = (await page.locator("[data-lab-canvas] canvas").boundingBox())!;
    expect(box.width).toBeLessThan(vp.width + 1);
    expect(box.height).toBeLessThan(vp.height * 0.8);
  });

  test("@EVAL-030 the HUD is three paper plates with live values and a real Pause button", async ({ page }) => {
    await openGame(page);
    await page.locator("[data-lab-play]").click();
    await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 40_000 });
    const hud = page.locator("[data-lab-hud]");
    await expect(hud.locator("[data-lab-score]")).toHaveText(/^\d[\d,]*$/);
    await expect(hud.locator("[data-lab-combo]")).toHaveText(/^x\d+$/);
    await expect(hud.locator("[data-lab-time]")).toHaveText(/^\d\d:\d\d$/);
    const art = await hud.locator("[class*='plate']").evaluateAll((els) => els.filter((e) => /plaque/.test(getComputedStyle(e).backgroundImage)).length);
    expect(art).toBe(3);
    const t0 = await hud.locator("[data-lab-time]").innerText();
    await expect.poll(() => hud.locator("[data-lab-time]").innerText(), { timeout: 20_000 }).not.toBe(t0);
    const pause = page.getByRole("button", { name: "Pause" });
    await expect(pause).toBeVisible();
    const b = (await pause.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
    const hb = (await hud.boundingBox())!;
    expect(hb.x).toBeGreaterThanOrEqual(0);
    expect(hb.x + hb.width).toBeLessThanOrEqual(page.viewportSize()!.width + 0.5);
  });

  test("@EVAL-030 sound is off by default: 0 audio requests until the toggle, music-1 before music-2, choice remembered", async ({ page }) => {
    const audio: string[] = [];
    page.on("request", (r) => {
      if (AUDIO_URL.test(r.url())) audio.push(r.url().split("/").pop()!);
    });
    await openGame(page);
    await page.locator("[data-lab-play]").click();
    await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 40_000 });
    await page.waitForTimeout(1500);
    expect(audio).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem("gummy-lab:sound"))).toBeNull();
    const off = page.getByRole("button", { name: /sound is off/i });
    await expect(off).toHaveAttribute("aria-pressed", "false");
    await off.click();
    await expect(page.getByRole("button", { name: /sound is on/i })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => audio.some((u) => /^music-1\./.test(u)), { timeout: 20_000 }).toBe(true);
    await expect.poll(() => audio.some((u) => /^music-2\./.test(u)), { timeout: 30_000 }).toBe(true);
    expect(audio.findIndex((u) => /^music-1\./.test(u))).toBeLessThan(audio.findIndex((u) => /^music-2\./.test(u)));
    expect(await page.evaluate(() => localStorage.getItem("gummy-lab:sound"))).toBe("on");
    // muting again is remembered too
    await page.getByRole("button", { name: /sound is on/i }).click();
    expect(await page.evaluate(() => localStorage.getItem("gummy-lab:sound"))).toBe("off");
  });

  test("@EVAL-030 a remembered 'sound on' shows the toggle on but loads nothing before the first gesture", async ({ page }) => {
    const audio: string[] = [];
    page.on("request", (r) => {
      if (AUDIO_URL.test(r.url())) audio.push(r.url());
    });
    await page.addInitScript(() => localStorage.setItem("gummy-lab:sound", "on"));
    await openGame(page);
    await expect(page.getByRole("button", { name: /sound is on/i })).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1500);
    expect(audio).toEqual([]);
    await page.mouse.click(5, 5);
    await expect.poll(() => audio.length, { timeout: 20_000 }).toBeGreaterThan(0);
  });

  test("@EVAL-030 dark theme swaps to the dark twins and gives the outer sheet an edge", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("portfolio-theme", "dark"));
    await openGame(page);
    await page.waitForSelector("[data-lab-diorama='ready']", { timeout: 30_000 });
    const r = await page.evaluate(() => {
      const visible = Array.from(document.querySelectorAll<HTMLImageElement>("[data-lab-diorama] img")).filter((i) => i.offsetParent !== null);
      const outer = document.querySelector<HTMLImageElement>("[data-layer='frame-1-outer'] picture[data-theme-art='dark'] img")!;
      return { files: visible.map((i) => i.src.split("/").pop()!), filter: getComputedStyle(outer).filter };
    });
    expect(r.files.filter((f) => /^(bg-|frame-[123])/.test(f)).every((f) => f.endsWith("-dark.webp"))).toBe(true);
    expect(r.filter).toContain("drop-shadow");
  });
});

test.describe("@EVAL-030 the remodel adds no animation loop outside the lab", () => {
  test.beforeEach(() => test.setTimeout(90_000));
  test("@EVAL-030 on /lab no infinite animation runs outside [data-lab], and the diorama's own animations are finite", async ({ page }, info) => {
    await page.goto("/lab");
    await waitLab(page);
    if ((await labMode(page)) === "canvas" && heavy(info)) await page.waitForSelector("[data-lab-diorama='ready']", { timeout: 40_000 });
    const r = await page.evaluate(() => {
      const all = document.getAnimations();
      const infinite = all.filter((a) => (a.effect as KeyframeEffect | null)?.getTiming().iterations === Infinity);
      const outside = infinite.filter((a) => !(a.effect as KeyframeEffect).target?.closest("[data-lab]"));
      const inDiorama = all.filter((a) => (a.effect as KeyframeEffect).target?.closest("[data-lab-diorama], [data-lab-hud]"));
      return { outside: outside.length, dioramaInfinite: inDiorama.filter((a) => infinite.includes(a)).length };
    });
    expect(r.outside).toBe(0);
    expect(r.dioramaInfinite).toBe(0);
  });

  test("@EVAL-030 the HUD, diorama and button motion never animate filters or layout properties", async ({ page }) => {
    await page.goto("/lab");
    await waitLab(page);
    const bad = await page.evaluate(async () => {
      const css = await Promise.all(Array.from(document.styleSheets).map(async (s) => {
        try {
          return Array.from(s.cssRules).map((r) => r.cssText).join("\n");
        } catch {
          return "";
        }
      }));
      const frames = css.join("\n").match(/@keyframes (plate-lift|num-flutter)[^}]*(\{[^{}]*\}[^{}]*)+\}/g) ?? [];
      return frames.filter((f) => /\b(filter|width|height|top|left|margin|padding|box-shadow)\s*:/.test(f));
    });
    expect(bad).toEqual([]);
  });
});
