/**
 * nuptis-paper.spec.ts (TASK-278) — the Nuptis origami paper-craft layout (components/case-study/nuptis):
 *   - hero, seven numbered sections in order, sources and the next band; navigator targets and legacy anchors resolve;
 *   - numbers come from the record (168, 62, 283, 9 routes); evidence kinds are labelled; no gaps box (TASK-297);
 *   - the dashboard and the three workflow screenshots are the record's own files, unmodified;
 *   - only Bhakti Vilas is named in the next band; the body names no product except Velora (the record's day-seven follow-on);
 *   - live product, pitch/demo video, GitHub links and the evidence drawer are still there;
 *   - light/dark show the matching hero art, crisp (natural width >= 2x rendered), no horizontal overflow at 375 / 414 / 768 / 1440;
 *   - other layouts are untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";

const study = getCaseStudy("nuptis")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("nuptis paper layout", () => {
  test("structure: hero, seven numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await expect(page.locator("article.nup")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nuptis");
    await expect(page.locator(".nup-kicker")).toHaveText("NP-01 · SOLO BUILD · LIVE ON MOCK DATA");
    await expect(page.locator(".nup-tagline")).toHaveText("Vendor operations, without the wedding-day scramble.");
    expect(await page.locator(".nup-sec .nup-num").allTextContents()).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    expect(await page.locator(".nup-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["problem", "insight", "product", "decisions", "system", "evidence", "learnings"]);
    expect(await page.locator(".nup-sec h2").allTextContents()).toEqual([
      "One vendor no-show can derail the day.",
      "Vet by risk, not habit.",
      "Onboard by risk. Track the work. Switch to a backup.",
      "Cut hard, and say why.",
      "The reducer is the API surface.",
      "Designed carefully. Measured honestly.",
      "Say what you know, and how you know it.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".nup-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".nup-nav-link")).toHaveCount(7);
    await expect(page.locator(".nup-step-label")).toHaveText(["Spreadsheets", "Chat threads", "Vendor no-show", "No backup on record", "Event-day scramble"]);
    await expect(page.locator(".nup-decisions h3")).toHaveText(["Risk-tiered verification", "An explicit cut list", "Workflow over AI"]);
    await expect(page.locator(".nup-flow-k")).toHaveText(["React UI", "Context + reducer", "localStorage", "Supabase mirror", "Nine-table schema"]);
    await expect(page.locator(".nup-card h3").filter({ hasText: /intuition|North Star|craft/ })).toHaveCount(3);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers and labels come from the record; the North Star and gaps are honest", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    const tiles = page.locator(".nup-metric");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      await expect(tiles.nth(i).locator(".nup-metric-value")).toHaveText(proof.value);
      await expect(tiles.nth(i).locator(".csx-badge")).toContainText(proof.kind === "prototype" ? "Prototype" : "Structural");
    }
    await expect(tiles.locator(".nup-metric-label")).toHaveText(["Figma frames, with an AA audit", "Dual-mode design tokens"]);
    await expect(tiles.nth(1).locator(".nup-metric-note")).toHaveText("Design evidence");
    // TASK-297: the retirement date is not a headline proof
    await expect(tiles).not.toContainText(["Day 7"]);
    const outcome = sec("outcome");
    const stats = page.locator(".nup-stat");
    await expect(stats).toHaveCount(outcome.proofs.length);
    for (const [i, proof] of outcome.proofs.entries()) {
      await expect(stats.nth(i).locator(".nup-stat-value")).toHaveText(proof.value);
      await expect(stats.nth(i).locator(".csx-badge")).toContainText(proof.kind === "prototype" ? "Prototype" : "Measured");
    }
    await expect(stats.nth(0).locator(".nup-metric-note")).toHaveText("and 62 dual-mode design tokens");
    // TASK-297: no "What isn’t measured" box
    await expect(page.locator(".nup-gaps")).toHaveCount(0);
    await expect(page.locator(".nup-star-tag")).toHaveText("Intended North Star · not measured");
    await expect(page.locator(".nup-p").first()).toHaveText("15–30+ vendors, 5–7 ceremonies, and fragmented records across spreadsheets and chat threads.");
    await expect(page.locator(".nup-quote p")).toHaveText(`“${sec("research").quotes[0]!.text}”`);
    // no production / traction claims
    await expect(page.locator("article.nup")).not.toContainText(/\b(pilot customers|users signed|in production|revenue)\b/i);
  });

  test("real screenshots: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    const media = study.hero.media as { src: string; alt: string };
    await expect(page.locator(`.nup-dash img[src="${media.src}"]`)).toHaveAttribute("alt", media.alt);
    for (const shot of sec("product").shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.nup-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".nup-cap-t")).toHaveText(["Risk-led intake", "Work-order visibility", "Pre-vetted backup"]);
  });

  test("naming: the next band names only Bhakti Vilas; the body names no product but Velora", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    const body = await page.evaluate(() => {
      const article = document.querySelector("article.nup")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      return bits.join("\n");
    });
    expect(body).not.toMatch(/bhakti|railcite|teachspark|tushky|cubicle|tegaki|token ?toli|pratyasa|dino arcade|campfire|slag|shravan|urja/i);
    const band = page.locator('section[aria-label="Next project"]');
    await expect(band.locator("h2")).toContainText("Bhakti Vilas");
    expect(await band.textContent()).not.toMatch(/velora|railcite|teachspark|tushky/i);
    await expect(band.getByRole("link", { name: /^Next project: Bhakti Vilas/ })).toHaveAttribute("href", "/work/bhakti-vilas");
  });

  test("links: live product, pitch and demo videos, GitHub and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo", "github"]) await expect(page.locator(`.nup-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.nup-tile-link[data-action="pitch"]')).toHaveAttribute("href", /sldcfNeQj94/);
    await expect(page.locator('.nup-tile-link[data-action="demo"]')).toHaveAttribute("href", /1F3UfV_cgW4/);
    await expect(page.locator('.nup-btn[data-action="live"]')).toBeVisible();
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Nuptis PRD");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching hero art, crisp`, async ({ page, noOverflow }) => {
      await page.goto("/work/nuptis", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      const img = page.locator(`.nup-hero-art img[data-theme-art="${theme}"]`);
      await expect(img).toBeVisible();
      await expect(page.locator(`.nup-hero-art img[data-theme-art="${other}"]`)).toBeHidden();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
      await page.locator('section[aria-label="Next project"]').scrollIntoViewIfNeeded();
      await expect(page.locator(`section[aria-label="Next project"] img.cs-next-art-${theme}`)).toBeVisible();
      await noOverflow(page);
    });
  }

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/nuptis", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("axe-clean in dark as well", async ({ page, axe }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await page.locator(".nup-btn-primary").focus();
    expect(await page.locator(".nup-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible without animation", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/nuptis", { waitUntil: "load" });
    for (const el of await page.locator(".nup [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator(".nup")).toHaveCount(0);
  });
});
