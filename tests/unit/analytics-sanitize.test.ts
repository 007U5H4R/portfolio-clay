import { describe, expect, it } from "vitest";
import { canonicalPath, destinationDomain, referrerHost, sanitizeUtm } from "@/lib/analytics/sanitize";
import { caseStudySlug, isMeasuredPath, pageNameFor } from "@/lib/analytics/pages";

describe("attribution sanitising (TASK-194)", () => {
  it("keeps only the five utm_* keys, lower-cased", () => {
    expect(sanitizeUtm("?utm_source=LinkedIn&utm_medium=social&utm_campaign=portfolio-launch&utm_content=post_1&utm_term=pm+jobs")).toEqual({
      utm_source: "linkedin", utm_medium: "social", utm_campaign: "portfolio-launch", utm_content: "post_1", utm_term: "pm jobs",
    });
  });

  it("drops every other query key: tokens, codes, emails, click ids", () => {
    const out = sanitizeUtm("?token=secret&code=abc&email=a@b.co&gclid=XYZ&fbclid=1&utm_source=newsletter&access_token=zzz");
    expect(out).toEqual({ utm_source: "newsletter" });
  });

  it("drops utm values that look like an email, a URL, a token blob, or are too long", () => {
    expect(sanitizeUtm("?utm_source=jane@example.com")).toEqual({});
    expect(sanitizeUtm("?utm_campaign=<script>alert(1)</script>")).toEqual({});
    expect(sanitizeUtm("?utm_content=" + "a".repeat(101))).toEqual({});
    expect(sanitizeUtm("?utm_source=")).toEqual({});
    expect(sanitizeUtm("?utm_source=%20%20")).toEqual({});
    expect(sanitizeUtm("")).toEqual({});
  });

  it("reduces a referrer to its host and ignores same-site and invalid referrers", () => {
    expect(referrerHost("https://www.linkedin.com/feed/update/urn:li:activity:1?utm=1#x", "tusharpathak.com")).toBe("linkedin.com");
    expect(referrerHost("https://t.co/abcd", "tusharpathak.com")).toBe("t.co");
    expect(referrerHost("https://tusharpathak.com/work", "tusharpathak.com")).toBeNull();
    expect(referrerHost("https://www.tusharpathak.com/work", "tusharpathak.com")).toBeNull();
    expect(referrerHost("", "tusharpathak.com")).toBeNull();
    expect(referrerHost("not a url", "tusharpathak.com")).toBeNull();
  });

  it("reduces an outbound href to its host: no path, no query", () => {
    expect(destinationDomain("https://drive.google.com/file/d/ABC/view?usp=sharing", "https://x.test")).toBe("drive.google.com");
    expect(destinationDomain("https://www.github.com/007U5H4R", "https://x.test")).toBe("github.com");
    expect(destinationDomain("mailto:a@b.co", "https://x.test")).toBeNull();
    expect(destinationDomain("javascript:alert(1)", "https://x.test")).toBeNull();
  });

  it("canonicalises a page path: no query, fragment or trailing slash", () => {
    expect(canonicalPath("/projects?product=nuptis#top")).toBe("/projects");
    expect(canonicalPath("/work/")).toBe("/work");
    expect(canonicalPath("/")).toBe("/");
    expect(canonicalPath("/About")).toBe("/about");
    expect(canonicalPath("/" + "a".repeat(300)).length).toBeLessThanOrEqual(120);
  });
});

describe("page identity (TASK-194)", () => {
  it.each([
    ["/", "home"], ["/work", "experience"], ["/work/teachspark", "case_study"], ["/projects", "portfolio"], ["/about", "about"],
    ["/contact", "contact"], ["/thinking", "thinking"], ["/thinking/refusal-is-a-feature", "essay"], ["/playground", "other"],
    ["/certifications", "certifications"], ["/card", "card"], ["/lab", "gummy_lab"], ["/nope", "other"],
  ])("%s → %s", (path, name) => expect(pageNameFor(path)).toBe(name));

  it("extracts a case-study slug only from /work/<slug>", () => {
    expect(caseStudySlug("/work/teachspark")).toBe("teachspark");
    expect(caseStudySlug("/work/teachspark/")).toBe("teachspark");
    expect(caseStudySlug("/work")).toBeNull();
    expect(caseStudySlug("/work/a/b")).toBeNull();
    expect(caseStudySlug("/projects")).toBeNull();
  });

  it("never measures dev QA boards or API routes", () => {
    expect(isMeasuredPath("/dev/ask")).toBe(false);
    expect(isMeasuredPath("/api/tushky/speech")).toBe(false);
    expect(isMeasuredPath("/projects")).toBe(true);
  });
});
