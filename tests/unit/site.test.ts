import { describe, expect, it } from "vitest";
import { contactResumeLink, resumeAction, site } from "@/lib/site";

// TKT-72 (S72.01, AC 6): "Bengaluru, India" stays hidden until Tushar confirms (HANDOFF §6).
describe("site.showLocation", () => {
  it("defaults to false", () => {
    expect(site.showLocation).toBe(false);
  });
});

// resumeAction() is the only source of truth for resume controls (PB5). TASK-175 (2026-10-07): the resume is
// Tushar's Google Drive file - an external link, labelled like LinkedIn/GitHub, never a download or a mailto.
describe("resumeAction()", () => {
  it("is the Drive link: 'Resume ↗', not a download", () => {
    expect(resumeAction()).toEqual({
      label: "Resume ↗",
      href: "https://drive.google.com/file/d/1hqDF4-YlcdaoIRLBzKwI4D8pUWQ7ELJ_/view?usp=sharing",
      download: false,
    });
  });

  it("site.resumeUrl is https on drive.google.com (the one place the URL lives)", () => {
    const url = new URL(site.resumeUrl);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("drive.google.com");
    expect(resumeAction().href).toBe(site.resumeUrl);
  });
});

// TASK-113 / TASK-175: the /contact card's résumé link is the same Drive link and label.
describe("contactResumeLink()", () => {
  it("equals resumeAction() - no 'updating', no 'available on request', no mailto", () => {
    const link = contactResumeLink();
    expect(link).toEqual(resumeAction());
    expect(link.label).toBe("Resume ↗");
    expect(link.label).not.toMatch(/updating|on request/i);
    expect(link.href).not.toMatch(/^mailto:|#resume/);
  });
});
