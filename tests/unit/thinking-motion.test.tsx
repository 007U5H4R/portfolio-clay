import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render } from "@testing-library/react";
import type { SourceRef, ThinkingChain } from "@/data/schema";
import { ShowTheThinking } from "@/components/interactions/ShowTheThinking";

/**
 * TKT-21 (technical-plan.md §B M-004 TKT-21 row: "only transform/opacity/clip-path in the
 * transition list (unit test greps the CSS)") — the Show-the-thinking node reveal rules in
 * app/globals.css must never animate a layout-triggering property (width/height/top/left/margin/
 * etc.), matching Design.md §8's hardware-acceleration rule ("every entry … animates only
 * `transform` and `opacity` (plus `clip-path` for the Show-the-thinking connector draw-in)").
 *
 * TKT-83 / TC-162 adds the paper re-skin's render contract: nested `section.thinking`, sr-only h2,
 * the toggle's `aria-expanded`, exactly TWO counted decorations (annotation + chain sketch), eight
 * nodes in the DOM before open, medallion numerals and Inter label tags, click-only reveal.
 */
const CSS = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

const ALLOWED = new Set(["opacity", "clip-path", "transform"]);

/** Every `transition`/`transition-property` declaration's comma-separated property list. */
function transitionedProperties(block: string): string[] {
  const props: string[] = [];
  for (const m of block.matchAll(/transition(?:-property)?:\s*([^;]+);/g)) {
    for (const raw of m[1]!.split(",")) {
      const token = raw.trim().split(/\s+/)[0]; // "opacity 220ms var(--ease-reveal)" → "opacity"
      if (token && token !== "none") props.push(token);
    }
  }
  return props;
}

/** Extract the `.thinking-node` / `.thinking-nodes` rule blocks (selector + body) from the CSS. */
function thinkingBlocks(css: string): string[] {
  const blocks: string[] = [];
  const re = /((?:\.thinking-node[a-zA-Z-]*[^{]*)\{[^}]*\})/g;
  for (const m of css.matchAll(re)) blocks.push(m[1]!);
  return blocks;
}

describe("Show-the-thinking motion (Design.md §4 hardware-acceleration rule)", () => {
  it("app/globals.css declares at least one .thinking-node rule (sanity — the grep isn't vacuous)", () => {
    const blocks = thinkingBlocks(CSS);
    expect(blocks.length).toBeGreaterThan(0);
  });

  it("every .thinking-node(s) transition only ever lists opacity/clip-path/transform", () => {
    const blocks = thinkingBlocks(CSS);
    const offenders: string[] = [];
    for (const block of blocks) {
      for (const prop of transitionedProperties(block)) {
        if (!ALLOWED.has(prop)) offenders.push(prop);
      }
    }
    expect(offenders, `disallowed animated properties found: ${offenders.join(", ")}`).toEqual([]);
  });

  it("the node stagger stays 120 ms per node and the reveal 220 ms (Design.md §8 row)", () => {
    expect(CSS).toMatch(/\.thinking-node\s*\{[^}]*transition:\s*opacity 220ms[^}]*transition-delay:\s*calc\(var\(--i\) \* 120ms\)/);
  });
});

// ---------------------------------------------------------------------------------------------------
// TC-162 (TKT-83 AC 4 / AC 5) — the paper render contract.
// ---------------------------------------------------------------------------------------------------
const SOURCES: SourceRef[] = [
  { id: "TS-README", label: "TeachSpark README", ref: "TS/README.md:3", inventory: "§8.1" },
  { id: "TS-PRD", label: "TeachSpark Final PRD", ref: "CS4/docs/final-prd.docx §7", inventory: "§8.1" },
];

const STAGES = ["observation", "user-problem", "insight", "hypothesis", "product-decision", "prototype", "evaluation", "outcome"] as const;

const CHAIN: ThinkingChain = STAGES.map((stage, i) => ({
  stage,
  text: `Node ${i + 1} of the illustrative chain — long enough to pass the schema's minimum length.`,
  source: i % 2 === 0 ? "TS-README" : "TS-PRD",
  ...(i % 2 === 1 ? { href: "/work/teachspark#02-problem" } : {}),
})) as ThinkingChain;

