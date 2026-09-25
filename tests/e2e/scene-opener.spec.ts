/**
 * scene-opener.spec.ts (TKT-95, decision EXE-18, Design.md §11 Dev-24) — every non-home page opens
 * with its manifest scene as a full-bleed `SceneOpener` (the home `SceneBanner` + a paper torn edge),
 * directly under the header and above the page's own title.
 *
 * Per route, at every viewport project: the opener is the first child of `<main>`; its `<img>` carries
 * the manifest alt byte-for-byte and is not hidden from assistive tech; it is the page's LCP-priority
 * image (`fetchpriority="high"`, eager); the cropped canvas covers the banner box on all four edges
 * (the `focalY` clamp never exposes a gap); the opener holds exactly one counted decoration (`torn`);
 * and the page's h1 sits below the banner.
 */
import { test, expect } from "./fixtures";
// The manifest directly — `lib/illustrations.ts` statically imports the JPEGs (see about.spec.ts).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const OPENERS: readonly { route: string; id: string }[] = [
  { route: "/work", id: "scene-work" },
  { route: "/work/teachspark", id: "scene-casestudy" },
  { route: "/thinking", id: "scene-thinking" },
  { route: "/thinking/green-tests-prove-it-runs", id: "scene-thinking" },
  { route: "/about", id: "scene-about" },
  { route: "/playground", id: "scene-playground" },
  { route: "/contact", id: "scene-contact" },
];

for (const { route, id } of OPENERS) {
  test(`${route} opens with the ${id} scene banner`, async ({ page }) => {
    await page.goto(route, { waitUntil: "load" });
    const alt = ILLUSTRATIONS.find((entry) => entry.id === id)!.alt;

    const first = page.locator("main#main > *").first();
    await expect(first).toHaveAttribute("data-opener", id);

    const img = first.locator("img");
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute("alt", alt);
    await expect(img).toHaveAttribute("fetchpriority", "high");
    await expect(img).toHaveAttribute("loading", "eager");
    expect(await img.evaluate((el) => el.closest('[aria-hidden="true"]') === null)).toBe(true);

    const decor = await first.locator("[data-decor]").evaluateAll((els) => els.map((el) => el.getAttribute("data-decor")));
    expect(decor).toEqual(["torn"]);

    const box = (await first.locator(".scene-banner").boundingBox())!;
    const canvas = (await first.locator(".scene-banner-canvas").boundingBox())!;
    expect(box.height).toBeGreaterThan(0);
    expect(canvas.x).toBeLessThanOrEqual(box.x + 0.5);
    expect(canvas.y).toBeLessThanOrEqual(box.y + 0.5);
    expect(canvas.x + canvas.width).toBeGreaterThanOrEqual(box.x + box.width - 0.5);
    expect(canvas.y + canvas.height).toBeGreaterThanOrEqual(box.y + box.height - 0.5);

    const h1 = (await page.getByRole("heading", { level: 1 }).first().boundingBox())!;
    expect(h1.y).toBeGreaterThanOrEqual(box.y + box.height);
  });
}
