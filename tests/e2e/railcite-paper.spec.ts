/**
 * railcite-paper.spec.ts (TASK-268) — the RailCite paper-archive layout (components/case-study/railcite):
 *   - hero, six numbered sections, sources and the next band exist, in order; navigator targets and legacy anchors resolve;
 *   - every number comes from the record: hero proofs and the four evidence stats, with badge, date and "what isn't measured";
 *   - the real screenshots are the record's own files; the seven pipeline steps show, the validator is the checkpoint;
 *   - light and dark render the same layout with the matching art, no overflow, axe-clean in dark too;
 *   - the Velora footer art is a fashion scene (no railway art) and the band links to Velora;
 *   - the shared template and the TeachSpark layout are untouched for other studies.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";
import { formatAsOf } from "@/lib/format";

const study = getCaseStudy("railcite")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("railcite paper layout", () => {
  test("structure: hero, six numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator("article.csx")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("RailCite");
    await expect(page.locator(".rcp-tagline")).toHaveText(study.hero.tagline);
    expect(await page.locator(".rcp-sec .rcp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05", "06"]);
    expect(await page.locator(".rcp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(study.sections.map((s) => s.id));
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".rcp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".rcp-nav-link")).toHaveCount(6);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers come from the record: hero proofs, evidence stats, and the honest gaps", async ({ page }) => {
    await page.goto("/work/railcite", { waitUntil: "load" });
    const tiles = page.locator(".rcp-metric");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      const tile = tiles.nth(i);
      await expect(tile.locator(".rcp-metric-value")).toHaveText(proof.value);
      await expect(tile.locator(".rcp-metric-label")).toHaveText(proof.label);
      await expect(tile.locator(".csx-badge")).toContainText(proof.kind === "measured" ? "Measured" : "Structural");
      if (proof.asOf) await expect(tile.locator(".rcp-date")).toHaveText(formatAsOf(proof.asOf));
      if (proof.note) await expect(tile.locator(".rcp-metric-note")).toHaveText(proof.note);
    }
    const outcome = sec("outcome");
    const stats = page.locator(".rcp-stat");
    await expect(stats).toHaveCount(outcome.proofs.length);
    for (const [i, proof] of outcome.proofs.entries()) {
      await expect(stats.nth(i).locator(".rcp-stat-value")).toHaveText(proof.value);
      await expect(stats.nth(i).locator(".rcp-stat-label")).toHaveText(proof.label);
      if (proof.asOf) await expect(stats.nth(i).locator(".rcp-date")).toHaveText(formatAsOf(proof.asOf));
      if (proof.note) await expect(stats.nth(i).locator(".rcp-metric-note")).toHaveText(proof.note);
    }
    await expect(page.locator(".rcp-gaps h3")).toHaveText("What isn’t measured");
    for (const gap of outcome.gaps) await expect(page.locator(".rcp-gaps")).toContainText(gap);
  });

  test("the real screenshots are the record's files; seven pipeline steps with the validator as the checkpoint", async ({ page }) => {
    await page.goto("/work/railcite", { waitUntil: "load" });
    const product = sec("product");
    for (const shot of product.shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.rcp-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(`.rcp-hero-card img[src="${product.shots[0]!.src}"]`)).toBeAttached();
    const system = sec("system");
    const nodes = page.locator(".rcp-node");
    await expect(nodes).toHaveCount(7);
    for (const [i, step] of system.steps.entries()) await expect(nodes.nth(i).locator(".rcp-node-label")).toHaveText(step.label);
    await expect(page.locator(".rcp-node[data-key] .rcp-node-label")).toHaveText("Citation validator");
    for (const rule of system.rules.slice(0, 2)) await expect(page.locator(".rcp-fail")).toContainText(rule);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the same layout with the matching art`, async ({ page, noOverflow }) => {
      await page.goto("/work/railcite", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      await expect(page.locator(`.rcp-hero-scene img[data-theme-art="${theme}"]`)).toBeVisible();
      await expect(page.locator(`.rcp-hero-scene img[data-theme-art="${other}"]`)).toBeHidden();
      await expect(page.locator(".rcp-hero-card img")).toBeVisible();
      await page.locator(".rcp-next").scrollIntoViewIfNeeded();
      await expect(page.locator(`.rcp-next-art img[data-theme-art="${theme}"]`)).toBeVisible();
      await noOverflow(page);
    });
  }

  test("the next band is Velora's fashion scene, decorative, and links to Velora", async ({ page }) => {
    await page.goto("/work/railcite", { waitUntil: "load" });
    const band = page.locator('section[aria-label="Next project"]');
    await expect(band.locator("img:not(.pf-logo-img)")).toHaveCount(2); // light + dark twins; one is display:none
    for (const img of await band.locator("img:not(.pf-logo-img)").all()) {
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.getAttribute("src")).toMatch(/\/railcite\/art\/footer-(light|dark)\.webp$/);
    }
    await expect(band.getByRole("link", { name: /^Next project: Velora/ })).toHaveAttribute("href", "/work/velora");
    await expect(band.locator(".rcp-next-h")).toContainText("Velora");
  });

  test("axe-clean in dark as well (the shared case-study spec runs light)", async ({ page, axe }) => {
    await page.goto("/work/railcite", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("navigator jump keeps the section heading clear of the sticky header and navigator", async ({ page }) => {
    test.skip(width(page) < 768, "the jump offset is checked at tablet and desktop");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await page.getByRole("link", { name: "Decisions", exact: true }).click();
    await page.waitForTimeout(700);
    const covered = await page.evaluate(() => {
      const h = document.querySelector("#decisions-h")!.getBoundingClientRect();
      const nav = document.querySelector(".rcp-nav")!.getBoundingClientRect();
      return h.top < nav.bottom;
    });
    expect(covered).toBe(false);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await page.locator(".rcp-btn-primary").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    expect(await page.locator(".rcp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("TeachSpark keeps its own layout", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await expect(page.locator("article.tsp")).toHaveCount(1);
    await expect(page.locator(".rcp")).toHaveCount(0);
  });
});
