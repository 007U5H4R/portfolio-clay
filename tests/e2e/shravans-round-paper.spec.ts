/**
 * shravans-round-paper.spec.ts (TASK-283) — The Shravan's Round paper-craft layout (components/case-study/shravans-round):
 *   - hero, five numbered sections in order, links and the next band; legacy anchors resolve;
 *   - the mockup claims the record cannot support are not on the page (100% voice, instant, Gemini, real AI avatar);
 *   - the real screenshots are the record's own files, unmodified;
 *   - the live product, pitch/demo videos and the evidence drawer are still there (GitHub stays hidden: the repo is private);
 *   - light/dark show the matching hero and Urja band art, crisp (natural width >= 2x rendered), no horizontal overflow at 375 / 414 / 768 / 1440;
 *   - axe-clean in both themes; reduced motion; the last section rests clear of the next band's torn-lag overlap; other layouts untouched.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";

const study = getCaseStudy("shravans-round")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;
const BAND = 'section[aria-label="Next project"]';

test.describe("shravan's round paper layout", () => {
  test("structure: hero, five numbered sections in order, links, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    await expect(page.locator("article.srp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp, article.nup, article.bvp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Shravan's Round");
    await expect(page.locator(".srp-kicker")).toHaveText("SR-01 · LIVE · TEAM BUILD");
    await expect(page.locator(".srp-tagline")).toHaveText("He listens. Then he asks the follow-up.");
    expect(await page.locator(".srp-sec .srp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".srp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["product", "round", "decisions", "system", "evidence"]);
    expect(await page.locator(".srp-sec h2").allTextContents()).toEqual([
      "A real interview. A real score card.",
      "One answer shapes the next question.",
      "A face earns attention. Listening earns trust.",
      "From spoken answer to useful follow-up.",
      "Live and free. Usage numbers aren’t claimed yet.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`), anchor).toBeAttached();
    for (const href of await page.locator(".srp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".srp-nav-link")).toHaveCount(5);
    await expect(page.locator(".srp-promise-t")).toHaveText(["Real PM cases", "Voice interview", "Adaptive follow-ups", "Free score card"]);
    await expect(page.locator(".srp-node-t")).toHaveText(["Start", "Answer", "Follow-up", "Review"]);
    await expect(page.locator(".srp-option-t")).toHaveCount(3);
    await expect(page.locator(".srp-flow-k")).toHaveCount(5);
    await expect(page.locator(".srp-chips li")).toHaveText(["Next.js", "Vercel", "Supabase Postgres", "pgvector"]);
    await expect(page.locator(".srp-ev h3")).toHaveText(["What is verified", "What isn’t measured here"]);
    await expect(page.locator(`${BAND} a`)).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("honest facts: the record's numbers and gaps; no unsupported mockup claims", async ({ page }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    const trial = study.hero.proofs.find((p) => p.kind === "measured")!;
    await expect(page.locator(".srp-trial-v")).toHaveText(trial.value);
    await expect(page.locator(".srp-trial .csx-badge")).toContainText("Measured");
    await expect(page.locator(".srp-trial")).toContainText("2026-09-10");
    await expect(page.locator(".srp-lede")).toContainText("20-minute");
    // the record's first gap (no usage data) is the "isn't measured" column; its second (head and shoulders only) is the known limit
    await expect(page.locator(".srp-gaps")).toContainText("Usage and completion rates");
    await expect(page.locator(".srp-limit")).toContainText(sec("outcome").gaps[1]!);
    const text = await page.locator("article.srp").innerText();
    expect(text).not.toMatch(/100%|instant|gemini|real ai avatar|improve product thinking|\busers\b.*\b\d{2,}\b/i);
    expect(text).not.toMatch(/urja|bhakti|railcite|teachspark|tushky|cubicle|tegaki|nuptis|token ?toli|pratyasa|dino arcade|campfire|slag/i);
  });

  test("real screenshots: the record's own files, unmodified", async ({ page }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    const poster = (study.hero.media as { poster: { src: string; alt: string } }).poster;
    await expect(page.locator(`.srp-frame img[src="${poster.src}"]`)).toHaveAttribute("alt", poster.alt);
    for (const shot of sec("product").shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.srp-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".srp-cap-t")).toHaveText(["Leave with specific feedback", "Start with a real PM case", "The same round on a phone"]);
  });

  test("next band: Urja, with its real link and the fleet art", async ({ page }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    const band = page.locator(BAND);
    await expect(band.locator("h2")).toContainText("Urja");
    await expect(band.getByRole("link", { name: /^Next project: Urja/ })).toHaveAttribute("href", "/work/urja");
    await expect(band.locator(".cs-next-line")).toHaveText("Truck fleet management dashboard");
    await expect(band).toHaveAttribute("data-tone", "cream");
    await expect(band.locator("img.cs-next-art-light")).toHaveAttribute("src", /shravans-round\/art\/urja-next-light\.webp/);
  });

  test("links: live product, pitch and demo videos and the evidence drawer are present; the private repo is not linked", async ({ page }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    for (const action of ["live", "pitch", "demo"]) await expect(page.locator(`.srp-tile-link[data-action="${action}"]`)).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('.srp-tile-link[data-action="live"]')).toHaveAttribute("href", "https://shravans-round.vercel.app");
    await expect(page.locator('.srp-tile-link[data-action="pitch"]')).toHaveAttribute("href", /0cYat1u7lJE/);
    await expect(page.locator('.srp-tile-link[data-action="demo"]')).toHaveAttribute("href", /lwXHhCh1NEE/);
    await expect(page.locator('.srp-btn[data-action="live"]')).toHaveAttribute("href", "https://shravans-round.vercel.app");
    await expect(page.locator('.srp-tile-link[data-action="github"]')).toHaveCount(0);
    await expect(page.locator('.srp-btn[data-action="see-product"]')).toHaveAttribute("href", "#product");
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching hero and band art, crisp`, async ({ page, noOverflow }) => {
      await page.goto("/work/shravans-round", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      const img = page.locator(`.srp-hero-art img[data-theme-art="${theme}"]`);
      await expect(img).toBeVisible();
      await expect(page.locator(`.srp-hero-art img[data-theme-art="${other}"]`)).toBeHidden();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
      const band = page.locator(`${BAND} img.cs-next-art-${theme}`);
      await page.locator(BAND).scrollIntoViewIfNeeded();
      await expect(band).toBeVisible();
      await expect.poll(() => band.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
      const b = await band.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
      expect(b.natural).toBeGreaterThanOrEqual(b.shown * 2);
      await noOverflow(page);
    });
  }

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/shravans-round", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("rest position: after scrolling to the end the last section ends at least 8px above the band", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/shravans-round", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
        await page.waitForTimeout(300);
        const gap = await page.evaluate((band) => {
          const last = document.querySelector(".srp-sources .srp-meta") as HTMLElement;
          const sheet = document.querySelector(band) as HTMLElement;
          return sheet.getBoundingClientRect().top - last.getBoundingClientRect().bottom;
        }, BAND);
        expect(gap, `${w}px ${theme}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  test("axe-clean in light and dark", async ({ page, axe }) => {
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    await setTheme(page, "light");
    await axe(page);
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    await page.locator(".srp-btn-primary").focus();
    expect(await page.locator(".srp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible and the waveform is still", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/shravans-round", { waitUntil: "load" });
    for (const el of await page.locator(".srp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator(".srp-wave i").first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator(".srp")).toHaveCount(0);
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await expect(page.locator("article.nup")).toHaveCount(1);
    await expect(page.locator(".srp")).toHaveCount(0);
  });
});
