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
import { qrSize } from "@/lib/card/qr";

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
  const far = await shift("silhouette");
  const near = await shift("eyes");
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

// ---- TASK-180: Panther Origami remodel ----

const PANTHER_LAYERS = ["silhouette", "neck", "head", "face", "nose", "eyes"];

for (const theme of ["light", "dark"] as const) {
  test(`the panther's depth layers exist and load for the ${theme} theme`, tag, async ({ page, request }) => {
    await page.goto("/card");
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const ids = await page.locator('[data-face="front"] [data-panther-layer]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.pantherLayer));
    expect(ids).toEqual(PANTHER_LAYERS);
    for (const id of PANTHER_LAYERS) {
      const bg = await page.locator(`[data-face="front"] [data-panther-layer="${id}"]`).evaluate((e) => getComputedStyle(e).backgroundImage);
      expect(bg, id).toContain(`/media/card/panther/${id}-${theme}.webp`);
      const res = await request.get(`/media/card/panther/${id}-${theme}.webp`);
      expect(res.status(), id).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/webp");
      expect((await res.body()).length, id).toBeLessThan(250 * 1024);
    }
    // the back carries a small cropped silhouette, not the full stack
    expect(await page.locator('[data-face="back"] [data-panther-layer]').count()).toBe(2);
  });
}

test("no panther layer box exceeds the card box at rest or at maximum tilt (no clipping)", tag, async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1024, "tilt is the fine-pointer path");
  await page.goto("/card");
  const inside = () =>
    page.evaluate(() => {
      const c = document.querySelector("[data-card]")!.getBoundingClientRect();
      const bad: string[] = [];
      document.querySelectorAll('[data-face="front"] [data-panther-layer]').forEach((el) => {
        const r = el.getBoundingClientRect();
        // "silhouette" is blurred by design; its box is still inside the card
        if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5)
          bad.push((el as HTMLElement).dataset.pantherLayer!);
      });
      return bad;
    });
  expect(await inside()).toEqual([]);
  const box = (await page.locator("[data-card]").boundingBox())!;
  for (const [fx, fy] of [[0.99, 0.01], [0.01, 0.99], [0.99, 0.99], [0.01, 0.01]] as const) {
    await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 6 });
    await page.waitForTimeout(450);
    expect(await inside(), `${fx},${fy}`).toEqual([]);
  }
});

test("the QR keeps its module count and quiet zone, and nothing overlaps it", tag, async ({ page }) => {
  await page.goto("/card");
  await flipToBack(page);
  const origin = new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).origin;
  const n = qrSize(`${origin}/card`);
  const geo = await page.locator("[data-qr]").evaluate((svg) => {
    const vb = (svg as SVGSVGElement).viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const rects = [...document.querySelectorAll('[data-face="back"] [class*="bracket"]')].map((b) => b.getBoundingClientRect());
    const overlaps = rects.filter((b) => b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top).length;
    return { vb: vb.width, w: r.width, overlaps };
  });
  expect(geo.vb).toBe(n + 6); // 3-module quiet zone each side
  expect(geo.overlaps).toBe(0);
  expect(geo.w / geo.vb).toBeGreaterThan(3); // modules stay >3 css px
});

test("Save contact is the black pill that downloads /card/vcard", tag, async ({ page }) => {
  await page.goto("/card");
  await flipToBack(page);
  const save = page.locator("[data-save-contact]");
  await expect(save).toHaveAttribute("href", "/card/vcard");
  await expect(save).toContainText("Save contact");
  const [dl] = await Promise.all([page.waitForEvent("download"), save.click()]);
  expect(dl.suggestedFilename()).toMatch(/\.vcf$/);
});

test("reduced motion: panther layers are static, no tilt or parallax", tag, async ({ page, withReducedMotion }) => {
  await withReducedMotion(page);
  await page.goto("/card");
  const box = (await page.locator("[data-card]").boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10, { steps: 5 });
  await page.waitForTimeout(400);
  const t = await page.locator("[data-panther-layer]").evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
  expect(new Set(t)).toEqual(new Set(["none"]));
  expect(await page.locator("[data-card-root]").evaluate((e) => (e as HTMLElement).style.getPropertyValue("--ny"))).toBe("");
});

test("no infinite animation runs on /card (it sleeps at rest)", tag, async ({ page }) => {
  await page.goto("/card");
  await page.waitForTimeout(800);
  const infinite = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => {
        const el = (a.effect as KeyframeEffect | null)?.target as Element | null;
        return el?.closest("[data-card-root]") && a.effect?.getComputedTiming().iterations === Infinity;
      })
      .length,
  );
  expect(infinite).toBe(0);
});

// TASK-180 follow-up (Tushar, 2026-10-09): the faded back-face panther sits in the bottom-LEFT corner,
// clear of the navy/gold fold in the bottom-right.
test("the back-face panther sits in the bottom-left corner", tag, async ({ page }) => {
  await page.goto("/card");
  await flipToBack(page);
  const pos = await page.evaluate(() => {
    const back = document.querySelector('[data-face="back"]')!.getBoundingClientRect();
    const p = document.querySelector('[data-face="back"] [data-panther="back"]')!.getBoundingClientRect();
    const cx = (Math.max(p.left, back.left) + Math.min(p.right, back.right)) / 2; // centre of the visible part
    return { leftHalf: cx < back.left + back.width / 2, lowerHalf: p.top > back.top + back.height / 2 };
  });
  expect(pos).toEqual({ leftHalf: true, lowerHalf: true });
});

// TASK-180 scar (2026-10-09): in WebKit a grain layer painted above the art washed the panther out (mix-blend-mode is
// dropped inside the 3D flip). The front's grain must sit beneath the panther in paint order.
test("the front grain layer sits beneath the panther art", tag, async ({ page }) => {
  await page.goto("/card");
  const order = await page.evaluate(() => {
    const kids = [...document.querySelector('[data-face="front"]')!.children];
    const art = kids.findIndex((k) => k.querySelector('[data-panther="front"]'));
    const tex = kids.findIndex((k) => k.tagName === "I" && getComputedStyle(k).mixBlendMode !== "normal");
    return { art, tex };
  });
  expect(order.tex).toBeGreaterThanOrEqual(0);
  expect(order.tex).toBeLessThan(order.art);
});
