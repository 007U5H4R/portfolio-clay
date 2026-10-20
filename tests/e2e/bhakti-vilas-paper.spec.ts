/**
 * bhakti-vilas-paper.spec.ts (TASK-276) — the Bhakti Vilas origami paper-craft layout (components/case-study/bhakti-vilas):
 *   - hero, five numbered sections in order (the research note sits inside the problem), sources and the next band exist;
 *   - numbers come from the record (hero proofs, survey sizes, console errors, gaps); nothing from the mockup's invented stats;
 *   - real screenshots are the record's own files;
 *   - only the next-project band names another product, and it depicts Pratyasa;
 *   - live product, pitch and demo links and the evidence drawer are still there;
 *   - art is crisp: every decorative image is at least 2x its rendered width at 1440 and 1920;
 *   - light/dark render the matching art with no horizontal overflow at 375 / 414 / 768 / 1440.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import type { CaseSection } from "@/data/schema";
import { getCaseStudy } from "@/data/case-studies";
import { projects } from "@/data/projects";
import { formatAsOf } from "@/lib/format";

const study = getCaseStudy("bhakti-vilas")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
type Of<K extends CaseSection["kind"]> = Extract<CaseSection, { kind: K }>;
const sec = <K extends CaseSection["kind"]>(kind: K) => study.sections.find((s): s is Of<K> => s.kind === kind)!;
/** Every other personal build's name: none may appear in the page body (only the next-project band names one). */
const OTHER_PRODUCTS = projects.filter((p) => p.category === "personal" && p.slug !== "bhakti-vilas").map((p) => p.name);

