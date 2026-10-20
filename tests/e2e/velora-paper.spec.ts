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
import screens from "../../public/media/case-studies/velora/art/hero-screen.json";

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
    expect(tag!.y - (img!.y + img!.height)).toBeLessThan(80); // under the caption line, in the same figcaption (TASK-296)
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

  // TASK-296: every screenshot sits inside its device screen, whole width, never cropped or stretched.
  type Box = { x: number; y: number; w: number; h: number };
  const waitDecoded = (page: Page, selector: string) =>
    page.locator(selector).evaluateAll((els) =>
      Promise.all(
        (els as HTMLImageElement[]).map(async (el) => {
          for (let i = 0; i < 100 && !(el.complete && el.naturalWidth > 0); i++) await new Promise((r) => setTimeout(r, 50));
          await el.decode();
        }),
      ),
    );
  const measure = (img: Element, screen: Element) => {
    const i = img.getBoundingClientRect();
    const s = screen.getBoundingClientRect();
    const el = img as HTMLImageElement;
    // untransformed layout size: the shot frames are rotated, which inflates getBoundingClientRect
    return { lay: { w: el.offsetWidth, h: el.offsetHeight }, layScreen: { w: (screen as HTMLElement).offsetWidth }, img: { x: i.x, y: i.y, w: i.width, h: i.height }, screen: { x: s.x, y: s.y, w: s.width, h: s.height }, nat: { w: el.naturalWidth, h: el.naturalHeight } };
  };
  const within = (inner: Box, outer: Box, tol = 1) => inner.x >= outer.x - tol && inner.y >= outer.y - tol && inner.x + inner.w <= outer.x + outer.w + tol && inner.y + inner.h <= outer.y + outer.h + tol;

  for (const vw of [375, 1440]) {
    for (const theme of ["light", "dark"] as const) {
      test(`phone mockups: screenshot fills its screen, uncropped and unstretched, captions clear (${vw}, ${theme})`, async ({ page }) => {
        test.skip(width(page) !== 1440, "sets its own viewport; runs once");
        await page.setViewportSize({ width: vw, height: 900 });
        await page.goto("/work/velora", { waitUntil: "load" });
        await setTheme(page, theme);
        const shots = page.locator(".vlp-shot");
        await expect(shots).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
          await shots.nth(i).scrollIntoViewIfNeeded();
          await waitDecoded(page, `.vlp-shot[data-i="${i + 1}"] img`);
        }
        const frames = await page.locator(".vlp-shot").evaluateAll((els, fn) => {
          const m = new Function("img", "screen", `return (${fn})(img, screen)`) as (a: Element, b: Element) => unknown;
          return els.map((el) => {
            const r = m(el.querySelector(".vlp-screen img")!, el.querySelector(".vlp-screen")!) as Record<string, unknown>;
            const c = el.querySelector(".vlp-cap")!.getBoundingClientRect();
            const f = el.querySelector(".vlp-frame")!.getBoundingClientRect();
            const sec = el.closest(".vlp-sec")!.getBoundingClientRect();
            return { ...r, cap: { x: c.x, y: c.y, w: c.width, h: c.height }, frame: { x: f.x, y: f.y, w: f.width, h: f.height }, sec: { x: sec.x, y: sec.y, w: sec.width, h: sec.height } };
          });
        }, measure.toString());
        type M = { lay: { w: number; h: number }; layScreen: { w: number }; img: Box; screen: Box; nat: { w: number; h: number }; cap: Box; frame: Box; sec: Box };
        for (const [i, m] of (frames as M[]).entries()) {
          const tag = `shot ${i + 1}`;
          expect(within(m.img, m.screen), `${tag}: img inside screen`).toBe(true);
          expect(Math.abs(m.lay.w / m.lay.h / (m.nat.w / m.nat.h) - 1), `${tag}: aspect ratio`).toBeLessThan(0.01);
          expect(m.lay.w, `${tag}: no horizontal clipping`).toBeGreaterThanOrEqual(m.layScreen.w - 2);
          expect(m.lay.w, `${tag}: not wider than screen`).toBeLessThanOrEqual(m.layScreen.w + 1);
          expect(within(m.cap, { x: 0, y: m.sec.y, w: vw, h: m.sec.h }, 0.5), `${tag}: caption inside viewport and section`).toBe(true);
          expect(m.cap.y, `${tag}: caption below its device`).toBeGreaterThanOrEqual(m.frame.y + m.frame.h - 3);
          const next = (frames as M[])[i + 1];
          if (next && next.frame.y < m.cap.y + m.cap.h) expect(m.cap.x + m.cap.w, `${tag}: caption clear of next device`).toBeLessThanOrEqual(next.frame.x + 1); // side by side
          if (next && next.frame.y >= m.cap.y + m.cap.h - 1) expect(next.frame.y, `${tag}: caption above next device`).toBeGreaterThanOrEqual(m.cap.y + m.cap.h - 3); // stacked
        }
      });

      test(`hero tablet: screenshot sits in the art's screen opening, never cropped or stretched (${vw}, ${theme})`, async ({ page }) => {
        test.skip(width(page) !== 1440, "sets its own viewport; runs once");
        await page.setViewportSize({ width: vw, height: 900 });
        await page.goto("/work/velora", { waitUntil: "load" });
        await setTheme(page, theme);
        await waitDecoded(page, ".vlp-hero-screen img");
        const m = await page.locator(".vlp-hero-screen").evaluate((screen, fn) => {
          const mm = new Function("img", "screen", `return (${fn})(img, screen)`) as (a: Element, b: Element) => unknown;
          return mm(screen.querySelector("img")!, screen);
        }, measure.toString());
        const { img, screen, nat } = m as { img: Box; screen: Box; nat: { w: number; h: number } };
        // object-fit: contain inside the box, so the painted picture is the contained rect
        const scale = Math.min(screen.w / nat.w, screen.h / nat.h);
        const painted = { w: nat.w * scale, h: nat.h * scale };
        expect(within(img, screen), "img element inside the opening").toBe(true);
        expect(painted.w, "whole width shows (within the dark art's 6% wider opening)").toBeGreaterThanOrEqual(screen.w * 0.9 - 2);
        expect(Math.abs(painted.h - screen.h) <= 2 || Math.abs(painted.w - screen.w) <= 2, "touches the opening on at least one axis").toBe(true);
        // the opening sits where the art's blank screen is: inside the scene, with the art's measured box
        const scene = await page.locator(".vlp-hero-scene").boundingBox();
        const sc = screens[theme];
        const box = { l: sc.left, t: sc.top, w: sc.width, h: sc.height };
        expect(Math.abs(screen.x - (scene!.x + (scene!.width * box.l) / 100))).toBeLessThanOrEqual(1);
        expect(Math.abs(screen.y - (scene!.y + (scene!.height * box.t) / 100))).toBeLessThanOrEqual(1.5);
        expect(Math.abs(screen.w - (scene!.width * box.w) / 100)).toBeLessThanOrEqual(1);
        expect(Math.abs(screen.h - (scene!.height * box.h) / 100)).toBeLessThanOrEqual(1.5);
        // TASK-296: the opening is slightly trapezoidal; none of the art's blank grey screen may show at the corners
        const shot = await page.screenshot({ clip: { x: screen.x - 1, y: screen.y - 1, width: screen.w + 2, height: screen.h + 2 } });
        const corners = await page.evaluate(async ({ b64, w, h }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const g = c.getContext("2d")!;
          g.drawImage(img, 0, 0);
          const k = img.naturalWidth / w;
          const at = (x: number, y: number) => Array.from(g.getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data.slice(0, 3));
          const i = 3;
          return [at(i, i), at(w - i, i), at(i, h - i), at(w - i, h - i)];
        }, { b64: shot.toString("base64"), w: screen.w + 2, h: screen.h + 2 });
        for (const [n, [r, g, b]] of corners.entries()) {
          const blankScreen = (r! + g! + b!) / 3 > 150 && Math.abs(r! - b!) < 12 && Math.abs(r! - g!) < 12;
          expect(blankScreen, `corner ${n} shows the art's blank screen (${r},${g},${b})`).toBe(false);
        }
      });
    }
  }
});
