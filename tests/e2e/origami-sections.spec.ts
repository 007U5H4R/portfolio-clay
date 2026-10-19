/**
 * origami-sections.spec.ts (TASK-265, option A) — on phones the origami layer shows behind EVERY section of each dock tab, not
 * only the first one. Method: at ~70 % scroll depth on each dock route (light + dark), shoot the viewport's content band
 * with the layer on and with it hidden (`display: none`); if the section fills below the first section are opaque the two
 * shots are identical, so the mean per-channel difference is ~0. Also: case studies keep their plain paper (no layer, opaque
 * fills), the /projects product detail view keeps its plain paper, and nothing overflows at 360 / 390 / 430.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const ROUTES = ["/", "/work", "/projects", "/about", "/certifications"];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

/** Mean absolute per-channel difference (0..255) between two PNG buffers of the same size. */
async function meanDiff(page: Page, a: Buffer, b: Buffer) {
  return page.evaluate(
    async ([x, y]: [string, string]) => {
      const load = (s: string) =>
        new Promise<HTMLImageElement>((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = "data:image/png;base64," + s;
        });
      const [ia, ib] = await Promise.all([load(x), load(y)]);
      const px = (i: HTMLImageElement) => {
        const c = document.createElement("canvas");
        c.width = i.width;
        c.height = i.height;
        const g = c.getContext("2d")!;
        g.drawImage(i, 0, 0);
        return g.getImageData(0, 0, c.width, c.height).data;
      };
      const da = px(ia);
      const db = px(ib);
      let sum = 0;
      for (let k = 0; k < da.length; k += 4) sum += Math.abs(da[k]! - db[k]!) + Math.abs(da[k + 1]! - db[k + 1]!) + Math.abs(da[k + 2]! - db[k + 2]!);
      return sum / (da.length / 4) / 3;
    },
    [a.toString("base64"), b.toString("base64")] as [string, string],
  );
}

async function layerVisibleAtDepth(page: Page, path: string, theme: "light" | "dark") {
  await page.goto(path, { waitUntil: "load" });
  await setTheme(page, theme);
  await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
  await page.evaluate(() => scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.7)));
  await page.waitForTimeout(500);
  const clip = { x: 0, y: 84, width: 390, height: 668 }; // below the header, above the dock
  const shoot = () => page.screenshot({ clip, animations: "disabled" });
  const on = await shoot();
  const style = await page.addStyleTag({ content: ".ob-root{display:none!important}" });
  const off = await shoot();
  await style.evaluate((n) => (n as Element).remove());
  return meanDiff(page, on, off);
}

test.describe("origami behind every phone section (TASK-265)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const path of ROUTES) {
      test(`${path} at 70% depth: the layer shows through (${theme})`, async ({ page }) => {
        test.skip(width(page) !== 390, "phone only; runs once");
        const d = await layerVisibleAtDepth(page, path, theme);
        // opaque fills => 0.00; with the layer showing behind translucent sections it is several levels per channel
        expect(d, `${path} ${theme} mean diff ${d.toFixed(2)}`).toBeGreaterThan(1.5);
      });
    }
  }

  test("no section below the first paints an opaque full-width fill over the layer, on any dock route", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    for (const path of ROUTES) {
      await page.goto(path, { waitUntil: "load" });
      await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
      const opaque = await page.evaluate(() => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 1;
        const cx = cv.getContext("2d", { willReadFrequently: true })!;
        const alpha = (c: string) => {
          cx.clearRect(0, 0, 1, 1);
          cx.fillStyle = "#000";
          cx.fillStyle = c;
          cx.fillRect(0, 0, 1, 1);
          return cx.getImageData(0, 0, 1, 1).data[3]! / 255;
        };
        const bad: string[] = [];
        for (const el of Array.from(document.body.querySelectorAll("*"))) {
          if (el.closest(".ob-root, footer, header, nav")) continue;
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          // full-width bands only (cards are inset), taller than a strip, below the hero scene (first ~320 px)
          if (cs.position === "fixed" || r.width < 380 || r.height < 120 || r.top + scrollY < 320) continue;
          if (alpha(cs.backgroundColor) >= 0.9) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`);
        }
        return bad;
      });
      expect(opaque, path).toEqual([]);
    }
  });

  test("case studies keep their plain paper: no layer", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await expect(page.getByTestId("projects-bg")).toHaveCount(0);
  });

  test("the /projects product detail view keeps its plain paper (fills restored, layer hidden)", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".pf-showcase")!).some((k) => k.startsWith("__react")));
    const fill = () => page.evaluate(() => getComputedStyle(document.querySelector(".pf-enterprise")!).backgroundColor);
    const listFill = await fill();
    expect(listFill === "rgba(0, 0, 0, 0)" || listFill === "transparent").toBe(true);
    await page.locator(".pf-m-card").first().click();
    await expect(page.locator(".pf-showcase")).toHaveAttribute("data-view", "detail");
    const detailFill = await fill();
    expect(detailFill !== "rgba(0, 0, 0, 0)" && detailFill !== "transparent").toBe(true);
  });

  for (const w of [360, 390, 430]) {
    test(`no horizontal overflow at ${w}px on every dock route`, async ({ page }) => {
      test.skip(width(page) !== 390, "phone project; resizes itself");
      await page.setViewportSize({ width: w, height: 844 });
      for (const path of ROUTES) {
        await page.goto(path, { waitUntil: "load" });
        await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} @${w}`).toBe(true);
      }
    });
  }

  test("at 640 and up the section fills are the original paper (desktop unchanged)", async ({ page }) => {
    test.skip(width(page) < 640, "desktop / tablet only");
    await page.goto("/about", { waitUntil: "load" });
    for (const sel of [".hs-body", ".bdx-body", ".chx-body", ".acx"]) {
      const bg = await page.evaluate((s) => getComputedStyle(document.querySelector(s)!).backgroundColor, sel);
      expect(bg, sel).not.toBe("rgba(0, 0, 0, 0)");
    }
  });
});
