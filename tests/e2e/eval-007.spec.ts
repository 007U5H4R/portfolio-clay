/**
 * eval-007.spec.ts (technical-plan.md §B S09.02, `@EVAL-007`) — keyboard operability: every flow
 * completes with the keyboard alone, focus is always visible (2px rust ring), and focus returns
 * to the trigger after a dialog closes. Live for the primary nav at every width (a single row ≥ 1440,
 * the scrollable tab strip below — TASK-112 removed the MobileMenu). The Ask panel, FilterTabs, ExperienceTimeline,
 * OverviewToggle and CopyButton flows are fixme'd until their tickets (TKT-10/16/17/45).
 * ShowTheThinking's keyboard flow is real now, in thinking.spec.ts (TKT-21).
 */
import { test, expect } from "./fixtures";
import { navItems } from "@/lib/nav";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-007 header: every tab stop shows the 2px rust focus ring", { tag: "@EVAL-007" }, async ({
  page,
  keyboardOnly,
}) => {
  await page.goto("/", { waitUntil: "load" });
  // Skip link → brand → every nav tab → "Let's connect →" pill → Ask ghost: all opt into
  // .focus-ring (TKT-71). Every width since TASK-112 (tabs, no hamburger).
  await keyboardOnly(page, { tabs: 2 + navItems.length + 2 });
});

/**
 * TASK-112 (Tushar 2026-09-27: tabs, no hamburger) — the < 1440 tab strip by keyboard alone: Tab from
 * load reaches the skip link, the brand, then every tab in order; each one is fully inside the strip's
 * visible box when focused (an off-screen tab scrolls into view) and wears the rust ring; the page
 * never scrolls horizontally. There is no menu button to reach.
 */
test("@EVAL-007 tab strip: Tab reaches every tab in order and scrolls an off-screen tab into view", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "the strip overflows (and must scroll to focus) at 390");
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator("header").getByRole("button", { name: /menu/i })).toHaveCount(0);

  const strip = page.locator('header nav[aria-label="Primary"]');
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="#main"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Tushar Pathak — home" })).toBeFocused();
  for (const item of navItems) {
    await page.keyboard.press("Tab");
    const tab = strip.locator(`a[href="${item.href}"]`);
    await expect(tab).toBeFocused();
    // Poll: the reveal is a smooth scroll unless reduced motion is on.
    await expect
      .poll(() =>
        tab.evaluate((el) => {
          const t = el.getBoundingClientRect();
          const s = el.closest("nav")!.getBoundingClientRect();
          return t.left >= s.left - 0.5 && t.right <= s.right + 0.5;
        }),
      )
      .toBe(true);
    const ring = await tab.evaluate((el) => {
      const cs = getComputedStyle(el);
      return `${cs.outlineStyle} ${cs.outlineWidth}`;
    });
    expect(ring, `${item.label} focus ring`).toBe("solid 2px");
  }
  expect(await strip.evaluate((el) => el.scrollLeft), "focusing the last tab scrolled the strip").toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  await page.keyboard.press("Tab");
  await expect(page.locator("header").getByRole("link", { name: /Let's connect/ })).toBeFocused();
});

const focusInsidePanel = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const d = document.querySelector("dialog.ask-panel");
    return !!(d && document.activeElement && d.contains(document.activeElement));
  });

/**
 * Whether focus has escaped the modal to an interactive control on the inert page (header / main /
 * footer). A native modal <dialog> traps focus but wraps through `document.body` at the last→first
 * boundary — a benign, non-interactive stop — so the trap contract is "focus never reaches a page
 * control", not "focus is inside the dialog on literally every keystroke".
 */
const focusEscapedToPage = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) return false;
    return ["header", "#main", "footer"].some((sel) => document.querySelector(sel)?.contains(a));
  });

test("@EVAL-007 keyboard: AskPanel opens, traps focus, answers, Esc closes and restores focus (desktop)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) < 1024, "the full trap + answer sweep runs at desktop widths (the 390 focus return is below)");
  await page.goto("/", { waitUntil: "load" });

  // The 44 px icon-only ghost (TKT-71, S21) — named by its aria-label, not visible text.
  const trigger = page.locator("header").getByRole("button", { name: "Ask AI" });
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const panel = page.locator("dialog.ask-panel");
  await expect(panel).toBeVisible();
  expect(await focusInsidePanel(page), "focus must move into the panel on open").toBeTruthy();

  // Focus is trapped: 20 Tabs never reach a control on the inert page (native showModal + inert
  // background), and focus is repeatedly back inside the panel (proving the wrap, not an escape).
  let landedInside = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(await focusEscapedToPage(page), `Tab ${i + 1} reached a page control`).toBeFalsy();
    if (await focusInsidePanel(page)) landedInside = true;
  }
  expect(landedInside, "focus must cycle back inside the panel").toBeTruthy();

  // Full keyboard answer path (TKT-104 r2 chat): type into the composer and submit. Focus stays in
  // the composer (the answer is announced by the `role="log"` conversation), and Shift+Tab walks
  // back through the follow-ups to the answer's source links.
  await panel.locator("#ask-panel-input").focus();
  await page.keyboard.type("What products have you built?");
  await page.keyboard.press("Enter");
  const sources = panel.getByRole("list", { name: "Sources" }).getByRole("link");
  await expect(sources.first()).toBeVisible();
  await expect(panel.locator("#ask-panel-input")).toBeFocused();
  let reachedSource = false;
  for (let i = 0; i < 8 && !reachedSource; i++) {
    await page.keyboard.press("Shift+Tab");
    reachedSource = await sources.evaluateAll((links) => links.includes(document.activeElement as HTMLAnchorElement));
  }
  expect(reachedSource, "a source link is reachable by keyboard from the composer").toBe(true);

  // Esc closes and returns focus to the trigger (EVAL-007 hard requirement).
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("@EVAL-007 keyboard: AskPanel Esc closes and restores focus to the header Ask trigger (390)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "the phone-width check of the header Ask ghost (TASK-112: no MobileMenu row)");
  await page.goto("/", { waitUntil: "load" });

  const askRow = page.locator("header").getByRole("button", { name: "Ask AI" });
  await askRow.focus();
  await page.keyboard.press("Enter");

  const panel = page.locator("dialog.ask-panel");
  await expect(panel).toBeVisible();
  expect(await focusInsidePanel(page), "focus must move into the panel on open").toBeTruthy();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  // Focus returns to the exact trigger that opened the panel.
  await expect(askRow).toBeFocused();
});

// FilterTabs roving tabindex, ExperienceTimeline, OverviewToggle, CopyButton — keyboard scripts
// land with their components. ShowTheThinking's real keyboard test now lives in thinking.spec.ts
// (TKT-21).
test.fixme("@EVAL-007 keyboard: FilterTabs / ExperienceTimeline / CopyButton (TKT-16/17/45)", {
  tag: "@EVAL-007",
}, async () => {});

// TASK-130: the deep-dive keyboard flow retired with the §7.3 template; the one-pager's keyboard
// contract (the evidence drawer: focus in, Tab trapped, Esc, focus return) is in case-study-system.spec.ts.
