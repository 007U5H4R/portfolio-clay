import { afterEach, describe, expect, it } from "vitest";
import { contactResumeLink, resumeAction, site } from "@/lib/site";

// TKT-72 (S72.01, AC 6): "Bengaluru, India" stays hidden until Tushar confirms (HANDOFF §6).
describe("site.showLocation", () => {
  it("defaults to false", () => {
    expect(site.showLocation).toBe(false);
  });
});

// resumeAction() is the only source of truth for resume controls (PB5). The build-time flag
// `site.resumeAvailable` is false on the tracer, so we cover the download shape by flipping it
// here (E-13: the true state is verified by unit test until TKT-08 flips the real flag).
describe("resumeAction()", () => {
  afterEach(() => {
    site.resumeAvailable = false;
  });

  it("returns the placeholder shape when the resume is unavailable", () => {
    site.resumeAvailable = false;
    expect(resumeAction()).toEqual({
      label: "Resume — updating",
      href: "/contact#resume",
      download: false,
      note: "Sanitised resume coming — email me for a copy",
    });
  });

  it("returns the download shape when the resume is available", () => {
    site.resumeAvailable = true;
    const action = resumeAction();
    expect(action).toEqual({
      label: "Download Resume ↓",
      href: "/resume.pdf",
      download: true,
    });
    expect(action.note).toBeUndefined();
  });
});

// TASK-113 (Tushar's contact spec §13): the /contact card's résumé link never shows unfinished-state
// copy — "available on request" as a mailto with a subject until the flag flips, then "Resume ↓".
describe("contactResumeLink()", () => {
  afterEach(() => {
    site.resumeAvailable = false;
  });

  it("asks by email while the resume is unavailable — never 'updating'", () => {
    site.resumeAvailable = false;
    const link = contactResumeLink();
    expect(link).toEqual({
      label: "Resume — available on request",
      href: `mailto:${site.email}?subject=Resume%20request`,
      download: false,
    });
    expect(link.label).not.toMatch(/updating/i);
  });

  it("becomes the 'Resume ↓' download once the resume is available (same href as resumeAction)", () => {
    site.resumeAvailable = true;
    expect(contactResumeLink()).toEqual({ label: "Resume ↓", href: resumeAction().href, download: true });
  });
});
