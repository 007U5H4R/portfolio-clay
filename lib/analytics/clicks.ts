/**
 * Click classification (TASK-194). One delegated listener (runtime.ts) hands every activated anchor to
 * `describeAnchor` (DOM → plain facts) and `classifyClick` (facts → events). Splitting them keeps the
 * rules pure and unit-tested, and means no component needs its own tracking call for links: the résumé,
 * LinkedIn, email, product and case-study links are recognised by WHERE THEY POINT, so a new button that
 * links to the same place is measured without anyone remembering to instrument it.
 *
 * Nothing here prevents or delays navigation: it only reads the anchor and returns events.
 */
import { destinationTypeFor } from "./chat";
import type { CtaLocation, EventName, EventProps, PageName } from "./events";
import { destinationDomain, canonicalPath } from "./sanitize";

export type Emit = { [N in EventName]: { name: N; props: EventProps<N> } }[EventName];

export type Zone = "header" | "footer" | "ask_panel" | "hero" | "product_sheet" | "other";

export interface ClickFacts {
  href: string;
  origin: string;
  pageName: PageName;
  zone: Zone;
  /** `data-action` on a portfolio sheet strip: product | github | prd | case | pitch | demo. */
  action?: string | undefined;
  /** The product shown in the sheet (`data-active-product`). */
  productId?: string | undefined;
}

export interface KnownTargets {
  linkedinPrefix: string;
  resumePrefix: string;
}

const SLUG = /^[a-z0-9][a-z0-9_-]{0,39}$/;

export function ctaLocationFor(zone: Zone, pageName: PageName): CtaLocation {
  switch (zone) {
    case "header": return "header";
    case "footer": return "footer";
    case "hero": return "hero";
    case "ask_panel": return "ask_tushky";
    case "product_sheet": return "projects";
    default:
      switch (pageName) {
        case "contact": return "contact_page";
        case "about": return "about";
        case "case_study": return "case_study";
        case "card": return "card";
        case "portfolio": return "projects";
        default: return "other";
      }
  }
}

const hostOf = (href: string): string => {
  try {
    return new URL(href).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

export function classifyClick(f: ClickFacts, known: KnownTargets): Emit[] {
  let url: URL;
  try {
    url = new URL(f.href, f.origin);
  } catch {
    return [];
  }
  const out: Emit[] = [];
  const loc = ctaLocationFor(f.zone, f.pageName);
  const inDrawer = f.zone === "ask_panel";
  const productId = f.productId && SLUG.test(f.productId) ? f.productId : undefined;

  if (url.protocol === "mailto:") {
    out.push({ name: "email_contact_clicked", props: { cta_location: loc } });
    out.push({ name: "professional_cta_clicked", props: { cta_type: "email", cta_location: loc, destination_type: "email_client" } });
    if (inDrawer) out.push({ name: "chatbot_cta_clicked", props: { destination_type: "contact" } });
    return out;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return out;

  if (url.origin !== f.origin) {
    const domain = destinationDomain(f.href, f.origin);
    if (!domain) return out;
    const isLinkedin = f.href.startsWith(known.linkedinPrefix);
    const isResume = f.href.startsWith(known.resumePrefix);
    const linkType: EventProps<"outbound_link_clicked">["link_type"] = isLinkedin
      ? "linkedin"
      : isResume
        ? "resume"
        : f.action === "product"
          ? "product"
          : f.action === "prd"
            ? "prd"
            : f.action === "github" || domain === "github.com"
              ? "github"
              : domain.endsWith("youtube.com") || domain.endsWith("youtube-nocookie.com") || domain === "vimeo.com"
                ? "video_provider"
                : f.pageName === "certifications"
                  ? "credential"
                  : "other";
    out.push({ name: "outbound_link_clicked", props: { destination_domain: domain, link_type: linkType, cta_location: loc } });
    if (isLinkedin) {
      out.push({ name: "linkedin_profile_clicked", props: { cta_location: loc } });
      out.push({ name: "professional_cta_clicked", props: { cta_type: "linkedin", cta_location: loc, destination_type: "external_profile" } });
    } else if (isResume) {
      out.push({ name: "resume_opened", props: { cta_location: loc, open_method: "external_viewer" } });
      out.push({ name: "professional_cta_clicked", props: { cta_type: "resume", cta_location: loc, destination_type: "external_document" } });
    }
    if (f.zone === "product_sheet" && productId && (f.action === "product" || f.action === "github" || f.action === "prd")) {
      out.push({ name: "product_link_clicked", props: { project_id: productId, destination_domain: domain } });
      out.push({ name: "project_asset_opened", props: { project_id: productId, asset_type: "product_link" } });
    }
    if (inDrawer) out.push({ name: "chatbot_cta_clicked", props: { destination_type: destinationTypeFor(f.href, f.origin) } });
    return out;
  }

  // Same-origin link.
  const path = canonicalPath(url.pathname);
  if (f.zone === "product_sheet" && f.action === "case" && productId) {
    out.push({ name: "project_asset_opened", props: { project_id: productId, asset_type: "case_study" } });
  }
  if (path === "/contact") {
    out.push({ name: "professional_cta_clicked", props: { cta_type: "contact_page", cta_location: loc, destination_type: "internal_page" } });
  }
  if (f.zone === "header" || f.zone === "footer") {
    out.push({ name: "navigation_clicked", props: { destination: path, navigation_location: f.zone } });
  }
  if (inDrawer) out.push({ name: "chatbot_cta_clicked", props: { destination_type: destinationTypeFor(f.href, f.origin) } });
  return out;
}

/** Read the facts the classifier needs from a clicked anchor. Pure DOM reads, no layout. */
export function describeAnchor(anchor: HTMLAnchorElement, pageName: PageName, origin: string): ClickFacts {
  const zone: Zone = anchor.closest("[data-site-header]")
    ? "header"
    : anchor.closest(".ask-panel")
      ? "ask_panel"
      : anchor.closest("footer")
        ? "footer"
        : anchor.closest(".pf-info")
          ? "product_sheet"
          : anchor.closest(".hero")
            ? "hero"
            : "other";
  const sheet = anchor.closest<HTMLElement>("[data-active-product]");
  return {
    href: anchor.href,
    origin,
    pageName,
    zone,
    action: anchor.dataset.action,
    productId: sheet?.dataset.activeProduct,
  };
}

/** The destination host helper used by tests and docs. */
export const hostnameOf = hostOf;
