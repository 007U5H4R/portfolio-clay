import { dockItems, activeDockHref, type DockLink } from "@/lib/mobile-dock";
import { site } from "@/lib/site";

/**
 * TASK-232 — the phone drawer's destinations (the menu behind the header's kebab, < 640 px). Routes and icons come from the dock
 * (`lib/mobile-dock`) so the dock and the drawer match; "Ask Tushky" is not a route (it opens the global Ask drawer). Product thinking
 * (/thinking) and Gummy Lab (/lab) are deliberately not listed here; their pages and every other link to them are untouched.
 */
export interface MenuLink {
  kind: "link";
  label: string;
  href: string;
  icon: string | "linkedin";
  external?: boolean;
}
export interface MenuAsk {
  kind: "ask";
  label: string;
  hint: string;
  icon: string;
}
export type MenuItem = MenuLink | MenuAsk;
export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const dockLink = (href: string, label: string): MenuLink => {
  const d = dockItems.find((i): i is DockLink => i.kind === "link" && i.href === href);
  if (!d) throw new Error(`mobile-menu: no dock item for ${href}`);
  return { kind: "link", label, href, icon: d.icon };
};
const askIcon = dockItems.find((i) => i.kind === "ask")!.icon;

export const menuGroups: MenuGroup[] = [
  {
    label: "Portfolio",
    items: [
      dockLink("/", "Home"),
      dockLink("/work", "Experience"),
      dockLink("/projects", "Portfolio"),
      { kind: "ask", label: "Ask Tushky", hint: "Questions about my work", icon: askIcon },
      dockLink("/about", "About"),
      dockLink("/certifications", "Certifications"),
    ],
  },
  {
    label: "Connect",
    items: [
      { kind: "link", label: "Let's connect", href: "/contact", icon: "/media/mobile-nav/connect.webp" },
      { kind: "link", label: "LinkedIn", href: site.linkedin, icon: "linkedin", external: true },
    ],
  },
];

/** The drawer row that is current for a pathname: the dock's rule, plus `/contact` for Let's connect. */
export function activeMenuHref(pathname: string | null | undefined): string | undefined {
  if (pathname === "/contact") return "/contact";
  return activeDockHref(pathname);
}
