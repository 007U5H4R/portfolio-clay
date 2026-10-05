/**
 * Primary nav copy (Design.md §4.1, decision D8 — TKT-71; TKT-101 Dev-90): `Home · Experience · Portfolio ·
 * Thinking · About · Playground`. Rendered by `PrimaryNav` as header tabs at every width (TASK-112: no hamburger). `Contact` is
 * never a nav item — it is the "Let's connect →" pill, the band and the page CTAs.
 *
 * D8 (proposed default, Tushar to confirm): the band footer (S16) dropped the footer nav that was
 * Playground's only path (E-9), so Playground joins the header as the fifth item. **Revert path:**
 * remove the `Playground` line below to return to four items; then add the band Playground link in
 * `BandFooter` (TKT-72 note, technical-plan E-20) so EVAL-011 reachability still holds.
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
  { label: "Playground", href: "/playground", hidden: true }, // TASK-135: hidden, page kept (was D8)
  { label: "Certifications", href: "/certifications" }, // TKT-102 (Tushar 2026-09-26)
];

/** The tabs the header renders: `allNavItems` minus the hidden ones. */
export const navItems: NavItem[] = allNavItems.filter((item) => !item.hidden);
