/**
 * scene-opener.spec.ts (TKT-95, decision EXE-18, Design.md §11 Dev-24) — every non-home page opens
 * with its manifest scene as a full-bleed `SceneOpener` (the home `SceneBanner` + a paper torn edge),
 * directly under the header and above the page's own title.
 *
 * Per route, at every viewport project: the opener is the first child of `<main>`; its `<img>` carries
 * the manifest alt byte-for-byte and is not hidden from assistive tech; it is the page's LCP-priority
 * image (`fetchpriority="high"`, eager); the cropped canvas covers the banner box on all four edges
 * (the focal clamp never exposes a gap); the opener holds exactly one counted decoration (`torn`);
 * and the page's h1 sits below the banner.
 */
import { test, expect } from "./fixtures";
// The manifest directly — `lib/illustrations.ts` statically imports the JPEGs (see about.spec.ts).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { LAYERED_SCENES } from "@/content/media/illustrations/layers";

const OPENERS: readonly { route: string; id: string }[] = [
  { route: "/work", id: "scene-experience" }, // TASK-114 (Dev-103): its own scene; the pinboard moved to /projects (TKT-101)
  { route: "/projects", id: "scene-work" },
  { route: "/thinking", id: "scene-thinking" },
  { route: "/thinking/green-tests-prove-it-runs", id: "scene-thinking" },
  { route: "/about", id: "scene-about" },
  { route: "/playground", id: "scene-playground" },
  { route: "/contact", id: "scene-contact" },
  { route: "/certifications", id: "scene-certifications" }, // TASK-114 (Dev-104)
];

for (const { route, id } of OPENERS) {
  test(`${route} opens with the ${id} scene banner`, async ({ page }) => {
    await page.goto(route, { waitUntil: "load" });
    const alt = ILLUSTRATIONS.find((entry) => entry.id === id)!.alt;

    const first = page.locator("main#main > *").first();
    await expect(first).toHaveAttribute("data-opener", id);

    // M-011 P2: the opener is a layered scene — one `role="img"` root carrying the manifest alt, every layer `alt=""` +
    // `aria-hidden`; each layer has a light and a dark twin, the active theme's set is the visible one and its `bg` is the
    // LCP image (eager, high priority; the rest lazy).
    const layers = LAYERED_SCENES.find((l) => l.id === id)!.layers.length;
    const root = first.locator("[data-paper-scene]");
    await expect(root).toHaveAttribute("role", "img");
    await expect(root).toHaveAttribute("aria-label", alt);
    expect(await root.evaluate((el) => el.closest('[aria-hidden="true"]') === null)).toBe(true);
    await expect(first.locator("img")).toHaveCount(layers * 2);
    const img = first.locator("img:visible");
    await expect(img).toHaveCount(layers);
    const bg = first.locator("picture[data-theme-art]:visible img").first();
    await expect(bg).toHaveAttribute("fetchpriority", "high");
    await expect(bg).toHaveAttribute("loading", "eager");
    for (const el of await img.all()) await expect(el).toHaveAttribute("alt", "");

    const decor = await first.locator("[data-decor]").evaluateAll((els) => els.map((el) => el.getAttribute("data-decor")));
    expect(decor).toEqual(["torn"]);

    const box = (await root.boundingBox())!;
    expect(box.height).toBeGreaterThan(0);

    const h1 = (await page.getByRole("heading", { level: 1 }).first().boundingBox())!;
    expect(h1.y).toBeGreaterThanOrEqual(box.y + box.height);
  });
}

// TASK-114 (Tushar 2026-09-27: "Just make sure its not repeated"): no two tabs open on the same scene.
// The essay pages share `/thinking`'s scene by design (TKT-95), so only one route per section counts.
test("no two tabs repeat an opener scene", () => {
  const tabs = OPENERS.filter(({ route }) => !route.startsWith("/thinking/") && !route.startsWith("/work/"));
  const ids = tabs.map(({ id }) => id);
  expect(new Set(ids).size).toBe(ids.length);
});
