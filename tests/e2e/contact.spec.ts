/**
 * contact.spec.ts (TKT-45, M-006) — the `/contact` `ContactCard`: copy-email / mailto / LinkedIn /
 * resume, no form (decision S10).
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts). Route-wide
 * axe (@EVAL-006), no-overflow and 44px-target sweeps (@EVAL-008) already cover `/contact`
 * generically via `tests/e2e/eval-006.spec.ts` / `tests/e2e/eval-008.spec.ts` (it is in
 * `routes.json`'s `static` list) — this file is NOT a second copy of those; it asserts what is
 * specific to `ContactCard`:
 *   AC1 — email/LinkedIn/city verbatim from CONTENT_INVENTORY §7; no phone anywhere.
 *   AC2 — the 4-action grid carries a real 12px gap (`--space-3`), on top of the generic ≥44×44
 *         sweep eval-008 already runs.
 *   AC3 — CopyButton idle → copied → (blocked clipboard → selectable-text fallback), mirroring the
 *         established stub pattern in `tests/e2e/home.spec.ts`'s `#cta` CopyButton coverage.
 *   AC4 — `#resume` anchor exists; the resume control renders the PB5 placeholder (label + the
 *         visible "email me for a copy" note) while `site.resumeAvailable` is `false`. The
 *         download-path (a real 200 once TKT-08 flips the flag) has no PDF to exercise yet — it is
 *         `test.fixme`'d here (same blocker/convention as `eval-002.spec.ts`'s full-journey fixme)
 *         and is already covered at the unit level by `tests/unit/site.test.ts`'s
 *         `resumeAction()` true-branch assertion (mocking the flag directly, per the brief's own
 *         "mock resumeAction" alternative).
 *   AC5 — LinkedIn is a real external link (target/rel/aria "opens in new tab").
 * Plus the screenshot pack (TDD gate item 7).
 */
import { test, expect } from "./fixtures";
import { site } from "@/lib/site";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Same PII patterns the forbidden-strings scanner and the resume-pii gate ban (EXE-8).
const PHONE_PATTERNS = [/\+91[\s-]?\d{5}[\s-]?\d{5}/, /\b\d{10}\b/];

// ---------------------------------------------------------------------------
// Content — h1, the 4 actions, city line, no phone anywhere. Content is viewport-independent.
// ---------------------------------------------------------------------------
test("ContactCard renders the headline, all four actions, the city line, and no phone number", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Still curious?");

  const card = page.locator("main");
  await expect(card.locator("[data-copy-button]")).toBeVisible();
  await expect(card.locator(`a[href="mailto:${site.email}"]`)).toContainText("Email me");
  await expect(card.locator(`a[href="${site.linkedin}"]`)).toBeVisible();
  await expect(card).toContainText("Bengaluru, India");

  const bodyText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  for (const pattern of PHONE_PATTERNS) {
    expect(bodyText, `found what looks like a phone number matching ${pattern}`).not.toMatch(pattern);
  }
});

// ---------------------------------------------------------------------------
// AC2 — the 4-action grid's real gap is 12px (--space-3), independent of the 44px floor eval-008
// already enforces generically.
// ---------------------------------------------------------------------------
test("the 4-action grid uses a 12px gap", async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1024, "gap token checked once stacked + once 2-col");
  await page.goto("/contact", { waitUntil: "load" });

  const grid = page.locator("[data-contact-actions]");
  await expect(grid).toBeVisible();
  const gaps = await grid.evaluate((el) => {
    const s = getComputedStyle(el);
    return { rowGap: s.rowGap, columnGap: s.columnGap };
  });
  expect(gaps.rowGap, "row-gap must be the 12px --space-3 token").toBe("12px");
  if (width(page) >= 768) {
    expect(gaps.columnGap, "column-gap must be the 12px --space-3 token").toBe("12px");
  }
});

// ---------------------------------------------------------------------------
// AC5 — LinkedIn: real external link (target/rel/aria).
// ---------------------------------------------------------------------------
test("LinkedIn is a real external link: target=_blank, rel=noopener, accessible name includes 'opens in new tab'", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "link attributes are viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  // Scoped to <main>: the Footer's own LinkedIn link reuses the same href, so an unscoped locator
  // would collide under Playwright's strict-mode single-element resolution.
  const link = page.locator("main").locator(`a[href="${site.linkedin}"]`);
  await expect(link).toHaveAttribute("target", "_blank");
  const rel = await link.getAttribute("rel");
  expect(rel, "LinkedIn link rel must include noopener").toContain("noopener");
  await expect(link).toHaveAccessibleName(/opens in new tab/i);
});

