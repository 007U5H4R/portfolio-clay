/**
 * contact.spec.ts (TKT-45 → TSK-46 / TC-170) — `/contact` in paper: the opener copy + actions list
 * (`section#contact`), the postcard details section, and `CopyButton`'s idle / copied / error states.
 * No form (decision S10); only email + LinkedIn published (EXE-8).
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts). Route-wide
 * axe (@EVAL-006), the generic overflow / 44 px sweeps (@EVAL-008) and the decoration budget
 * (@EVAL-018) already cover `/contact` via `routes.json`; this file asserts what is specific to
 * the page (Design.md §7.8, §7.9, §3.3):
 *   TC-170.1 — copy → "Copied" (forest border) for 2 s → idle; the live region announces.
 *   TC-170.2 — blocked clipboard → "Copy failed" (rust border) + selectable `<output>` fallback.
 *   TC-170.3 — mailto / LinkedIn external / `#resume` = `resumeAction()`; location line only
 *              behind `site.showLocation` (default false — dispatch rule for M-009).
 *   TC-170.4 — no phone / DOB / street address in the route markup (PII_PATTERNS, EXE-8).
 *   TC-170.5 — postcard labels are valid `data-hand="label"` (≤ 3 words); values are Inter.
 *   TC-170.6 — unit counts opener 3 · details 3 at 390 and 1440; no overflow at 390. The §7.8
 *              taped portrait (max 420 px < 900) is superseded by TKT-95's full-bleed opener
 *              (EXE-18 / Dev-24) — covered by `scene-opener.spec.ts`, not re-asserted here.
 * Plus the @EVAL-007 keyboard path for `CopyButton` and the screenshot pack.
 */
import { test, expect } from "./fixtures";
import { resumeAction, site } from "@/lib/site";
import { PII_PATTERNS } from "../../scripts/forbidden-strings";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

/** Resolve a CSS colour token to the computed `rgb(...)` string the browser reports. */
async function tokenColor(page: import("@playwright/test").Page, token: string): Promise<string> {
  return page.evaluate((t) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${t})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }, token);
}

async function stubClipboard(page: import("@playwright/test").Page, mode: "resolve" | "reject") {
  await page.addInitScript((m) => {
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (v: string) => {
          if (m === "reject") return Promise.reject(new Error("blocked"));
          (window as unknown as { __copied: string[] }).__copied.push(v);
          return Promise.resolve();
        },
      },
    });
  }, mode);
}

// ---------------------------------------------------------------------------
// Content — h1, the four actions in order with their numerals, no form.
// ---------------------------------------------------------------------------
test("opener renders the headline and the four numbered actions, and no form", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const opener = page.locator("section#contact");
  await expect(opener.getByRole("heading", { level: 1 })).toHaveText("Still curious?");
  await expect(opener.locator(".contact-eyebrow")).toHaveText("Contact");

  const items = opener.locator("ul[data-contact-actions] > li");
  await expect(items).toHaveCount(4);
  await expect(items.locator(".contact-num")).toHaveText(["01", "02", "03", "04"]);
  // Numerals are decoration (the list already numbers itself for AT).
  for (const num of await items.locator(".contact-num").all()) {
    await expect(num).toHaveAttribute("aria-hidden", "true");
  }

  await expect(items.nth(0)).toContainText(site.email);
  await expect(items.nth(0).locator("[data-copy-button]")).toBeVisible();
  await expect(items.nth(1).locator(`a[href="mailto:${site.email}"]`)).toHaveText("Email me →");
  await expect(items.nth(2).locator(`a[href="${site.linkedin}"]`)).toBeVisible();
  await expect(items.nth(3)).toHaveAttribute("id", "resume");

  await expect(page.locator("main form")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// TC-170.3 — location line only behind site.showLocation (dispatch rule; default false).
// ---------------------------------------------------------------------------
test("'Bengaluru, India' renders only when site.showLocation is on", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const main = page.locator("main");
  if (site.showLocation) {
    await expect(main.locator(".contact-location")).toHaveText("Bengaluru, India");
  } else {
    await expect(main).not.toContainText("Bengaluru");
    await expect(main.locator(".contact-location")).toHaveCount(0);
  }
});

// ---------------------------------------------------------------------------
// TC-170.4 — PII: no phone / DOB / street address in the route's rendered text or markup (EXE-8).
// ---------------------------------------------------------------------------
test("no phone number, DOB or street address anywhere on /contact", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  const markup = await page.locator("main").innerHTML();
  for (const [name, re] of Object.entries(PII_PATTERNS)) {
    expect(text, `visible text matches the ${name} pattern`).not.toMatch(re);
    expect(markup, `main markup matches the ${name} pattern`).not.toMatch(re);
  }
  // Only the approved contact channels are linked from <main>.
  const hrefs = await page.locator("main a[href]").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  expect(hrefs.filter((h) => h?.startsWith("tel:"))).toEqual([]);
});

