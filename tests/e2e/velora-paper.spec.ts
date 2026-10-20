/**
 * velora-paper.spec.ts (TASK-273) — the Velora origami paper-craft layout (components/case-study/velora):
 *   - hero, six numbered sections in order, sources and the next band exist; navigator targets and legacy anchors resolve;
 *   - numbers come from the record (hero proofs, three evidence stats, "Not measured"); real screenshots are the record's files;
 *   - the first product is named ONLY in the next-project band (visible text, alt text, aria-labels, image names);
 *   - caveats sit right next to what they qualify: the trust score and the secondary-research time strip;
 *   - product, pitch/demo video, GitHub links and the evidence drawer are still there;
 *   - light/dark render the matching art with no horizontal overflow at 375 / 414 / 768 / 1440;
 *   - other case studies keep their own layouts.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";
import { formatAsOf } from "@/lib/format";

const study = getCaseStudy("velora")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;

test.describe("velora paper layout", () => {
  test("structure: hero, six numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    await expect(page.locator("article.vlp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Velora");
    await expect(page.locator(".vlp-kicker")).toHaveText("VL-01 · LIVE · MOCK DATA");
    await expect(page.locator(".vlp-tagline")).toHaveText("Where brands and makers find their fit.");
    expect(await page.locator(".vlp-sec .vlp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05", "06"]);
    expect(await page.locator(".vlp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(study.sections.map((s) => s.id));
    expect(await page.locator(".vlp-sec h2").allTextContents()).toEqual([
      "Supplier trust doesn’t travel.",
      "The wait is between hand-offs.",
      "Keep the insight. Change the bet.",
      "One trust profile. Every step.",
      "Learnings worth keeping.",
      "A working prototype. Not traction.",
    ]);
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    for (const href of await page.locator(".vlp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".vlp-nav-link")).toHaveCount(6);
    await expect(page.locator(".vlp-step")).toHaveText(["Referrals", "Directories", "Unverified trust", "Repeated legwork"]);
    await expect(page.locator(".vlp-flow-step")).toHaveText(["Brand ↔ Manufacturer", "Match", "RFP", "Bid"]);
    await expect(page.locator(".vlp-card h3")).toHaveText(["Kill without flinching", "Find the hand-offs", "Label what’s real"]);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers come from the record: hero proofs, evidence stats, and the honest gaps", async ({ page }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    const tiles = page.locator(".vlp-metric");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      await expect(tiles.nth(i).locator(".vlp-metric-value")).toHaveText(proof.value);
      await expect(tiles.nth(i).locator(".csx-badge")).toContainText(proof.kind === "measured" ? "Measured" : "Structural");
      if (proof.asOf) await expect(tiles.nth(i).locator(".vlp-date")).toHaveText(formatAsOf(proof.asOf));
    }
    await expect(tiles.locator(".vlp-metric-label")).toHaveText(["directions explored", "first hypothesis retired", "Velora prototype built"]);
    const outcome = sec("outcome");
    const stats = page.locator(".vlp-stat");
    await expect(stats).toHaveCount(outcome.proofs.length);
    for (const [i, proof] of outcome.proofs.entries()) {
      await expect(stats.nth(i).locator(".vlp-stat-value")).toHaveText(proof.value);
      await expect(stats.nth(i).locator(".vlp-stat-label")).toHaveText(proof.label);
      if (proof.asOf) await expect(stats.nth(i).locator(".vlp-date")).toHaveText(formatAsOf(proof.asOf));
      if (proof.note) await expect(stats.nth(i).locator(".vlp-metric-note")).toHaveText(proof.note);
    }
    await expect(page.locator(".vlp-gaps h3")).toHaveText("Not measured");
    for (const gap of outcome.gaps) await expect(page.locator(".vlp-gaps")).toContainText(gap);
    // no traction claims
    await expect(page.locator("article.vlp")).not.toContainText(/\b(50\+|90%|users signed|pilot customers)\b/i);
  });

  test("real screenshots: the record's own files, in the product section and the hero device", async ({ page }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    const product = sec("product");
    for (const shot of product.shots as { src: string; alt: string }[]) {
      await expect(page.locator(`.vlp-frame img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    }
    await expect(page.locator(".vlp-shot figcaption > span:not(.vlp-score)")).toHaveText(["Manufacturer trust profile", "Brand RFPs", "Bids, sorted by match"]);
    const media = study.hero.media as { src: string };
    await expect(page.locator(`.vlp-hero-screen img[src="${media.src}"]`)).toBeAttached();
  });

  test("the first product is named only in the next-project band", async ({ page }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    const outside = await page.evaluate(() => {
      const article = document.querySelector("article.vlp")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) {
        for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      }
      return bits.join("\n");
    });
    expect(outside).not.toMatch(/nuptis/i);
    expect(outside).not.toMatch(/wedding/i);
    const band = page.locator('section[aria-label="Next project"]');
    await expect(band.locator(".vlp-next-eyebrow")).toHaveText("Next project");
    await expect(band.locator(".vlp-next-h")).toContainText("Nuptis");
    await expect(band.getByRole("link", { name: /^Next project: Nuptis/ })).toHaveAttribute("href", "/work/nuptis");
    // footer art is the wedding vendor-operations scene, decorative
    for (const img of await band.locator("img:not(.pf-logo-img)").all()) {
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.getAttribute("src")).toMatch(/\/velora\/art\/footer-(light|dark)\.webp$/);
    }
    // the evidence drawer (a closed dialog) must not name it either
    expect(await page.locator("#evidence-drawer").textContent()).not.toMatch(/nuptis/i);
  });

  test("caveats sit next to what they qualify", async ({ page }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    // trust score: the caveat is in the same figure, directly under the trust-profile screenshot
    const shot = page.locator(".vlp-shot").first();
    await expect(shot.locator("img")).toHaveAttribute("src", "/media/case-studies/velora/trust-profile.webp");
    await expect(shot.locator('[data-testid="score-caveat"]')).toHaveText("Trust score · authored prototype data");
    const [img, tag] = await Promise.all([shot.locator("img").boundingBox(), shot.locator('[data-testid="score-caveat"]').boundingBox()]);
    expect(tag!.y - (img!.y + img!.height)).toBeLessThan(40);
    // secondary research: the qualifier is in the strip's own figure, right under the bar
    const strip = page.locator(".vlp-strip");
    await expect(strip.locator(".vlp-qualifier")).toHaveText("Secondary research · verify before external use");
    await expect(strip.locator(".vlp-strip-legend li")).toHaveText(["Active work · under 10%", "Waiting between hand-offs"]);
    const [bar, qual] = await Promise.all([strip.locator(".vlp-strip-bar").boundingBox(), strip.locator(".vlp-qualifier").boundingBox()]);
    expect(qual!.y - (bar!.y + bar!.height)).toBeLessThan(90);
  });

  test("links: live product, pitch and demo videos, GitHub and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    await expect(page.locator('.vlp-tile-link[data-action="live"]')).toHaveAttribute("href", "https://velora-nu-eight.vercel.app/");
    await expect(page.locator('.vlp-tile-link[data-action="github"]')).toHaveAttribute("href", "https://github.com/007U5H4R/velora");
    await expect(page.locator('.vlp-tile-link[data-action="pitch"]')).toHaveAttribute("href", /youtube\.com\/watch\?v=rz1C0hTz1mE|youtu\.be\/rz1C0hTz1mE/);
    await expect(page.locator('.vlp-tile-link[data-action="demo"]')).toHaveAttribute("href", /1BRXGdMqPEs/);
    await expect(page.locator('.vlp-btn[data-action="live"]')).toBeVisible();
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Velora PRD");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching art`, async ({ page, noOverflow }) => {
      await page.goto("/work/velora", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      await expect(page.locator(`.vlp-hero-scene img[data-theme-art="${theme}"]`)).toBeVisible();
      await expect(page.locator(`.vlp-hero-scene img[data-theme-art="${other}"]`)).toBeHidden();
      await expect(page.locator(".vlp-hero-screen img")).toBeVisible();
      await page.locator(".vlp-next").scrollIntoViewIfNeeded();
      await expect(page.locator(`.vlp-next-art img[data-theme-art="${theme}"]`)).toBeVisible();
      await noOverflow(page);
    });
  }

  // TASK-273: the art is cut out with a real alpha matte and shipped at >= 2x its rendered width (crisp on retina), at 1440 and 1920.
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    test(`art is at least 2x its rendered width at ${viewport.width}`, async ({ page }) => {
      test.skip(width(page) < 1024, "desktop-only sizing check");
      await page.setViewportSize(viewport);
      await page.goto("/work/velora", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const imgs = page.locator(`.vlp-hero-scene img[data-theme-art="${theme}"], .vlp-step img, .vlp-next-art img[data-theme-art="${theme}"]`);
        const count = await imgs.count();
        expect(count).toBeGreaterThanOrEqual(6);
        for (let i = 0; i < count; i++) {
          const img = imgs.nth(i);
          await img.scrollIntoViewIfNeeded();
          await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
          const { natural, rendered, src } = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, rendered: el.getBoundingClientRect().width, src: el.src }));
          expect(natural, `${theme} ${src}`).toBeGreaterThanOrEqual(2 * rendered);
        }
      }
    });
  }

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/velora", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("axe-clean in dark as well", async ({ page, axe }) => {
    await page.goto("/work/velora", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero actions", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/velora", { waitUntil: "load" });
    await page.locator(".vlp-btn-primary").focus();
    expect(await page.locator(".vlp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
  });

  test("reduced motion: sections are visible without animation", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/velora", { waitUntil: "load" });
    for (const el of await page.locator(".vlp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/railcite", { waitUntil: "load" });
    await expect(page.locator("article.rcp")).toHaveCount(1);
    await expect(page.locator(".vlp")).toHaveCount(0);
  });
});
