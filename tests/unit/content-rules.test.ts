import { describe, expect, it } from "vitest";
import { getProject, projects } from "@/data/projects";
import type { Project } from "@/data/schema";
import metricAllowlist from "@/tests/fixtures/metric-allowlist.json";

/**
 * TC-091 (M-007 carry-forward CF-2, EVAL-013 companion) — mechanical content-rule guards over
 * `data/projects.ts`. Every `it()` here is a STRING assertion against today's manually-verified
 * content; none of them may be satisfied by editing a content value — a failure here means either
 * a real content regression, or (see the two documented interpretive notes below) a genuine
 * disagreement between the literal test-cases.md wording and the current, correct content.
 *
 * Two sub-rules could not be implemented as a literal blanket substring ban without failing
 * against content that is honest and correct on inspection — flagged in the docs/reports write-up
 * rather than silently narrowed:
 *   - teachspark "no '625'": the record legitimately quotes the pitch's debunked "625 tests" claim
 *     twice, specifically to disclose it was never reproduced/used (same pattern as railcite's
 *     conditional "5,687 only with 7 Sep context" rule). Implemented as "625 never appears without
 *     an adjoining disclaimer", not "625 never appears".
 *   - cubicle "role text ... not 'solo'": "solo" appears three times, describing the TARGET
 *     PERSONA ("a solo founder") or explicitly denying it ("role: 'Team build,' never solo") —
 *     never claiming Tushar built Cubicle solo. Implemented as "no undisclaimed authorship claim
 *     of 'solo'", not "the substring never appears".
 */

const stringify = (v: unknown): string => JSON.stringify(v);
const projectText = (p: Project): string => stringify(p);
const chapterBody = (p: Project, id: string): string =>
  (p.chapters.find((c) => c.id === id)?.body ?? []).join(" ");

describe("TC-091 · teachspark", () => {
  const p = getProject("teachspark")!;
  const text = projectText(p);

  it("all metrics[].asOf are identical", () => {
    const dates = new Set(p.metrics.map((m) => m.asOf));
    expect(dates.size).toBe(1);
  });

  it('contains "335 passed"', () => {
    expect(text).toContain("335 passed");
  });

  it("never dates anything 08-26 (the conflicting pitch snapshot is not mixed in)", () => {
    expect(text).not.toContain("08-26");
  });

  it('"625" never appears without an adjoining disclaimer (the pitch\'s debunked test count)', () => {
    const hits = text.match(/.{0,60}625.{0,60}/g) ?? [];
    const undisclaimed = hits.filter((h) => !/not used|could not be reproduced/i.test(h));
    expect(undisclaimed, JSON.stringify(hits)).toEqual([]);
  });
});

describe("TC-091 · railcite", () => {
  const p = getProject("railcite")!;
  const text = projectText(p);

  it('contains "by construction" (citation validity, not a sampled percentage)', () => {
    expect(text).toContain("by construction");
  });

  it("never states a citation-accuracy percentage (citations are refused-by-construction, not measured)", () => {
    expect(text).not.toMatch(/\d+\s?%[^.]{0,60}citation/i);
  });

  it('never cites the stale deck figure "148 tests"', () => {
    expect(text).not.toContain("148 tests");
  });

  it('"5,687" appears only tied to the 7 Sep Final-PRD ingest run, never as the current corpus', () => {
    const hits = text.match(/.{0,80}5,687.{0,80}/g) ?? [];
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h).toMatch(/7 Sep/);
  });

  it('discloses the one test failure as a "stale expectation"', () => {
    expect(text).toContain("stale expectation");
  });
});

describe("TC-091 · velora", () => {
  const p = getProject("velora")!;
  const text = projectText(p);

  it('the 15–30 day onboarding-delay figure is attributed as team secondary research', () => {
    const hits = text.match(/.{0,120}15–30 days.{0,120}/g) ?? [];
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h).toMatch(/secondary research|team baseline/i);
  });

  it('Trust Scores are labelled "authored, not verified"', () => {
    expect(text).toContain("authored, not verified");
  });

  it("the outcome chapter never claims users/a pilot except as an explicit negation", () => {
    const outcome = chapterBody(p, "outcome");
    const hits = outcome.match(/.{0,10}(users|pilot).{0,10}/gi) ?? [];
    const claims = hits.filter((h) => !/no\s+(users|pilot)/i.test(h));
    expect(claims, JSON.stringify(hits)).toEqual([]);
  });
});

