/**
 * lab-screenshots-199.ts (TASK-199) — the review set for the restructured pinball table, into docs/screenshots/m-013/task-199/:
 *   table-{light,dark}-{1440,390}.png         the full table at the start of a run
 *   bumper-{kind}-{light,dark}-{1440,390}.png each bumper type mid-hit (desktop: pop, jet, thumper, turbo; phone: pop, turbo), one browser session each
 *   hole-{light,dark}-{1440,390}.png          the black hole with the gummy about to go in (link hovered, so the hole swells)
 *   hole-entry-light-1440.png                 the gummy spiralling in (the exit sequence a frame in)
 *   spinner-{light,dark}-1440.png             the spinner under the diamond (turning from phase 1)
 * Needs a running production build (`ALLOW_DEV_ROUTES=1 pnpm build && pnpm start`) and a Chromium with WebGL:
 *   PLAYWRIGHT_BROWSERS_PATH=… pnpm tsx scripts/lab-screenshots-199.ts [baseUrl] [only]
 * Staged through the lab's `?debug` handle (as lab-screenshots-185.ts is), always through the game's own code: a software-GL host
 * renders the lab at about 1.5 fps, so a real hit would be over before a frame is drawn. The gummy is placed beside a bumper and
 * fired at it; the shot is taken on the real hit flash (rt.trailFlash).
 */
import { chromium, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const ONLY = process.argv[3];
const OUT = resolve(process.cwd(), "docs/screenshots/m-013/task-199");

interface Body {
  setTranslation(p: { x: number; y: number; z: number }, w: boolean): void;
  setLinvel(v: { x: number; y: number; z: number }, w: boolean): void;
}
interface Handle {
  rt: {
    bearBody: { current: Body | null };
    bear: { x: number; y: number };
    arena: { portal: { x: number; y: number; r: number }; bumpers: { id: string; kind: string; x: number; y: number; spin?: unknown }[] };
    trail: { clear(): void; push(x: number, y: number, s: number, dt: number): void; update(dt: number): void };
    trailFlash: number;
    launched: boolean;
    introBlend: number;
    exit: { via: string; t: number } | null;
    engine: { time: number };
    env: { phase: number };
  };
  store: { getState(): { state: string } };
}
type Win = { __gummyLab: Handle };

const key = (page: Page, type: "keydown" | "keyup", k: string) => page.evaluate(([t, kk]) => window.dispatchEvent(new KeyboardEvent(t as string, { key: kk as string, cancelable: true })), [type, k] as const);

async function launchOnce(page: Page) {
  await key(page, "keydown", " ");
  await page.waitForFunction(() => (window as unknown as { __gummyLab: { rt: { plunger: { charging: boolean } } } }).__gummyLab.rt.plunger.charging, null, { timeout: 60_000 });
  await key(page, "keyup", " ");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.launched, null, { timeout: 120_000 });
}

/** Opens the lab at `width`, starts a run and waits for the machine to settle; `fn` takes the shots; the browser is closed after. */
async function session(width: 390 | 1440, theme: "light" | "dark", fn: (page: Page, shot: (name: string) => Promise<void>) => Promise<void>) {
  const height = width === 390 ? 844 : 900;
  const mobile = width === 390;
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
  const page = await ctx.newPage();
  // A desktop machine: the lab's tier detection must see 8 cores (the sandbox reports 4, which would pick the simplified arena without the spinner).
  if (!mobile) await (await ctx.newCDPSession(page)).send("Emulation.setHardwareConcurrencyOverride", { hardwareConcurrency: 8 });
  const shot = async (name: string) => {
    if (ONLY && !name.includes(ONLY)) return;
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
  try {
    await fn(page, shot);
  } finally {
    await browser.close();
  }
}

/** One bumper type mid-hit: the gummy is put 1.6 u to the left of the bumper and fired at it, with the trail fed the approach. */
async function bumperShot(width: 390 | 1440, theme: "light" | "dark", id: string, kind: string) {
  if (ONLY && !`bumper-${kind}`.includes(ONLY)) return;
  await session(width, theme, async (page, shot) => {
    await launchOnce(page);
    await page.evaluate((bid) => {
      const rt = (window as unknown as Win).__gummyLab.rt;
      const b = rt.arena.bumpers.find((x) => x.id === bid)!;
      rt.trail.clear();
      const vx = 12;
      const dt = 1 / 60;
      for (let i = 0; i < 24; i += 1) {
        rt.trail.push(b.x - 1.9 + vx * dt * i * 0.6, b.y - 0.5 + 0.1 * i * 0.1, vx, dt);
        rt.trail.update(dt * 0.8);
      }
      rt.bearBody.current!.setTranslation({ x: b.x - 1.6, y: b.y - 0.5, z: 0 }, true);
      rt.bearBody.current!.setLinvel({ x: vx, y: 0, z: 0 }, true);
    }, id);
    await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.trailFlash > 0.8, null, { timeout: 90_000, polling: 8 });
    await shot(`bumper-${kind}`);
  });
}

