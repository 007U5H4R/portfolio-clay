/**
 * how-i-think.test.tsx (TKT-76 · TC-148 steps 1, 3, 5; Design.md §7.1, §3.3, §3.4) — the home
 * How-I-think section as six static pinned stage cards over the journey sketch.
 *
 *   1. six cards, label / principle / quote / attribution verbatim from data/thinking-framework.ts
 *      (D7); every quote ≤ 240 chars with its `cite` sibling; pills link to lib/anchors.ts anchors.
 *   3. decoration count per §3.3: torn + collage backdrop + journey sketch = 3 when ≥ 1025 matches,
 *      torn + collage = 2 below (the sketch is absent from the DOM, not hidden) — and absent from the
 *      SSR HTML. TKT-99 (Dev-40): the collage is ONE aria-hidden object whose pieces carry no data-decor.
 *   4/5. only the six pills are focusable; no roving tabindex / disclosure buttons remain.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { HowIThink, type HowIThinkStage } from "@/components/home/HowIThink";
import { SKETCHES } from "@/components/paper/sketch-paths";
import { thinkingFramework } from "@/data/thinking-framework";
import { getProject } from "@/data/projects";
import { ALL_PROJECT_SLUGS, routes } from "@/lib/anchors";
import { orderStages, STAGE_ORDER, stagePin } from "@/lib/stages";

// Same server-side resolution as app/page.tsx (A1).
const STAGES: HowIThinkStage[] = orderStages(thinkingFramework).map((stage) => ({
  id: stage.id,
  label: stage.label,
  principle: stage.principle,
  example: {
    quote: stage.example.quote,
    attribution: stage.example.attribution,
    href: stage.example.href,
    projectName: getProject(stage.example.project)?.name ?? stage.example.project,
  },
}));

function stubMatchMedia(matches: boolean) {
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

class NoopIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

function renderSection(wide: boolean) {
  stubMatchMedia(wide);
  const { container } = render(<HowIThink stages={STAGES} />);
  const section = container.querySelector("section#how-i-think");
  if (!section) throw new Error("section#how-i-think not rendered");
  return section;
}

describe("HowIThink (TKT-76, TC-148)", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the heading copy and six stage cards in CONTENT_INVENTORY §1.5 order", () => {
    const section = renderSection(true);
    expect(section.getAttribute("aria-labelledby")).toBe("how-i-think-heading");
    expect(section.querySelector("h2#how-i-think-heading")?.textContent).toBe("A product journey, not a process.");
    const cards = section.querySelectorAll('li > div > article[data-paper="card"]');
    expect(cards).toHaveLength(6);
    const labels = Array.from(section.querySelectorAll("article h3")).map((h) => h.textContent);
    expect(labels).toEqual(["Problem", "Insight", "Bet", "Build", "Evaluate", "Impact"]);
    expect(Array.from(section.querySelectorAll("li[data-stage]")).map((li) => li.getAttribute("data-stage"))).toEqual([
      ...STAGE_ORDER,
    ]);
  });

  it("renders every stage's wording verbatim from data/thinking-framework.ts (D7)", () => {
    const section = renderSection(true);
    const cards = Array.from(section.querySelectorAll('article[data-paper="card"]'));
    const ordered = orderStages(thinkingFramework);
    ordered.forEach((stage, i) => {
      const card = cards[i]!;
      expect(card.querySelector('[data-hand="label"]')?.textContent).toBe(String(i + 1).padStart(2, "0"));
      expect(card.querySelector("h3")?.textContent).toBe(stage.label);
      expect(card.querySelector(".hit-principle")?.textContent).toBe(stage.principle);
      expect(card.querySelector('blockquote[data-hand="quote"]')?.textContent).toBe(`“${stage.example.quote}”`);
      expect(card.querySelector("cite")?.textContent).toBe(stage.example.attribution);
      // DRAFT principle → exactly one DraftTag per card (content gate: DRAFT copy renders labelled).
      expect(card.querySelectorAll('[data-paper="tag"]')).toHaveLength(1);
      expect(card.querySelector('[data-fastener="pin"]')?.getAttribute("data-tone")).toBe(stagePin[stage.id]);
    });
  });

  it("keeps every quote within the §3.4 limit (≤ 240 chars) with a cite sibling in the same card", () => {
    const section = renderSection(true);
    const quotes = Array.from(section.querySelectorAll('blockquote[data-hand="quote"]'));
    expect(quotes).toHaveLength(6);
    for (const q of quotes) {
      expect((q.textContent ?? "").trim().length).toBeLessThanOrEqual(240);
      const cite = q.nextElementSibling;
      expect(cite?.tagName).toBe("CITE");
      expect((cite?.textContent ?? "").length).toBeGreaterThan(1);
      expect(q.closest('[data-paper="card"]')).toBe(cite?.closest('[data-paper="card"]'));
    }
  });

  it("links each pill to its case-study chapter anchor (lib/anchors.ts) with the project name", () => {
    const section = renderSection(true);
    const routeSet = routes({ projectSlugs: ALL_PROJECT_SLUGS });
    const pills = Array.from(section.querySelectorAll("a"));
    expect(pills).toHaveLength(6);
    pills.forEach((a, i) => {
      const stage = STAGES[i]!;
      const href = a.getAttribute("href") ?? "";
      expect(href).toBe(stage.example.href);
      expect(routeSet.has(href), `${href} must resolve in routes()`).toBe(true);
      expect(href).toMatch(/^\/work\/[a-z0-9-]+#\d{2}-[a-z-]+$/);
      expect(a.textContent).toBe(`See how I tested this in ${stage.example.projectName}`);
    });
  });

  it("counts 3 decorations (torn + collage + journey sketch) when ≥ 1025 matches", () => {
    const section = renderSection(true);
    const decor = Array.from(section.querySelectorAll("[data-decor]")).map((el) => el.getAttribute("data-decor"));
    expect(decor).toEqual(["torn", "collage", "sketch"]);
    expect(section.firstElementChild?.getAttribute("data-decor")).toBe("torn");
    const sketch = section.querySelector('[data-decor="sketch"]');
    expect(sketch?.getAttribute("data-sketch")).toBe("journey");
    expect(sketch?.getAttribute("aria-hidden")).toBe("true");
    expect(sketch?.querySelector("path")?.getAttribute("d")).toBe(SKETCHES.journey.paths[0]!.d);
  });

  it("counts 2 decorations below 1025 — the sketch is removed from the DOM, not hidden", () => {
    const section = renderSection(false);
    expect(Array.from(section.querySelectorAll("[data-decor]")).map((el) => el.getAttribute("data-decor"))).toEqual([
      "torn",
      "collage",
    ]);
    expect(section.querySelector("svg.sketch")).toBeNull();
  });

  it("never puts the width-gated sketch into the SSR HTML", () => {
    const html = renderToStaticMarkup(<HowIThink stages={STAGES} />);
    expect(html).not.toContain('data-decor="sketch"');
    expect(html).toContain('data-decor="torn"');
  });

  it("renders the collage backdrop as one aria-hidden, text-free decoration (TKT-99, Dev-40)", () => {
    const section = renderSection(true);
    const collage = section.querySelectorAll('[data-decor="collage"]');
    expect(collage).toHaveLength(1);
    const el = collage[0]!;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.querySelectorAll("[data-decor]")).toHaveLength(0);
    expect((el.textContent ?? "").trim()).toBe("");
    // it sits behind the cards, inside the journey, never inside a card
    expect(el.closest('[data-paper]')).toBeNull();
  });

  it("gives each card its own torn edge, a compact two-line DraftTag and an arrow CTA (TKT-99)", () => {
    const section = renderSection(true);
    const cards = Array.from(section.querySelectorAll('article[data-paper="card"]'));
    const rims = cards.map((c) => (c.querySelector(".hit-paper-rim") as HTMLElement | null)?.style.clipPath ?? "");
    expect(rims.every((r) => r.startsWith("polygon("))).toBe(true);
    expect(new Set(rims).size).toBe(6);
    for (const card of cards) {
      expect(card.querySelector(".hit-paper")?.getAttribute("aria-hidden")).toBe("true");
      const tag = card.querySelector('[data-paper="tag"]');
      expect(tag?.textContent).toBe("Draft — pending sign-off");
      expect(tag?.hasAttribute("data-micro-label")).toBe(true);
      expect(tag?.querySelector(".hit-draft-line")?.textContent).toBe("pending sign-off");
      const arrow = card.querySelector("a svg");
      expect(arrow?.getAttribute("aria-hidden")).toBe("true");
    }
    const edges = Array.from(section.querySelectorAll("li[data-stage]")).map((li) =>
      (li as HTMLElement).style.getPropertyValue("--slip-edge"),
    );
    expect(edges.every((e) => e.startsWith("polygon("))).toBe(true);
  });

  it("has only the six link pills as focus stops (no disclosure buttons, no roving tabindex)", () => {
    const section = renderSection(true);
    const focusable = section.querySelectorAll("a[href], button, input, select, textarea, [tabindex]");
    expect(focusable).toHaveLength(6);
    for (const el of Array.from(focusable)) expect(el.tagName).toBe("A");
    expect(section.querySelectorAll("[aria-expanded], [tabindex]")).toHaveLength(0);
  });

  it("source carries no roving-tabindex or expand logic (TC-148 step 5)", () => {
    const src = readFileSync(join(process.cwd(), "components/home/HowIThink.tsx"), "utf8");
    expect(src).not.toMatch(/roving|tabIndex=\{-1\}/);
    expect(src).not.toMatch(/^"use client"/m);
    expect(src).not.toMatch(/useState|aria-expanded/);
  });
});