describe("TC-091 · nuptis", () => {
  const p = getProject("nuptis")!;
  const text = projectText(p);

  it('"No AI" (or the underlying "keyword"-matching mechanism) is disclosed', () => {
    expect(/No AI|keyword/i.test(text)).toBe(true);
  });

  it('discloses "no automated tests"', () => {
    expect(text).toMatch(/no automated tests/i);
  });

  it('status is "Live (mock data)"', () => {
    expect(p.statusLabel).toBe("Live (mock data)");
  });

  it("header metrics are empty (no pilot data exists)", () => {
    expect(p.metrics).toEqual([]);
  });
});

describe("TC-091 · cubicle", () => {
  const p = getProject("cubicle")!;
  const text = projectText(p);

  it('contains "team of 6" (the buildathon brief, quoted verbatim)', () => {
    expect(text).toMatch(/team of 6/i);
  });

  it('never claims Tushar built it solo ("solo" appears only as the target persona or an explicit denial)', () => {
    const hits = text.match(/.{0,20}solo.{0,20}/gi) ?? [];
    expect(hits.length).toBeGreaterThan(0);
    const claims = hits.filter((h) => !/solo founder|solo builders|never solo/i.test(h));
    expect(claims, JSON.stringify(hits)).toEqual([]);
  });

  it("metrics carry only build-quality kinds — no cost or latency MetricCard", () => {
    for (const m of p.metrics) {
      expect(m.label.toLowerCase()).not.toMatch(/cost|latency/);
    }
  });

  it('status is "Built, not launched"', () => {
    expect(p.statusLabel).toBe("Built, not launched");
  });
});

describe("TC-091 · bhakti-vilas", () => {
  const p = getProject("bhakti-vilas")!;
  const text = projectText(p);

  it("the commit split (5 Tushar / 3 Shivali) is stated", () => {
    expect(text).toMatch(/5.{0,20}Tushar/);
    expect(text).toMatch(/3.{0,15}Shivali/);
  });

  it('the staged-reveal funnel is labelled "directional estimates"', () => {
    expect(text).toContain("directional estimates");
  });

  it('status is "Live prototype (mock data, team build)"', () => {
    expect(p.statusLabel).toBe("Live prototype (mock data, team build)");
  });

  it("team survey numbers carry an explicit 'team' attribution", () => {
    const surveyArtifact = p.chapters
      .flatMap((c) => c.artifacts)
      .find((a) => a.id === "bv-a-team-survey");
    expect(surveyArtifact).toBeDefined();
    const note = (surveyArtifact as { note?: string }).note ?? "";
    expect(note).toMatch(/\bteam\b/i);
    expect(note).toMatch(/n=23|n=47|n=12/);
  });
});

describe("TC-091 · token-toli", () => {
  const p = getProject("token-toli")!;
  const text = projectText(p);

  it('status is "Discovery only" with no live link or demo video', () => {
    expect(p.statusLabel).toBe("Discovery only");
    expect(p.links.live).toBeUndefined();
    expect(p.links.demoVideo).toBeUndefined();
  });

  it('"44 interviews" appears only with a team attribution', () => {
    const hits = text.match(/.{0,80}44 interviews.{0,80}/g) ?? [];
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(h).toMatch(/team/i);
  });

  it('"11 named respondents" is present, and no other respondent total is claimed', () => {
    expect(text).toContain("11 named respondents");
    const hits = text.match(/\d+[\s-]*(named )?respondents?/gi) ?? [];
    expect(hits).toEqual(["11 named respondents"]);
  });
});

describe("TC-091 · pratyasa", () => {
  const p = getProject("pratyasa")!;
  const text = projectText(p);

  it('contains "IN 429867"', () => {
    expect(text).toContain("IN 429867");
  });

  it("states the rights/safety line verbatim", () => {
    expect(text).toContain("Patent owned by NIT–Calicut; research prototype, not an approved diagnostic");
  });

  it("carries no product-metric kind (header metrics are empty)", () => {
    expect(p.metrics).toEqual([]);
  });
});

