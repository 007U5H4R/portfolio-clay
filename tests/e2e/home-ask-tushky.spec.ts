/**
 * home-ask-tushky.spec.ts (TKT-113, Tushar's Home Ask Tushky spec 2026-09-26; Design.md §11 Dev-64–69)
 * — the Home `section#ask` is a LAUNCHER for the right-side Ask Tushky drawer. It never answers inline:
 * typed text or a suggestion card opens the drawer, which asks that question as its first turn.
 *
 *   launch   typed text → drawer from the RIGHT, question auto-submitted, focus returns to the field
 *            each of the six cards → drawer opens and asks that card's question
 *            an empty send opens the empty drawer; focusing the field does not open it (Dev-64)
 *   layout   ≤ 850 px tall at 1440, 44/56 columns, stacks < 1024, single-column cards < 640,
 *            no horizontal overflow
 *   a11y     cards are real 44 px+ buttons, the input's aria-label, axe clean, reduced motion shows all
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { TUSHKY_SUGGESTIONS } from "@/components/ai/tushky-questions";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const section = (page: Page) => page.locator("section#ask");
const field = (page: Page) => page.locator("#ask-portfolio-input");
const drawer = (page: Page) => page.locator("dialog.ask-panel");
const cards = (page: Page) => section(page).getByRole("list", { name: "Suggested questions" }).getByRole("button");

async function gotoAsk(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await section(page).scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
}

async function expectAsked(page: Page, label: string) {
  const d = drawer(page);
  await expect(d).toBeVisible();
  await expect(d).toHaveAttribute("data-open", "");
  await expect(d.locator('[data-role="user"]')).toHaveCount(1);
  await expect(d.locator('[data-role="user"]').first()).toContainText(label);
  // The question is SUBMITTED, not just pre-filled: a sourced Tushky answer arrives.
  await expect(d.locator('[data-role="tushky"][data-msg="answer"]')).toHaveCount(1, { timeout: 5_000 });
  await expect(d.getByRole("list", { name: "Sources" })).toBeVisible();
}

/** The drawer settles against the right edge (the 420 ms open slide must finish first). */
async function expectDrawerOnRight(page: Page) {
  const w = width(page);
  const paper = drawer(page).locator(".tk-paper");
  await expect
    .poll(async () => {
      const b = (await paper.boundingBox())!;
      return Math.round(b.x + b.width);
    })
    .toBe(w);
  const box = (await paper.boundingBox())!;
  if (w >= 768) expect(box.width).toBeLessThan(w * 0.6); // a side drawer, the page visible on its left
}

async function closeDrawer(page: Page) {
  await page.keyboard.press("Escape");
  await expect(drawer(page)).not.toHaveAttribute("open", "");
}

