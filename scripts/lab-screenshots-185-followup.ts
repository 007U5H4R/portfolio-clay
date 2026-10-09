/**
 * lab-screenshots-185-followup.ts (TASK-185 follow-up) — the review shots for the black-hole path, the shooter-lane gate, the
 * Nudge button and the phone table: docs/screenshots/m-013/task-185/{portal-path-1440,portal-path-390,lane-gate-closed-1440,
 * nudge-390,mobile-arena-390-light,mobile-arena-390-dark}.png. Needs a running production build (`next start`) built with
 * ALLOW_DEV_ROUTES=1 only if /lab?debug is gated (it is not) and a Chromium with WebGL:
 *   PLAYWRIGHT_BROWSERS_PATH=… pnpm tsx scripts/lab-screenshots-185-followup.ts [baseUrl]
 *
 * Software GL renders the lab at about 1.5 fps, so each state is staged through the lab's `?debug` handle (the same handle the
 * e2e specs use) and the game is paused on the frame, always through the game's own code paths.
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
  store: { getState(): { patch(p: object): void } };
  rt: {
    bearBody: { current: Body | null };
    bear: { x: number; y: number };
    arena: { halfW: number; portal: { y0: number; y1: number; x: number; y: number }; lane: { xIn: number; dividerTop: number } };
    plunger: { elapsedMs: number; step: (ms: number) => void; charging: boolean };
    launched: boolean;
    laneGateShut: boolean;
    introBlend: number;
    blackHoleHover: boolean;
  };
}
type Win = { __gummyLab: Handle };

const key = (page: Page, type: "keydown" | "keyup", k: string) => page.evaluate(([t, kk]) => window.dispatchEvent(new KeyboardEvent(t as string, { key: kk as string, cancelable: true })), [type, k] as const);

async function open(width: 390 | 1440, theme: "light" | "dark") {
  const height = width === 390 ? 844 : 900;
  const mobile = width === 390;
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/lab?debug`);
  await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 120_000 });
  await page.evaluate(() => (document.querySelector("[data-lab-play]") as HTMLElement).click());
  await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 120_000 });
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.introBlend > 0.985, null, { timeout: 120_000 });
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: "[aria-label='Paused']{display:none!important}" });
  const shot = async (name: string) => {
    await page.screenshot({ path: resolve(OUT, `${name}.png`) });
    console.log(`captured ${name}`);
  };
  return { browser, page, shot };
}

/**
 * Put the gummy somewhere (at rest), let the running game draw it there for a couple of frames, then freeze the game on that frame
 * (P). A teleport into a paused world is not drawn until the next physics step, so the pause waits for the gummy to show up.
 */
async function hangAt(page: Page, at: (a: Handle["rt"]["arena"]) => { x: number; y: number }) {
  const target = await page.evaluate((src) => {
    const lab = (window as unknown as Win).__gummyLab;
    const rt = lab.rt;
    // a run that has not launched re-parks the gummy on the plunger each time it goes live: call it launched
    rt.launched = true;
    lab.store.getState().patch({ launched: true });
    const p = (new Function("a", `return (${src})(a)`) as (a: unknown) => { x: number; y: number })(rt.arena);
    rt.bearBody.current!.setTranslation({ x: p.x, y: p.y, z: 0 }, true);
    rt.bearBody.current!.setLinvel({ x: 0, y: 0, z: 0 }, true);
    return { x: p.x, y: p.y, t: (rt as unknown as { time: number }).time };
  }, at.toString());
  await page.waitForFunction(
    (t) => {
      const rt = (window as unknown as Win).__gummyLab.rt;
      if ((rt as unknown as { time: number }).time - t.t > 0.2 && Math.hypot(rt.bear.x - t.x, rt.bear.y - t.y) < 2.2) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }));
        return true;
      }
      return false;
    },
    target,
    { timeout: 60_000, polling: 4 },
  ).catch(async () => {
    // never lose a whole run to one staging miss: freeze where it is and say so
    console.log("hangAt: the gummy was not near its mark; freezing anyway", await page.evaluate(() => JSON.stringify((window as unknown as Win).__gummyLab.rt.bear)));
    await page.keyboard.press("p");
  });
}

async function launchOut(page: Page) {
  await key(page, "keydown", " ");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.plunger.charging, null, { timeout: 60_000 });
  await page.evaluate(() => {
    (window as unknown as Win).__gummyLab.rt.plunger.elapsedMs = 0.2 * 1500;
  });
  await key(page, "keyup", " ");
  await page.waitForFunction(() => (window as unknown as Win).__gummyLab.rt.laneGateShut, null, { timeout: 240_000, polling: 8 });
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  // 1440 light: the open path into the black hole, and the closed lane gate
  {
    const { browser, page, shot } = await open(1440, "light");
    await launchOut(page);
    await hangAt(page, (a) => ({ x: 0, y: a.portal.y0 - 1.6 }));
    await page.waitForTimeout(3500);
    await shot("lane-gate-closed-1440");
    await page.keyboard.press("p");
    await hangAt(page, (a) => ({ x: -a.halfW + 1.5, y: a.portal.y0 + 0.5 }));
    await page.waitForTimeout(3000);
    await shot("portal-path-1440");
    await browser.close();
  }

  // 390 light: the black-hole path, the Nudge button, the phone table
  {
    const { browser, page, shot } = await open(390, "light");
    await page.evaluate(() => (window as unknown as Win).__gummyLab.store.getState().patch({ launched: true })); // the start plaque is not the subject here
    await page.waitForTimeout(1500);
    await shot("nudge-390");
    await hangAt(page, (a) => ({ x: -a.halfW + 1.3, y: a.portal.y0 + 0.5 }));
    await page.waitForTimeout(3000);
    await shot("portal-path-390");
    await page.keyboard.press("p");
    await hangAt(page, () => ({ x: 0.2, y: 1.5 }));
    await page.waitForTimeout(3000);
    await shot("mobile-arena-390-light");
    await browser.close();
  }

  // 390 dark: the phone table
  {
    const { browser, page, shot } = await open(390, "dark");
    await hangAt(page, () => ({ x: 0.2, y: 1.5 }));
    await page.waitForTimeout(3000);
    await shot("mobile-arena-390-dark");
    await browser.close();
  }
}

void main();
