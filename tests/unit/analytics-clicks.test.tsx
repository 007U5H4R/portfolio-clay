import { describe, expect, it } from "vitest";
import { classifyClick, ctaLocationFor, describeAnchor, type ClickFacts } from "@/lib/analytics/clicks";
import { site } from "@/lib/site";

const ORIGIN = "https://tusharpathak.com";
const KNOWN = { linkedinPrefix: site.linkedin, resumePrefix: site.resumeUrl.split("?")[0]! };
const facts = (over: Partial<ClickFacts>): ClickFacts => ({ href: "/", origin: ORIGIN, pageName: "home", zone: "other", ...over });
const names = (f: ClickFacts) => classifyClick(f, KNOWN).map((e) => e.name);

describe("click classification (TASK-194)", () => {
  it("résumé: resume_opened + professional_cta_clicked + outbound, with the placement", () => {
    const events = classifyClick(facts({ href: site.resumeUrl, zone: "footer" }), KNOWN);
    expect(events.map((e) => e.name)).toEqual(["outbound_link_clicked", "resume_opened", "professional_cta_clicked"]);
    expect(events[0]!.props).toEqual({ destination_domain: "drive.google.com", link_type: "resume", cta_location: "footer" });
    expect(events[1]!.props).toEqual({ cta_location: "footer", open_method: "external_viewer" });
    expect(events[2]!.props).toEqual({ cta_type: "resume", cta_location: "footer", destination_type: "external_document" });
  });

  it("résumé on /contact is placed on the contact page", () => {
    const events = classifyClick(facts({ href: site.resumeUrl, pageName: "contact" }), KNOWN);
    expect(events.find((e) => e.name === "resume_opened")!.props).toMatchObject({ cta_location: "contact_page" });
  });

  it("LinkedIn: linkedin_profile_clicked + professional_cta_clicked, never a different profile", () => {
    expect(names(facts({ href: site.linkedin, zone: "footer" }))).toEqual(["outbound_link_clicked", "linkedin_profile_clicked", "professional_cta_clicked"]);
    expect(names(facts({ href: "https://www.linkedin.com/in/someone-else" }))).toEqual(["outbound_link_clicked"]);
  });

  it("email: a mailto link is email_contact_clicked + professional_cta_clicked and carries no address", () => {
    const events = classifyClick(facts({ href: "mailto:someone@example.com?subject=Hi", pageName: "contact" }), KNOWN);
    expect(events.map((e) => e.name)).toEqual(["email_contact_clicked", "professional_cta_clicked"]);
    expect(JSON.stringify(events)).not.toContain("example.com");
    expect(events[1]!.props).toEqual({ cta_type: "email", cta_location: "contact_page", destination_type: "email_client" });
  });

  it("product sheet: product / GitHub / PRD links report the project and the host only", () => {
    const events = classifyClick(facts({ href: "https://github.com/007U5H4R/some-repo?tab=readme", zone: "product_sheet", action: "github", productId: "teachspark", pageName: "portfolio" }), KNOWN);
    expect(events.map((e) => e.name)).toEqual(["outbound_link_clicked", "product_link_clicked", "project_asset_opened"]);
    expect(events[1]!.props).toEqual({ project_id: "teachspark", destination_domain: "github.com" });
    expect(events[2]!.props).toEqual({ project_id: "teachspark", asset_type: "product_link" });
    expect(events[0]!.props).toMatchObject({ link_type: "github", cta_location: "projects" });
  });

  it("product sheet: the case-study link is a project asset, not an outbound link", () => {
    const events = classifyClick(facts({ href: "/work/teachspark", zone: "product_sheet", action: "case", productId: "teachspark", pageName: "portfolio" }), KNOWN);
    expect(events).toEqual([{ name: "project_asset_opened", props: { project_id: "teachspark", asset_type: "case_study" } }]);
  });

  it("rejects an unsafe project id rather than sending it", () => {
    expect(names(facts({ href: "https://example.com/x", zone: "product_sheet", action: "product", productId: "Has Spaces!" }))).toEqual(["outbound_link_clicked"]);
  });

  it("header / footer links are navigation; the contact link is also a contact_page CTA", () => {
    const nav = classifyClick(facts({ href: "/projects", zone: "header" }), KNOWN);
    expect(nav).toEqual([{ name: "navigation_clicked", props: { destination: "/projects", navigation_location: "header" } }]);
    const pill = classifyClick(facts({ href: "/contact", zone: "header" }), KNOWN);
    expect(pill.map((e) => e.name)).toEqual(["professional_cta_clicked", "navigation_clicked"]);
    expect(pill[0]!.props).toEqual({ cta_type: "contact_page", cta_location: "header", destination_type: "internal_page" });
  });

  it("links in the page body are not navigation events", () => {
    expect(names(facts({ href: "/work", zone: "other" }))).toEqual([]);
    expect(names(facts({ href: "/work", zone: "hero", pageName: "home" }))).toEqual([]);
  });

  it("drawer links are chatbot_cta_clicked with a coarse destination type", () => {
    expect(classifyClick(facts({ href: "/work/railcite#06-evaluation", zone: "ask_panel" }), KNOWN)).toEqual([{ name: "chatbot_cta_clicked", props: { destination_type: "case_study" } }]);
    expect(names(facts({ href: "/about", zone: "ask_panel" }))).toEqual(["chatbot_cta_clicked"]);
    expect(classifyClick(facts({ href: "mailto:a@b.co", zone: "ask_panel" }), KNOWN).map((e) => e.name)).toContain("chatbot_cta_clicked");
    expect(classifyClick(facts({ href: "https://example.org/x", zone: "ask_panel" }), KNOWN).map((e) => e.name)).toEqual(["outbound_link_clicked", "chatbot_cta_clicked"]);
  });

  it("ignores non-web schemes and malformed hrefs", () => {
    expect(names(facts({ href: "tel:+10000000" }))).toEqual([]);
    expect(names(facts({ href: "javascript:void(0)" }))).toEqual([]);
    expect(names(facts({ href: "http://[bad" }))).toEqual([]);
  });

  it("maps zones and pages to the CTA placement", () => {
    expect(ctaLocationFor("header", "home")).toBe("header");
    expect(ctaLocationFor("other", "about")).toBe("about");
    expect(ctaLocationFor("other", "card")).toBe("card");
    expect(ctaLocationFor("other", "essay")).toBe("other");
  });
});

describe("describeAnchor (TASK-194)", () => {
  const mount = (html: string) => {
    document.body.innerHTML = html;
    return document.body.querySelector("a")!;
  };

  it("reads the zone, data-action and the active product from the DOM", () => {
    const a = mount(`<div data-active-product="nuptis"><div class="pf-info"><a href="https://example.com" data-action="product">x</a></div></div>`);
    expect(describeAnchor(a, "portfolio", ORIGIN)).toMatchObject({ zone: "product_sheet", action: "product", productId: "nuptis", pageName: "portfolio" });
  });

  it.each([
    [`<header data-site-header><a href="/work">x</a></header>`, "header"],
    [`<footer><a href="/work">x</a></footer>`, "footer"],
    [`<dialog class="ask-panel"><a href="/work">x</a></dialog>`, "ask_panel"],
    [`<section class="hero"><a href="/projects">x</a></section>`, "hero"],
    [`<main><a href="/projects">x</a></main>`, "other"],
  ])("zone of %s is %s", (html, zone) => {
    expect(describeAnchor(mount(html), "home", ORIGIN).zone).toBe(zone);
  });
});
