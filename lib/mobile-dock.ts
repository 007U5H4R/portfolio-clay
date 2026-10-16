/**
 * TASK-224 — the phone-only bottom dock's destinations. Routes are the site's own (`lib/nav`): Home `/`, Experience `/work`,
 * Portfolio `/projects`, About `/about`, Certifications `/certifications` (labelled "Certs" so six labels stay readable, Tushar 2026-10-16) — nothing is invented. "Ask Tushky" is not a route:
 * the dock opens the existing global Ask drawer (`useAskContext().openPanel`), the same one the header's Ask button opens.
 */
export interface DockLink {
  kind: "link";
  label: string;
  href: string;
  icon: string;
}
export interface DockAsk {
  kind: "ask";
  label: string;
  icon: string;
}
export type DockItem = DockLink | DockAsk;

export const dockItems: DockItem[] = [
  { kind: "link", label: "Home", href: "/", icon: "/media/mobile-nav/home.webp" },
  { kind: "link", label: "Experience", href: "/work", icon: "/media/mobile-nav/experience.webp" },
  { kind: "link", label: "Portfolio", href: "/projects", icon: "/media/mobile-nav/portfolio.webp" },
  { kind: "link", label: "About", href: "/about", icon: "/media/mobile-nav/about.webp" },
  { kind: "link", label: "Certs", href: "/certifications", icon: "/media/mobile-nav/certifications.webp" },
  { kind: "ask", label: "Ask Tushky", icon: "/media/illustrations/tushky-head.webp" },
];

/**
 * The dock link that is current for a pathname. Exact match on the item's route, plus the existing hierarchy: a project
 * detail page (`/work/<slug>`, reached from the Portfolio index at `/projects`) belongs to Portfolio, not Experience.
 */
export function activeDockHref(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path.startsWith("/work/")) return "/projects";
  return dockItems.find((i): i is DockLink => i.kind === "link" && i.href === path)?.href;
}
