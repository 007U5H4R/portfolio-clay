/**
 * Primary nav copy (Design.md §3 / SITEMAP.md, E-9): exactly `Home · Work · Thinking · About`.
 * `Playground` and `Contact` are reached via footer/CTAs only, never the header nav — do not
 * add them here without re-opening E-9.
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
];
