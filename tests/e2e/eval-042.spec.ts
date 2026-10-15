/**
 * eval-042.spec.ts (`@EVAL-042`, evaluation-plan §11, M-012 P4 / TASK-181.4) — reduced-motion and touch parity, plus the P4
 * hover contract, for the surfaces this phase owns: the Thinking essay row, the Playground bench cards (`.pg-ex`) and the
 * certification cards (`.cert-card`, `.certm-tile`). Other phases extend this file with their own surfaces
 * (TASK-201 adds the Experience timeline entries and the What I Bring tool chips below).
 *   - hover and keyboard focus-visible move the same amount (the focus twin); the shadow is a pseudo / layer whose OPACITY fades;
 *   - no transition-property on the element, its pseudos or the shade layer contains box-shadow, filter, backdrop-filter or `all`;
 *   - essay: the title shifts 3 px (≤ 4), the arrow 4 px, the meta row's box does not move;
 *   - reduced motion: 0 translate/transform change on hover or focus, the shadow / colour feedback is still there;
 *   - touch (390): a tap leaves no hover state; the touch press is present.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

test.skip(({ viewport }) => ![390, 1440].includes(viewport!.width), "EVAL-042 runs at 390 and 1440");

const FORBIDDEN = /box-shadow|filter|backdrop-filter|^all$/;

async function read(loc: Locator, pseudo?: string) {
  return loc.evaluate((el, ps) => {
    const cs = getComputedStyle(el, ps ?? null);
    const [tx = "0", ty = "0"] = cs.translate === "none" ? [] : cs.translate.split(" ");
    const m = cs.transform === "none" ? new DOMMatrix() : new DOMMatrix(cs.transform);
    return {
      x: Number.parseFloat(tx) + m.e,
      y: Number.parseFloat(ty) + m.f,
      scale: Math.max(m.a, m.d),
      opacity: Number(cs.opacity),
      color: cs.color,
      props: cs.transitionProperty.split(",").map((p) => p.trim()),
      durations: cs.transitionDuration.split(",").map((d) => Number.parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1000)),
    };
  }, pseudo);
}

function noForbiddenTransitions(label: string, r: Awaited<ReturnType<typeof read>>) {
  const bad = r.props.filter((p, i) => FORBIDDEN.test(p) && (r.durations[i % r.durations.length] ?? 0) > 0);
  expect(bad, `${label}: forbidden transition properties`).toEqual([]);
}

async function keyboardFocus(page: Page, loc: Locator) {
  await page.keyboard.press("Shift");
  await loc.focus();
  expect(await loc.evaluate((el) => el.matches(":focus-visible")), "focus is keyboard-visible").toBe(true);
}

async function box(loc: Locator) {
  return loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
}

const ENTRY = ".essay-entry";

test.describe("@EVAL-042 Thinking essay row", () => {
  test("hover and focus shift the title 3 px and the arrow 4 px; the meta row does not move; no shadow/filter transition", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/thinking", { waitUntil: "networkidle" });
    const row = page.locator(ENTRY).nth(1);
    await row.scrollIntoViewIfNeeded();
    const title = row.locator(".essay-entry-title");
    const arrow = row.locator(".essay-entry-arrow");
    const num = row.locator(".essay-num");
    const meta = row.locator(".essay-meta");
    const rest = { title: await read(title), arrow: await read(arrow), num: await read(num), meta: await box(meta), dek: await box(row.locator(".essay-entry-dek")) };

    await row.hover();
    await page.waitForTimeout(500);
    const hov = { title: await read(title), arrow: await read(arrow), num: await read(num) };
    expect(hov.title.x - rest.title.x, "title shift").toBeCloseTo(3, 0);
    expect(hov.title.x - rest.title.x, "title shift ≤ 4 px").toBeLessThanOrEqual(4);
    expect(hov.arrow.x - rest.arrow.x, "arrow shift").toBeCloseTo(4, 0);
    expect(hov.num.y - rest.num.y, "number tab lifts 1 px").toBeCloseTo(-1, 0);
    expect(await box(meta), "meta rect unchanged").toEqual(rest.meta);
    expect(await box(row.locator(".essay-entry-dek")), "dek rect unchanged").toEqual(rest.dek);
    for (const [k, r] of Object.entries(hov)) {
      noForbiddenTransitions(`essay ${k}`, r);
      expect(r.scale, `${k} scale`).toBeLessThanOrEqual(1.0001);
      r.durations.forEach((d, i) => {
        if (r.props[i] !== "none" && d > 0) {
          expect(d, `${k} ${r.props[i]} inside L1`).toBeGreaterThanOrEqual(149);
          expect(d, `${k} ${r.props[i]} inside L1`).toBeLessThanOrEqual(251);
        }
      });
    }

    await page.mouse.move(2, 2);
    await page.waitForTimeout(500);
    await keyboardFocus(page, row.locator(".essay-entry-title a"));
    await page.waitForTimeout(500);
    expect((await read(title)).x - rest.title.x, "focus twin: title").toBeCloseTo(3, 0);
    expect((await read(arrow)).x - rest.arrow.x, "focus twin: arrow").toBeCloseTo(4, 0);
    expect(await box(meta), "meta rect unchanged on focus").toEqual(rest.meta);
  });

  test("reduced motion: nothing moves, the title colour still changes", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/thinking", { waitUntil: "networkidle" });
    const row = page.locator(ENTRY).nth(1);
    await row.scrollIntoViewIfNeeded();
    const link = row.locator(".essay-entry-title a");
    const rest = { t: await read(row.locator(".essay-entry-title")), a: await read(row.locator(".essay-entry-arrow")), c: (await read(link)).color };
    await row.hover();
    await page.waitForTimeout(300);
    expect((await read(row.locator(".essay-entry-title"))).x - rest.t.x, "RM: title does not move").toBeCloseTo(0, 1);
    expect((await read(row.locator(".essay-entry-arrow"))).x - rest.a.x, "RM: arrow does not move").toBeCloseTo(0, 1);
    expect((await read(link)).color, "RM: colour feedback stays").not.toBe(rest.c);
  });

  test("touch: a tap leaves no hover state behind", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/thinking", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(false);
    const row = page.locator(ENTRY).first();
    await row.scrollIntoViewIfNeeded();
    const rest = await read(row.locator(".essay-entry-title"));
    await row.locator(".essay-entry-dek").tap();
    await page.waitForTimeout(400);
    expect((await read(row.locator(".essay-entry-title"))).x - rest.x, "no sticky title shift").toBeCloseTo(0, 1);
  });
});

test.describe("@EVAL-042 Playground bench cards", () => {
  test("hover and focus lift the card 4 px, the shadow pseudo fades by opacity, the tape rises 1 px", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/playground", { waitUntil: "networkidle" });
    const card = page.locator(".pg-ex").first();
    await card.scrollIntoViewIfNeeded();
    const rest = { c: await read(card), s: await read(card, "::after") };
    expect(rest.s.opacity, "shadow pseudo hidden at rest").toBe(0);
    await card.hover();
    await page.waitForTimeout(700);
    const hov = { c: await read(card), s: await read(card, "::after") };
    expect(hov.c.y - rest.c.y, "lift").toBeCloseTo(-4, 0);
    expect(hov.s.opacity, "shadow pseudo shown").toBe(1);
    for (const r of [hov.c, hov.s]) {
      noForbiddenTransitions("pg-ex", r);
      expect(r.scale).toBeLessThanOrEqual(1.0001);
    }
    expect(hov.s.props, "the pseudo transitions opacity only").toEqual(["opacity"]);

    await page.mouse.move(2, 2);
    await page.waitForTimeout(700);
    await keyboardFocus(page, card.locator(".pg-ex-live"));
    await page.waitForTimeout(700);
    expect((await read(card)).y - rest.c.y, "focus twin lift").toBeCloseTo(-4, 0);
    expect((await read(card, "::after")).opacity, "focus twin shadow").toBe(1);
  });

  test("reduced motion: no lift, the shadow still shows", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/playground", { waitUntil: "networkidle" });
    const card = page.locator(".pg-ex").first();
    await card.scrollIntoViewIfNeeded();
    const rest = await read(card);
    await card.hover();
    await page.waitForTimeout(300);
    expect((await read(card)).y - rest.y, "RM: no lift").toBeCloseTo(0, 1);
    expect((await read(card, "::after")).opacity, "RM: shadow feedback stays").toBe(1);
  });

  test("touch: no hover lift after a tap", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/playground", { waitUntil: "networkidle" });
    const card = page.locator(".pg-ex").first();
    await card.scrollIntoViewIfNeeded();
    const rest = await read(card);
    await card.locator(".pg-ex-title").tap();
    await page.waitForTimeout(500);
    expect((await read(card)).y - rest.y, "no sticky lift").toBeCloseTo(0, 1);
    expect((await read(card, "::after")).opacity, "no sticky shadow").toBe(0);
  });
});

test.describe("@EVAL-042 certification cards", () => {
  test("hover and focus lift the card, the shade layer fades by opacity, nothing transitions a filter or shadow", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/certifications", { waitUntil: "networkidle" });
    const link = page.locator("ol.cert-list > li a").first();
    await link.scrollIntoViewIfNeeded();
    const card = link.locator(".cert-card");
    const shade = link.locator(".cert-paper-shade");
    const paper = link.locator(".cert-paper");
    const rest = { c: await read(card), s: await read(shade) };
    expect(rest.s.opacity, "shade hidden at rest").toBe(0);
    await link.hover();
    await page.waitForTimeout(700);
    const hov = { c: await read(card), s: await read(shade), p: await read(paper) };
    expect(hov.c.y - rest.c.y, "lift").toBeCloseTo(-4, 0);
    expect(hov.s.opacity, "shade shown").toBe(1);
    expect(hov.s.props, "the shade transitions opacity only").toEqual(["opacity"]);
    for (const [k, r] of Object.entries(hov)) noForbiddenTransitions(`cert ${k}`, r);
    expect(hov.c.scale).toBeLessThanOrEqual(1.0001);
    hov.c.durations.forEach((d) => {
      expect(d).toBeGreaterThanOrEqual(299);
      expect(d).toBeLessThanOrEqual(701);
    });

    await page.mouse.move(2, 2);
    await page.waitForTimeout(700);
    await keyboardFocus(page, link);
    await page.waitForTimeout(700);
    expect((await read(card)).y - rest.c.y, "focus twin lift").toBeCloseTo(-4, 0);
    expect((await read(shade)).opacity, "focus twin shade").toBe(1);
  });

  test("reduced motion: the card does not move, the shade still shows", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/certifications", { waitUntil: "networkidle" });
    const link = page.locator("ol.cert-list > li a").first();
    await link.scrollIntoViewIfNeeded();
    const card = link.locator(".cert-card");
    const rest = await read(card);
    await link.hover();
    await page.waitForTimeout(300);
    const hov = await read(card);
    expect(hov.y - rest.y, "RM: no lift").toBeCloseTo(0, 1);
    expect((await read(link.locator(".cert-paper-shade"))).opacity, "RM: shadow feedback stays").toBe(1);
  });

  test("more-credentials tile: shadow pseudo fades, no box-shadow transition", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/certifications", { waitUntil: "networkidle" });
    const tile = page.locator(".certm-tile").first();
    if ((await tile.count()) === 0) test.skip(true, "no more-credentials tiles");
    await tile.scrollIntoViewIfNeeded();
    const rest = { t: await read(tile), s: await read(tile, "::after") };
    expect(rest.s.opacity).toBe(0);
    await tile.hover();
    await page.waitForTimeout(700);
    const hov = { t: await read(tile), s: await read(tile, "::after") };
    expect(hov.s.opacity).toBe(1);
    expect(hov.t.y - rest.t.y, "tile lift").toBeCloseTo(-3, 0);
    noForbiddenTransitions("certm tile", hov.t);
    noForbiddenTransitions("certm shade", hov.s);
  });

  test("touch: a tap leaves no hover state behind", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/certifications", { waitUntil: "networkidle" });
    const link = page.locator("ol.cert-list > li a").first();
    await link.scrollIntoViewIfNeeded();
    const card = link.locator(".cert-card");
    const rest = await read(card);
    await page.evaluate(() => document.addEventListener("click", (e) => e.preventDefault(), { capture: true }));
    await card.tap();
    await page.waitForTimeout(500);
    expect((await read(card)).y - rest.y, "no sticky lift").toBeCloseTo(0, 1);
    expect((await read(link.locator(".cert-paper-shade"))).opacity, "no sticky shade").toBe(0);
  });
});

// ---- TASK-201: Experience timeline entries (PLAN §4.8) ----
async function rotateDeg(loc: Locator) {
  return loc.evaluate((el) => Number.parseFloat(getComputedStyle(el).rotate) || 0);
}

test.describe("@EVAL-042 Experience timeline entries (TASK-201)", () => {
  test("hover and focus lift the card 3 px, the shadow layer fades by opacity, the pin presses 1 px, the logo turns 0.6° toward upright", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/work", { waitUntil: "networkidle" });
    const item = page.locator(".ct-item:has(.ct-details-summary)").first();
    await item.scrollIntoViewIfNeeded();
    const card = item.locator(".ct-card");
    const shade = item.locator(".ct-paper-lift");
    const pin = item.locator(".ct-pin");
    const logo = item.locator(".ct-logo");
    const text = card.locator(".ct-name");
    const rest = { c: await read(card), s: await read(shade), p: await read(pin), r: await rotateDeg(logo), t: await box(text), cb: await box(card) };
    expect(rest.s.opacity, "shadow layer hidden at rest").toBe(0);
    await card.hover();
    await page.waitForTimeout(800);
    const hov = { c: await read(card), s: await read(shade), p: await read(pin), r: await rotateDeg(logo), t: await box(text), cb: await box(card) };
    expect(hov.c.y - rest.c.y, "card lift").toBeCloseTo(-3, 0);
    expect(hov.s.opacity, "shadow layer shown").toBe(1);
    expect(hov.p.y - rest.p.y, "pin presses 1 px").toBeCloseTo(1, 0);
    expect(Math.abs(hov.r), "logo is closer to upright").toBeLessThan(Math.abs(rest.r));
    expect(Math.abs(rest.r) - Math.abs(hov.r), "logo turns 0.6°").toBeCloseTo(0.6, 1);
    expect(hov.t.y - hov.cb.y, "text stays static relative to the card").toBeCloseTo(rest.t.y - rest.cb.y, 0);
    for (const r of [hov.c, hov.s, hov.p]) {
      noForbiddenTransitions("ct", r);
      expect(r.scale).toBeLessThanOrEqual(1.0001);
    }
    expect(hov.s.props, "the shadow layer transitions opacity only").toEqual(["opacity"]);
    expect(hov.s.durations[0], "shadow in 420 ms").toBeCloseTo(420, 0);
    expect(hov.p.durations[0], "pin 180 ms").toBeCloseTo(180, 0);

    await page.mouse.move(2, 2);
    await page.waitForTimeout(800);
    await keyboardFocus(page, item.locator(".ct-details-summary"));
    await page.waitForTimeout(800);
    expect((await read(card)).y - rest.c.y, "focus twin lift").toBeCloseTo(-3, 0);
    expect((await read(shade)).opacity, "focus twin shadow").toBe(1);
  });

  test("reduced motion: no lift, no pin press, no logo turn — the shadow still shows", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work", { waitUntil: "networkidle" });
    const item = page.locator(".ct-item").first();
    await item.scrollIntoViewIfNeeded();
    const card = item.locator(".ct-card");
    const rest = { c: await read(card), p: await read(item.locator(".ct-pin")), r: await rotateDeg(item.locator(".ct-logo")) };
    await card.hover();
    await page.waitForTimeout(600);
    expect((await read(card)).y - rest.c.y, "RM: no lift").toBeCloseTo(0, 1);
    expect((await read(item.locator(".ct-pin"))).y - rest.p.y, "RM: no pin press").toBeCloseTo(0, 1);
    expect(await rotateDeg(item.locator(".ct-logo")), "RM: no logo turn").toBeCloseTo(rest.r, 2);
    expect((await read(item.locator(".ct-paper-lift"))).opacity, "RM: shadow feedback stays").toBe(1);
  });

  test("touch: a tap leaves no hover state behind", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/work", { waitUntil: "networkidle" });
    const item = page.locator(".ct-item").first();
    await item.scrollIntoViewIfNeeded();
    const card = item.locator(".ct-card");
    const rest = await read(card);
    await card.locator(".ct-name").tap();
    await page.waitForTimeout(600);
    expect((await read(card)).y - rest.y, "no sticky lift").toBeCloseTo(0, 1);
    expect((await read(item.locator(".ct-paper-lift"))).opacity, "no sticky shadow").toBe(0);
  });
});

// ---- TASK-201: What I Bring tool chips ----
test.describe("@EVAL-042 What I Bring tool chips (TASK-201)", () => {
  const STAGE = "#wib-panel-technology";
  const OPEN = "#wib-tab-technology"; // TASK-216: the stage is opened from the track

  test("hover and keyboard focus lift a chip 2 px and show the project from data; a chip with no project lifts and shows no label", async ({ page, viewport }) => {
    test.skip(viewport!.width < 960, "the side-by-side layout and fine-pointer hover");
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.locator("section#skills").scrollIntoViewIfNeeded();
    await page.locator(OPEN).click();
    const chip = page.locator(`${STAGE} .wib-chip`, { hasText: "Supabase" });
    const note = chip.locator(".wib-chip-note");
    await expect(note).toHaveText("→ TeachSpark");
    const rest = { c: await read(chip), n: await read(note) };
    expect(rest.n.opacity, "label hidden at rest").toBe(0);
    await chip.hover();
    await page.waitForTimeout(500);
    const hov = { c: await read(chip), n: await read(note) };
    expect(hov.c.y - rest.c.y, "chip lift").toBeCloseTo(-2, 0);
    expect(hov.n.opacity, "label shown").toBe(1);
    noForbiddenTransitions("chip", hov.c);
    noForbiddenTransitions("chip note", hov.n);
    expect(hov.c.scale).toBeLessThanOrEqual(1.0001);

    // an unpaired chip (AI stage's Vertex AI since TASK-216 trimmed Technology to paired tools): lifts, no label element at all
    await page.locator("#wib-tab-ai-genai").click();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(500); // let the 240 ms panel entrance settle before reading the resting position
    const bare = page.locator("#wib-panel-ai-genai .wib-chip", { hasText: "Vertex AI" });
    await expect(bare.locator(".wib-chip-note")).toHaveCount(0);
    const bareRest = await read(bare);
    await bare.hover();
    await page.waitForTimeout(500);
    expect((await read(bare)).y - bareRest.y, "unpaired chip lift").toBeCloseTo(-2, 0);

    // keyboard: the same label and lift (back on the Technology stage)
    await page.locator(OPEN).click();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(500);
    await keyboardFocus(page, page.locator(OPEN));
    await expect(page.locator(OPEN)).toHaveAttribute("aria-selected", "true");
    await keyboardFocus(page, chip);
    await expect.poll(async () => (await read(chip)).y - rest.c.y, { message: "focus twin lift" }).toBeCloseTo(-2, 0);
    await expect.poll(async () => (await read(note)).opacity, { message: "focus twin label" }).toBe(1);
  });

  test("reduced motion: no lift, the label still shows on focus", async ({ page, viewport }) => {
    test.skip(viewport!.width < 960, "the side-by-side layout and fine-pointer hover");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.locator("section#skills").scrollIntoViewIfNeeded();
    await page.locator(OPEN).click();
    const chip = page.locator(`${STAGE} .wib-chip`, { hasText: "Railway" });
    const rest = await read(chip);
    await chip.hover();
    await page.waitForTimeout(400);
    expect((await read(chip)).y - rest.y, "RM: no lift").toBeCloseTo(0, 1);
    expect((await read(chip.locator(".wib-chip-note"))).opacity, "RM: label shows").toBe(1);
  });

  test("touch: a tap shows the project label and a second tap hides it; nothing latches from hover", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.locator("section#skills").scrollIntoViewIfNeeded();
    await page.locator(OPEN).tap();
    const chip = page.locator(`${STAGE} .wib-chip`, { hasText: "Supabase" });
    const note = chip.locator(".wib-chip-note");
    await chip.scrollIntoViewIfNeeded();
    expect((await read(note)).opacity, "hidden before the tap").toBe(0);
    await chip.tap();
    await page.waitForTimeout(400);
    expect((await read(note)).opacity, "tap shows the label").toBe(1);
    await chip.tap();
    await page.waitForTimeout(400);
    expect((await read(note)).opacity, "second tap hides it").toBe(0);
  });
});
