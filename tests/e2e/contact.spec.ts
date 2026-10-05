/**
 * contact.spec.ts (TKT-45 → TSK-46 / TC-170 → TASK-113) — `/contact` in paper. TASK-113 rebuilt the
 * section to Tushar's contact spec (2026-09-27, `docs/redesign-mockups/m-009/tushar-2026-09-27/
 * contact-spec.md`): one `section#contact` — head (eyebrow, h1, hand subline), ONE torn contact card
 * (email + `CopyButton`, "Email me →", LinkedIn ↗ + résumé) and the visual story (collage, sticky,
 * closing line). The numbered actions list and the postcard details section are gone (spec §27).
 * No form (decision S10); only email + LinkedIn published (EXE-8).
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts). Route-wide
 * axe (@EVAL-006), the generic overflow / 44 px sweeps (@EVAL-008) and the decoration budget
 * (@EVAL-018) already cover `/contact` via `routes.json`; this file asserts what is specific to
 * the page (Design.md §7.8, §7.9, §3.3):
 *   TC-170.1 — copy → "Copied" (forest border) for 2 s → idle; the live region announces.
 *   TC-170.2 — blocked clipboard → "Copy failed" (rust border) + selectable `<output>` fallback.
 *   TC-170.3 — mailto / LinkedIn external / `#resume` = `contactResumeLink()` (never "updating");
 *              location line only behind `site.showLocation` (default false).
 *   TC-170.4 — no phone / DOB / street address in the route markup (PII_PATTERNS, EXE-8).
 *   TASK-113 — the spec's exact copy; card structure; desktop two columns / mobile head → card →
 *              story; section height ≤ 850 at 1440; unit count 4; the band tear never covers text.
 * Plus the @EVAL-007 keyboard path for `CopyButton` and the screenshot pack.
 */
import { test, expect } from "./fixtures";
import { contactResumeLink, site } from "@/lib/site";
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
// Content — the spec §26 copy, one card, no numbering, no form (TASK-113).
// ---------------------------------------------------------------------------
test("section renders the spec copy and one contact card — no numbered steps, no form", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const section = page.locator("section#contact");
  await expect(section.getByRole("heading", { level: 1 })).toHaveText("Still curious?");
  await expect(section.locator(".contact-eyebrow")).toHaveText("Contact");
  await expect(section.locator(".cx-subline")).toHaveText("Choose the easiest way to say hello ↓");
  await expect(section.locator(".cx-sticky")).toHaveText(/^No forms\.\s*No funnels\.\s*Just say hello\.$/);
  await expect(section.locator(".cx-note")).toHaveText(
    /^Waving from the window seat —\s*the coffee’s usually on\s*and I’m always up for\s*a good conversation\.$/,
  );
  await expect(section.locator(".cx-closing")).toHaveText(/^Good conversations usually start\s*with one message\.$/);

  // One card holds every action: email + Copy, the primary mailto, the two secondary links.
  const card = section.locator('[data-paper="card"].cx-card');
  await expect(card).toHaveCount(1);
  await expect(card.locator(".cx-label")).toHaveText("Email");
  await expect(card.locator(".cx-addr")).toHaveText(site.email);
  await expect(card.locator("[data-copy-button]")).toBeVisible();
  await expect(card.locator(`a[href="mailto:${site.email}"]`)).toHaveText("Email me →");
  await expect(card.locator(`a[href="${site.linkedin}"]`)).toContainText("LinkedIn ↗");
  await expect(card.locator("#resume")).toBeVisible();

  // Spec §27: no 01–04 numbering, no row-based actions list, no leftover copy.
  await expect(page.locator("main .contact-num, main ul[data-contact-actions]")).toHaveCount(0);
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/\b0[1-4]\b/);
  expect(text).not.toMatch(/whichever is easiest/i);
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
// LinkedIn: real external link (target/rel/aria) — the card's secondary link (postcard gone, TASK-113).
// ---------------------------------------------------------------------------
test("LinkedIn links are real external links: target=_blank, rel=noopener, 'opens in new tab'", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "link attributes are viewport-independent; checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });

  const links = page.locator("main").locator(`a[href="${site.linkedin}"]`);
  await expect(links).toHaveCount(1);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    expect(await link.getAttribute("rel"), "rel must include noopener").toContain("noopener");
    expect(await link.getAttribute("rel"), "rel must include noreferrer (spec §23)").toContain("noreferrer");
    await expect(link).toHaveAccessibleName(/opens in new tab/i);
  }
});

