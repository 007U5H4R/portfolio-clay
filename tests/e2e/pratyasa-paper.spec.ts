/**
 * pratyasa-paper.spec.ts (TASK-280) — the Pratyasa origami paper-craft layout (components/case-study/pratyasa):
 *   - hero, five numbered sections in order, sources and the next band; navigator targets and legacy anchors resolve;
 *   - the facts come from the record (IN 429867, 2nd of 5, NIT–Calicut) and the safety line is visible; no invented metric
 *     (no "~10 minutes", no "Detected", no percentages) and no diagnostic or sole-ownership claim;
 *   - the prototype photo, live-page screenshot and device-case photo are the record's own files, unmodified;
 *   - the next band names only Campfire Board and links to /work/campfire-board; the body names no other product;
 *   - live product, pitch/demo video, GitHub links and the evidence drawer are still there;
 *   - light/dark show the matching hero art, crisp (natural width >= 2x rendered), no horizontal overflow at 375 / 414 / 768 / 1440;
 *   - axe-clean in both themes, reduced motion, keyboard focus; other layouts are untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";

const study = getCaseStudy("pratyasa")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;
const band = (page: Page) => page.locator('section[aria-label="Next project"]');

test.describe("pratyasa paper layout", () => {
  test("structure: hero, five numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    await expect(page.locator("article.pra")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp, article.nup, article.bvp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pratyasa");
    await expect(page.locator(".pra-kicker")).toHaveText("PR-01 · RESEARCH PROTOTYPE · GRANTED PATENT");
    await expect(page.locator(".pra-tagline")).toHaveText("A patent, on the record.");
    await expect(page.locator(".pra-status")).toHaveText("Research prototype · Not an approved diagnostic");
    expect(await page.locator(".pra-sec .pra-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".pra-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["problem", "product", "decisions", "system", "evidence"]);
    expect(await page.locator(".pra-sec h2").allTextContents()).toEqual([
      "The invention was real. Its record didn’t exist.",
      "One page. The work, made visible.",
      "Credibility over claims.",
      "Every claim checked against an artifact.",
      "Tested in real samples. Reported in research.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".pra-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".pra-nav-link")).toHaveCount(5);
    await expect(page.locator(".pra-step-label")).toHaveText(["Patent", "Prototype", "Published research", "No single record", "This case study"]);
    await expect(page.locator(".pra-decisions h3")).toHaveText(["Audience", "Attribution", "Safety"]);
    await expect(page.locator(".pra-flow-k")).toHaveText(["Fact-locked PRD", "Required facts", "Fact checker", "Static page", "Live page"]);
    await expect(page.locator(".pra-chip")).toHaveText(["Electronics & firmware", "Android app", "Sensor preparation", "Validation testing"]);
    await expect(page.locator(".pra-sample-k")).toHaveText(["Whole blood", "Mayonnaise", "Fruit juice"]);
    await expect(band(page).locator("a")).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("facts come from the record; nothing is invented", async ({ page }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    const tiles = page.locator(".pra-metric");
    await expect(tiles).toHaveCount(3);
    for (const [i, proof] of study.hero.proofs.entries()) await expect(tiles.nth(i).locator(".pra-metric-value")).toHaveText(proof.value);
    await expect(tiles.locator(".pra-metric-value")).toHaveText(["IN 429867", "2nd of 5", "NIT–Calicut"]);
    await expect(tiles.locator(".pra-metric-label")).toHaveText(["Granted patent", "Co-inventors", "Patent owner"]);
    const outcome = sec("outcome");
    for (const gap of outcome.gaps) await expect(page.locator(".pra-gaps")).toContainText(gap);
    await expect(page.locator("#evidence")).toContainText("These are research results, not product metrics.");
    const text = (await page.locator("article.pra").textContent()) ?? "";
    expect(text).not.toMatch(/~\s?10\s?min|10 minutes|detected|\d+\s?%|sensitivity|specificity|accuracy|pg\/ml|affordable|low-cost|portable|life-?saving|early detection|solo (invent|owner)|we own|our patent/i);
    expect(text).not.toMatch(/\b(approved diagnostic)\b(?<!not an approved diagnostic)/i);
  });

  test("real images: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    const media = study.hero.media as { src: string; alt: string };
    await expect(page.locator(`.pra-photo img[src="${media.src}"]`)).toHaveAttribute("alt", media.alt);
    for (const shot of sec("product").shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.pra-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".pra-cap-t")).toHaveText(["The live page", "The device case"]);
    // the real photo is never filtered or cropped away
    expect(await page.locator(".pra-photo img").evaluate((el) => getComputedStyle(el).filter)).toBe("none");
    expect(await page.locator(".pra-photo img").evaluate((el) => getComputedStyle(el).objectFit)).not.toBe("cover");
  });

  test("naming: the next band names only Campfire Board; the body names no other product", async ({ page }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    const body = await page.evaluate(() => {
      const article = document.querySelector("article.pra")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      return bits.join("\n");
    });
    expect(body).not.toMatch(/bhakti|railcite|teachspark|tushky|cubicle|tegaki|token ?toli|nuptis|velora|dino arcade|campfire|slag|shravan|urja/i);
    await expect(band(page).locator("h2")).toContainText("Campfire Board");
    await expect(band(page).getByRole("link", { name: /^Next project: Campfire Board/ })).toHaveAttribute("href", "/work/campfire-board");
  });

  test("links: live product, pitch and demo videos, GitHub and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo", "github"]) await expect(page.locator(`.pra-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.pra-tile-link[data-action="live"]')).toHaveAttribute("href", "https://pratyasa.vercel.app");
    await expect(page.locator('.pra-tile-link[data-action="pitch"]')).toHaveAttribute("href", /xqevuhTxKAQ/);
    await expect(page.locator('.pra-tile-link[data-action="demo"]')).toHaveAttribute("href", /Rl6MQiSBqh8/);
    await expect(page.locator('.pra-tile-link[data-action="github"]')).toHaveAttribute("href", "https://github.com/007U5H4R/pratyasa");
    await expect(page.locator('.pra-btn[data-action="live"]')).toBeVisible();
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Discovery PRD");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching hero and band art, crisp`, async ({ page, noOverflow }) => {
      await page.goto("/work/pratyasa", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      const img = page.locator(`.pra-stage img[data-theme-art="${theme}"]`);
      await expect(img).toBeVisible();
      await expect(page.locator(`.pra-stage img[data-theme-art="${other}"]`)).toBeHidden();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
      await band(page).scrollIntoViewIfNeeded();
      const art = band(page).locator(`img.cs-next-art-${theme}`);
      await expect(art).toBeVisible();
      await expect(art).toHaveAttribute("src", new RegExp(`/pratyasa/art/next-${theme}\\.webp$`));
      await expect.poll(() => art.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const b = await art.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(b.natural).toBeGreaterThanOrEqual(b.shown * 2);
      await noOverflow(page);
    });
  }

  test("next band: supporting line, cream in light, no light strip in dark, art painted on the band colour", async ({ page }) => {
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    await band(page).scrollIntoViewIfNeeded();
    await expect(band(page).locator(".cs-next-line")).toHaveText("A Jira board for Gen AI Agents.");
    await expect(band(page).getByText("next up")).toHaveCount(0);
    // computed colours (any CSS colour syntax) -> rgb, via a canvas
    const rgb = (css: string) => page.evaluate((c) => { const g = document.createElement("canvas").getContext("2d")!; g.fillStyle = c; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); }, css);
    const surface = () => band(page).evaluate((el) => ({ bg: getComputedStyle(el).backgroundImage.match(/(lab|oklab|rgb|oklch)\([^)]*\)/)![0], front: getComputedStyle(el.querySelector(".torn-front")!).fill }));
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      const s = await surface();
      const bg = await rgb(s.bg);
      expect(await rgb(s.front), `${theme}: the torn front is the band's own colour (no light strip in dark)`).toEqual(bg);
      if (theme === "light") expect(bg).toEqual([0xf7, 0xf0, 0xe7]);
      // the art's decoded flat field is the band colour exactly (a 1-level miss shows as a box)
      const field = await band(page).locator(`img.cs-next-art-${theme}`).evaluate((img: HTMLImageElement) => { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext("2d")!; g.drawImage(img, 0, 0); return [...g.getImageData(img.naturalWidth >> 1, 6, 1, 1).data].slice(0, 3); });
      expect(field, `${theme}: art field vs band`).toEqual(bg);
    }
  });

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/pratyasa", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  for (const theme of ["light", "dark"] as const) {
    test(`axe-clean in ${theme}`, async ({ page, axe }) => {
      await page.goto("/work/pratyasa", { waitUntil: "load" });
      await setTheme(page, theme);
      await axe(page);
    });
  }

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    await page.locator(".pra-btn-primary").focus();
    expect(await page.locator(".pra-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible without animation", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/pratyasa", { waitUntil: "load" });
    for (const el of await page.locator(".pra [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator(".pra-photo .pra-frame").evaluate((n) => getComputedStyle(n).transform)).toBe("none");
  });

  test("the source tiles and the footer line end above the next band once scrolled to the bottom", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/pratyasa", { waitUntil: "load" });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(1200); // the band's scroll-driven slide settles
      const m = await page.evaluate(() => {
        const bottoms = [...document.querySelectorAll(".pra-tile-link, .pra-tile-drawer .csx-drawer-open, .pra-meta")].map((e) => e.getBoundingClientRect().bottom);
        return { lowest: Math.max(...bottoms), bandTop: document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect().top, n: bottoms.length };
      });
      expect(m.n, `${w}px`).toBeGreaterThanOrEqual(6);
      expect(m.lowest, `${w}px: sources end above the band`).toBeLessThanOrEqual(m.bandTop - 8);
    }
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator(".pra")).toHaveCount(0);
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await expect(page.locator("article.nup")).toHaveCount(1);
    await expect(page.locator(".pra")).toHaveCount(0);
  });
});
