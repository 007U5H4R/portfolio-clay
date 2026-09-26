/**
 * eval-002.spec.ts (technical-plan.md §B S09.02, `@EVAL-002`) — the recruiter path. The full
 * journey is / → /work → /work/[slug] → /about → resume → /contact in ≤ 6 clicks with every hop
 * 200 and the resume 200 on production. Implemented incrementally: the / → /work → /work/teachspark
 * leg is live now (those routes exist); the /about hop and the resume download are fixme'd until
 * TKT-42 (/about) and TKT-08 (resume PDF, resumeAvailable flips true).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-002 recruiter path: / → /projects → /work/teachspark all resolve (200 + heading)", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "journey verified at 390 and 1440");

  const home = await page.goto("/", { waitUntil: "load" });
  expect(home?.status(), "/ must be 200").toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI-native products");
  // The live leg of the path is navigable by click: the home page links to the case study today
  // (the /work grid that also links to it is TKT-16 — asserted in the fixme below).
  await expect(page.locator('a[href="/work/teachspark"]').first()).toBeVisible();

  // TKT-101: the project index is /projects (the hero's "View my work" CTA); /work is the Experience page.
  const work = await page.goto("/projects", { waitUntil: "load" });
  expect(work?.status(), "/projects must be 200").toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href="/work/teachspark"]').first()).toBeVisible();
  const experience = await page.goto("/work", { waitUntil: "load" });
  expect(experience?.status(), "/work (Experience) must be 200").toBe(200);

  const study = await page.goto("/work/teachspark", { waitUntil: "load" });
  expect(study?.status(), "/work/teachspark must be 200").toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");

  // /contact already exists and is a valid hop.
  const contact = await page.goto("/contact", { waitUntil: "load" });
  expect(contact?.status(), "/contact must be 200").toBe(200);
});

// Full click-counted journey through /about and the resume download (≤ 6 clicks, resume 200 on
// production) — /about is TKT-42, the resume PDF is TKT-08 (until then resumeAvailable=false and
// the CTA is a labelled placeholder to /contact#resume).
test.fixme("@EVAL-002 recruiter path: full journey incl /about + resume in ≤ 6 clicks (TKT-42/TKT-08)", {
  tag: "@EVAL-002",
}, async () => {});
