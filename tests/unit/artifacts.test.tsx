import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Artifact, Metric, SourceRef } from "@/data/schema";
import { ArtifactRenderer } from "@/components/case-study/artifacts/ArtifactRenderer";
import { ArtifactGrid } from "@/components/case-study/artifacts/ArtifactGrid";
import { MetricCard, type MetricCardProps } from "@/components/case-study/artifacts/MetricCard";
import { SourceCaption } from "@/components/case-study/artifacts/SourceCaption";
import { HAND_LIMITS } from "@/components/paper/Hand";

/**
 * artifacts.test.tsx (TKT-20; extended TKT-83 / TC-160) — the renderer-mapping + MetricCard sourcing
 * guard suite, plus the eight §7.3 paper forms: every artifact root is `data-paper`, Caveat appears
 * only through `data-hand` exemptions, and hypothesis text / kind badges / status text are Inter
 * (Dev-04 — asserted via the `font-body` class and the absence of `font-hand`).
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

const byType = (type: Artifact["type"]): Artifact => ONE_OF_EACH.find((a) => a.type === type)!;

/** The single `data-paper` root the renderer produced. */
function paperRoot(artifact: Artifact): HTMLElement {
  const { container } = render(<ArtifactRenderer artifact={artifact} sources={SOURCES} />);
  const roots = container.querySelectorAll("[data-paper]");
  expect(roots.length, `${artifact.type} must render exactly one data-paper root`).toBe(1);
  return roots[0] as HTMLElement;
}

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

