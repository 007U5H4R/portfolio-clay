/**
 * TASK-130 — which personal builds render the custom case-study system (data/case-studies). Specs
 * that assert the legacy template (30-sec / Deep dive tabs, chapters, ShowTheThinking) skip these;
 * `case-study-system.spec.ts` covers them. Derived from the data, so a product moves over by itself.
 */
import { caseStudies } from "@/data/case-studies";
import { getProject } from "@/data/projects";

export const SYSTEM_SLUGS: readonly string[] = caseStudies.map((study) => study.slug);
export const isSystem = (slug: string): boolean => SYSTEM_SLUGS.includes(slug);
export const SYSTEM_STUDIES = caseStudies.map((study) => ({ study, name: getProject(study.slug)?.name ?? study.slug }));

/**
 * TASK-130 new-tab rule: click a case-study link, assert it opens in a new tab, and return the new
 * page once loaded (the opener stays where it was).
 */
export async function openCaseStudy(page: import("@playwright/test").Page, link: import("@playwright/test").Locator) {
  const { expect } = await import("@playwright/test");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  const before = page.url();
  const [study] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  await study.waitForLoadState("load");
  expect(page.url(), "the opener stays on its page").toBe(before);
  return study;
}