describe("TC-162 · ShowTheThinking on paper (Design.md §7.3, §3.3 count 2)", () => {
  it("renders a nested section.thinking with an sr-only h2 and a toggle that is closed on load", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const section = container.querySelector("section.thinking")!;
    expect(section).not.toBeNull();
    const h2 = section.querySelector("h2")!;
    expect(h2.textContent).toBe("Show the thinking");
    expect(h2).toHaveClass("sr-only");
    const button = section.querySelector("button")!;
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("show-the-thinking-panel");
    expect(button.textContent).toMatch(/Show the thinking/);
    expect(button.textContent).toMatch(/8-step reasoning chain, expand to read/);
    expect(button).toHaveClass("focus-ring");
  });

  it("carries exactly two counted decorations — the annotation and the chain sketch — both aria-hidden", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const decor = Array.from(container.querySelectorAll("[data-decor]"));
    expect(decor.map((el) => el.getAttribute("data-decor")).sort()).toEqual(["annotation", "sketch"]);
    for (const el of decor) expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector('[data-decor="annotation"]')!.textContent).toBe("the chain, start to finish");
    expect(container.querySelector('[data-decor="sketch"]')!.getAttribute("data-sketch")).toBe("chain");
  });

  it("puts all 8 nodes in the DOM before open, collapsed (thinking-nodes without data-open), in stage order", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const panel = container.querySelector("#show-the-thinking-panel")!;
    expect(panel).toHaveClass("thinking-nodes"); // mounted in jsdom → the collapse class is applied
    expect(panel.hasAttribute("data-open")).toBe(false);
    const nodes = panel.querySelectorAll("li.thinking-node");
    expect(nodes).toHaveLength(8);
    expect(Array.from(nodes).map((li) => (li as HTMLElement).style.getPropertyValue("--i"))).toEqual(
      ["0", "1", "2", "3", "4", "5", "6", "7"],
    );
    expect(Array.from(panel.querySelectorAll(".node-lab")).map((l) => l.textContent)).toEqual([
      "Observation",
      "User problem",
      "Insight",
      "Hypothesis",
      "Product decision",
      "Prototype",
      "Evaluation",
      "Outcome",
    ]);
  });

  it("medallions are Caveat numerals 1–8 (aria-hidden — the <ol> numbers the list); label tags and text are Inter", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const meds = Array.from(container.querySelectorAll(".node-med"));
    expect(meds.map((m) => m.textContent)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    for (const med of meds) {
      expect(med).toHaveClass("font-hand");
      expect(med.getAttribute("aria-hidden")).toBe("true");
    }
    for (const lab of Array.from(container.querySelectorAll(".node-lab"))) {
      expect(lab).toHaveClass("font-body");
      expect(lab).not.toHaveClass("font-hand");
    }
    for (const text of Array.from(container.querySelectorAll(".node-text"))) expect(text).toHaveClass("font-body");
    // No Caveat outside aria-hidden anywhere in the section (§3.2 rule 5 needs no exemption here).
    for (const hand of Array.from(container.querySelectorAll(".font-hand"))) {
      expect(hand.closest('[aria-hidden="true"], [data-decor]')).not.toBeNull();
    }
  });

  it("source links render only for nodes with an href (rust link), plain labels otherwise — never the ref path", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const links = container.querySelectorAll("#show-the-thinking-panel a");
    expect(links).toHaveLength(4);
    for (const a of Array.from(links)) {
      expect(a.getAttribute("href")).toBe("/work/teachspark#02-problem");
      expect(a.textContent).toBe("TeachSpark Final PRD");
      expect(a).toHaveClass("node-src");
    }
    expect(container.querySelectorAll(".node-src-plain")).toHaveLength(4);
    expect(container.textContent).not.toMatch(/README\.md|final-prd\.docx/);
  });

  it("opens on click only — aria-expanded flips and data-open lands on the chain; it never opens by itself", () => {
    const { container } = render(<ShowTheThinking chain={CHAIN} sources={SOURCES} />);
    const button = container.querySelector("button")!;
    const panel = container.querySelector("#show-the-thinking-panel")!;
    expect(panel.hasAttribute("data-open")).toBe(false);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hasAttribute("data-open")).toBe(true);
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(panel.hasAttribute("data-open")).toBe(false);
  });

  it("renders nothing for a thin project's empty chain (no empty toggle)", () => {
    const { container } = render(<ShowTheThinking chain={[]} sources={SOURCES} />);
    expect(container.innerHTML).toBe("");
  });
});
