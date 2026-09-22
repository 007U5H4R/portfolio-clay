# Report — TKT-43 · `/thinking` list + `/thinking/[slug]` essay route (DRAFT entries)

**Ticket:** TKT-43 (Backlog `TASK-39`) · Milestone **M-006** · Branch `m-006-pages`

## Files created / edited
- **Created** `data/writing.ts` — `writing: Essay[]` (5 DRAFT candidate essays from CONTENT_INVENTORY §5). Schema imported as a type only (no zod value import), matching `experience.ts`.
- **Created** `components/thinking/ThinkingHero.tsx` — flat, h1 only ("Thinking"), no lead (no supporting copy exists to quote).
- **Created** `components/thinking/ThinkingList.tsx` — numbered rows ("01" `ink-3` → `accent` on hover, `lavender/4%` row tint on hover), title + dek + "Draft — pending sign-off" `Tag` per row, each a `next/link` to `/thinking/[slug]`; the "Essays in progress — five drafts, none published yet." line renders above the list (list still shows all 5 rows).
- **Created** `components/thinking/EssayBody.tsx` — title, reading-time caption + DRAFT `Tag` (no date field ever rendered), `Prose`-wrapped body (sourced `blockquote` passages, same `butter`-accent-bar shape as `InsightCard`, each captioned with its resolved `SourceRef.label`, never `.ref`) + one labelled "Draft — pending sign-off:" framing paragraph, then an internal related-project link to `/work/[relatedProject]`.
- **Created** `app/thinking/page.tsx` — `buildMetadata(path:'/thinking', ogFamily:'Product Thinking')`, mounts `ThinkingHero` + `ThinkingList` in `Container`, static.
- **Created** `app/thinking/[slug]/page.tsx` — `generateStaticParams()` over the 5 `data/writing.ts` slugs, `dynamicParams=false` (unknown slug → `notFound()`), per-essay `buildMetadata`, mounts `EssayBody`.
- **Created** `app/thinking/opengraph-image.tsx` — one list-level OG image (1200×630), reusing `lib/og.tsx`'s `renderOgCard` (the already-corrected Work OG pattern — WebP→PNG/Buffer→ArrayBuffer fixes inherited for free, no new OG bugs to fix).
- **Edited** `data/index.ts` — wired `writing` (was hard-coded `[]`) into `collections`, so `validateAll()` / `pnpm prebuild` actually validate the 5 essays.
- **Edited** `app/sitemap.ts` — added `/thinking` to `STATIC_ROUTES` and a third sitemap block for the 5 essay slugs (`data/writing.ts` imported directly, not via `@/data`, per the file's own pre-existing comment about avoiding `scripts/forbidden-strings.ts`'s filesystem walk).
- **Created** `tests/e2e/thinking-page.spec.ts` — the route's Playwright suite (see **Filename deviation** below).
- **Created** `tests/unit/writing.test.ts` — `data/writing.ts` schema/truth gate (mirrors `tests/unit/experience-skills.test.ts`'s pattern).
- **Created** `docs/screenshots/thinking/{list,essay}-{390,768,1024,1440}.png`.

No other files touched.

## Filename deviation (flagging as instructed)
The brief named `tests/e2e/thinking.spec.ts` for this route's tests. That file **already exists** and is TKT-21's `/dev/thinking` QA board suite for the unrelated case-study `ShowTheThinking` disclosure component (its own header explains the scope; it carries `@EVAL-007`/`@EVAL-010` coverage). Overwriting it would have deleted that ticket's tests, so this ticket's tests live in the sibling file `tests/e2e/thinking-page.spec.ts` instead — its header explains why. `tests/e2e/thinking.spec.ts` is untouched (`git diff` confirms zero diff).

## The 5 essays shipped (title / slug / relatedProject / passage source)

| Title | Slug | Related project | Passage source(s) |
|---|---|---|---|
| "Green tests prove it runs. They don't prove it's right." | `green-tests-prove-it-runs` | `teachspark` | `TS/docs/linkedin/9-day-build-series.md`; `CS6/lesson-learnt.md:8` |
| "I made my own numbers worse the day before submitting" | `worse-numbers-before-submitting` | `teachspark` | `TS/docs/linkedin/9-day-build-series.md` (Post 9); `CS4/docs/final-prd.docx` §0 |
| "Refusal is a feature: designing an AI that would rather say no" | `refusal-is-a-feature` | `railcite` | `CS5/Design.md:21-24`; `CS5/docs/linkedin/railcite-9day-linkedin-series.md` (Day 5); `RC/lib/synthesize.ts:8-21` |
| "Killing Nuptis: two products in nine days and why one had to die" | `killing-nuptis` | `nuptis` | `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx` (Day 7, Day 9) |
| "Staleness is a correctness bug, not a missing feature" | `staleness-is-a-correctness-bug` | `railcite` | `RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md:16-19` |

Every `passages[].quote` is copied verbatim from CONTENT_INVENTORY §5, including that document's own "…" elisions — nothing paraphrased, extended, or newly invented. The only authored text per essay is its `dek` (one-line list summary) and its `framing` paragraph, both scoped to restate what the sourced passages already say, never adding a new fact.

## How DRAFT is surfaced
- **List (`ThinkingList`):** the empty-state line "Essays in progress — five drafts, none published yet." renders unconditionally above the list (zero `draft:false` essays exist); each row still shows, each carrying a "Draft — pending sign-off" `Tag`. No date anywhere on the list.
- **Essay (`EssayBody`):** a "Draft — pending sign-off" `Tag` sits where a publish date would go (essay schema's `publishedOn` is never set — `tests/unit/writing.test.ts` asserts this); the body's only content is the quoted passages + one paragraph starting "Draft — pending sign-off:" — never presented as finished prose.
- **Data:** every essay is `draft: true` in `data/writing.ts`; the `Essay` schema's own refinement (`draft || publishedOn`) means a non-draft essay without a publish date would fail `validateAll()` — the truth rule is mechanically enforced, not just written copy.

## Sitemap proof
`pnpm build` → `assert-static.ts` → `all routes static (12)`, with `/thinking` (○ static) and all 5 `/thinking/[slug]` (● SSG) in the route table. `app/sitemap.ts` now emits `/thinking` + the 5 `/thinking/<slug>` entries from `data/writing.ts` directly. `tests/e2e/eval-017.spec.ts`'s `EXPECTED_SITEMAP_COUNT` is derived (not hard-coded) from `STATIC_ROUTES.length + personal-project-count + collections.writing.length`, so it followed automatically and passed at 82/82 in the eval run (see below) with no edit needed to that file, per its own pre-existing comment.

## ALL gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass, 0 errors |
| `pnpm lint` | pass, 0 errors/warnings |
| `pnpm exec vitest run` | pass — **41 test files, 226 tests passed, 1 pre-existing skip** (unrelated `resume-pii.test.ts`). New `tests/unit/writing.test.ts`: 7/7 passed. `tests/unit/content-gate.test.ts` (the deliberate-failure fixture, still exactly 3 planted issues) unaffected. |
| `pnpm prebuild` | pass: `content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)` |
| `pnpm build` | pass. `all routes static (12)`; `/thinking` + 5 `/thinking/[slug]` present and static |
| `tests/e2e/thinking-page.spec.ts` (Playwright, `workers:1`, production build via `pnpm test:e2e`) | **18 passed, 0 failed, 22 skipped** (viewport-guard skips — content/axe/measure checks run once at their designated width, matching the repo's established pattern). One red→green fix mid-build: the essay blockquote initially measured 676px against the ≤600px assertion (Prose's default `60ch` renders wider than 600px in this font, same issue `AboutHero.tsx` already worked around) — fixed with the same `!max-w-[600px]` override, rebuilt, reran green. **No OOM, no retries needed.** |
| Full `pnpm test:e2e` (whole suite, all files, all 4 viewports) | pass — **314 passed, 0 failed, 502 skipped** (4.2 min). Confirms nothing else regressed. |
| `pnpm eval --only EVAL-006,EVAL-011,EVAL-013,EVAL-017 --skip-build --label tkt-43-thinking` | pass — `evals/results/tkt-43-thinking.json`: **totals 4 pass · 0 fail · 13 skip · 0 manual (of 17)**, `"regressions": []`. The one EVAL-011 finding is a pre-existing, unrelated WARN (LinkedIn external link 429 bot-block, recorded not FAIL) — not caused by this ticket. **No OOM, no retries needed.** |

## Screenshots
`docs/screenshots/thinking/list-{390,768,1024,1440}.png` (the `/thinking` list, showing the empty-state line + 5 rows + DRAFT tags) and `docs/screenshots/thinking/essay-{390,768,1024,1440}.png` (the `green-tests-prove-it-runs` essay page) — no horizontal overflow at any width (`noOverflow` fixture, all 4 viewports, green).

## Commit
`feat(m006): TKT-43 /thinking list + essay route (DRAFT entries)` — SHA recorded after commit (see `git log` on `m-006-pages`).

## Flags for Tushar's eye (not blocking)
1. **Titles pending sign-off** — all 5 titles are shipped verbatim from CONTENT_INVENTORY §5 as instructed, but §5 itself and TKT-43's own AC list them as "DRAFT — needs Tushar's sign-off." No title was altered.
2. **`relatedProject` for the first essay ("Green tests…") is ambiguous by source** — its two passages come from two different projects (TeachSpark's 9-day build series AND Cubicle's `lesson-learnt.md`). I picked `teachspark` (the first-quoted source) as the single `relatedProject`; `railcite`/`nuptis` essays are unambiguous (single project each). If you'd rather this one point at `cubicle`, or carry no related-project link at all, that's a one-line data change in `data/writing.ts`.
3. **`dek` and `framing` paragraphs are my own authored connective text** (explicitly permitted by the brief: "a clearly-marked one-paragraph DRAFT framing"), scoped to restate only what the quoted passages already say — never a new fact, number, or claim. Worth a read before sign-off since they are the one place in this ticket with any authored (non-quoted) prose.
4. **`readingMinutes`** (1–2 min per essay) is my own estimate given how short each draft's actual content is (a couple of quotes + one paragraph) — not sourced from anywhere, since no full essay exists yet to time.
