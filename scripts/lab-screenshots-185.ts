/**
 * lab-screenshots-185.ts (TASK-185) — the review set for the paper-cut pinball machine: the start state, the plunger charged to
 * 78 %, a fast moment with its light trail, a bumper hit, and the black hole hovered, at 1440 and 390, light and dark, into
 * docs/screenshots/m-013/task-185/. Needs a running production build (`pnpm build && pnpm start`) and a Chromium with WebGL.
 *   PLAYWRIGHT_BROWSERS_PATH=… pnpm tsx scripts/lab-screenshots-185.ts [baseUrl]
 *
 * A software-GL host renders the lab at about 1.5 fps, and the game advances ~0.1 s per rendered frame, so a held key or a fast
 * moment would run past the interesting frame. Three states are therefore staged through the lab's `?debug` handle (the same
 * handle the e2e specs use), always through the game's own code paths:
 *   • charge  the plunger's elapsed time is set to 78 % of MAX_CHARGE_MS and its `step` is held, so the key is genuinely down and
 *             the meter, spring and gummy are drawn at that charge;
 *   • play    the trail buffer is fed the path a 60 fps run would record (the very `push`/`update` calls Trail.tsx makes each
 *             frame), then the game is paused on a frame with the gummy mid-table;
 *   • bumper  the gummy is fired at a bumper and the shot is taken on the real hit flash (rt.trailFlash).
 */
import { chromium, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = resolve(process.cwd(), "docs/screenshots/m-013/task-185");

interface Body {
  setTranslation(p: { x: number; y: number; z: number }, w: boolean): void;
  setLinvel(v: { x: number; y: number; z: number }, w: boolean): void;
}
interface Handle {
  rt: {
    bearBody: { current: Body | null };
    bear: { x: number; y: number };
    arena: { bumpers: { id: string; x: number; y: number }[] };
    plunger: { charging: boolean; elapsedMs: number; step: (ms: number) => void };
    trail: { clear(): void; push(x: number, y: number, s: number, dt: number): void; update(dt: number): void };
    trailFlash: number;
    launched: boolean;
    introBlend: number;
    blackHoleHover: boolean;
  };
}
type Win = { __gummyLab: Handle; __teleportY?: number };

const key = (page: Page, type: "keydown" | "keyup", k: string) => page.evaluate(([t, kk]) => window.dispatchEvent(new KeyboardEvent(t as string, { key: kk as string, cancelable: true })), [type, k] as const);

async function capture(width: 390 | 1440, theme: "light" | "dark") {
  const height = width === 390 ? 844 : 900;
  const mobile = width === 390;
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
  const page = await ctx.newPage();
  const shot = async (name: string) => {
    await page.screenshot({ path: resolve(OUT, `${name}-${theme}-${width}.png`) });
    console.log(`captured ${name} ${theme} ${width}`);
  };
  await page.goto(`${BASE}/lab?debug`);
  await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 120_000 });
  await page.evaluate(() => (document.querySelector("[data-lab-play]") as HTMLElement).click());
  await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 120_000 });
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.introBlend > 0.985, null, { timeout: 120_000 });
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: "[aria-label='Paused']{display:none!important}" });
  await shot("start");

  // charging at ~78 %
  await key(page, "keydown", " ");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.plunger.charging, null, { timeout: 60_000 });
  await page.evaluate(() => {
    const p = (window as unknown as Win).__gummyLab.rt.plunger;
    p.elapsedMs = 0.78 * 1500;
    p.step = () => {};
  });
  await page.waitForTimeout(2500);
  await shot("charge");
  await page.evaluate(() => delete (window as unknown as { __gummyLab: { rt: { plunger: { step?: unknown } } } }).__gummyLab.rt.plunger.step);
  await key(page, "keyup", " ");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.launched, null, { timeout: 120_000 });

  // a bumper hit, on the real flash
  await page.evaluate(() => {
    const rt = (window as unknown as Win).__gummyLab.rt;
    const b = rt.arena.bumpers.find((x) => x.id === "B2")!;
    rt.bearBody.current!.setTranslation({ x: b.x - 1.6, y: b.y - 0.5, z: 0 }, true);
    rt.bearBody.current!.setLinvel({ x: 12, y: 3, z: 0 }, true);
  });
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.trailFlash > 0.75, null, { timeout: 60_000, polling: 8 });
  await shot("bumper");

  // a fast moment with its trail
  await page.evaluate(() => {
    const rt = (window as unknown as Win).__gummyLab.rt;
    rt.trail.clear();
    let x = -3.4;
    let y = -2.0;
    const vx = 7.5;
    let vy = 14.5;
    const dt = 1 / 60;
    for (let i = 0; i < 26; i += 1) {
      vy -= 16 * dt;
      x += vx * dt;
      y += vy * dt;
      rt.trail.push(x, y + 0.5, Math.hypot(vx, vy), dt);
      rt.trail.update(dt * 0.85);
    }
    rt.bearBody.current!.setTranslation({ x, y, z: 0 }, true);
    rt.bearBody.current!.setLinvel({ x: vx, y: vy, z: 0 }, true);
    (window as unknown as Win).__teleportY = y;
  });
  await page.waitForFunction(
    () => {
      const w = window as unknown as Win;
      if (w.__gummyLab.rt.bear.x < 3 && Math.abs(w.__gummyLab.rt.bear.y - (w.__teleportY ?? 0)) < 2.5) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }));
        return true;
      }
      return false;
    },
    null,
    { timeout: 120_000, polling: 4 },
  );
  await page.waitForTimeout(2500);
  await shot("play");

  // the black hole, hovered (the game is still paused: the hover is the only thing moving)
  await page.hover("[data-lab-portal]");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.blackHoleHover, null, { timeout: 30_000 });
  await page.waitForTimeout(2500);
  await shot("hole");
  await browser.close();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const theme of ["light", "dark"] as const) for (const width of [1440, 390] as const) await capture(width, theme);
}

void main();