test.describe("bhakti vilas paper layout", () => {
  test("structure: hero, five numbered sections in order, sources, next band; anchors resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    await expect(page.locator("article.bvp")).toHaveCount(1);
    await expect(page.locator("article.csx, article.rcp, article.tsp, article.vlp")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bhakti Vilas");
    await expect(page.locator(".bvp-kicker")).toHaveText("BV-01 · LIVE PROTOTYPE · MOCK DATA · TEAM");
    await expect(page.locator(".bvp-tagline")).toHaveText("Devotion as behavioural health.");
    await expect(page.locator(".bvp-tags li")).toHaveText(["Elder wellness", "Guided routines", "Community"]);
    expect(await page.locator(".bvp-sec .bvp-num").allTextContents()).toEqual(["01", "02", "03", "04", "05"]);
    expect(await page.locator(".bvp-sec").evaluateAll((els) => els.map((e) => e.id))).toEqual(["problem", "decisions", "product", "evidence", "learnings"]);
    expect(await page.locator(".bvp-sec h2").allTextContents()).toEqual([
      "Elder care has a shortage of clarity, not of products.",
      "Make devotion the doorway to wellbeing.",
      "A working prototype, not just a concept.",
      "Research shaped the experience. The prototype tested the flow.",
      "Honest framing is part of the design.",
    ]);
    for (const section of study.sections) {
      await expect(page.locator(`[id="${section.id}"]`)).toBeAttached();
      for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    }
    for (const href of await page.locator(".bvp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator(".bvp-nav-link")).toHaveCount(5);
    await expect(page.locator(".bvp-pstep-k")).toHaveText(["Daily practice", "Community", "Personal rhythm", "Progress"]);
    await expect(page.locator(".bvp-card h3")).toHaveText(["Show the gaps", "Don’t dress devotion as a clinic", "Credit the team clearly"]);
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers match the record and nothing from the mockup's invented stats appears", async ({ page }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    const tiles = page.locator(".bvp-metric");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      await expect(tiles.nth(i).locator(".bvp-metric-value")).toHaveText(proof.value);
      await expect(tiles.nth(i).locator(".csx-badge")).toContainText(proof.kind === "measured" ? "Measured" : "Structural");
      if (proof.note) await expect(tiles.nth(i).locator(".bvp-metric-note")).toHaveText(proof.note);
    }
    const outcome = sec("outcome");
    const stats = page.locator(".bvp-stat");
    await expect(stats).toHaveCount(outcome.proofs.length);
    for (const [i, proof] of outcome.proofs.entries()) {
      await expect(stats.nth(i).locator(".bvp-stat-value")).toHaveText(proof.value);
      await expect(stats.nth(i).locator(".bvp-stat-label")).toHaveText(proof.label);
      await expect(stats.nth(i).locator(".csx-badge")).toContainText("Measured");
      if (proof.asOf) await expect(stats.nth(i).locator(".bvp-date")).toHaveText(formatAsOf(proof.asOf));
    }
    // TASK-298: the findings list starts at the insight; no survey-size line, intro paragraph or gaps box
    const research = sec("research");
    const panel = page.locator('.bvp-panel[data-panel="research"]');
    await expect(panel.locator(".bvp-plist li").first()).toHaveText(research.insight!.text);
    await expect(page.locator("article.bvp")).not.toContainText(research.intro!);
    await expect(page.locator("article.bvp")).not.toContainText("fieldwork");
    await expect(page.locator(".bvp-chip").first()).toHaveText("Team research");
    await expect(page.locator(".bvp-gaps")).toHaveCount(0);
    // the quote is the record's, labelled as the brief's wording, not a participant
    await expect(page.locator(".bvp-quote blockquote")).toHaveText(`“${sec("problem").quote!.text}”`);
    await expect(page.locator(".bvp-quote figcaption")).toHaveText("From the Case Study 2 brief");
    // unsupported mockup numbers and claims are absent
    await expect(page.locator("article.bvp")).not.toContainText(/1 in 3|\b70%|\b4\/5\b|\b3x\b|\b89%|felt more connected|higher intent/i);
  });

  test("real screenshots: the record's own files, in the hero, the gallery and the funnel", async ({ page }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    const product = sec("product");
    for (const shot of product.shots) await expect(page.locator(`article.bvp img[src="${shot.src}"]`)).toHaveAttribute("alt", shot.alt);
    const media = study.hero.media as { src: string };
    await expect(page.locator(`.bvp-hero-screen img[src="${media.src}"]`)).toBeAttached();
    await expect(page.locator(".bvp-shot")).toHaveCount(3);
    await expect(page.locator(".bvp-cap")).toHaveText(["Home · Bhajan circles, with a buddy to keep the habit", "Community · Member stories and the next circle", "Profile · Streaks and levels (mock member)"]);
    await expect(page.locator(".bvp-funnel .bvp-qualifier")).toHaveText("Staged-reveal funnel · directional estimates, not measured");
    // screenshots are served at their own pixels (never recompressed or redrawn): natural size equals the record's
    for (const shot of product.shots) {
      const img = page.locator(`article.bvp img[src="${shot.src}"]`);
      await img.scrollIntoViewIfNeeded(); // lazy below the fold
      const nat = await img.evaluate((img: HTMLImageElement) => img.decode().then(() => [img.naturalWidth, img.naturalHeight]));
      expect(nat, shot.src).toEqual([shot.width, shot.height]);
    }
  });

  test("only the next-project band names another product, and it is Pratyasa's biosensor", async ({ page }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    const body = await page.evaluate(() => {
      const article = document.querySelector("article.bvp")!;
      const bits: string[] = [article.textContent ?? ""];
      for (const el of article.querySelectorAll("[alt],[aria-label],[title],img,a")) for (const attr of ["alt", "aria-label", "title", "src", "href"]) bits.push(el.getAttribute(attr) ?? "");
      return bits.join("\n");
    });
    for (const name of OTHER_PRODUCTS) expect(body, name).not.toMatch(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
    expect(await page.locator("#evidence-drawer").textContent()).not.toMatch(/pratyasa/i);
    const band = page.locator('section[aria-label="Next project"]');
    await expect(band.locator(".bvp-next-eyebrow")).toHaveText("Next project");
    await expect(band.locator(".bvp-next-h")).toContainText("Pratyasa");
    await expect(band.locator(".bvp-next-line")).toHaveText("A patent, on the record");
    await expect(band.getByRole("link", { name: /^Next project: Pratyasa/ })).toHaveAttribute("href", "/work/pratyasa");
    await expect(band).not.toContainText(/clinically approved|FDA|deployed in|diagnos/i);
    // footer art is the biosensor scene (not the devotional diorama), decorative
    for (const img of await band.locator("img:not(.pf-logo-img)").all()) {
      await expect(img).toHaveAttribute("alt", "");
      expect(await img.getAttribute("src")).toMatch(/\/bhakti-vilas\/art\/footer-(light|dark)\.webp$/);
    }
  });

  test("links: live product, pitch and demo videos and the evidence drawer are present", async ({ page }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    await expect(page.locator('.bvp-tile-link[data-action="live"]')).toHaveAttribute("href", "https://bhakti-vilas.vercel.app/");
    await expect(page.locator('.bvp-tile-link[data-action="pitch"]')).toHaveAttribute("href", /6-o7uUh-ewY/);
    await expect(page.locator('.bvp-tile-link[data-action="demo"]')).toHaveAttribute("href", /ytD0nxWMRWU/);
    await expect(page.locator('.bvp-btn[data-action="live"]')).toHaveText(/Explore the live prototype/);
    await expect(page.locator('.bvp-btn[data-action="live-proto"]')).toHaveAttribute("href", "https://bhakti-vilas.vercel.app/");
    await expect(page.locator(".bvp-types li")).toHaveText(["Research", "PRD", "Build ledger", "Feedback", "Readme"]);
    await page.getByRole("button", { name: /View all evidence/ }).click();
    await expect(page.locator("#evidence-drawer")).toBeVisible();
    await expect(page.locator("#evidence-drawer")).toContainText("Mentor Q&A");
    await page.keyboard.press("Escape");
    await expect(page.locator("#evidence-drawer")).toBeHidden();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the matching art, crisp`, async ({ page, noOverflow }) => {
      test.skip(width(page) !== 1440, "art sizing is measured at 1440 and 1920 once");
      await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      await expect(page.locator(`.bvp-hero-scene img[data-theme-art="${theme}"]`)).toBeVisible();
      await expect(page.locator(`.bvp-hero-scene img[data-theme-art="${other}"]`)).toBeHidden();
      await expect(page.locator(".bvp-hero-screen img")).toBeVisible();
      await page.locator(".bvp-next").scrollIntoViewIfNeeded();
      await expect(page.locator(`.bvp-next-art img[data-theme-art="${theme}"]`)).toBeVisible();
      await noOverflow(page);
      // every visible decorative image carries at least 2x the pixels it is drawn at, at 1440 and at 1920
      for (const w of [1440, 1920]) {
        await page.setViewportSize({ width: w, height: 1000 });
        for (const img of await page.locator(`.bvp img[data-theme-art="${theme}"], .bvp-next img[data-theme-art="${theme}"]`).all()) {
          await img.scrollIntoViewIfNeeded();
          const [natural, rendered, src] = await img.evaluate(async (el: HTMLImageElement) => {
            await el.decode();
            const box = el.getBoundingClientRect();
            // the footer image is clipped by its wrapper; its drawn width is still its CSS width
            return [el.naturalWidth, box.width, el.getAttribute("src")] as const;
          });
          expect(natural, `${src} at ${w}`).toBeGreaterThanOrEqual(2 * rendered);
        }
      }
    });
  }

  test("no horizontal overflow at 375, 414, 768 and 1440 in light and dark", async ({ page }) => {
    test.skip(width(page) !== 1440, "sweeps its own widths once");
    for (const w of [375, 414, 768, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${w}px ${theme}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("axe-clean in dark as well", async ({ page, axe }) => {
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("keyboard focus is visible on the hero action and the source tiles", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    for (const sel of [".bvp-btn-primary", ".bvp-tile-link", ".bvp-nav-link"]) {
      await page.locator(sel).first().focus();
      expect(await page.locator(sel).first().evaluate((el) => getComputedStyle(el).outlineStyle), sel).toBe("solid");
    }
  });

  test("reduced motion: sections are visible and the art does not move", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/bhakti-vilas", { waitUntil: "load" });
    for (const el of await page.locator(".bvp [data-cs-reveal]").all()) expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(await page.locator(".bvp-hero-scene img[data-theme-art]").first().evaluate((n) => getComputedStyle(n).animationName)).toBe("none");
  });

  test("other layouts are untouched", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    for (const [slug, sel] of [["railcite", "article.rcp"], ["velora", "article.vlp"]] as const) {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await expect(page.locator(sel)).toHaveCount(1);
      await expect(page.locator(".bvp")).toHaveCount(0);
    }
  });
});
