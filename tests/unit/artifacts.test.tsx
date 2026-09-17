import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Artifact, Metric, SourceRef } from "@/data/schema";
import { ArtifactRenderer } from "@/components/case-study/artifacts/ArtifactRenderer";
import { MetricCard, type MetricCardProps } from "@/components/case-study/artifacts/MetricCard";
import { SourceCaption } from "@/components/case-study/artifacts/SourceCaption";

/**
 * artifacts.test.tsx (TKT-20) — the renderer-mapping + MetricCard sourcing guard suite.
 */

const PLAIN_SOURCE: SourceRef = {
  id: "TS-PILOT",
  label: "TeachSpark pilot log",
  ref: "CS4/pilot-log.md", // a filesystem-ish path — must NEVER appear in the DOM
  inventory: "§8.1",
};
const URL_SOURCE: SourceRef = {
  id: "RC-API",
  label: "RailCite live /api/stats",
  ref: "https://railcite.vercel.app/api/stats (secret path)",
  inventory: "§8.2",
  url: "https://railcite.vercel.app",
};
const SOURCES: SourceRef[] = [PLAIN_SOURCE, URL_SOURCE];

const goodMetric: Metric = {
  value: "17",
  label: "teachers onboarded",
  context: "joined the WhatsApp pilot in week 1; test handsets excluded",
  asOf: "2026-09-09",
  kind: "measured",
  source: "TS-PILOT",
};

/** One representative artifact per union member, each carrying a declared source. */
const ONE_OF_EACH: Artifact[] = [
  { id: "a-insight", type: "insight", source: "TS-PILOT", quote: "If it isn't inside WhatsApp, I won't open it.", attribution: "A teacher" },
  { id: "a-hyp", type: "hypothesis", source: "TS-PILOT", believe: "WhatsApp removes the adoption barrier.", knowWhen: "Half send a second prompt in week one.", status: "partially-validated" },
  { id: "a-metric", type: "metric", source: "TS-PILOT", metric: goodMetric },
  { id: "a-decision", type: "decision", source: "TS-PILOT", title: "Never invent a citation", chosen: "Answer only from retrieved passages.", rejected: ["Paraphrase from memory"], reason: "A wrong cite hurts credibility." },
  { id: "a-eval", type: "evaluation", source: "TS-PILOT", method: "Held-out set of 40 real questions.", result: "38/40 correct.", limitation: "Author-written, not live traffic." },
  { id: "a-exp", type: "experiment", source: "TS-PILOT", setup: "Same prompt through both systems.", result: "Bot matched the syllabus.", learning: "Context beat model size." },
  { id: "a-proto", type: "prototype", source: "TS-PILOT", media: { src: "/media/x.png", alt: "prototype capture pending", width: 1280, height: 720, kind: "placeholder" } },
  { id: "a-generic", type: "generic", source: "RC-API", title: "RailCite live stats", kind: "link", href: "https://railcite.vercel.app", note: "Live status." },
];