// ---------------------------------------------------------------------------
// LinkedIn: real external link (target/rel/aria) — actions row and postcard.
// ---------------------------------------------------------------------------
test("LinkedIn links are real external links: target=_blank, rel=noopener, 'opens in new tab'", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "link attributes are viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const links = page.locator("main").locator(`a[href="${site.linkedin}"]`);
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    expect(await link.getAttribute("rel"), "rel must include noopener").toContain("noopener");
    await expect(link).toHaveAccessibleName(/opens in new tab/i);
  }
});

// ---------------------------------------------------------------------------
// #resume = resumeAction() + the visible note while resumeAvailable is false (PB5).
// ---------------------------------------------------------------------------
test("#resume row renders resumeAction() and its visible note", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  expect(site.resumeAvailable, "this suite runs against the placeholder build (resumeAvailable=false)").toBe(
    false,
  );
  const resume = resumeAction();
  await page.goto("/contact", { waitUntil: "load" });

  const row = page.locator("#resume");
  await expect(row).toBeVisible();
  const control = row.locator("a");
  await expect(control).toHaveText(resume.label);
  await expect(control).toHaveAttribute("href", resume.href);
  await expect(row.locator(".contact-note")).toHaveText(resume.note ?? "");
});

// The real 200-download path only exists once TKT-08 lands a sanitised public/resume.pdf and flips
// site.resumeAvailable; resumeAction()'s download branch is covered in tests/unit/site.test.ts.
test.fixme(
  "resume control serves a real 200 download once resumeAvailable flips true (TKT-08)",
  async () => {},
);

// ---------------------------------------------------------------------------
// TC-170.1 — copied: forest border, announced, reverts to idle after 2 s.
// ---------------------------------------------------------------------------
test("CopyButton copies the email, shows 'Copied' with a forest border, then reverts", async ({ page }) => {
  test.skip(width(page) !== 1440, "clipboard behaviour checked once at w1440");
  await stubClipboard(page, "resolve");
  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await expect(button).toHaveAttribute("data-state", "idle");
  await expect(button).toHaveText("Copy");

  // TKT-97: timestamp every `data-state` flip IN THE PAGE (performance.now at click and at each
  // mutation), so the 2 s window is measured on the page's own clock. The old version slept a fixed
  // 1500 ms on the TEST side after several slow polls; under 2-worker CPU contention those polls ate
  // > 500 ms, the sleep overran the component's 2 s timer, and the "still copied" check read `idle`.
  await button.evaluate((el) => {
    const log: { state: string | null; t: number }[] = [];
    (window as unknown as { __copyLog: typeof log }).__copyLog = log;
    el.addEventListener("click", () => log.push({ state: "click", t: performance.now() }), { capture: true });
    new MutationObserver(() => log.push({ state: el.getAttribute("data-state"), t: performance.now() })).observe(
      el,
      { attributes: true, attributeFilter: ["data-state"] },
    );
  });
  await button.click();
  await expect(button).toHaveAttribute("data-state", "copied");
  await expect(button).toHaveText("Copied");
  await expect(page.locator("main span[role='status']")).toHaveText(`Copied ${site.email}`);

  const forest = await tokenColor(page, "--color-forest");
  // Poll: the border colour eases over 180 ms, so an immediate read lands mid-transition.
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(forest);

  const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
  expect(copied).toEqual([site.email]);

  // 2 s confirmation, then idle (not before ~1.5 s, not after ~3 s) — asserted on the in-page
  // timestamps, so test-side latency can no longer shift the window.
  await expect(button).toHaveAttribute("data-state", "idle", { timeout: 5000 });
  const log = await page.evaluate(
    () => (window as unknown as { __copyLog: { state: string | null; t: number }[] }).__copyLog,
  );
  expect(log.map((e) => e.state)).toEqual(["click", "copied", "idle"]);
  const [click, copiedAt, idleAt] = log.map((e) => e.t) as [number, number, number];
  expect(copiedAt - click, "copied should show promptly after the click").toBeLessThan(1500);
  const shown = idleAt - copiedAt;
  expect(shown, `'Copied' showed for ${Math.round(shown)} ms`).toBeGreaterThanOrEqual(1500);
  expect(shown, `'Copied' showed for ${Math.round(shown)} ms`).toBeLessThanOrEqual(3000);
});

