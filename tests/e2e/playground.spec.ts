/**
 * playground.spec.ts (TKT-88 · TSK-45, TC-169; Design.md §7.7, §3.3, §11 Dev-07/Dev-08) — the paper
 * `/playground`: TKT-95's scene opener → opener copy → bench board → band.
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts):
 *   TC-169.1 — 4 experiment cards, titles/taglines from `data/projects.ts`; NEVER Slag City / Mock
 *              Interview / Game (CONTENT_INVENTORY §6 exclusions).
 *   TC-169.2 — each live link: `target=_blank`, `rel` contains `noopener`, sr-only "(opens in new tab)";
 *              the 4 URLs resolve (EVAL-011 — also swept by the global crawler).
 *   TC-169.3 — no tone/status line, no Caveat notebook sheet (Dev-07); quiet close not built (D9).
 *   TC-169.4 — EVAL-018 unit counts: opener 3 · bench 3 (at 390 and 1440).
 *   TC-169.5 — board 12-col > 1024, 6-col ≤ 1024, 1-col ≤ 640; no overflow at any width.
 *   plus ≥44 targets + focus ring, heading outline h1 → h2 → h3, axe at 390/1440, screenshot pack.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { cinematicPortfolio, dinoArcadePwa, pratyasa, tegaki } from "@/data/projects";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

// Fixed order — mirrors components/playground/PlaygroundGrid.tsx's ENTRIES.
const EXPERIMENTS = [pratyasa, tegaki, dinoArcadePwa, cinematicPortfolio] as const;

// Case-sensitive whole-word "Game" (dino-arcade-pwa's tagline legitimately says "no game data");
// "ROM/BIOS" is the excluded Game project's detail, not dino-arcade-pwa's "BYO-ROM" framing.
const FORBIDDEN_PATTERNS: (string | RegExp)[] = ["Slag City", "Mock Interview", /\bGame\b/, "ROM/BIOS"];

test("opener: eyebrow + verbatim h1 under the scene opener", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });
  const main = page.locator("#main");
  await expect(main.locator('[data-opener="scene-playground"]')).toHaveCount(1);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Small experiments. Big questions.");
  await expect(main.locator(".pg-eyebrow").first()).toHaveText("Playground·Four live experiments");
});

test("TC-169.1 bench renders exactly the 4 sanctioned experiments from data, no excluded projects", async ({ page }) => {
  test.skip(width(page) !== 1440, "content/count is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });

  const bench = page.locator("section#experiments");
  const cards = bench.locator("article[data-paper]");
  await expect(cards).toHaveCount(4);

  for (const [i, project] of EXPERIMENTS.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(project.name);
    await expect(card).toContainText(project.tagline);
    await expect(card.locator('[data-hand="label"]')).toHaveText(String(i + 1).padStart(2, "0"));
  }

  const main = page.locator("#main");
  for (const bad of FORBIDDEN_PATTERNS) {
    await expect(main).not.toContainText(bad);
  }
});

test("TC-169.2 every live link opens in a new tab with rel=noopener and an sr-only note", async ({ page }) => {
  test.skip(width(page) !== 1440, "link attributes are viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });

  // Scoped to the bench: cinematic-portfolio's URL may also be linked from the band.
  const bench = page.locator("section#experiments");
  await expect(bench.locator("a[href]")).toHaveCount(4);
  for (const project of EXPERIMENTS) {
    const link = bench.locator(`a[href="${project.links.live}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("target", "_blank");
    expect(await link.getAttribute("rel"), `${project.slug} rel`).toContain("noopener");
    await expect(link.locator(".sr-only")).toHaveText("(opens in new tab)");
    await expect(link).toHaveAccessibleName(/opens in new tab/i);
    await expect(link).toContainText(project.links.live!);
  }
});

test("TC-169.3 no tone/status line, no notebook sheet, no quiet close (Dev-07, D9)", async ({ page }) => {
  test.skip(width(page) !== 1440, "structure is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });
  const main = page.locator("#main");
  await expect(main).not.toContainText("tone:");
  await expect(main.locator('[data-paper="notebook"]')).toHaveCount(0);
  await expect(main).not.toContainText("small on purpose");
  // The bench is the last section in <main>: the band (layout) is the closing CTA.
  await expect(main.locator("section").last()).toHaveAttribute("id", "experiments");
});

test("heading outline: h1 → h2 'Experiments' → one h3 per card", async ({ page }) => {
  test.skip(width(page) !== 1440, "heading structure is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });
  const main = page.locator("#main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(main.getByRole("heading", { level: 2 })).toHaveText(["Experiments"]);
  await expect(main.getByRole("heading", { level: 3 })).toHaveText(EXPERIMENTS.map((p) => p.name));
});

test("TC-169.4 EVAL-018 unit counts: opener copy 3 · bench 3", { tag: "@EVAL-018" }, async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "EVAL-018 is measured at 390 and 1440");
  await page.goto("/playground", { waitUntil: "load" });
  const counts = await page.evaluate(() => {
    const own = (unit: Element | null) =>
      unit
        ? Array.from(unit.querySelectorAll("[data-decor]")).filter(
            (d) => d.parentElement?.closest("section, header, footer") === unit,
          ).length
        : -1;
    return {
      opener: own(document.querySelector("section.pg-opener")),
      bench: own(document.querySelector("section#experiments")),
    };
  });
  expect(counts).toEqual({ opener: 3, bench: 3 });
});

test("TC-169.5 board columns: 12 > 1024 · 6 ≤ 1024 · 1 ≤ 640", async ({ page }) => {
  await page.goto("/playground", { waitUntil: "load" });
  const cols = await page
    .locator(".pg-board")
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
  const w = width(page);
  expect(cols, `board columns at ${w}`).toBe(w > 1024 ? 12 : w > 640 ? 6 : 1);
});

test("min-target sweep (≥44×44) and visible focus ring", async ({ page, minTargets, keyboardOnly }) => {
  await page.goto("/playground", { waitUntil: "load" });
  await minTargets(page);
  if (width(page) === 1440) {
    await keyboardOnly(page, { tabs: 8 });
  }
});

test("@EVAL-011 the 4 live experiment URLs resolve (HEAD 200-399)", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "external resolution checked once at w1440");
  for (const project of EXPERIMENTS) {
    const url = project.links.live!;
    const res = await page.request.head(url).catch(() => page.request.get(url));
    expect(res.status(), `${project.slug} live URL ${url} must resolve HEAD/GET 200-399`).toBeGreaterThanOrEqual(200);
    expect(res.status()).toBeLessThan(400);
  }
});

test("/playground · no-overflow + screenshot", async ({ page, noOverflow }) => {
  await page.goto("/playground", { waitUntil: "load" });
  await noOverflow(page);
  await page.screenshot({
    path: `docs/screenshots/playground/playground-${width(page)}.png`,
    fullPage: true,
    animations: "disabled",
  });
});

test("/playground · axe wcag2.1 AA", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
  await page.goto("/playground", { waitUntil: "load" });
  await axe(page);
});