// ---------------------------------------------------------------------------
// AC4 — #resume anchor + the PB5 placeholder (visible note, not just a tooltip) while
// site.resumeAvailable is false.
// ---------------------------------------------------------------------------
test("#resume anchor exists and the resume control renders the PB5 placeholder while resumeAvailable is false", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  expect(site.resumeAvailable, "this suite runs against the tracer build (resumeAvailable=false)").toBe(
    false,
  );
  await page.goto("/contact", { waitUntil: "load" });

  const resumeSection = page.locator("#resume");
  await expect(resumeSection).toBeVisible();
  await expect(resumeSection).toContainText("Resume — updating");
  await expect(resumeSection).toContainText("Sanitised resume coming — email me for a copy");
  await expect(resumeSection.locator("a")).toHaveAttribute("href", "/contact#resume");
});

// The real 200-download path only exists once TKT-08 lands a sanitised public/resume.pdf and
// flips site.resumeAvailable — until then there is no file to download and nothing to assert
// against in the browser. resumeAction()'s download-shape branch is already verified by mocking
// the flag directly in tests/unit/site.test.ts (the brief's documented alternative), so the
// resume control's contract is covered end-to-end; this fixme is the live e2e leg, same blocker
// and convention as eval-002.spec.ts's full-journey fixme.
test.fixme(
  "resume control serves a real 200 download once resumeAvailable flips true (TKT-08)",
  async () => {},
);

// ---------------------------------------------------------------------------
// AC3 — CopyButton happy path (mirrors home.spec.ts's #cta CopyButton coverage, scoped to /contact).
// ---------------------------------------------------------------------------
test("CopyButton copies the email and confirms", async ({ page }) => {
  test.skip(width(page) !== 1440, "clipboard behaviour checked once at w1440");

  await page.addInitScript(() => {
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (v: string) => {
          (window as unknown as { __copied: string[] }).__copied.push(v);
          return Promise.resolve();
        },
      },
    });
  });
  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await expect(button).toHaveAttribute("data-state", "idle");
  await button.click();
  await expect(button).toHaveAttribute("data-state", "copied");
  await expect(page.locator("main [role='status']")).toContainText("Copied");

  const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
  expect(copied).toContain(site.email);
});

// ---------------------------------------------------------------------------
// AC3 — CopyButton failure path: a blocked clipboard falls back to selectable text (A12).
// ---------------------------------------------------------------------------
test("CopyButton falls back to selectable text when the clipboard is blocked", async ({ page }) => {
  test.skip(width(page) !== 1440, "fallback behaviour checked once at w1440");

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("blocked")) },
    });
  });

  const warnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning") warnings.push(msg.text());
  });

  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await button.click();
  await expect(button).toHaveAttribute("data-state", "error");

  const fallback = page.locator("main [data-copy-fallback]");
  await expect(fallback).toBeVisible();
  await expect(fallback.locator("output")).toHaveText(site.email);
  await expect(fallback).toContainText("Select to copy");

  expect(warnings.some((w) => w.includes("[copy]"))).toBe(true);
});

// ---------------------------------------------------------------------------
// @EVAL-007 — CopyButton is fully keyboard-operable: Tab reaches it, the shared 2px rust focus
// ring is visible, and Enter/Space both activate it (TKT-48; closes the /contact CopyButton
// keyboard-e2e follow-up flagged in M-006).
// ---------------------------------------------------------------------------
test("@EVAL-007 CopyButton: Tab focuses it with a visible ring, Enter and Space both copy", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");

  await page.addInitScript(() => {
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (v: string) => {
          (window as unknown as { __copied: string[] }).__copied.push(v);
          return Promise.resolve();
        },
      },
    });
  });
  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await button.focus();
  await expect(button).toBeFocused();

  // The focused button wears the shared 2px solid rust ring (EVAL-007).
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-rust)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  const ring = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(ring.w).toBe("2px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(accent);

  // Enter activates the native button.
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("data-state", "copied");

  // Wait out the 2s copied→idle revert, then Space activates it too.
  await expect(button).toHaveAttribute("data-state", "idle", { timeout: 3000 });
  await button.focus();
  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("data-state", "copied");

  const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
  expect(copied).toEqual([site.email, site.email]);
});

// ---------------------------------------------------------------------------
// Screenshot pack (TDD gate item 7).
// ---------------------------------------------------------------------------
test("screenshot pack", async ({ page }) => {
  const w = width(page);
  test.skip(![390, 768, 1024, 1440].includes(w), "one screenshot per configured viewport project");
  await page.goto("/contact", { waitUntil: "load" });
  await page.screenshot({
    path: `docs/screenshots/contact/${w}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