// ---------------------------------------------------------------------------
// #resume = contactResumeLink(): "available on request" mailto until the flag flips (spec §13).
// ---------------------------------------------------------------------------
test("#resume asks by email while resumeAvailable is false — 'Resume — updating' is gone from the page", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  expect(site.resumeAvailable, "this suite runs against the placeholder build (resumeAvailable=false)").toBe(
    false,
  );
  const resume = contactResumeLink();
  await page.goto("/contact", { waitUntil: "load" });

  const control = page.locator("main a#resume");
  await expect(control).toBeVisible();
  await expect(control).toHaveText(resume.label);
  await expect(control).toHaveText("Resume — available on request");
  await expect(control).toHaveAttribute("href", `mailto:${site.email}?subject=Resume%20request`);
  expect(await control.getAttribute("download")).toBeNull();

  // No unfinished-state copy on the page a reader sees (spec §13). The shared chrome's hidden
  // résumé control (the band circle's aria-label) still derives from
  // resumeAction() — out of this section's scope, flagged to Tushar in docs/reports/TASK-113.md.
  expect(await page.locator("main").innerHTML()).not.toMatch(/updating/i);
  expect(await page.locator("body").innerText()).not.toMatch(/Resume — updating/);
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
  await expect(button).toHaveAccessibleName("Copy email address"); // spec §23

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
// TASK-111 — Tushar's portrait postage stamp on the card: a real, named, loaded image (content).
// ---------------------------------------------------------------------------
test("portrait stamp: a loaded <img> with alt 'Photo of Tushar Pathak', not hidden from AT, not a decoration", async ({
  page,
}) => {
  await page.goto("/contact", { waitUntil: "load" });
  const img = page.locator("section#contact .cx-card .cx-stamp img");
  await expect(img).toHaveCount(1);
  await expect(img).toHaveAttribute("alt", "Photo of Tushar Pathak");
  await expect(img).toBeVisible();
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await img.evaluate((el) => el.closest('[aria-hidden="true"], [data-decor]') === null)).toBe(true);
  await expect(page.getByRole("img", { name: "Photo of Tushar Pathak" })).toHaveCount(1);
  // Layout width (the rotated box's bounding rect is wider than the stamp itself).
  const w = await page.locator("section#contact .cx-stamp").evaluate((el) => (el as HTMLElement).offsetWidth);
  if (width(page) >= 560) expect(w).toBeGreaterThanOrEqual(72);
  expect(w).toBeLessThanOrEqual(96);
});

