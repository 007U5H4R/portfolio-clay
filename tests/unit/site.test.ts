import { afterEach, describe, expect, it } from "vitest";
import { resumeAction, site } from "@/lib/site";

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
