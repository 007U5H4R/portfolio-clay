"use client";

import { useSearchParams } from "next/navigation";

/**
 * The EVAL-018 violating fixture (S70.09, TC-127 test data): rendered only under
 * `/dev/primitives?violate=1`. It is **raw markup** — none of the paper primitives is weakened to
 * produce it — and every hit lands in `section#fixture-violate` so the rest of the board stays clean.
 *
 * Client-side off `useSearchParams` (under a Suspense boundary in the page) so the route stays
 * statically prerendered (TP1 / `scripts/assert-static.ts`); a server `searchParams` read would make
 * the page dynamic.
 *
 * Trips all four Design.md §3.2 rules:
 *   budget  — 5 notes + the tape + the sticky = 7 `[data-decor]` in one section (limit 4)
 *   caveat  — a `<p class="font-hand">` with no `data-decor`, no `aria-hidden`, no `data-hand`
 *   flat    — a `[data-decor="tape"]` inside a `[data-flat]` zone
 *   hidden  — a `[data-decor="sticky"]` without `aria-hidden="true"`
 *   caveat placement (§3.4, fix 1) — a `data-hand="label"` with no `[data-paper]` ancestor; a
 *             `data-hand="quote"` with no cite in its scope
 */
export function ViolateFixture() {
  const params = useSearchParams();
  if (params.get("violate") !== "1") return null;
  return (
    <section
      id="fixture-violate"
      data-fixture="violate"
      aria-labelledby="fixture-violate-title"
      className="mt-[var(--space-10)] border-2 border-dashed border-terracotta p-[var(--space-5)]"
    >
      <h2 id="fixture-violate-title" className="font-display text-h3 text-terracotta">
        Violating fixture (EVAL-018 positive control)
      </h2>
      <p className="text-caption text-ink-soft">
        Raw markup, not primitives. Expected: budget 7 / 4 · 3 Caveat hits (bare paragraph, label outside paper, quote
        without cite) · 1 decoration in a flat zone · 1 unhidden sticky.
      </p>
      <div className="mt-[var(--space-4)] flex flex-wrap items-start gap-[var(--space-4)]">
        {["one", "two", "three", "four", "five"].map((n) => (
          <span key={n} data-decor="note" aria-hidden="true" className="paper-note font-hand">
            {n}
          </span>
        ))}
      </div>
      <p className="font-hand mt-[var(--space-4)] text-[20px] text-navy-2">
        This paragraph is Caveat with no decoration, no aria-hidden and no data-hand — a Caveat rule hit.
      </p>
      <div data-flat="" className="mt-[var(--space-4)] max-w-[68ch]">
        <p className="text-body text-navy-2">A flat reading zone that wrongly contains a decoration:</p>
        <span data-decor="tape" aria-hidden="true" className="paper-tape mt-[var(--space-2)]" />
      </div>
      <p data-decor="sticky" data-tone="note" className="paper-sticky font-hand mt-[var(--space-4)]">
        An unhidden sticky — a hidden rule hit.
      </p>
      {/* §3.4 placement (fix 1): a label outside any data-paper object; a quote with no cite. */}
      <p data-hand="label" className="font-hand mt-[var(--space-4)] text-[20px] text-rust">
        Chosen
      </p>
      <blockquote data-hand="quote" className="font-hand mt-[var(--space-2)] text-[20px] text-navy">
        <p>A quote with no cite and no Source: sibling anywhere in its scope.</p>
      </blockquote>
    </section>
  );
}
