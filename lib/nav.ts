/**
 * Primary nav copy (Design.md §4.1, decision D8 — TKT-71): `Home · Work · Thinking · About ·
 * Playground`. Rendered by `Header` (≥ 1024) and by the `MobileMenu` sheet (< 1024). `Contact` is
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
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Thinking", href: "/thinking" },
  { label: "About", href: "/about" },
  { label: "Playground", href: "/playground" }, // D8 — remove this line to return to four items
];
