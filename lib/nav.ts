/**
 * Primary nav copy (Design.md §4.1, decision D8 — TKT-71; TKT-101 Dev-90): `Home · Experience · Portfolio ·
 * Thinking · About`. Rendered by `PrimaryNav` as header tabs at every width (TASK-112: no hamburger). `Contact` is
 * never a nav item — it is the "Let's connect →" pill, the band and the page CTAs.
 *
 * TASK-249 (Tushar 2026-10-18): the Playground tab (D8) is gone with the page; `/playground` redirects to `/projects`.
 */
export interface NavItem {
  label: string;
  href: string;
  /**
   * TASK-135 (Tushar 2026-09-29): a hidden tab is kept here but not rendered in the header. The page
   * itself stays built, public and in the sitemap. To show a tab again, delete its `hidden: true`.
   */
  hidden?: boolean;
}

/** Every tab the site has, including hidden ones: the single place to switch a tab back on. */
export const allNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  // TKT-101 (Tushar 2026-09-26): "Work" → "Experience" (the collage timeline at /work); the project
  // index moved to its own "Projects" tab at /projects — six items (Design.md §11 Dev-90).
  { label: "Experience", href: "/work" },
  // TASK-116 (Tushar 2026-09-28): the tab reads "Portfolio"; the route stays /projects (spec §1).
  { label: "Portfolio", href: "/projects" },
  { label: "Thinking", href: "/thinking", hidden: true }, // TASK-135: hidden, page kept
  { label: "About", href: "/about" },
  { label: "Certifications", href: "/certifications" }, // TKT-102 (Tushar 2026-09-26)
];

/** The tabs the header renders: `allNavItems` minus the hidden ones. */
export const navItems: NavItem[] = allNavItems.filter((item) => !item.hidden);

/**
 * The tab that is current for a pathname (TASK-192; was inline in `PrimaryNav`): an exact match on the tab's route — a nested
 * path such as `/work/<slug>` marks no tab, as before. Hidden tabs are never returned (they are not rendered).
 */
export function activeNavHref(pathname: string | null | undefined): string | undefined {
  return navItems.find((item) => item.href === pathname)?.href;
}
