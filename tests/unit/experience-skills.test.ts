import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ExperienceTimeline } from "@/components/timeline/ExperienceTimeline";
import { collections, validateAll } from "@/data/index";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";
import { impactMetrics, impactSources } from "@/data/impact";
import { Metric } from "@/data/schema";
import { teachspark, railcite } from "@/data/projects";

/**
 * TSK-22 — `data/experience.ts` + `data/skills.ts` (TKT-40 AC 1–5, TC-094).
 * Content correctness (every string traces to CONTENT_INVENTORY §4.1–4.5) is verified by hand in
 * docs/reports/TSK-22.md; this file asserts the structural/schema/truth invariants that TC-094
 * requires and that a future edit could silently break.
 */
describe("data/experience + data/skills (TSK-22)", () => {
  it("validateAll() reports no issues for the live collections (experience + skills wired in)", () => {
    expect(validateAll(collections)).toEqual({ ok: true });
  });

  it("has exactly 4 experience roles with the TimelineNode-matching ids (AC 1)", () => {
    expect(experience).toHaveLength(4);
    expect(experience.map((e) => e.id).sort()).toEqual(["amex", "godrej", "quantiphi", "shellkode"]);
  });

  it("marks scale 'not recorded' for every role §4.5 lists as MISSING, and a real figure for AmEx (AC 2)", () => {
    const byId = new Map(experience.map((e) => [e.id, e]));
    expect(byId.get("godrej")?.scale).toBe("not recorded");
    expect(byId.get("quantiphi")?.scale).toBe("not recorded");
    expect(byId.get("shellkode")?.scale).toBe("not recorded");
    expect(byId.get("amex")?.scale).not.toBe("not recorded");
  });

  it("never labels a résumé-only outcome 'measured' (AC 5)", () => {
    for (const e of experience) {
      expect(e.outcomes.length).toBeGreaterThan(0);
      for (const o of e.outcomes) {
        expect(o.kind).toBe("self-reported");
      }
    }
  });

  it("has exactly 4 skill clusters, each with a tone and 3-6 items (AC 6)", () => {
    expect(skills).toHaveLength(4);
    expect(new Set(skills.map((s) => s.id)).size).toBe(4);
    for (const cluster of skills) {
      expect(cluster.items.length).toBeGreaterThanOrEqual(3);
      expect(cluster.items.length).toBeLessThanOrEqual(6);
      expect(cluster.tone).toBeTruthy();
      expect(cluster.source.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("never contains PMP, a SAFe certification claim, or DOB/phone PII patterns (AC 4)", () => {
    const text = JSON.stringify([...experience, ...skills]);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
    expect(text).not.toMatch(/\b\d{10}\b/);
  });
});

/**
 * TSK-24 — `data/impact.ts` (TKT-40 AC 2, TC-095, EVAL-013). `impactMetrics`/`impactSources` are
 * not part of the `Collections`/`validateAll()` entity registry (Metric is an embedded value, not
 * a top-level content entity) — this suite is the schema/sourcing/parity gate for this module,
 * mirroring the render-time guard `components/about/Impact.tsx` and `CaseStudyHeader` both use.
 */
describe("data/impact (TSK-24)", () => {
  it("every metric parses against the Metric schema", () => {
    for (const metric of impactMetrics) {
      const parsed = Metric.safeParse(metric);
      expect(parsed.success, `metric "${metric.label}": ${JSON.stringify(parsed.success ? null : parsed.error.issues)}`).toBe(true);
    }
  });

  it("every metric.source resolves in impactSources (EVAL-013 — MetricCard would throw otherwise)", () => {
    const ids = new Set(impactSources.map((s) => s.id));
    for (const metric of impactMetrics) {
      expect(ids.has(metric.source), `metric "${metric.label}" references undeclared source "${metric.source}"`).toBe(true);
    }
  });

  it("has no duplicate source ids in impactSources", () => {
    const ids = impactSources.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("classifies every row per TKT-40 AC 2's kind mapping", () => {
    const byLabel = new Map(impactMetrics.map((m) => [m.label, m]));
    for (const label of [
      "AR capabilities delivered",
      "User stories",
      "Agile teams",
      "Feature delivery cycle time",
      "Cloud-native microservices/API capabilities",
      "Development effort (Devin GenAI)",
      "Developer productivity (Devin GenAI)",
      "Features shipped in 11 months",
      "Service-monitoring effectiveness",
      "Team productivity",
      "Turnaround time",
    ]) {
      expect(byLabel.get(label)?.kind, label).toBe("self-reported");
      expect(byLabel.get(label)?.source, label).toBe("RESUME");
    }
    expect(byLabel.get("Documents indexed")?.kind).toBe("measured");
    expect(byLabel.get("Chunks indexed (live)")?.kind).toBe("measured");
    expect(byLabel.get("Ingested PDFs needing OCR")?.kind).toBe("measured");
    expect(byLabel.get("Invented citations")?.kind).toBe("structural");
  });

  it("reuses the EXACT TeachSpark and RailCite figures already authored in data/projects.ts", () => {
    const byLabel = new Map(impactMetrics.map((m) => [m.label, m]));

    // "Invented citations" is the one row TKT-40 AC 2 gives its OWN context wording ("by
    // construction (lib/validate.ts)") rather than reusing projects.ts's context verbatim — value/
    // label/asOf/kind/source still must match exactly.
    const OWN_CONTEXT = new Set(["Invented citations"]);

    for (const source of [...teachspark.metrics, ...railcite.metrics]) {
      const shipped = byLabel.get(source.label);
      expect(shipped, `expected an Impact row reusing projects.ts metric "${source.label}"`).toBeTruthy();
      if (OWN_CONTEXT.has(source.label)) {
        expect(shipped).toMatchObject({
          value: source.value,
          label: source.label,
          asOf: source.asOf,
          kind: source.kind,
          source: source.source,
        });
      } else {
        expect(shipped).toEqual(source);
      }
    }

    // The TeachSpark referral figure and the RailCite live chunk count are chapter artifacts, not
    // top-level project.metrics — reused from the same exact objects (data/projects.ts "ts-a-referrals"
    // / "rc-a-chunks").
    expect(byLabel.get("Referrals")).toEqual({
      value: "3",
      label: "Referrals",
      context:
        "teacher-reported referrals during the first-week pilot; snapshot 2026-08-24, test handsets excluded",
      asOf: "2026-08-24",
      kind: "self-reported",
      source: "CS4-FINAL-PRD",
    });
    expect(byLabel.get("Chunks indexed (live)")).toEqual({
      value: "14,406",
      label: "Chunks indexed (live)",
      context:
        "live /api/stats on 2026-09-15; the corpus is cited live-with-date because the nightly crawl keeps ingesting new circulars",
      asOf: "2026-09-15",
      kind: "measured",
      source: "RC-API-STATS",
    });
  });

  it("never invents a number outside §4.4 and carries no DOB/phone PII", () => {
    const text = JSON.stringify(impactMetrics);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
  });
});

/**
 * TC-167 · S18 regression (TKT-87, technical-plan F1-2; kept permanently). The timeline lead once read
 * "newest to oldest" while the data — mapped unreversed — runs oldest first. These assertions pin the
 * lead string, tie the rendered order to the data order (never a hard-coded list), and pin Dev-11's
 * always-open cards.
 */
const S18_LEAD = "Four roles, oldest to newest — open any node for the context, scale, and what changed.";

function decode(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

/** Company names in the order the timeline's story-card `h3`s render ("<company>[ (note)] — <title>"). */
function renderedCompanies(html: string): string[] {
  return [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => decode(m[1] ?? "").split(" — ")[0]!.replace(/ \(.*\)$/, ""));
}

/** The pure check the regression rests on — exercised on the real render and on a reversed control. */
function orderMatchesData(companies: string[], data: { company: string }[]): boolean {
  return JSON.stringify(companies) === JSON.stringify(data.map((e) => e.company));
}

describe("ExperienceTimeline — S18 lead + order regression (TC-167, TKT-87)", () => {
  const html = renderToStaticMarkup(createElement(ExperienceTimeline));

  it("renders the lead exactly as the S18 string", () => {
    const leads = [...html.matchAll(/<p class="xp-lead">([\s\S]*?)<\/p>/g)].map((m) => decode(m[1] ?? ""));
    expect(leads).toEqual([S18_LEAD]);
    expect(html).not.toContain("newest to oldest");
  });

  it("renders the company h3s in data order (oldest → newest); the first role starts earliest", () => {
    const companies = renderedCompanies(html);
    expect(companies).toHaveLength(experience.length);
    expect(orderMatchesData(companies, experience)).toBe(true);
    const starts = experience.map((e) => e.dates.start);
    expect(starts[0]).toBe([...starts].sort()[0]);
    expect(starts).toEqual([...starts].sort());
  });

  it("negative control: a reversed fixture order fails the order check", () => {
    const companies = renderedCompanies(html);
    expect(orderMatchesData(companies, [...experience].reverse())).toBe(false);
  });

  it("renders every story card open: one `#experience-<id>` entry and one flat dl per role, no collapse state", () => {
    for (const role of experience) {
      expect(html).toContain(`id="experience-${role.id}"`);
    }
    expect(html.match(/<dl data-flat=""/g) ?? []).toHaveLength(experience.length);
    expect(html).not.toMatch(/\shidden[\s=>]|aria-expanded|data-open=|grid-rows-\[0fr\]/);
    for (const role of experience) {
      expect(decode(html)).toContain(role.whatChanged);
    }
  });

  it("puts no decoration inside a story dl (flat zone, TC-168 step 1)", () => {
    const dls = [...html.matchAll(/<dl data-flat=""[\s\S]*?<\/dl>/g)].map((m) => m[0]);
    expect(dls).toHaveLength(experience.length);
    for (const dl of dls) expect(dl).not.toContain("data-decor");
    // The section's only decoration is its torn edge (§3.3: experience 1).
    expect(html.match(/data-decor=/g) ?? []).toHaveLength(1);
  });
});
