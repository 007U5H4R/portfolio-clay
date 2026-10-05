/**
 * Semantic cursor labels (cursor.md §2, §41). An explicit `data-cursor="…"` wins; otherwise a link
 * earns a label from where it points. Plain buttons, in-page anchors and content get none (no noise).
 */
import { isCaseStudyHref } from "@/lib/case-study-link";

export function labelFor(target: Element | null): string | null {
  const tagged = target?.closest<HTMLElement>("[data-cursor]");
  if (tagged) return tagged.dataset.cursor || null;
  const link = target?.closest<HTMLAnchorElement>("a[href]");
  if (!link) return null;
  const raw = link.getAttribute("href") ?? "";
  if (raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return null;
  const kind = link.dataset.cursorKind;
  if (kind === "prd") return "PRD ↗";
  let url: URL;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return url.hostname === "github.com" ? "CODE ↗" : "OPEN ↗";
  if (isCaseStudyHref(url.pathname)) return "CASE STUDY →";
  if (url.pathname === "/projects" || url.pathname.startsWith("/projects/")) return "VIEW →";
  return "OPEN →";
}
