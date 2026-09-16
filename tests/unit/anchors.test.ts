import { describe, expect, it } from "vitest";
import { CHAPTER_ANCHORS, PAGE_ANCHORS, resolves, routes } from "@/lib/anchors";
import { CHAPTER_IDS } from "@/data/schema";

/**
 * Every internal href authored in CONTENT_INVENTORY §1.5 (HowIThink) and §9 (KnowledgeIndex) must
 * resolve through the single `routes()` builder — a dangling internal link is a build failure
 * (EVAL-013), not a later crawl finding. The slug universe below is the full §2.2 personal-build set
 * so the test is stable as content lands.
 *
 * Reconciliation (E-2): §9 drafts one filter link as `/work?tab=enterprise`; the project decision is
 * that internal hrefs use `?filter=`, so the canonical form `/work?filter=enterprise` is asserted and
 * the `?tab=` form is asserted NOT to resolve.
 */
const PROJECT_SLUGS = [
  "teachspark",
  "railcite",
  "cubicle",
  "nuptis",
  "velora",
  "bhakti-vilas",
  "token-toli",
  "pratyasa",
  "tegaki",
  "dino-arcade-pwa",
  "cinematic-portfolio",
] as const;

const ROUTE_SET = routes({ projectSlugs: PROJECT_SLUGS });

// CONTENT_INVENTORY §1.5 — HowIThink example links.
const S1_5_HREFS = [
  "/work/railcite#02-problem",
  "/work/velora#03-discovery",
  "/work/teachspark#04-product-bet",
  "/work/railcite#05-what-i-built",
  "/work/teachspark#06-evaluation",
  "/work/teachspark#07-outcome",
];

// CONTENT_INVENTORY §9 — KnowledgeIndex evidence links (internal only; https/mailto excluded).
const S9_HREFS = [
  "/work/teachspark",
  "/work/railcite",
  "/work/velora",
  "/work/velora#03-discovery",
  "/work/teachspark#03-discovery",
  "/thinking",
  "/work/teachspark#05-what-i-built",
  "/work/railcite#05-what-i-built",
  "/about#experience",
  "/work/railcite#06-evaluation",
  "/about#impact",
  "/work/teachspark#07-outcome",
  "/work/railcite#07-outcome",
  "/about",
  "/work",
  "/work?filter=enterprise", // §9 `?tab=enterprise` reconciled to E-2 canonical `?filter=`
  "/about#capabilities",
];

describe("lib/anchors routes()", () => {
  it("resolves every CONTENT_INVENTORY §1.5 internal href", () => {
    for (const href of S1_5_HREFS) {
      expect(resolves(href, ROUTE_SET), `§1.5 href must resolve: ${href}`).toBe(true);
    }
  });

  it("resolves every CONTENT_INVENTORY §9 internal href", () => {
    for (const href of S9_HREFS) {
      expect(resolves(href, ROUTE_SET), `§9 href must resolve: ${href}`).toBe(true);
    }
  });

  it("has one anchor per schema chapter id, in fixed order", () => {
    expect(Object.keys(CHAPTER_ANCHORS)).toEqual([...CHAPTER_IDS]);
    const anchors = Object.values(CHAPTER_ANCHORS).map((c) => c.anchor);
    expect(new Set(anchors).size).toBe(anchors.length); // distinct
  });

  it("rejects unknown query keys (E-2: only ?filter=) and dangling links", () => {
    expect(resolves("/work?tab=enterprise", ROUTE_SET)).toBe(false);
    expect(resolves("/work/teachspark#99-nope", ROUTE_SET)).toBe(false);
    expect(resolves("/about#nonexistent", ROUTE_SET)).toBe(false);
    expect(resolves("/work/does-not-exist", ROUTE_SET)).toBe(false);
  });

  it("exposes the documented page anchors", () => {
    expect(PAGE_ANCHORS.about).toContain("experience");
    expect(PAGE_ANCHORS.contact).toContain("resume");
  });
});
