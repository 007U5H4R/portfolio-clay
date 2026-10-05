import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { collections, validateAll } from "@/data/index";
import { writing } from "@/data/writing";
import { ALL_PROJECT_SLUGS } from "@/lib/anchors";
import { EssayBody } from "@/components/thinking/EssayBody";
import { ThinkingHero } from "@/components/thinking/ThinkingHero";
import { ESSAYS_EMPTY_LINE, ThinkingList } from "@/components/thinking/ThinkingList";

/**
 * TKT-43 — `data/writing.ts` (tickets.md TKT-43 AC 1–3, TDD gate item 3). Content correctness
 * (every quoted passage traces to CONTENT_INVENTORY §5) is verified by hand in
 * `docs/reports/TKT-43.md`; this file asserts the structural/schema/truth invariants a future edit
 * could silently break — the DRAFT-everywhere rule above all (AC2/AC3).
 */
describe("data/writing (TKT-43)", () => {
  it("validateAll() reports no issues for the live collections (writing wired in)", () => {
    expect(validateAll(collections)).toEqual({ ok: true });
  });

  it("has exactly the 5 DRAFT candidate essays from CONTENT_INVENTORY §5, unique slugs", () => {
    expect(writing).toHaveLength(5);
    expect(new Set(writing.map((e) => e.slug)).size).toBe(5);
  });

  it("every essay is draft:true and carries no publishedOn (nothing is published — AC2)", () => {
    for (const essay of writing) {
      expect(essay.draft, `essay "${essay.slug}" must be draft:true`).toBe(true);
      expect(essay.publishedOn, `essay "${essay.slug}" must not carry a publish date`).toBeUndefined();
    }
  });

  it("every essay has at least one sourced passage and a labelled DRAFT framing paragraph", () => {
    for (const essay of writing) {
      expect(essay.passages.length, `essay "${essay.slug}"`).toBeGreaterThanOrEqual(1);
      expect(essay.framing.length, `essay "${essay.slug}" framing`).toBeGreaterThanOrEqual(40);
      expect(essay.framing, `essay "${essay.slug}" framing must be clearly labelled DRAFT`).toMatch(
        /Draft — pending sign-off/,
      );
    }
  });

  it("every passage.source resolves to a declared SourceRef.id (EVAL-013 — EssayBody would render no caption otherwise)", () => {
    for (const essay of writing) {
      const ids = new Set(essay.sources.map((s) => s.id));
      for (const passage of essay.passages) {
        expect(
          ids.has(passage.source),
          `essay "${essay.slug}" passage references undeclared source "${passage.source}"`,
        ).toBe(true);
      }
    }
  });

  it("every essay's relatedProject (when present) is a real personal-build slug", () => {
    for (const essay of writing) {
      if (essay.relatedProject) {
        expect(
          (ALL_PROJECT_SLUGS as readonly string[]).includes(essay.relatedProject),
          `essay "${essay.slug}" relatedProject "${essay.relatedProject}" is not a known project slug`,
        ).toBe(true);
      }
    }
  });

  it("never contains PMP, a SAFe certification claim, or DOB/phone PII patterns", () => {
    const text = JSON.stringify(writing);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
  });
});

// ---------------------------------------------------------------------------
// TKT-84 — the paper `/thinking` + essay components, rendered to static markup (the SSR HTML — so a
// `MediaGate`-gated decoration is correctly absent, as it is below its width in the browser).
// ---------------------------------------------------------------------------

/** The prefix every `framing` in data/writing.ts starts with — read from the data, never typed (TC-164). */
const DRAFT_PREFIX = (() => {
  const match = /^[^:]+:/.exec(writing[0]!.framing);
  if (!match) throw new Error("writing[0].framing has no 'label:' prefix");
  return match[0];
})();