// ---------------------------------------------------------------------------------------------------
// TC-160 (TKT-83 AC 2) — the eight §7.3 paper forms. Design.md §3.1/§3.4: every artifact is content
// paper (`data-paper`), never a decoration; Caveat only via `data-hand`; Inter for data (Dev-04).
// ---------------------------------------------------------------------------------------------------
describe("TC-160 · the eight artifact paper forms (Design.md §7.3, Dev-04)", () => {
  it("every variant renders exactly one data-paper root, zero data-decor and a Source line", () => {
    for (const artifact of ONE_OF_EACH) {
      const root = paperRoot(artifact);
      expect(root.querySelectorAll("[data-decor]"), `${artifact.type} carries no decoration`).toHaveLength(0);
      expect(root.textContent, `${artifact.type} ends with its Source`).toMatch(/Source:/);
      expect(root.className, `${artifact.type} carries its form class`).toMatch(/\bartifact-(insight|hyp|metric|dec|eval|exp|proto|doc)\b/);
    }
  });

  it("insight → a bare figure with blockquote[data-hand=quote] in Caveat + cite + Source in the figcaption", () => {
    const root = paperRoot(byType("insight"));
    expect(root.tagName).toBe("FIGURE");
    expect(root.getAttribute("data-paper")).toBe("card");
    const quote = root.querySelector('blockquote[data-hand="quote"]');
    expect(quote).not.toBeNull();
    expect(quote).toHaveClass("font-hand");
    expect(quote!.textContent).toBe("“If it isn't inside WhatsApp, I won't open it.”");
    const figcaption = root.querySelector("figcaption")!;
    expect(figcaption.querySelector("cite")!.textContent).toBe("— A teacher");
    expect(figcaption.textContent).toMatch(/Source: TeachSpark pilot log/);
  });

  it("insight over the §3.4 240-char limit stays verbatim in Fraunces, without data-hand (D7 — never trimmed)", () => {
    const long = "L".repeat(HAND_LIMITS.quoteChars + 20);
    const root = paperRoot({ id: "a-long", type: "insight", source: "TS-PILOT", quote: long, attribution: "A very long source" });
    expect(root.querySelector("[data-hand]")).toBeNull();
    const quote = root.querySelector("blockquote")!;
    expect(quote).toHaveClass("artifact-quote-long");
    expect(quote).not.toHaveClass("font-hand");
    expect(quote.textContent).toBe(`“${long}”`);
    expect(root.querySelector("cite")).not.toBeNull();
  });

  it("hypothesis → note card: Caveat data-hand=label labels, Inter body text and Inter status pill (Dev-04)", () => {
    const root = paperRoot(byType("hypothesis"));
    const labels = root.querySelectorAll('[data-hand="label"]');
    expect(Array.from(labels).map((l) => l.textContent)).toEqual(["We believe", "We'll know when"]);
    for (const label of Array.from(labels)) expect(label).toHaveClass("font-hand");
    const texts = root.querySelectorAll(".artifact-text");
    expect(texts).toHaveLength(2);
    for (const text of Array.from(texts)) {
      expect(text).toHaveClass("font-body");
      expect(text).not.toHaveClass("font-hand");
    }
    const status = root.querySelector(".artifact-status")!;
    expect(status).toHaveClass("font-body");
    expect(status).not.toHaveClass("font-hand");
    expect(status.getAttribute("data-status")).toBe("partially-validated");
    expect(status.querySelector("svg"), "status carries an icon as well as text").not.toBeNull();
  });

  it("metric → pinned ruled index card with the kind badge in Inter", () => {
    const root = paperRoot(byType("metric"));
    expect(root.getAttribute("data-paper")).toBe("index");
    expect(root.querySelectorAll('[data-fastener="pin"]')).toHaveLength(1);
    const kind = root.querySelector(".metric-kind")!;
    expect(kind).toHaveClass("font-body");
    expect(kind).not.toHaveClass("font-hand");
    expect(kind.getAttribute("data-kind")).toBe("measured");
    expect(kind.textContent).toBe("Measured");
    expect(root.querySelector(".metric-val")!.textContent).toBe("17");
    expect(root.querySelector("[data-hand]"), "a metric card has no Caveat at all").toBeNull();
  });

  it("decision → ivory card: h3, Chosen / Rejected / Why: hand labels, struck rejected list", () => {
    const root = paperRoot(byType("decision"));
    expect(root.getAttribute("data-paper")).toBe("card");
    expect(root.querySelector("h3")!.textContent).toBe("Never invent a citation");
    const labels = Array.from(root.querySelectorAll('[data-hand="label"]')).map((l) => l.textContent);
    expect(labels).toEqual(["Chosen", "Rejected", "Why:"]);
    expect(root.querySelectorAll(".dec-rej li")).toHaveLength(1);
    expect(root.querySelector(".dec-chosen svg"), "Chosen carries the check icon, not colour alone").not.toBeNull();
  });

  it("evaluation → dl with dt[data-hand=label] for Method / Result / Limitation", () => {
    const root = paperRoot(byType("evaluation"));
    const dl = root.querySelector("dl")!;
    const dts = Array.from(dl.querySelectorAll('dt[data-hand="label"]')).map((dt) => dt.textContent);
    expect(dts).toEqual(["Method", "Result", "Limitation"]);
    expect(dl.querySelectorAll("dd")).toHaveLength(3);
    for (const dt of Array.from(dl.querySelectorAll("dt"))) expect(dt).toHaveClass("font-hand");
  });

  it("experiment → three ordered steps with hand step labels", () => {
    const root = paperRoot(byType("experiment"));
    const steps = root.querySelectorAll("ol > li");
    expect(steps).toHaveLength(3);
    const labels = Array.from(root.querySelectorAll('b[data-hand="label"]')).map((b) => b.textContent);
    expect(labels).toEqual(["Setup", "Result", "Learning"]);
  });

  it("prototype → taped photo frame (2 tape fasteners) with the alt as the placeholder caption", () => {
    const root = paperRoot(byType("prototype"));
    expect(root.tagName).toBe("FIGURE");
    expect(root.getAttribute("data-paper")).toBe("photo");
    expect(root.querySelectorAll('[data-fastener="tape"]')).toHaveLength(2);
    expect(root.querySelector(".proto-frame img")).toBeNull();
    expect(root.querySelector(".proto-placeholder")!.textContent).toContain("prototype capture pending");
  });

  it("prototype → an image media renders an <img> with the alt; a video renders <video> with the aria-label", () => {
    const image = paperRoot({ id: "a-img", type: "prototype", source: "TS-PILOT", media: { src: "/media/x.png", alt: "WhatsApp flow", width: 1280, height: 720, kind: "image" } });
    expect(image.querySelector(".proto-frame img")!.getAttribute("alt")).toBe("WhatsApp flow");
    const video = paperRoot({ id: "a-vid", type: "prototype", source: "TS-PILOT", media: { src: "/media/x.mp4", alt: "Bot demo clip", width: 1280, height: 720, kind: "video" } });
    expect(video.querySelector(".proto-frame video")!.getAttribute("aria-label")).toBe("Bot demo clip");
  });

  it("generic → kraft doc tag with the kind eyebrow, a title link and the note", () => {
    const root = paperRoot(byType("generic"));
    expect(root.getAttribute("data-paper")).toBe("tag");
    expect(root).toHaveClass("artifact-doc");
    expect(root.querySelector(".artifact-eyebrow")!.textContent).toBe("Link");
    expect(root.querySelector("h3 a")!.getAttribute("href")).toBe("https://railcite.vercel.app");
    expect(root.querySelector(".artifact-note")!.textContent).toBe("Live status.");
    expect(root.querySelector("[data-hand]"), "a doc tag has no Caveat").toBeNull();
  });

  it("ArtifactGrid wraps each artifact in an .art slot inside the .artifacts cluster", () => {
    const { container } = render(
      <ArtifactGrid>
        {ONE_OF_EACH.map((artifact) => (
          <ArtifactRenderer key={artifact.id} artifact={artifact} sources={SOURCES} />
        ))}
      </ArtifactGrid>,
    );
    const cluster = container.firstElementChild!;
    expect(cluster).toHaveClass("artifacts");
    expect(cluster.querySelectorAll(":scope > .art")).toHaveLength(ONE_OF_EACH.length);
    expect(cluster.querySelectorAll("[data-paper]")).toHaveLength(ONE_OF_EACH.length);
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

  it("renders as a <span> when asked (inside another <p>)", () => {
    const { container } = render(<SourceCaption as="span" source={PLAIN_SOURCE} />);
    expect(container.firstElementChild!.tagName).toBe("SPAN");
  });
});

describe("MetricCard — sourcing guard (EVAL-013)", () => {
  it("renders a fully sourced, dated metric", () => {
    render(<MetricCard metric={goodMetric} source={PLAIN_SOURCE} />);
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("as of 9 Sep 2026")).toBeInTheDocument();
  });

  it("inline variant carries the same sourced fields without a sheet", () => {
    const { container } = render(<MetricCard metric={goodMetric} source={PLAIN_SOURCE} variant="inline" />);
    expect(container.querySelector("[data-paper]")).toBeNull();
    expect(container.textContent).toMatch(/17[\s\S]*teachers onboarded[\s\S]*Measured[\s\S]*as of 9 Sep 2026[\s\S]*Source: TeachSpark pilot log/);
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
