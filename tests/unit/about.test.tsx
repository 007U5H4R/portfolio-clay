import { afterEach, describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { AboutHero, ABOUT_PULL_QUOTE, ABOUT_STATS } from "@/components/about/AboutHero";
import { CapabilityClusters } from "@/components/about/CapabilityClusters";
import { Impact, groupResume, resolveImpact, splitValue } from "@/components/about/Impact";
import { JOURNEY_STAGES, ProductJourney } from "@/components/timeline/ProductJourney";
import { experience } from "@/data/experience";
import { impactMetrics } from "@/data/impact";
import { skills } from "@/data/skills";
import { formatAsOf } from "@/lib/format";

// TC-166 (TKT-86 AC 1–4): `/about` part 1 — copy equals data/{experience,skills,impact}.ts (D7), the
// Dev-10 subline is out of the a11y tree, EVAL-018 unit counts 2 · 3 (1 at 390) · 1 · 2 (Design §3.3),
// and every tier-1 impact card carries value · label · context · kind badge · asOf · Source (EVAL-013).

function mockMatchMedia(matches: boolean) {
  // Reveal (the journey cards' leaf) observes on mount; jsdom has no IntersectionObserver.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

/** EVAL-018 count: `data-decor` objects whose nearest section is `section` (Design §3.2 rule 1). */
function decorCount(section: Element): number {
  return Array.from(section.querySelectorAll("[data-decor]")).filter((el) => el.closest("section") === section).length;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AboutHero (S86.01)", () => {
  it("renders the h1 narrative, the derived stats, the pull-quote and 2 decorations", () => {
    const { container } = render(<AboutHero />);
    const section = container.querySelector("section")!;
    const h1 = within(section).getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("I started with machines.Then systems. Then people.Now, intelligent products.");

    const earliest = Math.min(...experience.map((r) => Number(r.dates.start.slice(0, 4))));
    expect(ABOUT_STATS[0].value).toBe(`${2026 - earliest}+`);
    for (const stat of ABOUT_STATS) {
      expect(section).toHaveTextContent(stat.value);
      expect(section).toHaveTextContent(stat.label);
    }
    expect(section).toHaveTextContent(`counted from ${earliest}`);

    const quote = section.querySelector('blockquote[data-hand="quote"]')!;
    expect(quote).toHaveTextContent(ABOUT_PULL_QUOTE);
    expect(quote.closest('[data-paper="index"]')).not.toBeNull();
    expect(quote.closest('[data-paper="index"]')!.textContent).toContain("Source: Tushar Pathak");
    expect(section.querySelector('[data-paper="card"] [data-fastener="tape"]')).not.toBeNull();
    expect(section.querySelector('[data-paper="index"] [data-fastener="pin"]')).not.toBeNull();

    expect(decorCount(section)).toBe(2);
    expect(section.querySelectorAll("img")).toHaveLength(0); // the scene is the page's SceneOpener (Dev-24)
  });

  it("keeps the DRAFT subline out of the accessibility tree (Dev-10)", () => {
    const { container } = render(<AboutHero />);
    const sub = Array.from(container.querySelectorAll("p")).find((p) => p.textContent?.includes("Same curiosity"))!;
    expect(sub).toHaveAttribute("aria-hidden", "true");
    expect(sub).toHaveAttribute("data-decor", "annotation");
    // Two DraftTags: the h1 and the pull-quote.
    expect(container.querySelectorAll(".draft-tag")).toHaveLength(2);
  });
});

describe("ProductJourney (S86.02)", () => {
  it("renders the four stages verbatim as pinned cards, no controls, closing line + DraftTag", () => {
    mockMatchMedia(true);
    const { container } = render(<ProductJourney />);
    const section = container.querySelector("section#journey")!;
    const cards = section.querySelectorAll('ol > li [data-paper="card"]');
    expect(cards).toHaveLength(4);
    JOURNEY_STAGES.forEach((stage, i) => {
      const card = cards[i]!;
      expect(card).toHaveTextContent(stage.year);
      expect(within(card as HTMLElement).getByRole("heading", { level: 3 })).toHaveTextContent(stage.milestone);
      expect(card).toHaveTextContent(`${stage.range} · ${stage.label}`);
      expect(card).toHaveTextContent(stage.description);
      expect(card.querySelector('[data-fastener="pin"]')).not.toBeNull();
    });
    expect(section.querySelectorAll("a, button")).toHaveLength(0);
    const close = section.querySelector(".aj-close")!;
    expect(close).toHaveTextContent("The tools changed. The curiosity didn't.");
    expect(close.querySelector(".draft-tag")).not.toBeNull();
    expect(close.closest(".font-hand, [data-decor]")).toBeNull(); // Fraunces lead, not Caveat
  });

  it("counts 4 decorations at ≥ 900 (torn · collage · path · start here) and 2 below (TKT-100)", () => {
    mockMatchMedia(true);
    const wide = render(<ProductJourney />);
    const wideSection = wide.container.querySelector("section")!;
    expect(decorCount(wideSection)).toBe(4);
    expect(wideSection.querySelector('[data-decor="sketch"][data-sketch="path"]')).not.toBeNull();
    expect(wideSection.querySelector('[data-decor="annotation"]')).toHaveTextContent("start here ↘");
    wide.unmount();

    mockMatchMedia(false);
    const narrow = render(<ProductJourney />);
    const narrowSection = narrow.container.querySelector("section")!;
    expect(decorCount(narrowSection)).toBe(2);
    expect(narrowSection.querySelector('[data-decor="torn"]')).not.toBeNull();
    expect(narrowSection.querySelector('[data-decor="collage"]')).not.toBeNull();
  });

  it("TKT-100: one aria-hidden collage carries every ornament; no brand names drawn; cards stay content", () => {
    mockMatchMedia(true);
    const { container } = render(<ProductJourney />);
    const section = container.querySelector("section#journey")!;
    const collage = section.querySelectorAll('[data-decor="collage"]');
    expect(collage).toHaveLength(1);
    expect(collage[0]).toHaveAttribute("aria-hidden", "true");
    // the collage's pieces never count on their own
    expect(collage[0]!.querySelectorAll("[data-decor]")).toHaveLength(0);
    // doodle notes (Caveat) live only inside the hidden layer; EVAL-021 — no company names in the art
    expect(collage[0]).toHaveTextContent("GenAI.");
    expect(collage[0]).toHaveTextContent("TeachSpark");
    expect(collage[0]!.textContent).not.toMatch(/godrej|american express|amex/i);
    // the torn card layers are aria-hidden material, and the range kicker keeps its micro-label rule
    section.querySelectorAll('ol > li [data-paper="card"]').forEach((card) => {
      expect(card.querySelector(".aj-paper")).toHaveAttribute("aria-hidden", "true");
      expect(card.querySelector(".aj-range")).toHaveAttribute("data-micro-label");
    });
    // head, lead and closing line sit on torn strips — their own boxes, still in the a11y tree
    expect(section.querySelector("#journey-heading")!.closest(".aj-strip")).not.toBeNull();
    expect(section.querySelector(".aj-close .aj-strip")).toHaveTextContent("The tools changed. The curiosity didn't.");
    expect(section.querySelectorAll('.aj-strip[aria-hidden], .aj-strip [aria-hidden="true"]')).toHaveLength(0);
  });
});

describe("CapabilityClusters (S86.02)", () => {
  it("renders every data/skills.ts cluster verbatim on a notebook sheet; 1 decoration", () => {
    const { container } = render(<CapabilityClusters />);
    const section = container.querySelector("section#capability-clusters")!;
    const sheets = section.querySelectorAll('[data-paper="notebook"]');
    expect(sheets).toHaveLength(skills.length);
    skills.forEach((cluster, i) => {
      const sheet = sheets[i] as HTMLElement;
      expect(within(sheet).getByRole("heading", { level: 3 })).toHaveTextContent(cluster.name);
      expect(Array.from(sheet.querySelectorAll("li")).map((li) => li.textContent)).toEqual(cluster.items);
    });
    expect(decorCount(section)).toBe(1);
  });
});

describe("Impact (S86.02, DC2 tiers)", () => {
  it("splits data/impact.ts into the product tier (8) and the résumé tier, nothing dropped", () => {
    const { product, resume } = resolveImpact();
    expect(product).toHaveLength(8);
    expect(product.length + resume.length).toBe(impactMetrics.length);
    expect(resume.every(({ metric }) => metric.source === "RESUME")).toBe(true);
  });

  it("fails loud on an undeclared source id (EVAL-013)", () => {
    const bad = [{ ...impactMetrics[0]!, source: "NOPE" }];
    expect(() => resolveImpact(bad)).toThrow(/not declared/);
  });

  it("groups the résumé rows by engagement, in data order", () => {
    const groups = groupResume(resolveImpact().resume);
    expect(groups.map((g) => g.title)).toEqual([
      "AmEx MARS Accounts Receivable migration, Jun 2026–present",
      "Devin GenAI adoption in the MARS engineering ecosystem · measurement method not recorded",
      "Godrej Smartnet platform, Sep 2016–Dec 2018",
    ]);
    expect(groups.flatMap((g) => g.rows.map((r) => r.metric))).toEqual(
      impactMetrics.filter((m) => m.source === "RESUME"),
    );
  });

  it("splits a compound value into its number and small unit", () => {
    expect(splitValue("8 (47%)")).toEqual(["8", "(47%)"]);
    expect(splitValue("37.5 min")).toEqual(["37.5", "min"]);
    expect(splitValue("5,760")).toEqual(["5,760", ""]);
  });

  it("renders every tier-1 card with all six parts, and the résumé tier with one sourced foot; 2 decorations", () => {
    const { container } = render(<Impact />);
    const section = container.querySelector("section#impact")!;
    const cards = section.querySelectorAll('[data-paper="index"]');
    const { product, resume } = resolveImpact();
    expect(cards).toHaveLength(product.length);
    product.forEach(({ metric, source }, i) => {
      const card = cards[i] as HTMLElement;
      expect(card.querySelector(".aimp-value")!.textContent!.replace(/\s+/g, " ").trim()).toBe(metric.value);
      expect(card.querySelector(".aimp-label")).toHaveTextContent(metric.label);
      expect(card.querySelector(".aimp-ctx")).toHaveTextContent(metric.context);
      expect(card.querySelector(`.aimp-kind[data-kind="${metric.kind}"]`)).not.toBeNull();
      expect(card).toHaveTextContent(formatAsOf(metric.asOf));
      expect(card).toHaveTextContent(`Source: ${source.label}`);
      expect(card.querySelector('[data-fastener="pin"]')).not.toBeNull();
    });
    // The live-corpus source keeps its public link; path-only sources never become links.
    expect(within(section as HTMLElement).getAllByRole("link", { name: /RailCite live \/api\/stats/ }).length).toBe(2);
    expect(section.innerHTML).not.toContain("final-prd.docx");

    const resumeBlock = section.querySelector(".aimp-resume")!;
    for (const { metric } of resume) {
      expect(resumeBlock).toHaveTextContent(metric.value);
      expect(resumeBlock).toHaveTextContent(metric.label);
    }
    const foot = resumeBlock.querySelector(".aimp-foot")!;
    expect(foot).toHaveTextContent("Self-reported");
    expect(foot).toHaveTextContent(formatAsOf(resume[0]!.metric.asOf));
    expect(foot).toHaveTextContent("Source: Résumé — Impact metrics");

    expect(section.querySelector('[data-decor="sticky"]')).toHaveTextContent("dated, labelled, never rounded up.");
    expect(decorCount(section)).toBe(2);
  });
});