/** Rendered text of an element (tags stripped, the few entities React escapes decoded). */
function textOf(element: ReactElement): string {
  return renderToStaticMarkup(element)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Occurrences of `needle` in `haystack` — a count, not a substring test (S18: `toContain` missed the duplicate). */
function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

const decorCount = (html: string) => (html.match(/data-decor="/g) ?? []).length;

function renderEssay(index: number): string {
  const essay = writing[index]!;
  const next = writing[index + 1];
  return renderToStaticMarkup(
    createElement(EssayBody, {
      essay,
      number: index + 1,
      next: next ? { slug: next.slug, title: next.title } : undefined,
    }),
  );
}

describe("TKT-84 · EssayBody — S18 double-prefix regression (TC-164)", () => {
  it("the prefix under test comes from the data and is the S18 string", () => {
    expect(DRAFT_PREFIX).toBe("Draft — pending sign-off:");
    for (const essay of writing) expect(essay.framing.startsWith(DRAFT_PREFIX), essay.slug).toBe(true);
  });

  it.each(writing.map((essay, index) => [essay.slug, index] as const))(
    "%s: the DRAFT prefix renders exactly once and the DraftTag exactly once",
    (_slug, index) => {
      const essay = writing[index]!;
      const html = renderEssay(index);
      const text = textOf(
        createElement(EssayBody, { essay, number: index + 1, next: undefined }),
      );
      expect(occurrences(text, DRAFT_PREFIX)).toBe(1);
      expect(occurrences(html, 'data-paper="tag"')).toBe(1);
      // The tag sits in the header's meta row, not in the prose.
      expect(html).toMatch(/<p class="essay-meta">(?:(?!<\/p>).)*data-paper="tag"/);
    },
  );

  it("negative control: a component that re-adds the prefix span is caught by the same count", () => {
    const essay = writing[0]!;
    const doubled = createElement(
      "p",
      null,
      createElement("span", null, `${DRAFT_PREFIX} `),
      essay.framing,
    );
    expect(occurrences(textOf(doubled), DRAFT_PREFIX)).toBe(2);
  });

  it.each(writing.map((essay, index) => [essay.slug, index] as const))(
    "%s: flat prose (0 decorations), sourced pull quotes ≤ 240 chars with a Source cite, unit count 1",
    (_slug, index) => {
      const essay = writing[index]!;
      const html = renderEssay(index);
      const prose = /<div data-flat="" class="essay-prose">([\s\S]*)<\/div><nav/.exec(html)?.[1] ?? "";
      expect(prose, "prose zone rendered").not.toBe("");
      expect(decorCount(prose)).toBe(0);
      expect(occurrences(prose, 'data-hand="quote"')).toBe(essay.passages.length);
      expect(occurrences(prose, "<b>Source:</b>")).toBe(essay.passages.length);
      for (const passage of essay.passages) expect(passage.quote.length + 2).toBeLessThanOrEqual(240);
      // Essay section unit: the margin sticky only (the pinned photo is superseded by the opener).
      expect(decorCount(html)).toBe(1);
    },
  );

  it("pager: prev goes to /thinking, next follows data order, the last essay has no next", () => {
    const first = renderEssay(0);
    expect(first).toContain('href="/thinking"');
    expect(first).toContain(`href="/thinking/${writing[1]!.slug}"`);
    const last = renderEssay(writing.length - 1);
    expect(last).not.toContain("next note");
  });
});

describe("TKT-84 · ThinkingList + ThinkingHero (TC-163)", () => {
  it("renders the 5 essays in data order, each h3 linking to its slug", () => {
    const html = renderToStaticMarkup(createElement(ThinkingList, { essays: writing }));
    const hrefs = [...html.matchAll(/<h3[^>]*><a[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(writing.map((essay) => `/thinking/${essay.slug}`));
  });

  it("shows the empty-state line while no essay is published, and hides it once one is", () => {
    const live = textOf(createElement(ThinkingList, { essays: writing }));
    expect(occurrences(live, ESSAYS_EMPTY_LINE)).toBe(1);

    const fixture = writing.map((essay, i) =>
      i === 0 ? { ...essay, draft: false, publishedOn: "2026-10-01" } : essay,
    );
    const published = textOf(createElement(ThinkingList, { essays: fixture }));
    expect(published).not.toContain(ESSAYS_EMPTY_LINE);
  });

  it("empty collection: the empty-state line alone, no sheet", () => {
    const html = renderToStaticMarkup(createElement(ThinkingList, { essays: [] }));
    expect(html).toContain(ESSAYS_EMPTY_LINE);
    expect(html).not.toContain('data-paper="notebook"');
  });

  it("unit counts: essays 3 in the SSR HTML (margin annotation is width-gated ≥ 1320), opener 2", () => {
    const list = renderToStaticMarkup(createElement(ThinkingList, { essays: writing }));
    expect(decorCount(list)).toBe(3);
    expect(list).not.toContain("the same lesson, told twice");
    const hero = renderToStaticMarkup(createElement(ThinkingHero));
    expect(decorCount(hero)).toBe(2);
  });
});
