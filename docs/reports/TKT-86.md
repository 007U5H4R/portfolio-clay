# TKT-86 report: `/about` part 1 (hero, journey, capabilities, impact)

**Ticket:** TKT-86 (Backlog `TASK-81`) · M-009 · Feature · P1 · sp:5 · Phase C
**Branch:** `m009/tkt-86` (not pushed or merged) · **Model:** Opus 5.5
**Base:** `6366c7b`. This base does not include the Phase A/B integration, so `app/globals.css` merges against it.

## AC checklist (TC-166)

| AC | Status | Evidence |
|---|---|---|
| 1. Copy comes from `data/{experience,skills,impact}.ts` | ✓ | `tests/unit/about.test.tsx`: stats derive from `experience`; the notebooks equal `skills` item for item; the impact tiers equal `impactMetrics` (8 product rows, résumé rows grouped in data order, nothing dropped); an unknown source id throws |
| 2. The DRAFT subline is `aria-hidden`; the h1 carries the narrative (Dev-10) | ✓ | Unit test: the subline is `data-decor="annotation"` + `aria-hidden`. e2e `Dev-10 …` at 390/1440: the line is visible, it is absent from the hero's `ariaSnapshot()`, and the h1 is present |
| 3. EVAL-018 counts 2 / 3 (1 at 390) / 1 / 2 | ✓ | Unit counts per section (the journey tested with `matchMedia` true and false). e2e `eval-018.spec.ts` passes at w390/w1440 with the parked list at **`[]`** |
| 4. Every impact card has value, label, context, kind badge (Inter), asOf and Source | ✓ | Unit (all 8 cards) and e2e (all 8 cards; the badge's computed font is not Caveat) |
| 5. Scene is one `<img>` with the manifest alt; below 900 the copy stacks above a 4:3 photo | ✓ (adapted) | **Superseded by Dev-24 / EXE-18.** The scene is TKT-95's `SceneOpener` above the hero, so `section.ahero` has 0 imgs. The page has exactly 1 `main img[alt=<manifest alt>]`. There is no 4:3 photo below 900: the opener already renders the scene above the copy at every width |
| 6. No overflow at 390; stats go 2-up at ≤ 640 | ✓ | e2e stacking test at all four widths (2-up ≤ 640; the quote stacks under the stats < 900). `@EVAL-008` overflow and targets pass at 390/768/1024/1440 |

## What was built

- **`AboutHero`**: `section.ahero` sits under the opener. It holds:
  - the eyebrow;
  - the three-line Fraunces h1, with the third line in rust, plus a `DraftTag`;
  - `Annotation size="hero"` "Same curiosity → bigger problems.";
  - a taped `Sheet card` of stats (10+ / 3 / ∞ as a `<ul aria-label="Three quick facts">`) with an explanatory line (Inter);
  - the caption annotation "coffee first. then the roadmap.";
  - the pull-quote on a pinned `Sheet index` (note-coloured): a `Hand quote` blockquote plus an sr-only "Source: Tushar Pathak" (Dev-20 precedent) plus a `DraftTag`.
- **`ProductJourney`**: `section#journey` on paper-2 with a torn edge. Four pinned `Sheet card`s (rust, steel, forest, rust) inside `Reveal` leaves. The `Sketch path` and the "start here ↘" annotation sit inside `MediaGate min={900}`. The closing line is a Fraunces lead plus a `DraftTag`. Stage copy is unchanged and now exported as `JOURNEY_STAGES`.
- **`CapabilityClusters`**: `section#capability-clusters` on paper with a torn edge. Four `Sheet notebook`s on a 12-column grid (5/7/7/5, with the mockup rotations). The ticks are CSS list chrome: rust on sheets 1 and 4, forest on 2 and 3.
- **`Impact`**: `section#impact` on paper-2 with a torn edge.
  - Tier 1: 8 pinned `Sheet index` cards (4-up, 2-up ≤ 1100, 1-up ≤ 640). Each has the value (Fraunces, with the unit as `small`), label, context, an Inter kind badge, asOf and a `SourceCaption`.
  - Tier 2 ("From my résumé"): three engagement groups of value + Inter label, then one foot with Self-reported, asOf and Source.
  - Guards: the component throws if the résumé rows ever stop sharing one asOf/kind/source, so the shared foot can never misdate a row. An undeclared source id also throws (EVAL-013).
  - `Sticky` "dated, labelled, never rounded up." sits beside tier 2.
- **`eval-018-parked.json` → `[]`**: the `/about` caveat hit is fixed, and the stale-park guard passes.

## Judgement calls (decided by plan/Design precedence)

1. **Section id `#product-journey` → `#journey`** (Design §7.4). Nothing else in the repo references the old id; `about.spec.ts` is updated.
2. **The 14 px floor beats Design's "Inter 13"**. EXE-7 / EVAL-008 fail content text under 14 px, so these lines are 14 px: the stats "counted from…" line, the stat labels, the card context and the asOf. The uppercase eyebrows, kickers, kind badges and résumé group titles are `data-micro-label` (12 px, AA contrast checked by EVAL-008).
3. **Structural badge text is navy-2, with only the dot in steel.** Steel text on ivory is about 4.2:1, below AA at 12 px.
4. **The stats "how" line wording is derived from data**: "counted from 2016 — the “+” is because the American Express role is still open". The year and role come from `data/experience.ts`, the one role with no `dates.end`.
5. **Grouping the résumé "40+ microservices" row.** Its context has no date range, but it is grouped under "AmEx MARS Accounts Receivable migration, Jun 2026–present", as the mockup does (same engagement).
6. **Hero spacing.** The hero's top padding is tightened to `clamp(24px,3vw,44px)` under the opener, closing TKT-95's judgement item 3 for `/about`.

## Files changed

- `components/about/{AboutHero,CapabilityClusters,Impact}.tsx`
- `components/timeline/ProductJourney.tsx`
- `tests/unit/about.test.tsx` (new, 10 tests)
- `tests/e2e/about.spec.ts`: hero test rewritten; new Dev-10 test and stats/quote stacking test; journey pins, closing line and `#journey`; impact six-part check; EVAL-010 selector updated to `#journey`. No test was deleted or weakened.
- `tests/e2e/eval-018-parked.json` → `[]`
- `app/globals.css`
- `docs/screenshots/about/{390,768,1024,1440}.png`, produced by `about.spec`'s EVAL-008 test.

`app/about/page.tsx` is **untouched**. Component names and order are unchanged; each of my components renders its own `<section>`.

## Shared-file edit

`app/globals.css`: exactly one appended block, `/* TKT-86 · about part 1 … */ @layer components { … } /* end TKT-86 */`, holding the classes `about-head|eyebrow|h2|lead`, `ahero-*`, `aj*`, `acap*` and `aimp*`. No other block or token was edited.

## Gates

Two locked runs: the full gate, then one fix re-run.

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ (run 1 had one TS cast error in the new unit test, fixed) |
| `pnpm lint` / `pnpm tokens:check` | ✓ / ✓ |
| `pnpm test` (full) | 51 files passed · 1 skipped · **479 passed** · 2 skipped |
| `pnpm build` | ✓ |
| `about.spec.ts` (4 projects) | **24 passed**, 0 failed (the rest skip by design). Run 1 failed the new stacking test at 768/1024/1440: the −0.7° card tilt offsets same-row items by about 5 px, so the tolerance became half an item's height |
| `eval-018` + `scene-opener` + `timeline` (w390, w1440) | **73 passed**, 0 failed |
| `pnpm eval --only EVAL-006,008,013,018,021 --skip-build` | **5 pass · 0 fail** (491 specs) → `evals/results/eval-run-0.2.0-6366c7b-2.json`. Run 1 had EVAL-008 failing on the 12–13 px text (item 2 above); it went FAIL → PASS after the fix |

## Screenshots

I read the 1440 and 390 full-page shots in crops. At 1440 the hero copy sits under the opener, with the taped stats card left and the pinned yellow quote right. The journey shows four pinned year cards on the dashed path, with "start here" top-left. The notebooks sit on a 5/7/7/5 grid. The index cards run 4-up, and the résumé groups have the sticky at the right. At 390 everything stacks in one column, stats go 2-up with ∞ on its own row, and the path is absent.

## Merge notes

- Up to date as of writing: the section id is now `#journey`, not `#product-journey`. TKT-87's `about-part2.spec.ts` or its page-order checks should use `#journey`.
- `tests/e2e/about.spec.ts` still contains the legacy Awards/Research/Education/CTA/SITEMAP-order tests. TKT-87 owns those sections. If its rebuild changes the ids (`#awards`, `#research`, `#education`) or the colophon, those tests in my file need the matching update at merge.
- The Experience section below Impact is still legacy on this base (lead reads "newest to oldest"). That is TKT-87's S18 fix.
- **Restore failed.** The hook blocked `git checkout` of 12 churned screenshots I did not produce: `docs/screenshots/tracer/{case,home}-*.png` and `docs/screenshots/about/*-experience-open.png`. They remain modified and **unstaged** in the worktree. They are not in my commit.
