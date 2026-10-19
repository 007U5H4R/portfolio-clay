/**
 * slag-city-paper.spec.ts (TASK-282) — the Slag City arcade paper-craft layout (components/case-study/slag-city):
 *   - hero, five numbered sections in order, sources and the next band; navigator targets and legacy anchors resolve;
 *   - numbers and honest caveats come from the record (3, 10 s, live since 16 September 2026, "no numbers yet");
 *   - the real attract screen and the three real screenshots are the record's own files, unmodified;
 *   - live product, pitch/demo video, GitHub links and the evidence drawer are still there;
 *   - next band: The Shravan's Round, its art and line, and nothing from a transport theme;
 *   - light/dark show the matching art, each crisp (natural width >= 2x rendered), no horizontal overflow at 375 / 414 / 768 / 1440;
 *   - the Sources tiles are not covered by the next band once scrolled to the end; axe-clean in both themes; reduced motion;
 *   - other layouts are untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";

const study = getCaseStudy("slag-city")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("slag city paper layout", () => {
  test("structure: hero, five numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    await expect(page.locator("article.sgp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp, article.nup")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Slag City");
    await expect(page.locator(".sgp-kicker")).toHaveText("SC-01 · LIVE · BROWSER GAME");
    await expect(page.locator(".sgp-tagline")).toHaveText("Insert coin. The browser is the cabinet.");
    expect(await page.locator(".sgp-sec .sgp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".sgp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["why", "product", "decisions", "system", "evidence"]);
    expect(await page.locator(".sgp-sec h2").allTextContents()).toEqual([
      "Private emulators can’t ship. Original IP can.",
      "Attract. Insert coin. Fight. Continue. Initials.",
      "Deterministic underneath. Arcade on top.",
      "One input frame. One pure core.",
      "Live since 16 September 2026 — no numbers yet.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".sgp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".sgp-nav-link")).toHaveCount(5);
    await expect(page.locator(".sgp-card h3")).toHaveText(["Deterministic core", "One input frame", "Browser-synthesised audio"]);
    await expect(page.locator(".sgp-flow-k")).toHaveText(["Input devices", "Input frame", "Pure core", "Phaser 3 scene", "Web Audio"]);
    await expect(page.locator(".sgp-flow-step")).toHaveCount(sec("system").steps.length);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers and caveats come from the record; nothing is invented", async ({ page }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    const tiles = page.locator(".sgp-stat");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      await expect(tiles.nth(i).locator(".sgp-stat-value")).toHaveText(proof.value);
      await expect(tiles.nth(i).locator(".sgp-stat-label")).toHaveText(proof.label);
    }
    await expect(tiles.nth(0).locator(".sgp-stat-value")).toHaveText("3");
    await expect(tiles.nth(1).locator(".sgp-stat-value")).toHaveText("10 s");
    const outcome = sec("outcome");
    await expect(page.locator(".sgp-evidence .sgp-p")).toHaveText(outcome.intro ?? "");
    await expect(page.locator(".sgp-gaps h3")).toHaveText("What isn’t measured");
    for (const gap of outcome.gaps) await expect(page.locator(".sgp-gaps")).toContainText(gap);
    await expect(page.locator(".sgp-quote p")).toHaveText(sec("problem").quote!.text);
    await expect(page.locator(".sgp-chips li")).toHaveText(["Readme", "PRD", "Build ledger", "Evaluation"]);
    // no traction claims
    await expect(page.locator("article.sgp")).not.toContainText(/\b(\d[\d,]* (players|users|sessions)|pilot|revenue|downloads|high score)\b/i);
  });

  test("real screenshots: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    const poster = (study.hero.media as { poster: { src: string; alt: string } }).poster;
    await expect(page.locator(`.sgp-bezel img[src="${poster.src}"]`)).toHaveAttribute("alt", poster.alt);
    for (const shot of sec("product").shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.sgp-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".sgp-cap-t")).toHaveText(["Desktop: the simulated cabinet", "The 10-second continue", "Phone: on-screen controls"]);
  });

  test("links: live product, pitch and demo videos, GitHub and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo", "github"]) await expect(page.locator(`.sgp-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.sgp-tile-link[data-action="live"]')).toHaveAttribute("href", "https://slag-city.vercel.app");
    await expect(page.locator('.sgp-tile-link[data-action="github"]')).toHaveAttribute("href", "https://github.com/007U5H4R/slag-city");
    await expect(page.locator('.sgp-tile-link[data-action="pitch"]')).toHaveAttribute("href", /1xvj8j79Svs/);
    await expect(page.locator('.sgp-tile-link[data-action="demo"]')).toHaveAttribute("href", /tc4QDVl8NJM/);
    await expect(page.locator('.sgp-btn[data-action="live"]')).toHaveAttribute("href", "https://slag-city.vercel.app");
    await expect(page.locator('.sgp-btn[data-action="github"]')).toBeVisible();
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Discovery PRD");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  test("next band: The Shravan's Round, with its art and line, no transport imagery", async ({ page }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    const band = page.locator('section[aria-label="Next project"]');
    await expect(band.locator("h2")).toContainText("The Shravan's Round");
    await expect(band.getByRole("link", { name: /^Next project: The Shravan's Round/ })).toHaveAttribute("href", "/work/shravans-round");
    await expect(band.locator(".cs-next-line")).toHaveText("Rehearse the round before the round: a 20-minute AI mock PM interview.");
    await expect(band.locator("img.cs-next-art-light")).toHaveAttribute("src", /slag-city\/art\/band-light\.webp/);
    await expect(band.locator("img.cs-next-art-dark")).toHaveAttribute("src", /slag-city\/art\/band-dark\.webp/);
    const text = ((await band.textContent()) ?? "") + (await band.locator("img").evaluateAll((els) => els.map((e) => `${e.getAttribute("src") ?? ""} ${e.getAttribute("alt") ?? ""}`).join(" ")));
    expect(text).not.toMatch(/train|railway|bridge|station|locomotive|carriage/i);
    // the page body names no other product
    const body = await page.locator("article.sgp").evaluate((el) => el.textContent ?? "");
    expect(body).not.toMatch(/bhakti|railcite|teachspark|tushky|cubicle|tegaki|token ?toli|pratyasa|campfire|nuptis|urja|velora|shravan/i);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme shows the matching art, crisp`, async ({ page, noOverflow }) => {
      await page.goto("/work/slag-city", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      for (const scope of [".sgp-hero-art", ".sgp-sign"]) {
        const img = page.locator(`${scope} img[data-theme-art="${theme}"]`);
        await img.scrollIntoViewIfNeeded();
        await expect(img).toBeVisible();
        await expect(page.locator(`${scope} img[data-theme-art="${other}"]`)).toBeHidden();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
        const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
        expect(m.natural, `${scope} natural vs rendered`).toBeGreaterThanOrEqual(m.shown * 2);
      }
      const band = page.locator('section[aria-label="Next project"]');
      await band.scrollIntoViewIfNeeded();
      const bandImg = band.locator(`img.cs-next-art-${theme}`);
      await expect(bandImg).toBeVisible();
      await expect.poll(() => bandImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const b = await bandImg.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(b.natural).toBeGreaterThanOrEqual(b.shown * 2);
      await noOverflow(page);
    });
  }

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/slag-city", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("the Sources tiles are not covered by the next band at the end of the page", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/slag-city", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        // scroll to the very end in steps so the band's scroll-driven lag settles
        for (let i = 0; i < 4; i++) {
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          await page.waitForTimeout(250);
        }
        const gaps = await page.evaluate(() => {
          const band = document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect().top;
          return [...document.querySelectorAll(".sgp-tiles li, .sgp-meta")].map((el) => band - el.getBoundingClientRect().bottom);
        });
        for (const g of gaps) expect(g, `${w}px ${theme}: tile/meta clear of the band`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test("axe-clean in light and dark", async ({ page, axe }) => {
    await page.goto("/work/slag-city", { waitUntil: "load" });
    await setTheme(page, "light");
    await axe(page);
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/slag-city", { waitUntil: "load" });
    await page.locator(".sgp-btn-primary").focus();
    expect(await page.locator(".sgp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible and nothing transitions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/slag-city", { waitUntil: "load" });
    for (const el of await page.locator(".sgp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator(".sgp-shot .sgp-frame").first().evaluate((n) => getComputedStyle(n).transform)).toBe("none");
    expect(await page.locator(".sgp-btn-primary").evaluate((n) => getComputedStyle(n).transitionDuration)).toMatch(/^0s/);
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    for (const [slug, root] of [["railcite", "article.rcp"], ["nuptis", "article.nup"], ["token-toli", "article.csx"]] as const) {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await expect(page.locator(root)).toHaveCount(1);
      await expect(page.locator(".sgp")).toHaveCount(0);
    }
  });
});
