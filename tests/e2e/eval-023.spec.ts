/**
 * eval-023.spec.ts (`@EVAL-023`; evaluation-plan.md §9.3; Design.md §13.2, decision S25; TASK-141) — theme
 * resolution, persistence and no flash, at w390 and w1440 (the case's viewports).
 *
 *   six scenarios — no choice + system light / dark · saved light / dark against the opposite system · a hard
 *                   reload after toggling · a runtime system flip with and without a saved choice.
 *   history       — an `addInitScript` MutationObserver on <html data-theme> proves the attribute takes exactly
 *                   ONE value for the life of a document (set by the pre-paint script; React never rewrites it).
 *   head order    — the served HTML carries the inline theme script before the first stylesheet / style tag.
 *   storage       — a plain visit writes nothing (only an explicit toggle persists); key `portfolio-theme`.
 *   hydration     — 0 hydration warnings on the console in every scenario.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const KEY = "portfolio-theme";
const MEASURED = [390, 1440];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const skipUnmeasured = (page: Page) => test.skip(!MEASURED.includes(width(page)), "EVAL-023 measures w390 and w1440 only");

/** Seed storage (when asked) before any page script and record every value `data-theme` ever takes + every storage write. */
async function instrument(page: Page, seed?: "light" | "dark") {
  await page.addInitScript(
    ({ seed: s, key }) => {
      const w = window as unknown as { __themeHistory: (string | null)[]; __storageWrites: string[] };
      w.__themeHistory = [];
      w.__storageWrites = [];
      if (s && !sessionStorage.getItem("__seeded")) {
        localStorage.setItem(key, s);
        sessionStorage.setItem("__seeded", "1");
      }
      const proto = Storage.prototype;
      const orig = proto.setItem;
      proto.setItem = function (k: string, v: string) {
        if (k === key) w.__storageWrites.push(v);
        return orig.call(this, k, v);
      };
      new MutationObserver(() => w.__themeHistory.push(document.documentElement.getAttribute("data-theme"))).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    },
    { seed, key: KEY },
  );
}

const history = (page: Page) => page.evaluate(() => (window as unknown as { __themeHistory: string[] }).__themeHistory);
const writes = (page: Page) => page.evaluate(() => (window as unknown as { __storageWrites: string[] }).__storageWrites);
const theme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-theme"));

function collectHydration(page: Page): string[] {
  const hits: string[] = [];
  page.on("console", (m) => {
    if (/hydrat/i.test(m.text())) hits.push(m.text());
  });
  page.on("pageerror", (e) => {
    if (/hydrat/i.test(e.message)) hits.push(e.message);
  });
  return hits;
}

const SCENARIOS: { name: string; seed?: "light" | "dark"; system: "light" | "dark"; expected: "light" | "dark" }[] = [
  { name: "no choice, system light", system: "light", expected: "light" },
  { name: "no choice, system dark", system: "dark", expected: "dark" },
  { name: "saved light beats system dark", seed: "light", system: "dark", expected: "light" },
  { name: "saved dark beats system light", seed: "dark", system: "light", expected: "dark" },
];

for (const sc of SCENARIOS) {
  test(`@EVAL-023 ${sc.name} → ${sc.expected}, one value for the document's life, 0 writes, 0 hydration warnings`, async ({ page }) => {
    skipUnmeasured(page);
    const hydration = collectHydration(page);
    await page.emulateMedia({ colorScheme: sc.system });
    await instrument(page, sc.seed);
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(800); // let hydration and the idle work have their chance to misbehave
    expect(await theme(page)).toBe(sc.expected);
    const h = await history(page);
    test.info().annotations.push({ type: "eval-023", description: `${sc.name} @${width(page)}: history=${JSON.stringify(h)}` });
    expect(h, "data-theme history").toEqual([sc.expected]);
    expect(await writes(page), "a plain visit writes nothing").toEqual([]);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe(sc.seed ?? null);
    expect(hydration, "hydration warnings").toEqual([]);
  });
}

test("@EVAL-023 hard reload after toggling keeps the explicit choice (and only then is it persisted)", async ({ page }) => {
  skipUnmeasured(page);
  const hydration = collectHydration(page);
  await page.emulateMedia({ colorScheme: "light" });
  await instrument(page);
  await page.goto("/", { waitUntil: "load" });
  expect(await theme(page)).toBe("light");
  await page.getByRole("switch", { name: "Use dark theme" }).click();
  await expect.poll(() => theme(page)).toBe("dark");
  expect(await writes(page)).toEqual(["dark"]);
  expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("dark");
  await page.reload({ waitUntil: "load" });
  expect(await theme(page)).toBe("dark");
  expect(await history(page), "after the reload the attribute is set once").toEqual(["dark"]);
  expect(hydration).toEqual([]);
});

test("@EVAL-023 a runtime system flip is followed with no saved choice and ignored with one", async ({ page }) => {
  skipUnmeasured(page);
  await page.emulateMedia({ colorScheme: "light" });
  await instrument(page);
  await page.goto("/", { waitUntil: "load" });
  expect(await theme(page)).toBe("light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => theme(page)).toBe("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => theme(page)).toBe("light");

  // With an explicit choice the OS no longer matters.
  await page.getByRole("switch").click(); // → dark, saved
  await expect.poll(() => theme(page)).toBe("dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForTimeout(400);
  expect(await theme(page), "an explicit choice ignores the system").toBe("dark");
});

test("@EVAL-023 the served HTML sets the theme in an inline script before the first stylesheet", async ({ page, request }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "the served HTML is viewport-independent; checked once");
  const html = await (await request.get("/")).text();
  const head = html.slice(html.indexOf("<head"), html.indexOf("</head>"));
  const script = head.indexOf("portfolio-theme");
  const firstSheet = head.search(/<link[^>]+rel="stylesheet"|<style/);
  expect(script, "inline theme script in <head>").toBeGreaterThan(-1);
  expect(firstSheet, "the page has a stylesheet or style tag in <head>").toBeGreaterThan(-1);
  expect(script, "theme script precedes every stylesheet").toBeLessThan(firstSheet);
  expect(head.slice(0, script)).not.toMatch(/<link[^>]+stylesheet/);
  expect(html).toMatch(/<html[^>]*lang="en"/);
});