describe("ArtifactRenderer — mapping", () => {
  it("renders every Artifact variant with its distinctive shape", () => {
    // insight
    expect(render(<ArtifactRenderer artifact={ONE_OF_EACH[0]!} sources={SOURCES} />).getByText("Insight")).toBeInTheDocument();
    // hypothesis — the "We believe" / "We'll know when" split
    const hyp = render(<ArtifactRenderer artifact={ONE_OF_EACH[1]!} sources={SOURCES} />);
    expect(hyp.getByText("We believe")).toBeInTheDocument();
    expect(hyp.getByText("We'll know when")).toBeInTheDocument();
    expect(hyp.getByText("Partially validated")).toBeInTheDocument();
    // metric
    const metric = render(<ArtifactRenderer artifact={ONE_OF_EACH[2]!} sources={SOURCES} />);
    expect(metric.getByText("17")).toBeInTheDocument();
    expect(metric.getByText("teachers onboarded")).toBeInTheDocument();
    expect(metric.getByText("Measured")).toBeInTheDocument();
    expect(metric.getByText("as of 9 Sep 2026")).toBeInTheDocument();
    // decision
    const dec = render(<ArtifactRenderer artifact={ONE_OF_EACH[3]!} sources={SOURCES} />);
    expect(dec.getByText("Chosen")).toBeInTheDocument();
    expect(dec.getByText("Rejected")).toBeInTheDocument();
    // evaluation
    const evalc = render(<ArtifactRenderer artifact={ONE_OF_EACH[4]!} sources={SOURCES} />);
    expect(evalc.getByText("Method")).toBeInTheDocument();
    expect(evalc.getByText("Limitation")).toBeInTheDocument();
    // experiment
    const exp = render(<ArtifactRenderer artifact={ONE_OF_EACH[5]!} sources={SOURCES} />);
    expect(exp.getByText("Setup")).toBeInTheDocument();
    expect(exp.getByText("Learning")).toBeInTheDocument();
    // prototype — placeholder, not a broken <img>
    const proto = render(<ArtifactRenderer artifact={ONE_OF_EACH[6]!} sources={SOURCES} />);
    expect(proto.getByText("prototype capture pending")).toBeInTheDocument();
    // generic link — an anchor to the live url
    const gen = render(<ArtifactRenderer artifact={ONE_OF_EACH[7]!} sources={SOURCES} />);
    const links = gen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href") === "https://railcite.vercel.app")).toBe(true);
  });

  it("throws (never renders unsourced) when an artifact's source id is not declared", () => {
    const orphan: Artifact = { id: "orphan", type: "insight", source: "NOPE", quote: "unsourced claim here", attribution: "x" };
    expect(() => render(<ArtifactRenderer artifact={orphan} sources={SOURCES} />)).toThrow(/not declared/);
  });

  it("throws on an unknown artifact type (exhaustive-switch backstop)", () => {
    const bogus = { id: "bogus", type: "made-up", source: "TS-PILOT" } as unknown as Artifact;
    expect(() => render(<ArtifactRenderer artifact={bogus} sources={SOURCES} />)).toThrow(/unhandled artifact type/);
  });
});

describe("SourceCaption — label only, never the path", () => {
  it("renders the human label, not source.ref, and links when a url is present", () => {
    const { rerender } = render(<SourceCaption source={PLAIN_SOURCE} />);
    expect(screen.getByText("TeachSpark pilot log")).toBeInTheDocument();
    expect(screen.queryByText(/CS4\/pilot-log\.md/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument(); // no url → plain text

    rerender(<SourceCaption source={URL_SOURCE} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://railcite.vercel.app");
    expect(screen.queryByText(/secret path/)).not.toBeInTheDocument();
  });
});

describe("MetricCard — sourcing guard (EVAL-013)", () => {
  it("renders a fully sourced, dated metric", () => {
    render(<MetricCard metric={goodMetric} source={PLAIN_SOURCE} />);
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("as of 9 Sep 2026")).toBeInTheDocument();
  });

  it("throws rather than render a metric missing asOf", () => {
    const noDate = { ...goodMetric, asOf: "" } as unknown as Metric;
    expect(() => render(<MetricCard metric={noDate} source={PLAIN_SOURCE} />)).toThrow(/asOf \+ source/);
  });

  it("throws rather than render a metric missing source", () => {
    const noSource = { ...goodMetric, source: "" } as unknown as Metric;
    expect(() => render(<MetricCard metric={noSource} source={PLAIN_SOURCE} />)).toThrow(/asOf \+ source/);
  });

  it("refuses partial props at the type level (no context/asOf/kind/source)", () => {
    // @ts-expect-error — MetricCard's `metric` prop is the full `Metric`; a partial is a compile error (AC 2).
    const invalid: MetricCardProps = { metric: { value: "17", label: "teachers" }, source: PLAIN_SOURCE };
    expect(invalid).toBeTruthy();
  });
});
