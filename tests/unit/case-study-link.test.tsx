import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { caseStudyLinkAttrs, isCaseStudyHref } from "@/lib/case-study-link";
import { NewTabHint } from "@/components/common/NewTabHint";
import { EvidenceLinks } from "@/components/ai/EvidenceLinks";

/** TASK-130 new-tab rule: `/work/<slug>` (with or without a hash) is a case study; `/work` is not. */
describe("case-study links", () => {
  it("recognises case-study hrefs only", () => {
    expect(isCaseStudyHref("/work/railcite")).toBe(true);
    expect(isCaseStudyHref("/work/teachspark#02-problem")).toBe(true);
    expect(isCaseStudyHref("/work")).toBe(false);
    expect(isCaseStudyHref("/work/")).toBe(false);
    expect(isCaseStudyHref("/projects?product=railcite")).toBe(false);
    expect(isCaseStudyHref("https://railcite.vercel.app")).toBe(false);
  });

  it("returns new-tab attributes only for case studies", () => {
    expect(caseStudyLinkAttrs("/work/railcite")).toEqual({ target: "_blank", rel: "noopener noreferrer" });
    expect(caseStudyLinkAttrs("/work")).toEqual({});
  });

  it("NewTabHint renders the visually hidden note only for a case-study href", () => {
    const { container, rerender } = render(<NewTabHint href="/work/railcite" />);
    expect(container.textContent).toContain("(opens in a new tab)");
    rerender(<NewTabHint href="/about" />);
    expect(container.textContent).toBe("");
  });

  it("Ask evidence pills open case studies in a new tab, other internal links in place", () => {
    render(<EvidenceLinks evidence={[{ label: "RailCite", href: "/work/railcite" }, { label: "About", href: "/about" }]} />);
    const study = screen.getByRole("link", { name: /RailCite/ });
    expect(study.getAttribute("target")).toBe("_blank");
    expect(study.getAttribute("rel")).toContain("noopener");
    expect(study.textContent).toContain("opens in a new tab");
    expect(screen.getByRole("link", { name: /About/ }).getAttribute("target")).toBeNull();
  });
});
