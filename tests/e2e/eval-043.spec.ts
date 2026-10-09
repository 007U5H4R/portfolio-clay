/**
 * eval-043.spec.ts (`@EVAL-043`, evaluation-plan §11, M-012 P2 / TASK-181.2) — the per-project signatures of the Featured Work
 * trio. Each card moves different parts (RailCite's train and headlight, Slag City's works, Campfire Board's fire and notes); every
 * signature is transform / opacity only, finite (no running animation 2 s after the hover starts, none infinite), plays on keyboard
 * focus as well as hover, rests at opacity 0 / identity when the card is idle, and lives inside the card's clipped, masked sheet. The
 * rest-pose half of the case (the layers stack to the original collage, byte for byte) is `tests/unit/featured-layers.test.ts`.
 * Runs at w1440 (hover and focus on a fine pointer); w390 asserts the touch variant.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const SLUGS = ["railcite", "slag-city", "campfire-board"] as const;
const lift = (slug: string) => `.fw-lift[data-featured-lift="${slug}"]`;
const width = (page: Page) => page.viewportSize()!.width;

async function gotoFeatured(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.locator(lift("railcite")).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>("#work-featured .fw-layer img")].filter((i) => i.getBoundingClientRect().top < innerHeight).every((i) => i.complete));
  await page.waitForTimeout(600);
}

/** Computed signature state of a card: opacity / translate / transform of every `[data-sig]` image, keyed by layer name. */
async function sig(page: Page, slug: string) {
  return page.evaluate((sel) => {
    const out: Record<string, { opacity: string; translate: string; transform: string }> = {};
    for (const el of document.querySelectorAll(`${sel} [data-sig]`)) {
      const cs = getComputedStyle(el);
      out[(el as HTMLElement).dataset.layer ?? (el as HTMLElement).dataset.sig!] = { opacity: cs.opacity, translate: cs.translate, transform: cs.transform };
    }
    return out;
  }, lift(slug));
}

/** The signature is "awake" when at least `want` parts differ from rest in opacity, translate or transform. */
const differing = (a: Awaited<ReturnType<typeof sig>>, b: Awaited<ReturnType<typeof sig>>) => Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));

test.describe("@EVAL-043 signatures", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) !== 1440, "signatures are measured at w1440 (fine pointer)");
  });

  test("each card's signature targets are distinct: 3/3, no part shared", async ({ page }) => {
    await gotoFeatured(page);
    const sets = await Promise.all(
      SLUGS.map((slug) =>
        page.evaluate((sel) => [...document.querySelectorAll(`${sel} [data-sig]`)].map((e) => (e as HTMLElement).dataset.sig!).sort(), lift(slug)),
      ),
    );
    for (const s of sets) expect(s.length).toBeGreaterThan(1);
    // a given token (train, glow, flames…) belongs to one card only
    const tokens = sets.map((s) => new Set(s.flatMap((x) => x.split(" "))));
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect([...tokens[i]!].filter((t) => tokens[j]!.has(t)), `${SLUGS[i]} / ${SLUGS[j]} share a signature token`).toEqual([]);
  });

  test("at rest every signature extra is invisible and every signature part sits at identity", async ({ page }) => {
    await gotoFeatured(page);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(600);
    for (const slug of SLUGS) {
      const rest = await sig(page, slug);
      for (const [layer, v] of Object.entries(rest)) {
        expect(v.translate === "none" || v.translate === "0px 0px", `${slug}/${layer} translate ${v.translate}`).toBe(true);
        expect(v.transform === "none", `${slug}/${layer} transform ${v.transform}`).toBe(true);
      }
      // the overlays that exist only for the signature (halo, glow, lit windows, slag core, smoke) rest at opacity 0
      for (const layer of ["halo", "glow", "lit", "slaghot", "puff1", "puff2", "puff3"]) if (rest[layer]) expect(rest[layer]!.opacity, `${slug}/${layer}`).toBe("0");
    }
  });

  test("hover and keyboard focus both wake the signature; it settles within 2 s with nothing running, nothing infinite", async ({ page }) => {
    await gotoFeatured(page);
    for (const slug of SLUGS) {
      await page.mouse.move(2, 2);
      await page.waitForTimeout(700);
      const rest = await sig(page, slug);

      const box = (await page.locator(`${lift(slug)} .fw-paper`).boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55, { steps: 8 });
      await page.waitForTimeout(2000);
      const hovered = await sig(page, slug);
      expect(differing(rest, hovered).length, `${slug}: hover wakes no signature part`).toBeGreaterThan(0);

      // transform / opacity only, finite: no running animation 2 s in, none infinite
      const running = await page.evaluate((sel) => {
        const card = document.querySelector(sel)!;
        return document
          .getAnimations()
          .filter((a) => {
            const t = (a.effect as KeyframeEffect | null)?.target;
            return t && card.contains(t);
          })
          .map((a) => ({ state: a.playState, infinite: a.effect?.getComputedTiming().iterations === Infinity, props: ((a as CSSTransition).transitionProperty ?? (a as CSSAnimation).animationName) as string }));
      }, lift(slug));
      expect(running.filter((r) => r.infinite), `${slug} infinite animations`).toEqual([]);
      expect(running.filter((r) => r.state === "running"), `${slug} still running 2 s after the hover began`).toEqual([]);
      expect(running.filter((r) => /^(box-shadow|filter|backdrop-filter|width|height|top|left|margin)/.test(r.props)), `${slug} animates a forbidden property`).toEqual([]);

      // leave: everything returns
      await page.mouse.move(2, 2, { steps: 6 });
      await page.waitForTimeout(1600);
      expect(differing(rest, await sig(page, slug)), `${slug}: parts left displaced after the hover`).toEqual([]);

      // keyboard focus: the same awake pose with no pointer anywhere near
      await page.locator(`${lift(slug)} .fw-cta`).focus({ preventScroll: true });
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab"); // :focus-visible by keyboard
      await page.waitForTimeout(2000);
      const focused = await sig(page, slug);
      expect(differing(rest, focused), `${slug}: focus and hover wake different parts`).toEqual(differing(rest, hovered));
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.waitForTimeout(1200);
    }
  });

  test("the signature stays inside the card's masked, clipped sheet", async ({ page }) => {
    await gotoFeatured(page);
    for (const slug of SLUGS) {
      const clip = await page.locator(`${lift(slug)} .fw-paper`).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { overflow: cs.overflow, mask: cs.maskImage || cs.webkitMaskImage };
      });
      expect(clip.overflow, `${slug} sheet overflow`).toBe("hidden");
      expect(clip.mask, `${slug} sheet mask`).toMatch(/tear-feature/);
    }
  });

  test("no signature runs while the section is off-screen", async ({ page }) => {
    await gotoFeatured(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const live = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && (a.effect as KeyframeEffect | null)?.target?.closest?.("#work-featured")).length);
    expect(live).toBe(0);
  });
});

test.describe("@EVAL-043 touch", () => {
  test("touch shows the evidence and information slips without any hover; nothing loops", async ({ page }) => {
    test.skip(width(page) !== 390, "touch profile");
    await gotoFeatured(page);
    const opacities = await page.evaluate(() => [...document.querySelectorAll("#work-featured .fw-proof-item, #work-featured .fw-slip")].map((e) => getComputedStyle(e).opacity));
    expect(opacities.length).toBe(4);
    expect(opacities.every((o) => o === "1"), opacities.join(",")).toBe(true);
    const infinite = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity && (a.effect as KeyframeEffect).target?.closest?.("#work-featured")).length);
    expect(infinite).toBe(0);
  });
});
