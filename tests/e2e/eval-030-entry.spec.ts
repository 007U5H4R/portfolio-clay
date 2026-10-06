/**
 * eval-030-entry.spec.ts (`@EVAL-030`, TASK-143) — the Gummy Lab's hidden route and secret trigger,
 * split out of eval-030.spec.ts so they run on the default launch. Neither block touches WebGL; under
 * that file's SwiftShader flags every page composites in software GL, and leaving a page blocked on
 * compositor teardown (`LayerTreeHost::~LayerTreeHost`) for 10–80 s on a loaded host, which timed
 * them out (EXE-49). The canvas path stays in eval-030.spec.ts.
 */
import { test, expect } from "./fixtures";
import { BRAND, MONOGRAM, enterLab, rapidClicks } from "./lab-helpers";

test.describe("@EVAL-030 hidden, not broken", () => {
  test("@EVAL-030 /lab is 200 with noindex and is not disallowed in robots.txt", async ({ request }) => {
    const res = await request.get("/lab");
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/<meta name="robots" content="noindex[^"]*"/);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).not.toMatch(/Disallow:\s*\/lab/i);
    expect(robots).toMatch(/Allow:\s*\//);
  });

  test("@EVAL-030 /lab is in no sitemap entry", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("<loc>");
    expect(xml).not.toMatch(/\/lab(<|\/|\?)/);
  });

  test("@EVAL-030 no route links to /lab (0 a[href=\"/lab\"]) — static HTML of every sitemap URL", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]!).pathname);
    expect(paths.length).toBeGreaterThan(8);
    for (const path of ["/", ...paths, "/lab"]) {
      const html = await (await request.get(path)).text();
      expect(html, `${path} links to /lab`).not.toMatch(/href="\/lab(["?#/])/);
    }
  });

  test("@EVAL-030 no rendered nav/footer link to /lab (live DOM)", async ({ page }) => {
    for (const path of ["/", "/projects", "/about", "/contact"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
      expect(await page.locator('a[href="/lab"]').count(), path).toBe(0);
    }
  });

  test("@EVAL-030 only /lab may compile wasm (CSP) and it never allows unsafe-eval", async ({ request }) => {
    const lab = (await request.head("/lab")).headers()["content-security-policy"] ?? "";
    const home = (await request.head("/")).headers()["content-security-policy"] ?? "";
    expect(lab).toContain("'wasm-unsafe-eval'");
    expect(home).not.toContain("wasm-unsafe-eval");
    expect(lab).not.toContain("'unsafe-eval'");
    expect(home).not.toContain("'unsafe-eval'");
  });
});

test.describe("@EVAL-030 secret trigger", () => {
  test("@EVAL-030 5 rapid clicks on the name open /lab", async ({ page, consoleErrors }) => {
    await enterLab(page);
    expect(new URL(page.url()).pathname).toBe("/lab");
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 5 rapid clicks on the TP monogram open /lab", async ({ page }) => {
    await enterLab(page, MONOGRAM);
    expect(new URL(page.url()).pathname).toBe("/lab");
  });

  test("@EVAL-030 5 rapid clicks from an inner page still open /lab (the sequence survives the first navigation)", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 5, 150);
    await page.waitForURL("**/lab", { timeout: 15_000 });
  });

  test("@EVAL-030 4 clicks do nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 4);
    await page.waitForTimeout(1800);
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await page.locator("[data-gummy-overlay]").count()).toBe(0);
  });

  test("@EVAL-030 a slow sequence (5 clicks over > 3.5 s) does nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 5, 1000);
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("@EVAL-030 a pause resets the counter (4 clicks, wait out the window, 1 click)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 4);
    await page.waitForTimeout(3800);
    await rapidClicks(page, BRAND, 1);
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("@EVAL-030 the per-click hints are opacity/transform/filter/spacing only", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const css = await page.evaluate(async () => {
      const rules: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const walk = (list: CSSRuleList) => {
            for (const r of Array.from(list)) {
              if (r instanceof CSSKeyframesRule && /^gl-/.test(r.name)) rules.push(r.cssText);
              else if ("cssRules" in r) walk((r as CSSGroupingRule).cssRules);
            }
          };
          walk(sheet.cssRules);
        } catch {
          /* cross-origin sheet */
        }
      }
      return rules.join("\n");
    });
    expect(css).toContain("gl-wobble");
    // No layout-driving properties inside the hint keyframes.
    expect(css).not.toMatch(/\b(width|height|top|left|margin|padding)\s*:/);
  });
});
