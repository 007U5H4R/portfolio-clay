import { NEW_TAB_HINT, isCaseStudyHref } from "@/lib/case-study-link";
import { VisuallyHidden } from "./VisuallyHidden";

/**
 * The visually hidden " (opens in a new tab)" note every case-study link carries (TASK-130). Pass
 * `href` to render it only when that href is a case study (`/work/<slug>`), so shared link
 * renderers (Ask sources, How I think pills) can include it unconditionally.
 */
export function NewTabHint({ href }: { href?: string | undefined }) {
  if (href !== undefined && !isCaseStudyHref(href)) return null;
  return <VisuallyHidden> {NEW_TAB_HINT}</VisuallyHidden>;
}
