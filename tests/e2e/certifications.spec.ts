/**
 * certifications.spec.ts (TKT-102, certifications-spec.md) — `/certifications`:
 *   - every certification is ONE `<a>` to its exact individual Credly credential (from
 *     `data/certifications.ts`), `target=_blank`, `rel` ⊇ noopener + noreferrer, and
 *     `aria-label="View <name> credential on Credly"`; no "Verify" button anywhere
 *   - the always-visible "View credential ↗" micro-label (nothing hover-only)
 *   - keyboard focus reaches every card and wears the visible rust ring
 *   - every card is a ≥ 44 px target; no horizontal overflow at 390 / 768; axe clean
 *   - hover lifts the card (transform) — and under reduced motion it does not
 */
import { test, expect } from "./fixtures";
import { certifications, featuredCertifications } from "@/data/certifications";

const ROUTE = "/certifications";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("every certification is one <a> to its exact Credly credential", async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1, name: "Certifications" })).toHaveCount(1);

  const links = page.locator('main a[href^="https://www.credly.com/"]');
  await expect(links).toHaveCount(certifications.length);

  for (const cert of certifications) {
    const link = page.locator(`main a[href="${cert.credentialUrl}"]`);
    await expect(link, cert.slug).toHaveCount(1);
    expect(cert.credentialUrl).toMatch(/^https:\/\/www\.credly\.com\/badges\/[0-9a-f-]{36}$/);
    await expect(link).toHaveAttribute("target", "_blank");
    const rel = (await link.getAttribute("rel")) ?? "";
    expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
    await expect(link).toHaveAttribute("aria-label", `View ${cert.name} credential on Credly`);
    await expect(link.locator("img")).toHaveAttribute("src", cert.badge);
    // the micro-label is always rendered, inside the link (not a separate CTA)
    await expect(link.getByText("View credential", { exact: false })).toBeVisible();
  }

  // the profile URL is never a card target, and there is no generic "Verify" control
  await expect(page.locator('main a[href*="/users/tusharpathak94"]')).toHaveCount(0);
  await expect(page.locator("main").getByText(/\bverify\b/i)).toHaveCount(0);
  await expect(page.locator("main button")).toHaveCount(0);
});

test("the five annotated certifications carry their sticky note, name, issuer and year", async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "load" });
  const items = page.locator("ol.cert-list > li");
  await expect(items).toHaveCount(featuredCertifications.length);
  for (const [i, cert] of featuredCertifications.entries()) {
    const item = items.nth(i);
    await expect(item.locator(".cert-name")).toHaveText(cert.name);
    await expect(item.locator(".cert-issuer")).toContainText(cert.issuer);
    await expect(item.locator("time")).toHaveText(cert.year);
    await expect(item.locator(".cert-sticky-text")).toHaveText(cert.applied!);
    // the sticky words reach assistive tech through the link's description
    const describedBy = (await item.locator("a").getAttribute("aria-describedby")) ?? "";
    expect(describedBy.split(" ")).toContain(`${cert.slug}-applied`);
  }
});

test("keyboard: Tab reaches every credential card with a visible focus ring", async ({ page }) => {
  test.skip(width(page) < 1024, "keyboard path runs on the desktop widths");
  await page.goto(ROUTE, { waitUntil: "load" });
  const seen = new Set<string>();
  for (let i = 0; i < 80 && seen.size < certifications.length; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el.tagName !== "A") return null;
      const href = el.getAttribute("href") ?? "";
      if (!href.startsWith("https://www.credly.com/badges/")) return null;
      const s = getComputedStyle(el);
      return { href, style: s.outlineStyle, width: s.outlineWidth, focusVisible: el.matches(":focus-visible") };
    });
    if (!info) continue;
    expect(info.focusVisible).toBe(true);
    expect(info.style).toBe("solid");
    expect(info.width).toBe("2px");
    seen.add(info.href);
  }
  expect(seen.size).toBe(certifications.length);
});

test("every credential card is a ≥ 44 px target, the page never scrolls sideways, and axe is clean", async ({
  page,
  axe,
  noOverflow,
  minTargets,
}) => {
  await page.goto(ROUTE, { waitUntil: "load" });
  const sizes = await page.locator('main a[href^="https://www.credly.com/badges/"]').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }),
  );
  expect(sizes).toHaveLength(certifications.length);
  for (const s of sizes) {
    expect(s.w).toBeGreaterThanOrEqual(44);
    expect(s.h).toBeGreaterThanOrEqual(44);
  }
  await noOverflow(page);
  await minTargets(page);
  await axe(page);
});

async function cardMotion(page: import("@playwright/test").Page) {
  const link = page.locator("ol.cert-list > li a").first();
  await link.scrollIntoViewIfNeeded();
  await link.locator(".cert-card").hover();
  await page.waitForTimeout(400); // the 240 ms lift settles
  return link.locator(".cert-card").evaluate((el) => {
    const s = getComputedStyle(el);
    return { translate: s.translate, rotate: s.rotate, transform: s.transform };
  });
}

test("hover lifts the paper card (≈ −4 px, −0.6°)", async ({ page }) => {
  test.skip(width(page) < 1024, "hover is a fine-pointer interaction");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROUTE, { waitUntil: "load" });
  const m = await cardMotion(page);
  expect(m.translate).toBe("0px -4px");
  expect(m.rotate).toBe("-0.6deg");
});

test("reduced motion: hover never transforms the card", async ({ page }) => {
  test.skip(width(page) < 1024, "hover is a fine-pointer interaction");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROUTE, { waitUntil: "load" });
  const m = await cardMotion(page);
  expect(m.translate).toBe("none");
  expect(m.rotate).toBe("none");
  expect(m.transform).toBe("none");
});

test("clicking a card fires the analytics event without blocking the new-tab navigation", async ({ page, context }) => {
  test.skip(width(page) !== 1440, "one width is enough");
  // Capture @vercel/analytics calls: its queue (`initQueue`) keeps a pre-existing `window.va`.
  await page.addInitScript(() => {
    const w = window as unknown as { va: (...a: unknown[]) => void; __events: unknown[][] };
    w.__events = [];
    w.va = (...a: unknown[]) => void w.__events.push(a);
  });
  // never hit Credly from a test: answer the credential request locally
  await context.route("https://www.credly.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<title>ok</title>" }),
  );
  await page.goto(ROUTE, { waitUntil: "load" });
  const cert = featuredCertifications[0]!;
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.locator(`main a[href="${cert.credentialUrl}"] .cert-card`).click(),
  ]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe(cert.credentialUrl);
  await popup.close();

  const events = await page.evaluate(() => (window as unknown as { __events: unknown[][] }).__events);
  const click = events.find((e) => e[0] === "event") as [string, { name: string; data: Record<string, unknown> }] | undefined;
  expect(click?.[1].name).toBe("Certification Credential Clicked");
  expect(click?.[1].data).toEqual({
    certification_name: cert.name,
    issuer: cert.issuer,
    certification_year: cert.year,
    credential_provider: "Credly",
    credential_url: cert.credentialUrl,
    page: "portfolio",
    section: "certifications",
  });
});