// ---------------------------------------------------------------------------
// TC-170.2 — error: rust border + selectable <output> fallback (A12: never a dead end).
// ---------------------------------------------------------------------------
test("CopyButton shows 'Copy failed' and a selectable fallback when the clipboard is blocked", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "fallback behaviour checked once at w1440");
  await stubClipboard(page, "reject");

  const warnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning") warnings.push(msg.text());
  });

  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await button.click();
  await expect(button).toHaveAttribute("data-state", "error");
  await expect(button).toHaveText("Copy failed");

  const rust = await tokenColor(page, "--color-rust");
  // Poll: the border colour eases over 180 ms, so an immediate read lands mid-transition.
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(rust);

  const fallback = page.locator("main [data-copy-fallback]");
  await expect(fallback).toBeVisible();
  const output = fallback.locator("output");
  await expect(output).toHaveText(site.email);
  expect(await output.evaluate((el) => getComputedStyle(el).userSelect)).toBe("all");
  await expect(fallback).toContainText("Select to copy");
  await expect(page.locator("main span[role='status']")).toContainText("Copy failed");

  expect(warnings.some((w) => w.includes("[copy]"))).toBe(true);
});

// ---------------------------------------------------------------------------
// @EVAL-007 — CopyButton keyboard path: Tab focus ring, Enter and Space both copy.
// ---------------------------------------------------------------------------
test("@EVAL-007 CopyButton: Tab focuses it with a visible ring, Enter and Space both copy", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");
  await stubClipboard(page, "resolve");
  await page.goto("/contact", { waitUntil: "load" });

  const button = page.locator("main [data-copy-button]");
  await button.focus();
  await expect(button).toBeFocused();

  const accent = await tokenColor(page, "--color-rust");
  const ring = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(ring.w).toBe("2px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(accent);

  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("data-state", "copied");
  await expect(button).toHaveAttribute("data-state", "idle", { timeout: 3000 });
  await button.focus();
  await page.keyboard.press("Space");
  await expect(button).toHaveAttribute("data-state", "copied");

  const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
  expect(copied).toEqual([site.email, site.email]);
});

// ---------------------------------------------------------------------------
// TC-170.5 — postcard: stamp chrome, valid labels, Inter values, email + LinkedIn rows.
// ---------------------------------------------------------------------------
test("postcard: labels are data-hand='label' ≤ 3 words, values are Inter, stamp is chrome", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const card = page.locator('main [data-paper="postcard"]');
  await expect(card).toHaveCount(1);
  await expect(card.locator(".paper-stamp")).toHaveAttribute("aria-hidden", "true");

  const labels = card.locator('[data-hand="label"]');
  const texts = await labels.allInnerTexts();
  expect(texts.slice(0, 2)).toEqual(["email", "linkedin"]);
  for (const t of texts) {
    expect(t.trim().split(/\s+/).length, `label "${t}" must be ≤ 3 words`).toBeLessThanOrEqual(3);
  }
  for (const label of await labels.all()) {
    expect(await label.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Caveat/i);
  }
  for (const value of await card.locator(".contact-postcard-value").all()) {
    expect(await value.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Inter/i);
  }
  await expect(card.locator(`a[href="mailto:${site.email}"]`)).toHaveText(site.email);
  if (!site.showLocation) await expect(card).not.toContainText("Bengaluru");
});

// ---------------------------------------------------------------------------
// TC-170.6 — unit counts (§3.3) at both measured widths + no overflow at 390.
// ---------------------------------------------------------------------------
test("decoration counts: opener 3 · details 3; no horizontal overflow at 390", async ({ page, noOverflow }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "EVAL-018 widths are 390 and 1440");
  await page.goto("/contact", { waitUntil: "load" });

  const own = (selector: string) =>
    page.locator(selector).evaluate((section) =>
      Array.from(section.querySelectorAll("[data-decor]"))
        .filter((el) => el.closest("section") === section)
        .map((el) => el.getAttribute("data-decor")),
    );

  expect((await own("section#contact")).sort()).toEqual(["annotation", "annotation", "sticky"]);
  expect((await own("section.contact-details")).sort()).toEqual(["annotation", "sketch", "torn"]);

  if (w === 390) await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Screenshot pack.
// ---------------------------------------------------------------------------
test("screenshot pack", async ({ page }) => {
  const w = width(page);
  test.skip(![390, 768, 1024, 1440].includes(w), "one screenshot per configured viewport project");
  await page.goto("/contact", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `docs/screenshots/contact/${w}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
