import { dockItems, activeDockHref, type DockLink } from "@/lib/mobile-dock";
import { resumeAction, site } from "@/lib/site";

/**
 * TASK-232 — the phone drawer's destinations (the menu behind the header's kebab, < 640 px). Routes and icons come from the dock
 * (`lib/mobile-dock`) so the dock and the drawer match; "Ask Tushky" is not a route (it opens the global Ask drawer). Product thinking
 * (/thinking) and Gummy Lab (/lab) are deliberately not listed here; their pages and every other link to them are untouched.
 */
export interface MenuLink {
  kind: "link";
  label: string;
  href: string;
  icon: string | "linkedin" | "github" | "resume";
  external?: boolean;
}
export interface MenuAsk {
  kind: "ask";
  label: string;
  hint: string;
  icon: string;
}
/** TASK-170: replays the guided tour (not a route; goes home first when needed). */
export interface MenuTour {
  kind: "tour";
  label: string;
  hint: string;
  icon: string;
}
export type MenuItem = MenuLink | MenuAsk | MenuTour;
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
      { kind: "tour", label: "Take a tour", hint: "A 30-second look around", icon: dockLink("/", "Home").icon },
    ],
  },
  {
    label: "Connect",
    items: [
      { kind: "link", label: "Let's connect", href: "/contact", icon: "/media/mobile-nav/connect.webp" },
      { kind: "link", label: "LinkedIn", href: site.linkedin, icon: "linkedin", external: true },
      // TASK-302: the same destinations the footer's Social icons use (`site.github`, `resumeAction().href`), nothing new.
      ...(site.github ? [{ kind: "link" as const, label: "GitHub", href: site.github, icon: "github", external: true }] : []),
      { kind: "link", label: "Resume", href: resumeAction().href, icon: "resume", external: true },
    ],
  },
];

/** The drawer row that is current for a pathname: the dock's rule, plus `/contact` for Let's connect. */
export function activeMenuHref(pathname: string | null | undefined): string | undefined {
  if (pathname === "/contact") return "/contact";
  return activeDockHref(pathname);
}
