/**
 * campfire-paper.spec.ts (TASK-281) — the Campfire Board paper-craft layout (components/case-study/campfire):
 *   - hero, five numbered sections in order, sources and the next band; navigator targets and legacy anchors resolve;
 *   - the three real screenshots are the record's own files; facts (10, 1, 3/3, caveat) come from the record;
 *   - live product, pitch/demo video and GitHub links and the evidence drawer are preserved;
 *   - the next band is Slag City (next in order) with the arcade art, crisp, one per theme;
 *   - light/dark show the matching hero art (>= 2x rendered width), axe-clean in both themes;
 *   - no horizontal overflow at 375 / 414 / 768 / 1440 in light and dark; reduced motion; other layouts untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";
import { campfireBoard } from "@/data/projects";

const study = getCaseStudy("campfire-board")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
const band = (page: Page) => page.locator('section[aria-label="Next project"]');
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("campfire paper layout", () => {
  test("structure: hero, five numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    await expect(page.locator("article.cfp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp, article.nup, article.bvp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Campfire Board");
    await expect(page.locator(".cfp-kicker")).toHaveText("CF-01 · BUILT · LIVE DEMO");
    await expect(page.locator(".cfp-tagline")).toHaveText("Every project. One command centre.");
    expect(await page.locator(".cfp-sec .cfp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".cfp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["problem", "product", "decisions", "system", "evidence"]);
    expect(await page.locator(".cfp-sec h2").allTextContents()).toEqual([
      "Many builds. No shared view.",
      "Board, Gantt, workflow. One place.",
      "Fork, don’t rebuild. Keep it local.",
      "Markdown on disk. One binary on top.",
      "3/3 pilot checks passed.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".cfp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".cfp-nav-link")).toHaveText(["01Problem", "02Product", "03Decisions", "04System", "05Evidence"]);
    await expect(page.locator(".cfp-flow-k")).toHaveText(["projects.json", "Markdown backlogs", "Bun CLI", "Embedded React UI", "Board · Gantt · Workflow"]);
    await expect(page.locator(".cfp-decisions h3")).toHaveText(["Fork Backlog.md", "One local binary"]);
    await expect(page.locator(".cfp-check h3")).toHaveText(["Project switching", "Ticket moves", "Project isolation"]);
    await expect(band(page).locator("a")).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("facts come from the record; the caveat is visible and no claim goes beyond the pilot", async ({ page }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    const values = page.locator(".cfp-metric-value");
    await expect(values).toHaveText([study.hero.proofs[0]!.value, study.hero.proofs[1]!.value, "3/3"]);
    expect(sec("outcome").proofs[0]!.value.replace(/\s/g, "")).toBe("3/3");
    await expect(page.locator(".cfp-metric-label")).toHaveText(["workflow stages", "local binary", "pilot checks passed"]);
    await expect(page.locator(".cfp-metrics .csx-badge")).toContainText("Prototype");
    const caveat = page.locator(".cfp-caveat");
    await expect(caveat).toBeVisible();
    await expect(caveat).toContainText("Tested on throwaway projects; not yet validated on real projects.");
    for (const gap of sec("outcome").gaps) await expect(caveat).toContainText(gap);
    await expect(page.locator("article.cfp")).not.toContainText(/\b(production[- ]ready|customers|revenue|\d+%)/i);
  });

  test("real screenshots: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    const media = study.hero.media as { poster: { src: string; alt: string } };
    const shots = [media.poster, sec("product").poster!, sec("product").shots[0]!];
    for (const shot of shots) await expect(page.locator(`.cfp-frame img[src="${shot.src}"]`).first()).toHaveAttribute("alt", shot.alt);
    await expect(page.locator(".cfp-cap-t")).toHaveText(["Gantt", "Kanban", "Workflow"]);
    await expect(page.locator(".cfp-cap-d")).toHaveText(["See timing and dependencies.", "Track tickets by stage.", "Follow the ten-stage build."]);
  });

  test("links: live product, pitch and demo videos, GitHub and the evidence drawer are preserved", async ({ page }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo", "github"]) await expect(page.locator(`.cfp-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.cfp-tile-link[data-action="live"]')).toHaveAttribute("href", campfireBoard.links.live!);
    await expect(page.locator('.cfp-tile-link[data-action="github"]')).toHaveAttribute("href", campfireBoard.links.github!);
    await expect(page.locator('.cfp-btn[data-action="live"]')).toBeVisible();
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Pilot checklist");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme}: hero art and the Slag City arcade band are the matching art, crisp, and the link is unchanged`, async ({ page, noOverflow, axe }) => {
      await page.goto("/work/campfire-board", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      const img = page.locator(`.cfp-hero-art img[data-theme-art="${theme}"]`);
      await expect(img).toBeVisible();
      await expect(page.locator(`.cfp-hero-art img[data-theme-art="${other}"]`)).toBeHidden();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);

      await band(page).scrollIntoViewIfNeeded();
      const art = band(page).locator(`img.cs-next-art-${theme}`);
      await expect(art).toBeVisible();
      await expect(art).toHaveAttribute("src", new RegExp(`slag-next-${theme}\\.webp$`));
      await expect(band(page).locator(`img.cs-next-art-${other}`)).toBeHidden();
      await expect(band(page).locator("h2")).toContainText("Slag City");
      await expect(band(page).locator(".cs-next-line")).toHaveText("A 90’s arcade game.");
      await expect(band(page).locator("a")).toHaveAttribute("href", "/work/slag-city");
      await expect.poll(() => art.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const b = await art.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(b.natural).toBeGreaterThanOrEqual(b.shown * 2);
      await noOverflow(page);
      await page.waitForTimeout(700); // let the section reveals finish so axe never samples a half-faded badge
      await axe(page);
    });
  }

  test("naming: the body names no other product; only Slag City is named, in the band", async ({ page }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    const body = await page.evaluate(() => {
      const article = document.querySelector("article.cfp")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      return bits.join("\n");
    });
    expect(body).not.toMatch(/slag|bhakti|railcite|teachspark|tushky|cubicle|tegaki|token ?toli|pratyasa|dino arcade|shravan|urja|nuptis|velora/i);
  });

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/campfire-board", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("rest position: the Sources tiles end at least 8px above the next band after scrolling to the end", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/campfire-board", { waitUntil: "load" });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      const gap = await page.evaluate(() => {
        const tiles = [...document.querySelectorAll(".cfp-tile-link, .cfp-tile-drawer button")].map((el) => el.getBoundingClientRect()).filter((r) => r.height > 0).map((r) => r.bottom);
        const bandTop = document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect().top;
        return bandTop - Math.max(...tiles);
      });
      expect(gap, `${w}px`).toBeGreaterThanOrEqual(8);
    }
  });

  test("axe-clean in dark as well", async ({ page, axe }) => {
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    await page.locator(".cfp-btn-primary").focus();
    expect(await page.locator(".cfp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible without animation", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/campfire-board", { waitUntil: "load" });
    for (const el of await page.locator(".cfp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    const lift = await page.locator(".cfp-card").first().evaluate((n) => getComputedStyle(n).transitionDuration);
    expect(Number.parseFloat(lift)).toBeLessThanOrEqual(0.001);
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator(".cfp")).toHaveCount(0);
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await expect(page.locator("article.nup")).toHaveCount(1);
    await expect(page.locator(".cfp")).toHaveCount(0);
  });
});
