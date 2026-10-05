/**
 * TASK-130 new-tab rule (Tushar, 2026-09-29: "whenever a user clicks on case study link a new tab
 * should open"). A case-study link is any site link to `/work/<slug>` (with or without a `#hash`);
 * `/work` itself is the Experience page and is not a case study. Every such link carries these
 * attributes plus the visually hidden `NEW_TAB_HINT` (components/common/NewTabHint.tsx);
 * tests/e2e/case-study-new-tab.spec.ts crawls every public route to enforce it.
 */
export const CASE_STUDY_HREF = /^\/work\/[a-z0-9-]+(?:[#?].*)?$/;

export const NEW_TAB_HINT = "(opens in a new tab)";

export function isCaseStudyHref(href: string): boolean {
  return CASE_STUDY_HREF.test(href);
}

/** `target`/`rel` for a case-study link; nothing for any other href (spread-safe). */
export function caseStudyLinkAttrs(href: string): { target?: "_blank"; rel?: string } {
  return isCaseStudyHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}
