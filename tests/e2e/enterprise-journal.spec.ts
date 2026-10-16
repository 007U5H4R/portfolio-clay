/**
 * enterprise-journal.spec.ts — the Enterprise Field Journal on /projects (TASK-204, EXE-80).
 *
 *   LAYOUT      3 / 2 / 1 columns, no horizontal overflow, no text under 14 px, every image loads;
 *   HOVER       (fine pointer) the card rises 4 px, the deeper shade crossfades by opacity, one detail answers;
 *               keyboard focus gives the same movement; nothing transitions box-shadow / filter;
 *   SIGNATURE   activating a card plays its signature once (a layer rides, a connector draws or a mark appears) and the
 *               card is back at rest afterwards; a second activation restarts cleanly;
 *   ACTIVE      the card is pinned (outline + pin + label), the dossier shows the record, no link, no navigation, one open;
 *   TOUCH       a tap opens it and leaves no sticky hover; REDUCED MOTION nothing moves, the active state stays;
 *   DARK        the dark cutouts are used, the light ones are not fetched, and axe finds no contrast failure in either theme.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { enterpriseCases } from "@/data/enterprise";
import { enterpriseArt } from "@/data/enterprise-art";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const item = (page: Page, id: string) => page.locator(`.ee-item[data-case="${id}"]`);
const translateY = (loc: ReturnType<Page["locator"]>) =>
  loc.evaluate((el) => {
    const t = getComputedStyle(el).translate;
    return t === "none" ? 0 : Number.parseFloat(t.split(" ")[1] ?? "0");
  });
const settle = (page: Page, ms = 450) => page.waitForTimeout(ms);

async function open(page: Page) {
  await page.goto("/projects", { waitUntil: "load" });
  await page.locator("section#enterprise").scrollIntoViewIfNeeded();
}

test("layout: 3 / 2 / 1 columns, no overflow, 14 px text floor, images load", async ({ page, noOverflow }) => {
  await open(page);
  if (width(page) < 640) {
    // TASK-233: on a phone the cases are a one-card-per-screen scroll-snap row (portfolio-mobile.spec.ts holds its behaviour)
    expect(await page.locator(".ee-grid").evaluate((el) => getComputedStyle(el).display)).toBe("flex");
  } else {
    const cols = await page.locator(".ee-grid").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(cols).toBe(width(page) >= 1024 ? 3 : 2);
  }
  await noOverflow(page);
  const small = await page.locator("section#enterprise").evaluate((root) => {
    const bad: string[] = [];
    for (const el of root.querySelectorAll<HTMLElement>("*")) {
      if (el.closest("[aria-hidden='true']")) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (own && el.offsetParent !== null && Number.parseFloat(getComputedStyle(el).fontSize) < 14) bad.push(`${el.tagName}.${el.className}`);
    }
    return bad;
  });
  expect(small).toEqual([]);
  for (const c of enterpriseCases) await item(page, c.id).scrollIntoViewIfNeeded();
  // lazy images: on a phone the off-screen slides of the carousel load a moment after they are scrolled to
  await expect
    .poll(() =>
      page.locator(".ee-img").evaluateAll((imgs) =>
        (imgs as HTMLImageElement[]).filter((i) => i.offsetParent !== null && (!i.complete || i.naturalWidth === 0)).map((i) => i.src),
      ),
    )
    .toEqual([]);
  await expect(page.locator("section#enterprise a")).toHaveCount(0);
});

test("hover and focus: the card rises 4 px with the same twin, a detail answers, no shadow or filter transitions", async ({ page }) => {
  test.skip(width(page) < 1024, "hover is a fine-pointer behaviour (the 390 project is touch)");
  await open(page);
  for (const c of enterpriseCases) {
    const card = item(page, c.id).locator(".ee-card");
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await settle(page);
    expect(await translateY(card), `${c.id} hover lift`).toBeCloseTo(-4, 0);
    expect(await card.locator(".ee-shade").evaluate((el) => getComputedStyle(el).opacity), `${c.id} shade`).toBe("1");
    const hoverPart = card.locator(".ee-part[data-hover]");
    expect(Math.abs(await translateY(hoverPart)), `${c.id} detail answers`).toBeGreaterThan(0.5);
    // a transition-property with a 0 s duration never runs (pseudo-elements report the initial `all 0s`)
    const props = await card.evaluate((el) =>
      [getComputedStyle(el), getComputedStyle(el, "::before"), getComputedStyle(el, "::after"), getComputedStyle(el.querySelector(".ee-shade")!)].flatMap((s) => {
        const d = s.transitionDuration.split(",").map((x) => Number.parseFloat(x));
        return s.transitionProperty.split(",").map((p, i) => ((d[i % d.length] ?? 0) > 0 ? p.trim() : "")).filter(Boolean);
      }),
    );
    expect(props.join(",")).not.toMatch(/box-shadow|filter|\ball\b/);
    await page.mouse.move(2, 2);
    await settle(page);
    expect(await translateY(card), `${c.id} rest`).toBe(0);
    await card.locator(".ee-open").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await settle(page);
    expect(await translateY(card), `${c.id} focus twin`).toBeCloseTo(-4, 0);
    await card.locator(".ee-open").blur();
  }
});

test("signature: each card plays once on activation, settles, and restarts cleanly", async ({ page }) => {
  test.setTimeout(180_000);
  await open(page);
  const sample = (id: string) =>
    item(page, id).evaluate((el) => {
      const part = [...el.querySelectorAll<HTMLElement>(".ee-part")].some((p) => {
        const t = getComputedStyle(p).translate;
        return t !== "none" && t !== "0px 0px" && t !== "0px";
      });
      const wire = [...el.querySelectorAll<SVGPathElement>(".ee-wires path")].some((p) => Number.parseFloat(getComputedStyle(p).strokeDashoffset) < 0.98 && Number.parseFloat(getComputedStyle(p).opacity) > 0);
      const mark = [...el.querySelectorAll<HTMLElement>(".ee-mark")].some((m) => Number.parseFloat(getComputedStyle(m).opacity) > 0.05);
      return { part, wire, mark };
    });
  for (const c of enterpriseCases) {
    const it = item(page, c.id);
    await it.scrollIntoViewIfNeeded();
    const art = enterpriseArt[c.id]!;
    await it.locator(".ee-open").click();
    await expect(it).toHaveAttribute("data-play", "");
    // sample through the ride (a loaded runner can skip frames): each kind of motion shows up at least once
    const seen = { part: false, wire: false, mark: false };
    for (let t = 0; t < 1300; t += 60) {
      const s = await sample(c.id);
      seen.part ||= s.part;
      seen.wire ||= s.wire;
      seen.mark ||= s.mark;
      await page.waitForTimeout(60);
    }
    expect(seen.part, `${c.id} a layer rides`).toBe(true);
    if (art.connectors.length > 0) expect(seen.wire, `${c.id} a connector draws`).toBe(true);
    if (art.marks.length > 0) expect(seen.mark, `${c.id} a mark appears`).toBe(true);
    await page.mouse.move(2, 2); // the pointer that clicked is still over the card, whose hover answer is not the signature
    await expect(it).not.toHaveAttribute("data-play", "", { timeout: 4000 });
    await page.waitForTimeout(400);
    const rest = await it.evaluate((el) => [...el.querySelectorAll<HTMLElement>(".ee-part")].map((p) => getComputedStyle(p).translate));
    for (const t of rest) expect(["none", "0px 0px", "0px"]).toContain(t);
    // close, then play again (repeat activation restarts without a glitch)
    await it.locator(".ee-open").click();
    await it.locator(".ee-open").click();
    await expect(it).toHaveAttribute("data-play", "");
    await it.locator(".ee-open").click();
    await expect(it.locator(".ee-open")).toHaveAttribute("aria-expanded", "false");
  }
});

test("active state and the case file: pinned, record in plain text, no link, no navigation, one open", async ({ page }) => {
  await open(page);
  const url = page.url();
  for (const c of enterpriseCases) {
    const it = item(page, c.id);
    const btn = it.locator(".ee-open");
    await it.scrollIntoViewIfNeeded();
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(btn).toContainText("Close case file");
    await expect(it.locator(".ee-pin")).toHaveCSS("opacity", "1");
    expect(await it.locator(".ee-card").evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("1");
    const panel = it.locator(".ee-dossier");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".ee-summary")).toHaveText(c.summary);
    await expect(panel.locator(".pf-case-streams li")).toHaveCount(c.workstreams.length);
    await expect(panel.locator(".ee-tags li")).toHaveText(c.tags);
    await expect(panel.locator("a")).toHaveCount(0);
    await expect(page.locator(".ee-item[data-open]")).toHaveCount(1);
    expect(page.url()).toBe(url);
  }
  await page.keyboard.press("Space");
  await expect(page.locator(".ee-item[data-open]")).toHaveCount(0);
});

test("touch: a tap opens a case file and leaves no sticky hover", async ({ page }) => {
  test.skip(width(page) !== 390, "touch project only");
  await open(page);
  const it = item(page, "mojix");
  await it.scrollIntoViewIfNeeded();
  await it.locator(".ee-open").tap();
  await expect(it.locator(".ee-open")).toHaveAttribute("aria-expanded", "true");
  await settle(page);
  expect(await translateY(it.locator(".ee-card"))).toBeLessThanOrEqual(1);
  await expect(it.locator(".ee-dossier")).toBeVisible();
});

test("reduced motion: nothing moves, the pin and the label still show the active state", async ({ page, withReducedMotion }) => {
  await withReducedMotion(page);
  await open(page);
  const it = item(page, "pear-health-labs");
  await it.scrollIntoViewIfNeeded();
  await it.locator(".ee-open").click();
  await expect(it.locator(".ee-open")).toHaveAttribute("aria-expanded", "true");
  await expect(it.locator(".ee-pin")).toHaveCSS("opacity", "1");
  await page.waitForTimeout(300);
  const names = await it.evaluate((el) => [...el.querySelectorAll<HTMLElement>(".ee-part, .ee-wires path, .ee-mark")].map((n) => getComputedStyle(n).animationName));
  for (const n of names) expect(n).toBe("none");
  if (width(page) >= 1024) {
    await page.mouse.move(0, 0);
    await it.locator(".ee-card").hover();
    await settle(page);
    expect(await translateY(it.locator(".ee-card"))).toBe(0);
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme} theme: the matching cutouts load and the section has no contrast failure`, async ({ page, axe }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const fetched: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/media/enterprise-work/")) fetched.push(r.url());
    });
    await open(page);
    for (const c of enterpriseCases) await item(page, c.id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
    const other = scheme === "dark" ? "light.webp" : "dark.webp";
    expect(fetched.filter((u) => u.endsWith(other)), `the ${other} cutouts are never fetched`).toEqual([]);
    expect(fetched.filter((u) => u.endsWith(`${scheme}.webp`)).length).toBeGreaterThanOrEqual(6);
    await item(page, "iu-health").locator(".ee-open").click();
    await axe(page, { include: "#enterprise" });
  });
}
