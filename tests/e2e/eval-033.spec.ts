/**
 * eval-033.spec.ts (`@EVAL-033`, evaluation-plan §10, M-011 P0 / TASK-156.4) — gyro permission and fallback on the
 * `/dev/primitives` fixture scene, touch profiles at 390 and 768 with `DeviceOrientationEvent` stubbed three ways:
 * iOS-style (`requestPermission` → granted / denied), Android-style (no `requestPermission`), unavailable. Counts are
 * attributed to `paperMotion` by its built chunk (tests/e2e/paper-world-lib.ts). Needs `ALLOW_DEV_ROUTES=1` at build.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { gotoBoard, instrument, layerTranslates, liveMotionListeners, scrollSceneIntoView, settled, SCENE, type PwRecord } from "./paper-world-lib";
import { ORIENTATION_PX } from "@/content/media/illustrations/layers";

test.skip(({ viewport }) => ![390, 768].includes(viewport!.width), "EVAL-033 runs at 390 and 768 (eval-cases.json viewport)");
test.use({ hasTouch: true, isMobile: true });

type Stub = "ios-granted" | "ios-denied" | "android" | "unavailable";

async function stub(page: Page, mode: Stub) {
  await page.addInitScript(instrument);
  await page.addInitScript((m) => {
    const w = window as unknown as { __pw: PwRecord };
    if (m === "unavailable") {
      Object.defineProperty(window, "DeviceOrientationEvent", { value: undefined, configurable: true, writable: true });
      return;
    }
    const Stub = function () {} as unknown as { requestPermission?: () => Promise<string> };
    if (m.startsWith("ios")) {
      Stub.requestPermission = () => {
        w.__pw.permission++;
        return m === "ios-granted" ? Promise.resolve("granted") : Promise.resolve("denied");
      };
    }
    Object.defineProperty(window, "DeviceOrientationEvent", { value: Stub, configurable: true, writable: true });
  }, mode);
}

const chip = (page: Page) => page.getByRole("button", { name: "Move your phone to explore" });
const permissionCalls = (page: Page) => page.evaluate(() => (window as unknown as { __pw: PwRecord }).__pw.permission);
const tilt = (page: Page, gamma: number, beta: number, n = 80) =>
  page.evaluate(
    ([g, b, count]) => {
      for (let i = 0; i < (count as number); i++) {
        const e = new Event("deviceorientation");
        Object.assign(e, { gamma: g, beta: b, alpha: 0, absolute: false });
        window.dispatchEvent(e);
      }
    },
    [gamma, beta, n] as const,
  );

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

test.describe("@EVAL-033 iOS-style permission", () => {
  test("never asks before a tap; the chip is a named, keyboard-reachable ≥ 44 px button", async ({ page }) => {
    await stub(page, "ios-granted");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(1500);
    expect(await permissionCalls(page), "requestPermission before any gesture").toBe(0);
    expect(await liveMotionListeners(page, "deviceorientation", "window"), "orientation listener before permission").toBe(0);
    await expect(chip(page)).toBeVisible();
    const box = (await chip(page).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
    await chip(page).focus();
    await expect(chip(page)).toBeFocused();
  });

  test("granted: one call per tap, chip gone, tilt drives layers through the spring within the per-layer maxima", async ({ page }) => {
    await stub(page, "ios-granted");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    await chip(page).tap();
    await expect(chip(page)).toHaveCount(0);
    expect(await permissionCalls(page)).toBe(1);
    expect(await liveMotionListeners(page, "deviceorientation", "window")).toBe(1);
    await tilt(page, 40, 45 + 40); // far past ±25°: clamps to full deflection
    const t = await settled(page);
    for (const l of t) {
      const max = ORIENTATION_PX[l.layer as keyof typeof ORIENTATION_PX];
      expect(Math.abs(l.x), `${l.layer} x`).toBeLessThanOrEqual(max + 1);
      expect(Math.abs(l.x), `${l.layer} x reaches its maximum`).toBeGreaterThanOrEqual(max - 1);
      expect(Math.abs(l.y), `${l.layer} y`).toBeLessThanOrEqual(max + 1);
    }
    // The spring renders: right after one small event the layers have barely moved (low-pass + spring, no jump).
    await tilt(page, -40, 45 - 40, 1);
    const early = await layerTranslates(page);
    const details = early.find((l) => l.layer === "details")!;
    expect(details.x).toBeGreaterThan(ORIENTATION_PX.details * 0.5);
    expect(await permissionCalls(page), "no second prompt").toBe(1);
  });

  test("denied: chip hides, no console error, no retry, scroll depth still works", async ({ page }) => {
    const errors = collectErrors(page);
    await stub(page, "ios-denied");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    await chip(page).tap();
    await expect(chip(page)).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(await permissionCalls(page)).toBe(1);
    expect(await liveMotionListeners(page, "deviceorientation", "window")).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => window.scrollBy(0, 300));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    const timeline = await page.locator(`${SCENE} [data-layer] > div`).first().evaluate((e) => getComputedStyle(e).animationName);
    expect(timeline).not.toBe("");
    expect(errors, "console errors after denial").toEqual([]);
  });
});

test.describe("@EVAL-033 Android-style and unavailable", () => {
  test("no chip; the orientation listener exists only while the scene is in view", async ({ page }) => {
    await stub(page, "android");
    await gotoBoard(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await expect(chip(page)).toHaveCount(0);
    expect(await liveMotionListeners(page, "deviceorientation", "window"), "scene out of view").toBe(0);
    await scrollSceneIntoView(page);
    expect(await liveMotionListeners(page, "deviceorientation", "window"), "scene in view").toBe(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    expect(await liveMotionListeners(page, "deviceorientation", "window"), "scene scrolled away").toBe(0);
    expect(await permissionCalls(page)).toBe(0);
  });

  test("unavailable: no chip, no listener, no error, scroll works", async ({ page }) => {
    const errors = collectErrors(page);
    await stub(page, "unavailable");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    await expect(chip(page)).toHaveCount(0);
    expect(await liveMotionListeners(page, "deviceorientation", "window")).toBe(0);
    await page.evaluate(() => window.scrollBy(0, 200));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});

test.describe("@EVAL-033 desktop", () => {
  test.use({ hasTouch: false, isMobile: false });

  test("a fine-pointer desktop never attaches the orientation listener or shows the chip", async ({ page }) => {
    test.skip(page.viewportSize()!.width !== 768, "checked once, at the 768 desktop profile");
    await stub(page, "ios-granted");
    await gotoBoard(page);
    await scrollSceneIntoView(page);
    await page.waitForTimeout(500);
    expect(await liveMotionListeners(page, "deviceorientation", "window")).toBe(0);
    await expect(chip(page)).toHaveCount(0);
    expect(await permissionCalls(page)).toBe(0);
  });
});

// TASK-169 (Tushar 2026-10-07: "3d depth parallax is not working in phones"): the chip lived only on the dev board, so
// on the real site iOS never got its tap-gated permission and tilt never started. These run on the shipped pages.
test.describe("@EVAL-033 on the real site", () => {
  test("home, iOS-style: the chip shows outside the role=img scene, and a tap starts tilt parallax", async ({ page }) => {
    await stub(page, "ios-granted");
    await page.goto("/", { waitUntil: "load" });
    await scrollSceneIntoView(page);
    await expect(chip(page)).toBeVisible();
    expect(await chip(page).evaluate((el) => el.closest('[role="img"]') === null), "chip must not sit inside role=img").toBe(true);
    expect(await permissionCalls(page), "no prompt before the tap").toBe(0);
    await chip(page).tap();
    await expect(chip(page)).toHaveCount(0);
    expect(await permissionCalls(page)).toBe(1);
    await tilt(page, 40, 45 + 40);
    const details = (await settled(page)).find((l) => l.layer === "details")!;
    expect(Math.abs(details.x), "front layer follows the tilt").toBeGreaterThanOrEqual(ORIENTATION_PX.details - 1);
  });

  test("a tab opener, iOS-style: the chip shows there too", async ({ page }) => {
    await stub(page, "ios-granted");
    await page.goto("/projects", { waitUntil: "load" });
    await page.locator("[data-paper-scene]").first().scrollIntoViewIfNeeded();
    await expect(chip(page)).toBeVisible();
  });

  test("home, Android-style: no chip, and tilt moves the layers without a tap", async ({ page }) => {
    await stub(page, "android");
    await page.goto("/", { waitUntil: "load" });
    await scrollSceneIntoView(page);
    await expect(chip(page)).toHaveCount(0);
    await tilt(page, 40, 45 + 40);
    const moved = (await settled(page)).some((l) => Math.abs(l.x) > 1);
    expect(moved, "layers follow the tilt").toBe(true);
  });
});