// ---------------------------------------------------------------------------
// TASK-113 — layout: desktop two columns (story | head + card), < 1024 head → card → story.
// ---------------------------------------------------------------------------
test("layout: story beside the card ≥ 1024, head → card → story below; secondary links equal width", async ({
  page,
  noOverflow,
}) => {
  await page.goto("/contact", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const box = async (sel: string) => (await page.locator(sel).boundingBox())!;
  const head = await box("section#contact .cx-head");
  const card = await box("section#contact .cx-card");
  const story = await box("section#contact .cx-story");

  if (width(page) >= 1024) {
    expect(story.x + story.width, "story sits left of the card").toBeLessThanOrEqual(card.x);
    expect(head.y + head.height, "head sits above the card").toBeLessThanOrEqual(card.y + 1);
    // Balanced columns (spec §18): the story's vertical centre is within the right column's span.
    const mid = story.y + story.height / 2;
    expect(mid).toBeGreaterThanOrEqual(head.y);
    expect(mid).toBeLessThanOrEqual(card.y + card.height);
  } else {
    expect(head.y + head.height).toBeLessThanOrEqual(card.y + 1);
    expect(card.y + card.height, "the controls come before the decoration (spec §22)").toBeLessThanOrEqual(story.y + 1);
  }

  // LinkedIn + résumé, plus GitHub under the band's S5 rule (a project links a public repo).
  const secondary = page.locator("section#contact [data-contact-secondary] > a");
  await expect(secondary).toHaveCount((await page.locator('footer.band a[aria-label="GitHub"]').count()) ? 3 : 2);
  const [a, b] = [(await secondary.nth(0).boundingBox())!, (await secondary.nth(1).boundingBox())!];
  expect(Math.abs(a.width - b.width), "equal-width secondary buttons").toBeLessThanOrEqual(1);
  if (width(page) >= 560) expect(Math.abs(a.y - b.y), "two columns").toBeLessThanOrEqual(1);
  else expect(b.y, "stacked on phones").toBeGreaterThan(a.y + a.height - 1);

  // Primary CTA 52–58 px tall (spec §11); every control ≥ 44 px.
  const primary = await box(`section#contact a[href="mailto:${site.email}"]`);
  expect(primary.height).toBeGreaterThanOrEqual(52);
  expect(primary.height).toBeLessThanOrEqual(58);
  for (const control of await page.locator("section#contact a, section#contact button").all()) {
    const b2 = (await control.boundingBox())!;
    expect(b2.height, await control.innerText()).toBeGreaterThanOrEqual(44);
  }
  await noOverflow(page);
});

test("section fits ~one desktop viewport: head + card + story span ≤ 850 px at 1440 (spec §17)", async ({ page }) => {
  test.skip(width(page) !== 1440, "desktop height checked at w1440");
  await page.goto("/contact", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const span = await page.evaluate(() => {
    const els = ["head", "card", "story"].map((k) => document.querySelector(`section#contact .cx-${k}`)!.getBoundingClientRect());
    return Math.max(...els.map((r) => r.bottom)) - Math.min(...els.map((r) => r.top));
  });
  test.info().annotations.push({ type: "task-113", description: `content span ${span.toFixed(0)} px at 1440` });
  expect(span).toBeLessThanOrEqual(850);
});

// ---------------------------------------------------------------------------
// TASK-113 — the band's torn sheet (TKT-106 lag) never covers this section's text.
// ---------------------------------------------------------------------------
test("band tear slides over the section's empty foot only — never over the card or the closing line", async ({
  page,
}) => {
  await page.goto("/contact", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  // Let the scroll-driven lag settle at its end state.
  await page.waitForTimeout(300);
  const { tearTop, lowest, sectionZ } = await page.evaluate(() => {
    const tear = document.querySelector('footer.band > [data-decor="torn"]')!.getBoundingClientRect();
    const parts = ["cx-card", "cx-closing", "cx-sticky", "cx-collage"].map((c) =>
      document.querySelector(`section#contact .${c}`)!.getBoundingClientRect().bottom,
    );
    return {
      tearTop: tear.top,
      lowest: Math.max(...parts),
      sectionZ: getComputedStyle(document.querySelector("section#contact")!).zIndex,
    };
  });
  expect(sectionZ, "the section stacks below the band (z 1)").toBe("0");
  expect(lowest, `lowest content ${lowest.toFixed(0)} px vs tear ${tearTop.toFixed(0)} px`).toBeLessThanOrEqual(tearTop);
});

// ---------------------------------------------------------------------------
// TASK-113 — entrance: plays once when in view; nothing hidden or moving under reduced motion.
// ---------------------------------------------------------------------------
test("entrance ends fully visible; reduced motion shows everything at once, untransformed", async ({
  page,
  withReducedMotion,
}) => {
  test.skip(width(page) !== 1440, "motion checked once at w1440");
  await page.goto("/contact", { waitUntil: "load" });
  const grid = page.locator("section#contact .cx-grid");
  await expect(grid).toHaveAttribute("data-in", "");
  await expect.poll(() => page.locator("section#contact .cx-card").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");

  await withReducedMotion(page);
  await page.reload({ waitUntil: "load" });
  await expect(grid).toHaveAttribute("data-armed", "");
  for (const sel of [".cx-head", ".cx-card", ".cx-collage", ".cx-closing"]) {
    const s = await page.locator(`section#contact ${sel}`).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { o: cs.opacity, t: cs.translate, d: cs.transitionDuration };
    });
    expect(s.o, sel).toBe("1");
    expect(s.t, sel).toBe("none");
  }
});

// ---------------------------------------------------------------------------
// Unit count (§3.3): section#contact = collage · sticky · subline + closing annotations = 4, at 390
// and 1440 (EVAL-018 widths); no second contact section.
// ---------------------------------------------------------------------------
test("decoration count: section#contact 4 (annotation ×2, collage, sticky); no details section", async ({ page }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "EVAL-018 widths are 390 and 1440");
  await page.goto("/contact", { waitUntil: "load" });

  const own = await page.locator("section#contact").evaluate((section) =>
    Array.from(section.querySelectorAll("[data-decor]"))
      .filter((el) => el.closest("section") === section)
      .map((el) => el.getAttribute("data-decor")),
  );
  expect(own.sort()).toEqual(["annotation", "annotation", "collage", "sticky"]);
  // The postcard details section is gone: the contact section is `main`'s last child (after the opener).
  await expect(page.locator("main section.contact-details, main [data-paper=\"postcard\"]")).toHaveCount(0);
  expect(await page.locator("main").evaluate((m) => m.lastElementChild?.id)).toBe("contact");
  for (const el of await page.locator("section#contact [data-decor]").all()) {
    await expect(el).toHaveAttribute("aria-hidden", "true");
  }
});

// ---------------------------------------------------------------------------
// Screenshot pack (TASK-113): one per viewport + the "Copied ✓" state at 1440.
// ---------------------------------------------------------------------------
test("screenshot pack", async ({ page }) => {
  const w = width(page);
  test.skip(![390, 768, 1024, 1440].includes(w), "one screenshot per configured viewport project");
  await stubClipboard(page, "resolve");
  await page.goto("/contact", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator("section#contact");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".cx-grid")).toHaveAttribute("data-in", "");
  await page.waitForTimeout(900); // the ~700 ms entrance
  await page.screenshot({ path: `docs/screenshots/m-009/task-113/contact-${w}.png`, fullPage: true, animations: "disabled" });
  if (w === 1440) {
    await section.locator("[data-copy-button]").click();
    await expect(section.locator("[data-copy-button]")).toHaveAttribute("data-state", "copied");
    await section.locator(".cx-card").screenshot({ path: "docs/screenshots/m-009/task-113/contact-1440-copied.png" });
  }
});