async function capture(width: 390 | 1440, theme: "light" | "dark") {
  const mobile = width === 390;
  await session(width, theme, async (page, shot) => {
    await shot("table");
    // the spinner arrives at 10 s: push the run clock past it and park the gummy out of the way so the table is clear
    if (!mobile) {
      await launchOnce(page);
      await page.evaluate(() => {
        const rt = (window as unknown as Win).__gummyLab.rt;
        (rt.engine as unknown as { time: number }).time = 12;
      });
      await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.env.phase >= 1, null, { timeout: 60_000 });
      // freeze the game, park the gummy high on the right where it is out of the way, let the spinner finish growing in, then clear the hint
      await key(page, "keydown", "p");
      await page.waitForSelector("[data-lab-state='PAUSED']", { timeout: 60_000 });
      await page.evaluate(() => {
        const rt = (window as unknown as Win).__gummyLab.rt;
        rt.trail.clear();
        rt.bearBody.current!.setTranslation({ x: 3.3, y: 1.6, z: 0 }, true);
        rt.bearBody.current!.setLinvel({ x: 0, y: 0, z: 0 }, true);
      });
      await page.addStyleTag({ content: "[data-lab-hint],[class*='banner']{display:none!important}" });
      await page.waitForTimeout(9000);
      await shot("spinner");
      await key(page, "keydown", "p");
      await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 60_000 });
    } else await launchOnce(page);
    // the black hole: the gummy just short of it, the link hovered so the hole swells
    // pause first (so nothing falls into the hole before the shot), then put the gummy a little way from the hole
    await key(page, "keydown", "p");
    await page.waitForSelector("[data-lab-state='PAUSED']", { timeout: 60_000 });
    await page.evaluate(() => {
      const rt = (window as unknown as Win).__gummyLab.rt;
      const p = rt.arena.portal;
      rt.trail.clear();
      rt.bearBody.current!.setTranslation({ x: p.x + 1.3, y: p.y - 0.6, z: 0 }, true);
      rt.bearBody.current!.setLinvel({ x: 0, y: 0, z: 0 }, true);
    });
    await page.waitForTimeout(1500);
    await page.hover("[data-lab-portal]");
    await page.waitForTimeout(2500);
    await shot("hole");
  });
}

/** The gummy going in: fired at the sensor; the shot is taken as soon as the exit sequence has started. */
async function entry(theme: "light" | "dark") {
  if (ONLY && !"hole-entry".includes(ONLY)) return;
  await session(1440, theme, async (page) => {
    await launchOnce(page);
    await page.evaluate(() => {
      const rt = (window as unknown as Win).__gummyLab.rt;
      const p = rt.arena.portal;
      rt.bearBody.current!.setTranslation({ x: p.x + 0.9, y: p.y - 0.5, z: 0 }, true);
      rt.bearBody.current!.setLinvel({ x: -6, y: 0, z: 0 }, true);
    });
    await page.waitForFunction(() => (window as unknown as Win).__gummyLab.store.getState().state === "EXITING", null, { timeout: 60_000, polling: 4 }).catch(() => undefined);
    await page.screenshot({ path: resolve(OUT, `hole-entry-${theme}-1440.png`) });
    console.log(`captured hole-entry ${theme} 1440`);
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const theme of ["light", "dark"] as const) {
    for (const width of [1440, 390] as const) {
      await capture(width, theme);
      const kinds = width === 1440 ? ([["B1", "jet"], ["B2", "thumper"], ["B3", "turbo"], ["B4", "pop"]] as const) : ([["B1", "pop"], ["B2", "turbo"]] as const);
      for (const [id, kind] of kinds) await bumperShot(width, theme, id, kind);
    }
  }
  await entry("light");
}

void main();
