/**
 * eval-029.spec.ts (`@EVAL-029`, TASK-146) — `/card`, the paper-cut digital business card (S27):
 * 200 + sitemap + OG, a real flip button (name, Enter/Space, aria state, back links tabbable only when
 * shown), a QR that decodes from rendered pixels to `${siteUrl()}/card`, "Save contact" as a
 * `text/vcard` attachment with the eight vCard lines and no phone/DOB, no Apple Wallet anywhere,
 * reduced motion → crossfade with no 3D and tilt off. Manual half: phone camera scan at the gate.
 */
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { PII_PATTERNS } from "@/scripts/forbidden-strings";

const tag = { tag: "@EVAL-029" };
const FLIP = "[data-flip]";

/** Park the card clear of the sticky header (the QR sits near the card top). */
async function parkCard(page: Page) {
  await page.evaluate(() => {
    const top = document.querySelector("[data-card]")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 130));
  });
  await page.waitForTimeout(900);
}

async function flipToBack(page: Page) {
  await page.locator(FLIP).click();
  await expect(page.locator("[data-card-root]")).toHaveAttribute("data-side", "back");
  // settle: the flip transition is ~1s
  await page.waitForTimeout(1300);
  await parkCard(page);
}

test("/card returns 200, is in the sitemap and has an OG image", tag, async ({ page, request }) => {
  const res = await page.goto("/card");
  expect(res?.status()).toBe(200);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toMatch(/<loc>[^<]*\/card<\/loc>/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toMatch(/^https:\/\//);
  const img = await request.get(new URL(og!).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toBe("image/png");
});

test("flip is a real button: name, Enter, Space, aria state", tag, async ({ page }) => {
  await page.goto("/card");
  const btn = page.locator(FLIP);
  expect(await btn.evaluate((el) => el.tagName)).toBe("BUTTON");
  await expect(btn).toHaveAccessibleName(/show Tushar Pathak contact/i);
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await btn.focus();
  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(btn).toHaveAccessibleName(/show the front/i);
  await page.keyboard.press("Space");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("back links are tabbable only while the back is shown", tag, async ({ page }) => {
  await page.goto("/card");
  const back = page.locator('[data-face="back"]');
  await expect(back).toHaveAttribute("inert", "");
  expect(await back.locator("a").evaluateAll((as) => as.map((a) => (a as HTMLElement).matches(":focus-visible, :focus")))).toBeTruthy();
  // tabbing through the whole page never lands inside the hidden back face
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-face="back"]'))).toBe(false);
  }
  await page.locator(FLIP).click();
  await expect(back).not.toHaveAttribute("inert", "");
  await expect(page.locator('[data-face="front"]')).toHaveAttribute("inert", "");
  await back.locator("a").first().focus();
  expect(await page.evaluate(() => !!document.activeElement?.closest('[data-face="back"]'))).toBe(true);
});

test("the QR decodes from rendered pixels to the card URL", tag, async ({ page }) => {
  await page.goto("/card");
  await flipToBack(page);
  const png = PNG.sync.read(await page.locator("[data-qr]").screenshot());
  const hit = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  const expected = `${new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).origin}/card`;
  expect(hit?.data).toBe(expected);
});

test("the QR stays dark-on-light in dark theme", tag, async ({ page }) => {
  await page.goto("/card");
  // T2 owns the dark token block in globals.css; mirror Design.md §13.1 here until it lands.
  await page.addStyleTag({
    content: ':root[data-theme="dark"]{--color-paper:#0B1530;--color-ivory:#172646;--color-navy:#F4EEDF;}',
  });
  await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
  await flipToBack(page);
  const png = PNG.sync.read(await page.locator("[data-qr]").screenshot());
  const hit = jsQR(new Uint8ClampedArray(png.data), png.width, png.height, { inversionAttempts: "dontInvert" });
  expect(hit).not.toBeNull();
});

test("Save contact is a text/vcard attachment: eight lines, no phone or DOB", tag, async ({ page, request }) => {
  await page.goto("/card");
  const href = await page.locator("[data-save-contact]").getAttribute("href");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/^text\/vcard/);
  expect(res.headers()["content-disposition"]).toMatch(/^attachment/);
  const body = await res.text();
  const lines = body.split(/\r?\n/);
  for (const key of ["BEGIN:VCARD", "VERSION", "FN", "N", "TITLE", "EMAIL", "URL", "END:VCARD"]) {
    expect(lines.some((l) => l === key || l.startsWith(`${key}:`) || l.startsWith(`${key};`)), key).toBe(true);
  }
  expect(body).not.toMatch(/^(TEL|BDAY)/im);
  expect(PII_PATTERNS.DOB.test(body)).toBe(false);
  expect(PII_PATTERNS.PHONE.test(body)).toBe(false);
});

test("no Apple Wallet control, badge, text or route", tag, async ({ page, request }) => {
  await page.goto("/card");
  await flipToBack(page);
  expect(await page.locator("body").innerText()).not.toMatch(/wallet|pkpass/i);
  expect(await page.content()).not.toMatch(/pkpass|apple[- ]wallet/i);
  expect((await request.get("/card/wallet.pkpass")).status()).toBe(404);
});

test("the QR falls back to nothing (no empty frame) when it cannot be generated", tag, async ({ page }) => {
  // The unit test tests/unit/card-back.test.tsx renders CardBack with an unencodable URL; here the
  // shipped page proves the frame only ever exists together with a QR.
  await page.goto("/card");
  const panels = await page.locator("[data-qr-panel]").count();
  expect(panels).toBe(await page.locator("[data-qr-panel] [data-qr] path").count());
});

test("pointer movement tilts the card and moves nearer layers further (fine pointer)", tag, async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "hover/tilt is the desktop path; touch has its own gesture");
  await page.goto("/card");
  const card = page.locator("[data-card]");
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.5, { steps: 6 });
  await page.waitForTimeout(500);
  const shift = (id: string) =>
    page.locator(`[data-layer="${id}"]`).first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  const far = await shift("far");
  const near = await shift("ripples");
  expect(Math.abs(near)).toBeGreaterThan(Math.abs(far));
  expect(Math.abs(far)).toBeLessThan(10); // stays inside the bleed (§62)
  expect(Math.abs(near)).toBeLessThan(20);
});

test("reduced motion: crossfade, no 3D transform, tilt off", tag, async ({ page, withReducedMotion }) => {
  await withReducedMotion(page);
  await page.goto("/card");
  const probe = () =>
    page.evaluate(() => {
      const t = (s: string) => getComputedStyle(document.querySelector(s)!).transform;
      const root = document.querySelector("[data-card-root]")!;
      return {
        card: t("[data-card]"),
        perspective: getComputedStyle(root).perspective,
        nx: (root as HTMLElement).style.getPropertyValue("--nx"),
        back: getComputedStyle(document.querySelector('[data-face="back"]')!).opacity,
        front: getComputedStyle(document.querySelector('[data-face="front"]')!).opacity,
      };
    });
  let s = await probe();
  expect(s.card).toBe("none");
  expect(s.perspective).toBe("none");
  expect([s.front, s.back]).toEqual(["1", "0"]);
  const box = (await page.locator("[data-card]").boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10, { steps: 4 });
  await page.waitForTimeout(300);
  s = await probe();
  expect(s.nx).toBe(""); // tilt listeners never wrote a value
  await page.locator(FLIP).click();
  await page.waitForTimeout(500);
  s = await probe();
  expect(s.card).toBe("none");
  expect([s.front, s.back]).toEqual(["0", "1"]);
});
