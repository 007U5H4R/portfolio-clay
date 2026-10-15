/**
 * about-research-cards.spec.ts (TASK-209) — the Research & Intellectual cards are self-contained: the
 * detached publication/patent reference block is gone and its content lives inside the three cards.
 * Every project (w390/w768/w1024/w1440) runs the bounds checks; the 320 px overflow check resizes itself.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { papers, patent, researchDisclaimer } from "@/data/credentials";

// Reduced motion: every Reveal shows at once, so the checks measure the settled layout (entrance timing
// is covered in about.spec.ts).
test.use({ reducedMotion: "reduce" });

async function openResearch(page: Page) {
  await page.goto("/about", { waitUntil: "load" });
  await page.locator("#research").scrollIntoViewIfNeeded();
  for (const el of await page.locator("#research .rvx-rv").all()) {
    await expect.poll(() => el.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
  }
}

const card = (page: Page, id: string) => page.locator(`#research .rvx-slot[data-artifact="${id}"]`);

test("TASK-209: the detached reference block is gone — nothing but the head and the three cards", async ({ page }) => {
  await openResearch(page);
  await expect(page.locator("#research .rvx-foot")).toHaveCount(0);
  await expect(page.locator("#research > .rvx-papers")).toHaveCount(0);
  await expect(page.locator("#research > p")).toHaveCount(0);
  // the only .rvx-papers list sits inside the publications card
  await expect(page.locator("#research .rvx-papers")).toHaveCount(1);
  await expect(card(page, "publications").locator(".rvx-papers")).toHaveCount(1);
  // every direct child of #research is the head or the card list
  const kids = await page.locator("#research").evaluate((el) => [...el.children].map((c) => c.className));
  expect(kids).toEqual(["rvx-head", "rvx-artifacts"]);
});

test("TASK-209: each card carries its own links, summary and disclaimer", async ({ page }) => {
  await openResearch(page);
  const [langmuir, softMatter] = papers;
  const nano = card(page, "nanotech");
  await expect(nano).toContainText("Research in materials, sensing and nanoscale systems.");
  await expect(nano).toContainText(langmuir!.title);
  await expect(nano.locator(`a[href="${langmuir!.doiHref}"]`)).toBeVisible();

  const pat = card(page, "patent");
  await expect(pat).toContainText(patent.number);
  await expect(pat).toContainText(patent.title);
  await expect(pat.locator(`a[href="${patent.href}"]`)).toBeVisible();
  await expect(pat.locator(".rvx-disclaimer")).toHaveText(researchDisclaimer);
  await expect(pat.locator(".rvx-disclaimer")).toBeVisible();

  const pubs = card(page, "publications");
  await expect(pubs.locator(".rvx-papers > li")).toHaveCount(2);
  for (const paper of [langmuir!, softMatter!]) {
    await expect(pubs).toContainText(paper.title);
    await expect(pubs).toContainText(String(paper.year));
    await expect(pubs.locator(`a[href="${paper.doiHref}"]`)).toBeVisible();
  }
  // each link is keyboard-focusable
  for (const link of await page.locator("#research .rvx-artifact a").all()) {
    await link.focus();
    await expect(link).toBeFocused();
  }
});

test("TASK-209: every word and panel stays inside its card; the disclaimer and second paper are not clipped", async ({ page }) => {
  await openResearch(page);
  const report = await page.evaluate(() => {
    const out: string[] = [];
    for (const slot of document.querySelectorAll<HTMLElement>("#research .rvx-slot")) {
      const cardEl = slot.querySelector<HTMLElement>(".rvx-artifact")!;
      const box = cardEl.getBoundingClientRect();
      const id = slot.dataset.artifact;
      // cards are rotated < 1deg, so allow 2 px
      for (const el of cardEl.querySelectorAll<HTMLElement>(".rvx-art, .rvx-panel, .rvx-panel *, .rvx-title, .rvx-text, .rvx-meta")) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const rect = el.children.length === 0 || el.matches(".rvx-art, .rvx-panel") ? el.getBoundingClientRect() : r.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (rect.left < box.left - 2 || rect.right > box.right + 2 || rect.top < box.top - 2 || rect.bottom > box.bottom + 2) {
          out.push(`${id}: ${el.className || el.tagName} outside card`);
        }
      }
      for (const panel of cardEl.querySelectorAll<HTMLElement>(".rvx-panel")) {
        if (panel.scrollWidth > panel.clientWidth + 1 || panel.scrollHeight > panel.clientHeight + 1) out.push(`${id}: panel clipped`);
      }
    }
    // neighbouring cards never overlap
    const boxes = [...document.querySelectorAll<HTMLElement>("#research .rvx-artifact")].map((c) => c.getBoundingClientRect());
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        if (a.left < b.right - 4 && b.left < a.right - 4 && a.top < b.bottom - 4 && b.top < a.bottom - 4) out.push(`cards ${i}/${j} overlap`);
      }
    }
    return out;
  });
  expect(report).toEqual([]);
});

test("TASK-209: at 320 and 390 the research section has no horizontal overflow and nothing is clipped", async ({ page }) => {
  for (const w of [320, 390]) {
    await page.setViewportSize({ width: w, height: 700 });
    await openResearch(page);
    const m = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sec: Math.max(0, ...[...document.querySelectorAll("#research-values *")].map((e) => Math.round(e.getBoundingClientRect().right - window.innerWidth))),
    }));
    expect(m.doc, `doc overflow @${w}`).toBeLessThanOrEqual(0);
    expect(m.sec, `section overflow @${w}`).toBeLessThanOrEqual(0);
    await expect(card(page, "patent").locator(".rvx-disclaimer")).toBeVisible();
    await expect(card(page, "publications").locator(".rvx-papers > li").nth(1)).toBeVisible();
  }
});

test("TASK-209: in both themes the panels stand apart from their card", async ({ page }) => {
  await openResearch(page);
  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const bg = await page.locator("#research .rvx-panel").first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const cardBg = await page.locator("#research .rvx-artifact").first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, theme).not.toBe(cardBg);
    await expect(page.locator("#research .rvx-doi").first()).toBeVisible();
  }
});

test.describe("normal motion", () => {
  test.use({ reducedMotion: "no-preference" });

  // TASK-209 review: a card that never reveals for a phone user who scrolls normally would be a real bug. Each card
  // (the tallest is ~550 px at 390) must reach Reveal's 0.2 IntersectionObserver threshold and settle fully visible.
  test("TASK-209: scrolling card by card, all three reveal and settle (opacity 1, no transform)", async ({ page }) => {
    test.slow(); // one page load per height; a loaded CI box needs the headroom
    for (const h of [700, 844]) {
      await page.setViewportSize({ width: page.viewportSize()!.width, height: h });
      await page.goto("/about", { waitUntil: "load" });
      await page.waitForSelector("#research .rvx-rv.reveal", { state: "attached" }); // hydrated: observers attached
      const slots = await page.locator("#research .rvx-rv").all();
      expect(slots).toHaveLength(3);
      for (const slot of slots) {
        // a user stepping down the page: bring the card in from below in ~1/3-viewport steps
        await slot.evaluate(async (el) => {
          const top = el.getBoundingClientRect().top + window.scrollY;
          for (let y = top - window.innerHeight; y <= top - window.innerHeight * 0.3; y += window.innerHeight * 0.25) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
        });
        await expect(slot, `reveal @${h}`).toHaveAttribute("data-revealed", "");
        await expect.poll(() => slot.evaluate((el) => `${getComputedStyle(el).opacity}|${getComputedStyle(el).transform}`)).toBe("1|none");
      }
    }
  });
});
