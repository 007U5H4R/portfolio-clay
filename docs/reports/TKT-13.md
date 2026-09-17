# TKT-13 — How-I-Think home section

**Milestone:** M-003 · **Branch:** `m-003-home` · **Date:** 2026-09-16

## What shipped
- `lib/stages.ts` — new: `StageId` (derived from `ThinkingStageDef['id']`), `STAGE_ORDER` (CONTENT_INVENTORY §1.5 order), the `stageTone` map (single source of truth for stage→colour, reused by later artifact/badge components per S13.01), and `orderStages()` (a generic sort-into-fixed-order helper).
- `data/thinking-framework.ts` — new: the 6 `ThinkingStageDef` records (Problem · Insight · Bet · Build · Evaluate · Impact), each with a VERIFIED `example` (quote/attribution/project/href, verbatim from CONTENT_INVENTORY §1.5) and a DRAFT `principle` one-liner. Tones read from `lib/stages.ts`.
- `data/index.ts` — wired `thinkingFramework` into `collections` (was `[]`), so the content gate now validates it.
- `components/home/HowIThink.tsx` — new client component: 6 `ClayTile` (utility tier) disclosure buttons in a roving-tabindex `<ol>`, one shared expand region below the row rendering the open stage's sourced example + a `ClayPill` link into its case study. One stage open at a time; `Escape`/outside-click close.
- `app/page.tsx` — resolves `thinkingFramework` server-side into the exact client-leaf prop shape (project slugs resolved to display names via `getProject`, per A1), renders `<HowIThink/>` after `<FeaturedWork/>` (additive; Hero/Ask/FeaturedWork untouched).
- `tests/e2e/how-i-think.spec.ts` — new `@EVAL-007 @EVAL-010 @EVAL-011 @EVAL-013` spec.
- `tests/e2e/ask-inline.spec.ts` — one-line regression fix: `page.getByText("Draft")` → `card.getByText("Draft")`, scoped to the Ask card now that HowIThink's own "Draft" badge (same convention as `AnswerView`'s) makes the unscoped locator ambiguous.

## Deviations from the literal plan text (documented)
1. **Tile size 140, not 160.** `ClayTile`'s discrete sizes are `40/56/120/140/180` (`components/clay/ClayTile.tsx`); "160" isn't one of them. Widening that shared primitive's size union was out of this ticket's scope (blast radius on every other `ClayTile` consumer). Used `size={140}` (nearest) with `!h-auto` to relax the square default — the same idiom `components/hero/FloatingTiles.tsx` already established for a non-square tile shape.
2. **Expand/collapse via CSS transition, not `m.div layout`.** Design.md §4's own "How-I-Think stage expand" row specifies a plain CSS transition (`ease-out`, 200ms) — `layout` animations need `domMax`, which `LazyMotionRoot` deliberately doesn't load (A6 bundle budget; same reasoning `AskPortfolio`'s TKT-10 report already recorded for its own expand). Implemented as a `grid-template-rows` transition on the shared expand region; `motion-reduce:transition-none` collapses it to instant.
3. **Tone resolution order.** Technical-plan's S13.01 line is internally inconsistent ("Problem→lavender?" followed by "Problem→sky … Bet→lavender" later in the same sentence). Took the more specific, later clause as authoritative: Problem→sky, Insight→butter, Bet→lavender, Build→peach, Evaluate→mint, Impact→mint (leaves `blush` free, reserved for error surfaces elsewhere per Design.md §2).
4. **`principle` is always DRAFT, no schema field added.** `ThinkingStageDef` (already fixed in `data/schema.ts`, out of this ticket's scope) has no `draft: boolean`. Since CONTENT_INVENTORY §1.5 supplies only the sourced `example`, not the general-framing `principle` line, every `principle` is DRAFT by construction — so `HowIThink` always renders one `AnswerView`-style "Draft" badge under the row, rather than a per-item flag that would need a schema change.

## Sourced / DRAFT accounting (EVAL-013)
- **VERIFIED, verbatim:** all 6 `example.quote` strings, copied character-for-character from CONTENT_INVENTORY §1.5 (Impact's quote reshaped to exactly the source's stat sentence, moving the "2026-08-24, test handsets excluded" framing into `attribution` rather than altering the quoted stat). Every `example.href` resolves through `lib/anchors.ts routes()` (checked by `data/index.ts`'s cross-entity validation) — no dangling/fabricated link.
- **DRAFT, flagged:** all 6 `principle` one-liners are new editorial framing (not present in CONTENT_INVENTORY), rendered with an explicit "Draft" badge + caption ("Principle lines are my own framing, not yet signed off."). None of the six assert a specific fact, number, or outcome — there is nothing in them to fabricate, only the (flagged) unsigned-off voice.

## Gates (all green)
- `pnpm typecheck` · `pnpm lint` — PASS.
- `pnpm test` — 163 pass, 1 skip (unchanged) — PASS.
- `pnpm build` — prebuild content gate `content OK (… thinking:6)`; all routes still static — PASS.
- `pnpm test:e2e --grep how-i-think` — 7 pass / 21 skipped-by-width — PASS.
- `pnpm eval --only EVAL-003,EVAL-007,EVAL-011,EVAL-013` — **3 pass · 0 fail · 1 manual (EVAL-003)** — no regression.
  - Running the full `pnpm test:e2e` once (not a required gate, but checked for safety) surfaced one pre-existing regression this ticket caused (`ask-inline.spec.ts`'s unscoped `page.getByText("Draft")` locator, fixed above — see Deviations) and one **pre-existing, unrelated** failure: `eval-017.spec.ts`'s sitemap test still hard-codes an expected count of 4 URLs, left stale when TKT-12 (already merged) added RailCite + Velora to `data/projects.ts` (sitemap now correctly lists 6). Confirmed via `app/sitemap.ts`/`git log` that this predates TKT-13 and touches no file in this ticket's scope — left unfixed and flagged here rather than silently repaired.

## git diff --stat (staged files only — screenshots/eval-run JSON/backlog left unstaged per brief)
```
 app/page.tsx                    | 26 ++++++++++++++++++++++++++
 components/home/HowIThink.tsx   | (new)
 data/index.ts                   |  5 +++--
 data/thinking-framework.ts      | (new)
 lib/stages.ts                   | (new)
 tests/e2e/ask-inline.spec.ts    |  4 +++-
 tests/e2e/how-i-think.spec.ts   | (new)
```

Left unstaged (not this ticket's to touch): `docs/screenshots/tracer/home-{390,768,1024,1440}.png` (re-rendered by running the e2e suite locally), `evals/results/eval-run-0.2.0-3a9b4d4.json` (eval-run artifact, same as TKT-12's precedent of not committing these), and `backlog/pm-dashboard.json` (an unrelated one-line `accent` field change observed in the working tree at the start of this session — not touched, not authored by this ticket).
