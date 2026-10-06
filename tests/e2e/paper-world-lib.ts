/**
 * Shared instrumentation for the Paper World specs (EVAL-032 / EVAL-033, M-011 P0). `instrument` runs before any
 * page script: it records live window/document listeners for the motion event types, rAF registrations,
 * `preventDefault` calls and `--pp-*` writes, each with its stack. `motionChunks` finds the built JS chunk(s) that
 * contain the motion source, so a listener or frame can be attributed to `paperMotion` (Lenis and the cursor own
 * their own rAF/pointer listeners on the same page).
 */
import type { Page } from "@playwright/test";
import { test } from "./fixtures";

export const DEV_BOARD = "/dev/primitives";
export const SCENE = '[data-paper-scene="hero-home"]';

export interface PwRecord {
  live: Array<{ type: string; on: string; fn: unknown; stack: string }>;
  raf: Array<{ t: number; stack: string }>;
  prevent: Array<{ type: string; stack: string }>;
  writes: number[];
  permission: number;
}

export function instrument(): void {
  const w = window as unknown as { __pw: PwRecord };
  const rec: PwRecord = (w.__pw = { live: [], raf: [], prevent: [], writes: [], permission: 0 });
  const TYPES = ["pointermove", "deviceorientation", "visibilitychange"];
  const where = (t: unknown) => (t === window ? "window" : t === document ? "document" : "other");
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, fn: unknown, ...rest: unknown[]) {
    if (TYPES.includes(type)) rec.live.push({ type, on: where(this), fn, stack: String(new Error().stack) });
    return (add as (...a: unknown[]) => void).call(this, type, fn, ...rest);
  } as typeof add;
  EventTarget.prototype.removeEventListener = function (this: EventTarget, type: string, fn: unknown, ...rest: unknown[]) {
    const i = rec.live.findIndex((l) => l.type === type && l.fn === fn && l.on === where(this));
    if (i !== -1) rec.live.splice(i, 1);
    return (remove as (...a: unknown[]) => void).call(this, type, fn, ...rest);
  } as typeof remove;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    rec.raf.push({ t: performance.now(), stack: String(new Error().stack) });
    return raf(cb);
  };
  const prevent = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function (this: Event) {
    rec.prevent.push({ type: this.type, stack: String(new Error().stack) });
    return prevent.call(this);
  };
  const setProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function (this: CSSStyleDeclaration, name: string, ...rest: never[]) {
    if (name.startsWith("--pp-")) rec.writes.push(performance.now());
    return (setProperty as (...a: unknown[]) => void).call(this, name, ...rest);
  } as typeof setProperty;
}

/** Navigate to the board; skip (never fail) when the dev route 404s on a build without `ALLOW_DEV_ROUTES=1`. */
export async function gotoBoard(page: Page): Promise<void> {
  const res = await page.goto(DEV_BOARD, { waitUntil: "load" });
  test.skip(res?.status() === 404, `${DEV_BOARD} 404s without ALLOW_DEV_ROUTES=1 — build with it to exercise Paper World`);
}

/** Built JS chunk URLs (no query) that contain the motion source. */
export async function motionChunks(page: Page): Promise<string[]> {
  const urls = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((e) => e.name)
      .filter((n) => /\.js(\?|$)/.test(n)),
  );
  const hits: string[] = [];
  for (const url of urls) {
    const body = await (await page.request.get(url)).text();
    if (body.includes("--pp-x")) hits.push(url.split("?")[0]!);
  }
  return hits;
}

export const fromChunks = (stack: string, chunks: string[]) => chunks.some((c) => stack.includes(c));

export async function liveMotionListeners(page: Page, type: string, on: string): Promise<number> {
  const chunks = await motionChunks(page);
  const live = await page.evaluate(() => (window as unknown as { __pw: PwRecord }).__pw.live.map((l) => ({ type: l.type, on: l.on, stack: l.stack })));
  return live.filter((l) => l.type === type && l.on === on && fromChunks(l.stack, chunks)).length;
}

export async function scrollSceneIntoView(page: Page): Promise<void> {
  await page.locator(SCENE).scrollIntoViewIfNeeded();
  // Let the IntersectionObserver deliver and the lazy layers settle.
  await page.waitForFunction((sel) => {
    const r = document.querySelector(sel)?.getBoundingClientRect();
    return !!r && r.top < window.innerHeight && r.bottom > 0;
  }, SCENE);
  await page.waitForTimeout(250);
}

export interface LayerTranslate {
  layer: string;
  depth: number;
  x: number;
  y: number;
}

/** Computed individual `translate` of every layer wrapper, in px. */
export async function layerTranslates(page: Page): Promise<LayerTranslate[]> {
  return page.evaluate((sel) => {
    return [...document.querySelectorAll(`${sel} [data-layer]`)].map((el) => {
      const t = getComputedStyle(el).translate;
      const [x = "0", y = "0"] = t === "none" ? [] : t.split(" ");
      return { layer: (el as HTMLElement).dataset.layer!, depth: Number((el as HTMLElement).dataset.depth), x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
    });
  }, SCENE);
}

/** Wait until the layers stop moving (two equal reads 120 ms apart). */
export async function settled(page: Page): Promise<LayerTranslate[]> {
  let prev = JSON.stringify(await layerTranslates(page));
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(120);
    const cur = JSON.stringify(await layerTranslates(page));
    if (cur === prev) return JSON.parse(cur) as LayerTranslate[];
    prev = cur;
  }
  throw new Error("layers never settled");
}
