import type { PageName } from "./events";

/** pathname → the canonical page identifier used by `page_name` (one place; unit-tested). */
export function pageNameFor(path: string): PageName {
  const p = path === "/" ? "/" : path.replace(/\/+$/, "");
  if (p === "/") return "home";
  if (p === "/work") return "experience";
  if (p.startsWith("/work/")) return "case_study";
  if (p === "/projects") return "portfolio";
  if (p === "/about") return "about";
  if (p === "/contact") return "contact";
  if (p === "/thinking") return "thinking";
  if (p.startsWith("/thinking/")) return "essay";
  if (p === "/certifications") return "certifications";
  if (p === "/card") return "card";
  if (p === "/lab") return "gummy_lab";
  return "other";
}

/** `/work/teachspark` → `teachspark`; null for any other path. */
export function caseStudySlug(path: string): string | null {
  const m = /^\/work\/([a-z0-9][a-z0-9-]*)$/.exec(path.replace(/\/+$/, ""));
  return m?.[1] ?? null;
}

/** Dev-only QA boards are never measured. */
export function isMeasuredPath(path: string): boolean {
  return !path.startsWith("/dev/") && !path.startsWith("/api/");
}
