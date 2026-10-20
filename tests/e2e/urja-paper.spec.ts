/**
 * urja-paper.spec.ts (TASK-284) — the Urja paper-craft layout (components/case-study/urja):
 *   - hero, five numbered sections in the brief's order, sources and the TeachSpark next band; anchors resolve;
 *   - figures and labels come from the record; the simulated fleet and the failed Ask Urja eval stay on the page;
 *   - the Today, trip-evidence and Hindi-brief captures are the record's own files, unmodified;
 *   - live product, pitch/demo video, GitHub links, the hero video player and the evidence drawer are still there;
 *   - light/dark show the matching art (hero diorama and the TeachSpark band), crisp (natural width >= 2x rendered);
 *   - no horizontal overflow at 375 / 414 / 768 / 1440 in both themes; reduced motion; axe in both themes;
 *   - at rest at the end of the page the last section ends >= 8 px above the next band (its torn-lag slide-over);
 *   - other layouts are untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";

const study = getCaseStudy("urja")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
const band = (page: Page) => page.locator('section[aria-label="Next project"]');
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("urja paper layout", () => {
  test("structure: hero, five numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    await expect(page.locator("article.urp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp, article.nup")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Urja");
    await expect(page.locator(".urp-kicker")).toHaveText("UR-01 · LIVE · SIMULATED FLEET");
    await expect(page.locator(".urp-tagline")).toHaveText("The trip is done. Where did the money go?");
    expect(await page.locator(".urp-sec .urp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".urp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["why", "product", "system", "decisions", "evidence"]);
    expect(await page.locator(".urp-sec-in > .urp-h2").allTextContents()).toEqual([
      "Diesel is the biggest cost. The leak appears after the trip.",
      "Read the brief. Open the evidence. Ask the driver.",
      "From truck data to the owner’s morning.",
      "Rules find the money. AI explains the evidence.",
      "Tested on a simulated fleet. Real-world impact is still unproven.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".urp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".urp-nav-link")).toHaveCount(5);
    await expect(page.locator(".urp-stop-label")).toHaveText(["Trip starts", "Diesel", "Tolls", "Kilometres", "Earnings", "Trip ends"]);
    await expect(page.locator(".urp-flow-k")).toHaveText(["Trip data", "Five rules", "Confidence", "Morning brief", "Ask Urja"]);
    await expect(page.locator(".urp-card h3")).toHaveText(["One problem, explained", "Rules before model guesses", "Owner makes the call"]);
    await expect(page.locator(".urp-chosen")).toHaveCount(3);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("facts: record figures, simulated labels, the failed eval and the gaps stay visible", async ({ page }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    const tiles = page.locator(".urp-metric");
    await expect(tiles).toHaveCount(3);
    await expect(tiles.locator(".urp-metric-value")).toHaveText([study.hero.proofs[0]!.value, study.hero.proofs[1]!.value, "24 trucks"]);
    await expect(tiles.nth(1)).toContainText("False-accusation guardrail: under 10%.");
    await expect(tiles.nth(2)).toContainText("Simulated fleet; no real users yet.");
    await expect(page.locator(".urp-stat-value")).toHaveText(["1,235", "515", "Ask Urja"]);
    await expect(page.locator(".urp-stat[data-tone='fail']")).toContainText("Evaluation gate failed");
    expect(sec("outcome").gaps).toHaveLength(3); // the brief's three lines are the record's three gaps, reworded
    await expect(page.locator(".urp-gaps li")).toHaveText(["No real owners, trips or recoveries recorded.", "Ask Urja’s final evaluation gate failed after the free-tier quota was reached.", "Hindi copy has not had a native-speaker review."]);
    await expect(page.locator(".urp-quote p")).toHaveText(`“${sec("problem").quote!.text}”`);
    await expect(page.locator("article.urp")).not.toContainText(/\b(saved|recovered) ₹|real customers|in production|revenue\b/i);
    // the mockup's AI-drawn screens are never used: every capture is the record's file
    await expect(page.locator("article.urp img:not([aria-hidden])")).toHaveCount(3);
  });

  test("real captures: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    const media = study.hero.media as { poster: { src: string; alt: string } };
    await expect(page.locator(`.urp-dash img[src="${media.poster.src}"]`)).toHaveAttribute("alt", media.poster.alt);
    for (const shot of sec("product").shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.urp-shot img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".urp-shot figcaption")).toHaveText(["One flag’s evidence · simulated fleet", "The morning brief · Hindi"]);
  });

  test("naming: the next band names only TeachSpark; the body names no other product", async ({ page }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    const body = await page.evaluate(() => {
      const article = document.querySelector("article.urp")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      return bits.join("\n");
    });
    expect(body).not.toMatch(/teachspark|railcite|velora|nuptis|bhakti|pratyasa|tushky|cubicle|tegaki|token ?toli|campfire|slag|shravan/i);
    await expect(band(page).locator("h2")).toContainText("TeachSpark");
    await expect(band(page).locator(".cs-next-line")).toHaveText("AI worksheets for teachers");
    await expect(band(page).locator(".cs-next-note")).toHaveCount(0);
    expect(await band(page).textContent()).not.toMatch(/truck|fleet|fuel|toll|road/i);
    await expect(band(page).getByRole("link", { name: /^Next project: TeachSpark/ })).toHaveAttribute("href", "/work/teachspark");
  });

  test("links: live product, pitch and demo videos, GitHub, the hero player and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo", "github"]) await expect(page.locator(`.urp-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.urp-tile-link[data-action="live"]')).toHaveAttribute("href", "https://urja-three.vercel.app");
    await expect(page.locator('.urp-tile-link[data-action="pitch"]')).toHaveAttribute("href", /bZbUP3BhXKs/);
    await expect(page.locator('.urp-tile-link[data-action="demo"]')).toHaveAttribute("href", /cDWf1t08lkQ/);
    await expect(page.locator('.urp-tile-link[data-action="github"]')).toHaveAttribute("href", "https://github.com/007U5H4R/urja");
    await expect(page.locator('.urp-btn[data-action="live"]')).toBeVisible();
    await expect(page.locator("main iframe")).toHaveCount(0);
    await page.getByRole("button", { name: /^Play / }).first().click();
    await expect(page.locator('main iframe[src*="youtube-nocookie.com/embed/bZbUP3BhXKs"]')).toHaveCount(1);
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    for (const row of study.evidence) await expect(page.locator("#evidence-drawer")).toContainText(row.title);
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching art, crisp (>= 2x its rendered width)`, async ({ page, noOverflow }) => {
      await page.goto("/work/urja", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      const hero = page.locator(`.urp-hero-art img[data-theme-art="${theme}"]`);
      await hero.scrollIntoViewIfNeeded();
      await expect(hero).toBeVisible();
      await expect(page.locator(`.urp-hero-art img[data-theme-art="${other}"]`)).toBeHidden();
      await expect.poll(() => hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const m = await hero.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
      await band(page).scrollIntoViewIfNeeded();
      const img = band(page).locator(`img.cs-next-art-${theme}`);
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute("src", new RegExp(`teachspark-next-${theme}\\.webp$`));
      await expect(band(page).locator(`img.cs-next-art-${other}`)).toBeHidden();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const b = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(b.natural).toBeGreaterThanOrEqual(b.shown * 2);
      await noOverflow(page);
    });
  }

  test("band art is painted on the band's exact surface colour in both themes", async ({ page }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      await band(page).scrollIntoViewIfNeeded();
      await expect.poll(() => band(page).locator(`img.cs-next-art-${theme}`).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const r = await band(page).evaluate(async (el, t) => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 1;
        const ctx = cv.getContext("2d", { willReadFrequently: true })!;
        const rgb = (css: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1); return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)); };
        const probe = document.createElement("i");
        probe.style.color = getComputedStyle(el).backgroundImage.replace(/^linear-gradient\(/, "").split(/,(?![^(]*\))/)[0]!.trim();
        document.body.appendChild(probe);
        const surface = rgb(getComputedStyle(probe).color);
        probe.remove();
        const img = el.querySelector(`img.cs-next-art-${t}`) as HTMLImageElement;
        await img.decode();
        const big = document.createElement("canvas");
        big.width = img.naturalWidth; big.height = img.naturalHeight;
        const g = big.getContext("2d", { willReadFrequently: true })!;
        g.drawImage(img, 0, 0);
        const px = (x: number, y: number) => Array.from(g.getImageData(x, y, 1, 1).data.slice(0, 3));
        return { surface, corners: [px(40, 40), px(img.naturalWidth - 40, 40), px(40, img.naturalHeight - 40), px(img.naturalWidth - 40, img.naturalHeight - 40)] };
      }, theme);
      for (const c of r.corners) expect(c, `${theme} art field vs band surface`).toEqual(r.surface);
    }
  });

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/urja", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await band(page).scrollIntoViewIfNeeded();
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("rest position: the last section ends >= 8 px above the next band at 375, 768 and 1440", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/urja", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(1200); // the scroll-driven slide-over settles
        const m = await page.evaluate(() => {
          const last = document.querySelector(".urp-sources .urp-meta")!.getBoundingClientRect();
          return { lastBottom: last.bottom, bandTop: document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect().top };
        });
        expect(m.bandTop - m.lastBottom, `${w}px ${theme}: gap between the last content and the band`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test("axe-clean in light and dark", async ({ page, axe }) => {
    await page.goto("/work/urja", { waitUntil: "load" });
    await setTheme(page, "light");
    await axe(page);
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/urja", { waitUntil: "load" });
    await page.locator(".urp-btn-primary").focus();
    expect(await page.locator(".urp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible without animation", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/urja", { waitUntil: "load" });
    for (const el of await page.locator(".urp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator("article.urp").evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    for (const [slug, root] of [["railcite", "article.rcp"], ["nuptis", "article.nup"], ["teachspark", "article.tsp"]] as const) {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await expect(page.locator(root)).toHaveCount(1);
      await expect(page.locator(".urp")).toHaveCount(0);
    }
  });
});