describe("TC-091 · tegaki", () => {
  const p = getProject("tegaki")!;
  const text = projectText(p);

  it("discloses there is no AI in the product", () => {
    expect(text).toMatch(/no AI in the product/i);
  });

  it('discloses the checkout "confirms an order without charging"', () => {
    expect(text).toMatch(/confirms an order without charging/i);
  });

  it("never claims a pilot-user or order count", () => {
    expect(text).not.toMatch(/\d+\s+(pilot users?|orders?)\b/i);
  });

  // The "Master Prompt v2.0 is internal IP" fact (CONTENT_INVENTORY §8.9) has not landed in
  // data/projects.ts yet — tegaki is still a "thin five" record (deepDive:false, EMPTY_CHAPTERS).
  // Per TC-091's own precondition ("SKIP-with-reason until its record has chapters"), this
  // sub-rule is not yet checkable against data/projects.ts.
  it.skip("Master Prompt is described only as internal — SKIP: tegaki has no chapters yet (thin record); fact lives only in CONTENT_INVENTORY §8.9", () => {});
});

describe("TC-091 · dino-arcade-pwa", () => {
  const p = getProject("dino-arcade-pwa")!;
  const text = projectText(p);

  it('contains "BYO-ROM"', () => {
    expect(text).toContain("BYO-ROM");
  });

  it('never mentions "Game/" (the private planning folder) or "neogeo"', () => {
    expect(text).not.toContain("Game/");
    expect(text.toLowerCase()).not.toContain("neogeo");
  });

  it("asserts no test-result numbers (results are MISSING, not invented)", () => {
    expect(text).not.toMatch(/\d+\s*(passed|failed|tests?)\b/i);
  });

  it("repo is public", () => {
    expect(p.links.repoPublic).toBe(true);
  });
});

describe("TC-091 · cinematic-portfolio", () => {
  const p = getProject("cinematic-portfolio")!;
  const text = projectText(p);

  // The "7+ / 40+ / 180+ / 30%" resume-derived stats (CONTENT_INVENTORY §8.11) are shown on the
  // separate cinematic site (portfolio/index.html), never in data/projects.ts — out of scope here
  // (and out of scope for this M-007 batch, which must not touch the cinematic site). This guards
  // against a future regression where one of those strings leaks into this record unsourced.
  it("never carries the cinematic-site resume stats without a self-reported/resume source", () => {
    for (const needle of ["7+", "40+", "180+", "30 %", "30%"]) {
      if (!text.includes(needle)) continue;
      const hits = text.match(new RegExp(`.{0,60}${needle.replace(/[+%]/g, "\\$&")}.{0,60}`, "g")) ?? [];
      for (const h of hits) expect(h).toMatch(/self-reported|resume/i);
    }
  });

  it("repo is public", () => {
    expect(p.links.repoPublic).toBe(true);
  });

  it('the film-cost metric is "197", kind "measured", asOf 2026-08-26', () => {
    const m = p.metrics.find((mm) => mm.value === "197");
    expect(m).toBeDefined();
    expect(m?.kind).toBe("measured");
    expect(m?.asOf).toBe("2026-08-26");
  });
});

describe("TC-091 · thin five — no unsourced MetricCard", () => {
  const allowlist = metricAllowlist as unknown as Record<string, string[]>;
  const thinFive = ["token-toli", "pratyasa", "tegaki", "dino-arcade-pwa", "cinematic-portfolio"];

  it("every thin-five slug has an allowlist entry", () => {
    for (const slug of thinFive) expect(allowlist[slug], slug).toBeDefined();
  });

  for (const slug of thinFive) {
    it(`${slug}: every MetricCard label is in its pack allowlist`, () => {
      const p = getProject(slug)!;
      const allowed = allowlist[slug] ?? [];
      for (const m of p.metrics) {
        expect(allowed, `${slug} metric "${m.label}" not in tests/fixtures/metric-allowlist.json`).toContain(
          m.label,
        );
      }
    });
  }
});

describe("TC-091 · sanity", () => {
  it("covers every non-professional project slug named in the spec", () => {
    const personal = projects.filter((p) => p.category === "personal").map((p) => p.slug);
    expect(personal.sort()).toEqual(
      [
        "teachspark",
        "railcite",
        "velora",
        "nuptis",
        "cubicle",
        "bhakti-vilas",
        "token-toli",
        "pratyasa",
        "tegaki",
        "dino-arcade-pwa",
        "cinematic-portfolio",
      ].sort(),
    );
  });
});
