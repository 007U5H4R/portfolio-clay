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
    // Tushar 2026-10-07: the combo plate sits up on the frame, never over the arena, and stays on screen.
    const combo = (await page.locator("[data-lab-combo-plate]").boundingBox())!;
    const opening = (await page.locator("[data-lab-opening]").boundingBox())!;
    expect(combo.y + combo.height, "combo above the opening").toBeLessThanOrEqual(opening.y + 2);
    expect(combo.y, "combo on screen").toBeGreaterThanOrEqual(0);
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

test.describe("@EVAL-030 the intro: the entrance to the paper lab (canvas path)", () => {
  test.beforeEach(({}, info) => {
    test.skip(!heavy(info), "canvas checks run on w1440 + w390");
    test.setTimeout(150_000);
  });

  test("@EVAL-030 intro paper plates sit on their own compositing layer (Safari dropped the sheet's paper while it moved)", async ({ page }) => {
    await openGame(page);
    await page.waitForSelector("[data-lab-play]", { timeout: 40_000 });
    const wc = await page.locator("[class*='plate2']").evaluateAll((els) => els.map((e) => getComputedStyle(e).willChange));
    expect(wc.length).toBeGreaterThanOrEqual(3);
    for (const v of wc) expect(v).toContain("translate");
  });

  test("@EVAL-030 the intro is live text on paper: note, title, sub, instruction sheet and a named CTA", async ({ page }, info) => {
    await openGame(page);
    await expect(page.getByRole("heading", { name: "Gummy Lab", level: 1 })).toBeVisible();
    await expect(page.getByText("You found the secret lab.")).toBeVisible();
    await expect(page.getByText("Keep the Gummy Alive")).toBeVisible();
    const how = page.getByRole("list", { name: "How to play" });
    await expect(how.getByRole("listitem")).toHaveCount(4);
    for (const t of ["Tap left / right", "Keep the gummy", "Hit", "Don't let it drain"]) await expect(how.getByText(t, { exact: true })).toBeAttached();
    const cta = page.getByRole("button", { name: /^let.s play/i });
    await expect(cta).toBeVisible();
    const b = (await cta.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
    // the tags are decorative: aria-hidden, never in the accessibility tree
    const tags = await page.evaluate(() => Array.from(document.querySelectorAll("[data-lab-intro-back] [aria-hidden='true']")).flatMap((e) => Array.from(e.querySelectorAll("span")).map((s) => s.textContent?.trim())).filter(Boolean));
    if (info.project.name === "w1440") expect(tags).toEqual(["Fun", "Physics", "Experiment", "Play"]);
    // the plates carry the art; the text on them is real DOM text (none of it is in an image)
    expect(await page.locator("[data-lab-intro] img").count()).toBe(0);
  });

  test("@EVAL-030 the art layers stack bg, arch, stage, props, then the gummy, then fg; mobile crops to bg, arch, stage", async ({ page }, info) => {
    await openGame(page);
    await page.waitForSelector("[data-lab-diorama='ready']", { timeout: 30_000 });
    const r = await page.evaluate(() => {
      const names = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(`${sel} [data-intro-layer]`)).filter((e) => getComputedStyle(e).display !== "none").map((e) => e.dataset.introLayer);
      const z = (sel: string) => Number(getComputedStyle(document.querySelector(sel)!).zIndex);
      return {
        back: names("[data-lab-intro-back]"),
        front: names("[data-lab-intro-front]"),
        zBack: z("[data-lab-intro-back]"),
        zCanvas: z("[data-lab-canvas]"),
        zFront: z("[data-lab-intro-front]"),
        keys: !!document.querySelector("[data-lab-keys]") && getComputedStyle(document.querySelector("[data-lab-keys]")!).display !== "none",
        loaded: Array.from(document.querySelectorAll<HTMLImageElement>("[data-lab-intro-back] img, [data-lab-intro-front] img")).filter((i) => i.offsetParent !== null).map((i) => i.complete && i.naturalWidth > 0),
      };
    });
    expect(r.zBack).toBeLessThan(r.zCanvas);
    expect(r.zCanvas).toBeLessThan(r.zFront);
    if (info.project.name === "w390") {
      expect(r.back).toEqual(["bg", "arch", "stage"]);
      expect(r.front).toEqual([]);
      expect(r.keys).toBe(false); // §101: the keyboard label is hidden on mobile
    } else {
      expect(r.back).toEqual(["bg", "arch", "stage", "props-left", "props-right"]);
      expect(r.front).toEqual(["fg"]);
      expect(r.keys).toBe(true);
      await expect(page.locator("[data-lab-keys]")).toContainText("← → flip · Space both · P pause · Esc exit");
    }
    await expect.poll(async () => (await page.evaluate(() => Array.from(document.querySelectorAll<HTMLImageElement>("[data-lab-intro-back] img, [data-lab-intro-front] img")).filter((i) => i.offsetParent !== null).every((i) => i.complete && i.naturalWidth > 0))), { timeout: 20_000 }).toBe(true);
  });

  test("@EVAL-030 the CTA works from the keyboard: Enter and Space both start the run", async ({ page }) => {
    await openGame(page);
    const cta = page.getByRole("button", { name: /^let.s play/i });
    await expect(cta).toBeFocused({ timeout: 10_000 });
    await page.keyboard.press("Enter");
    await page.waitForSelector("[data-lab-state='PLAYING'], [data-lab-state='COUNTDOWN']", { timeout: 40_000 });
    // the intro leaves and the diorama is revealed
    await page.waitForSelector("[data-lab-intro-front]", { state: "detached", timeout: 20_000 });
    expect(await page.locator("[data-lab]").first().getAttribute("data-intro")).toBeNull();
  });

  test("@EVAL-030 Space activates the CTA too", async ({ page }) => {
    await openGame(page);
    const cta = page.getByRole("button", { name: /^let.s play/i });
    await expect(cta).toBeFocused({ timeout: 10_000 });
    await page.keyboard.press("Space");
    await page.waitForSelector("[data-lab-state='PLAYING'], [data-lab-state='COUNTDOWN']", { timeout: 40_000 });
  });

  test("@EVAL-030 intro parallax rides paperMotion and the transition is transform/opacity only", async ({ page }, info) => {
    await openGame(page);
    if (info.project.name === "w1440") {
      await page.mouse.move(60, 80);
      await page.mouse.move(200, 120);
      await expect.poll(() => page.evaluate(() => document.querySelector<HTMLElement>("[data-lab-intro-back]")!.style.getPropertyValue("--pp-x")), { timeout: 15_000 }).not.toBe("");
    }
    const bad = await page.evaluate(() => {
      const names = /intro-(out-depth|out-left|out-right|out-up|pull|fade)|frame-in/;
      const out: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const r of Array.from(rules)) {
          if (r instanceof CSSKeyframesRule && names.test(r.name)) {
            const props = new Set<string>();
            for (const k of Array.from(r.cssRules)) for (const p of Array.from((k as CSSKeyframeRule).style)) props.add(p);
            for (const p of props) if (!["transform", "opacity"].includes(p)) out.push(`${r.name}:${p}`);
          }
        }
      }
      return out;
    });
    expect(bad).toEqual([]);
  });

  test("@EVAL-030 reduced motion swaps the paper-opening for a plain fade, and the game still starts", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openGame(page);
    const rule = await page.evaluate(() => {
      let found = "";
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const r of Array.from(rules)) if (r instanceof CSSMediaRule && /prefers-reduced-motion: reduce/.test(r.conditionText) && /intro-fade/.test(r.cssText) && /pull/.test(r.cssText)) found = r.cssText;
      }
      return found;
    });
    expect(rule).toMatch(/(250ms|0?\.25s)[^;}]*intro-fade/); // the CSS minifier reorders the shorthand and rewrites 250ms as .25s
    expect(rule).not.toMatch(/intro-pull|intro-out-depth/);
    await page.locator("[data-lab-play]").click();
    await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 40_000 });
    await page.waitForSelector("[data-lab-intro-front]", { state: "detached", timeout: 20_000 });
  });
});