test.describe("home ask tushky", () => {
  test("copy: Ask Tushky heading, subtitle, the one grounding line; the old inline copy is gone", async ({ page }) => {
    test.skip(width(page) !== 1440, "copy checked once at w1440");
    await gotoAsk(page);
    const s = section(page);
    await expect(s.getByRole("heading", { level: 2 })).toHaveText("Ask Tushky");
    await expect(s.locator(".hat-eyebrow")).toHaveText("Ask");
    await expect(s.locator(".hat-subtitle")).toHaveText("Tushar’s Portfolio Assistant");
    await expect(s.locator(".hat-lead")).toHaveText(
      "Ask anything about Tushar’s work, projects, experience, skills, product thinking, and learnings. Answers are grounded only in this portfolio.",
    );
    await expect(s.getByText(/grounded only in this portfolio/)).toHaveCount(1);
    await expect(s.getByText(/Ask my portfolio|no live AI|nothing generated/)).toHaveCount(0);
    await expect(s.locator(".hat-callout")).toContainText("That’s Tushky!");
    await expect(s.locator(".hat-sticky")).toContainText("I sniff through Tushar’s work so you don’t have to.");
    await expect(s.getByRole("img", { name: /^Tushky, the golden retriever/ })).toBeVisible();
    await expect(field(page)).toHaveAttribute("placeholder", "Ask Tushky anything about Tushar...");
    await expect(cards(page).locator(".hat-card-text")).toHaveText(TUSHKY_SUGGESTIONS.map((q) => q.label));
  });

  test("@EVAL-012 typed text opens the drawer from the RIGHT and asks it there; focus returns to the field", {
    tag: ["@EVAL-012", "@EVAL-007"],
  }, async ({ page }) => {
    await gotoAsk(page);
    const url = page.url();
    await field(page).fill("What products has Tushar built?");
    await field(page).press("Enter");
    await expectAsked(page, "What products has Tushar built?");
    // Never answers inline, never navigates.
    await expect(section(page).getByRole("list", { name: "Sources" })).toHaveCount(0);
    expect(page.url()).toBe(url);
    // The drawer sits against the right edge (full width below 768).
    await expectDrawerOnRight(page);
    await closeDrawer(page);
    await expect(field(page)).toBeFocused();
    await expect(field(page)).toHaveValue("");
  });

  test("@EVAL-012 the send button submits the typed text too", { tag: "@EVAL-012" }, async ({ page }) => {
    test.skip(width(page) !== 1440, "send path checked once at w1440");
    await gotoAsk(page);
    await field(page).fill("What are his strongest skills?");
    await section(page).getByRole("button", { name: "Ask Tushky" }).click();
    await expectAsked(page, "What are his strongest skills?");
  });

  test("@EVAL-012 each suggestion card opens the drawer and asks that question", { tag: "@EVAL-012" }, async ({ page }) => {
    test.skip(width(page) !== 1440 && width(page) !== 390, "all six at w1440; one at w390");
    await gotoAsk(page);
    const n = width(page) === 1440 ? TUSHKY_SUGGESTIONS.length : 1;
    for (let i = 0; i < n; i++) {
      const card = cards(page).nth(i);
      await card.click();
      await expectAsked(page, TUSHKY_SUGGESTIONS[i]!.label);
      await closeDrawer(page);
      await expect(card).toBeFocused();
    }
  });

  test("spec §24: the hero \"✦ Ask Tushky\" CTA opens the drawer from the RIGHT; focus returns to it; #ask stays its fallback", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    const cta = page.locator(".hero-cta-row").getByRole("link", { name: "Ask Tushky" });
    await expect(cta).toHaveAttribute("href", "#ask"); // no-JS fallback
    await expect(cta).toHaveAttribute("aria-haspopup", "dialog");
    await cta.click();
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page)).toHaveAttribute("data-open", "");
    expect(page.url()).not.toMatch(/#ask$/); // opened, did not scroll away
    await expectDrawerOnRight(page);
    await expect(drawer(page).locator('[data-role="user"]')).toHaveCount(0); // empty state, nothing asked
    await closeDrawer(page);
    await expect(cta).toBeFocused();
  });

  test("an empty send opens the empty drawer; focusing the field does not open it (Dev-64)", async ({ page }) => {
    test.skip(width(page) !== 1440, "checked once at w1440");
    await gotoAsk(page);
    await field(page).focus();
    await page.waitForTimeout(300);
    await expect(drawer(page)).toHaveCount(0); // the lazy drawer is not even mounted
    await field(page).press("Enter");
    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).locator('[data-role="user"]')).toHaveCount(0);
    await expect(drawer(page).getByRole("list", { name: "Suggested questions" })).toBeVisible();
  });

  test("layout: one composed frame ≤ 850 px at 1440, left 42–46% / right 54–58%", async ({ page }) => {
    test.skip(width(page) !== 1440, "desktop composition measured at w1440");
    await gotoAsk(page);
    const s = (await section(page).boundingBox())!;
    expect(s.height).toBeLessThanOrEqual(850);
    const left = (await page.locator(".hat-left").boundingBox())!;
    const right = (await page.locator(".hat-panel").boundingBox())!;
    const total = left.width + right.width;
    expect(left.width / total).toBeGreaterThanOrEqual(0.42);
    expect(left.width / total).toBeLessThanOrEqual(0.46);
    expect(right.x).toBeGreaterThan(left.x + left.width - 1);
    // Tushky is prominent but not dominating (spec §5: 220–300 px on desktop).
    const dog = (await page.locator(".hat-dog").boundingBox())!;
    expect(dog.height).toBeGreaterThanOrEqual(220);
    expect(dog.height).toBeLessThanOrEqual(300);
    // Cards: 2 columns × 3 rows, 72–84 px tall.
    const boxes = await cards(page).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
    expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(2);
    for (const b of boxes) {
      expect(b.height).toBeGreaterThanOrEqual(72);
      expect(b.height).toBeLessThanOrEqual(84);
    }
  });

  test("@EVAL-008 responsive: stacks below 1024, single-column cards below 640 and at 1024–1199, no horizontal overflow", {
    tag: "@EVAL-008",
  }, async ({ page }) => {
    await gotoAsk(page);
    const w = width(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const s = (await section(page).boundingBox())!;
    expect(Math.ceil(s.width)).toBeLessThanOrEqual(w);
    const title = (await section(page).getByRole("heading", { level: 2 }).boundingBox())!;
    const dog = (await page.locator(".hat-dog").boundingBox())!;
    const panel = (await page.locator(".hat-panel").boundingBox())!;
    expect(panel.x + panel.width).toBeLessThanOrEqual(w + 0.5);
    const xs = new Set(await cards(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().x))));
    if (w < 1024) {
      expect(title.y).toBeLessThan(dog.y);
      expect(dog.y + dog.height).toBeLessThanOrEqual(panel.y + 1); // title → Tushky → notebook
    }
    if (w < 640) {
      expect(xs.size).toBe(1);
      expect(dog.height).toBeGreaterThanOrEqual(120);
      expect(dog.height).toBeLessThanOrEqual(160);
      const composer = (await page.locator(".hat-composer").boundingBox())!;
      expect(composer.width).toBeGreaterThan(panel.width * 0.75); // full-width composer
    } else if (w >= 1024 && w < 1200) {
      expect(xs.size).toBe(1); // the 2-column desktop panel is too narrow for 2 × 3 here (Dev-68)
    } else {
      expect(xs.size).toBe(2);
    }
  });

  test("@EVAL-008 suggestions are real buttons and every control meets 44 px; input label", { tag: "@EVAL-008" }, async ({
    page,
  }) => {
    await gotoAsk(page);
    await expect(cards(page)).toHaveCount(6);
    for (const tag of await cards(page).evaluateAll((els) => els.map((e) => `${e.tagName}:${e.getAttribute("type")}`))) {
      expect(tag).toBe("BUTTON:button");
    }
    await expect(field(page)).toHaveAttribute("aria-label", "Ask Tushky anything about Tushar");
    await expect(page.getByLabel("Ask Tushky anything about Tushar")).toHaveCount(1);
    await expect(async () => {
      const controls: Locator = section(page).locator("a[href], button, input");
      const small: string[] = [];
      for (const el of await controls.all()) {
        const b = await el.boundingBox();
        if (b && (Math.round(b.width) < 44 || Math.round(b.height) < 44)) small.push(`${await el.getAttribute("class")} ${b.width}×${b.height}`);
      }
      expect(small).toEqual([]);
    }).toPass({ timeout: 6_000 });
  });

  test("@EVAL-007 keyboard: cards take focus with the visible rust ring and open on Enter", { tag: "@EVAL-007" }, async ({ page }) => {
    test.skip(width(page) !== 1440, "keyboard path at a desktop width");
    await gotoAsk(page);
    await field(page).focus();
    await page.keyboard.press("Tab"); // send
    await page.keyboard.press("Tab"); // first card
    const first = cards(page).first();
    await expect(first).toBeFocused();
    const outline = await first.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Enter");
    await expectAsked(page, TUSHKY_SUGGESTIONS[0]!.label);
  });

  test("@EVAL-006 the Ask Tushky section is axe-clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await gotoAsk(page);
    await page.waitForTimeout(1_200); // entrance settled
    await axe(page, { include: "#ask" });
  });

  test("@EVAL-010 reduced motion: everything is visible at once, nothing offset", { tag: "@EVAL-010" }, async ({
    page,
    withReducedMotion,
  }) => {
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" }); // NOT scrolled: no entrance may be pending
    const states = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#ask .hat-intro > *, #ask .hat-in-dog, #ask .hat-in-note, #ask .hat-in-panel, #ask .hat-in-card")).map(
        (el) => {
          const cs = getComputedStyle(el);
          return { opacity: cs.opacity, translate: cs.translate, scale: cs.scale };
        },
      ),
    );
    expect(states.length).toBeGreaterThan(10);
    for (const s of states) expect(s).toEqual({ opacity: "1", translate: "none", scale: "none" });
  });

  test("motion: the entrance plays once on viewport entry and settles fully visible", async ({ page }) => {
    test.skip(width(page) !== 1440, "entrance checked once at w1440");
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator(".hat-grid")).toHaveAttribute("data-armed", "");
    await expect(page.locator(".hat-grid")).not.toHaveAttribute("data-in", "");
    expect(await page.locator(".hat-panel").evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await section(page).scrollIntoViewIfNeeded();
    await expect(page.locator(".hat-grid")).toHaveAttribute("data-in", "");
    await expect.poll(() => page.locator(".hat-in-card").last().evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect.poll(() => page.locator(".hat-panel").evaluate((el) => getComputedStyle(el).translate)).toBe("none");
  });
});
