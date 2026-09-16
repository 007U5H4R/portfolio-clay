# TKT-12 — Featured Work (RailCite + Velora) + FeaturedWork home section

**Milestone:** M-003 · **Branch:** `m-003-home` · **Date:** 2026-09-16

## What shipped
- `data/projects.ts` — added the **railcite** and **velora** records at card fidelity; `projects` is now the featured trio `[teachspark, railcite, velora]`. Icons `ShieldCheck` (railcite) and `Handshake` (velora) added to the `ICONS` map.
- `components/projects/FeaturedWork.tsx` — new server component; derives the featured trio from `projects`, sorts by rank, renders an editorial equal-height row (large card spans 2 of 4 columns at ≥1024, mediums 1 each; single column stacked below 1024).
- `app/page.tsx` — `<FeaturedWork/>` replaces the M-001 tracer single-card placeholder (removed now-unused `Container`, `ProjectCard`, `teachspark` imports).
- `app/work/[slug]/page.tsx` + `app/work/[slug]/opengraph-image.tsx` — `generateStaticParams` now maps every personal project (teachspark, railcite, velora), keeping page + OG image routes in sync.
- `tests/e2e/featured.spec.ts` — new `@EVAL-002 @EVAL-011 @EVAL-015` spec.
- `components/projects/ProjectCard.tsx` — **unchanged** (statusLabel + VT names already generic; asymmetry carried by grid width, so no per-size fork was needed — grid mode lands at TKT-16).

## The three featured records

| Rank | slug | name (display) | gridSize | status / statusLabel | statusAsOf | tags | filters | live | repoPublic |
|---|---|---|---|---|---|---|---|---|---|
| 1 | teachspark | TeachSpark | **large** | pilot / "Live pilot (Twilio sandbox)…" | 2026-09-09 | AI · WhatsApp · EdTech | ai | railway app | false |
| 2 | railcite | RailCite | medium | live / "Live" | 2026-09-15 | AI · RAG · GovTech | ai, cloud | railcite.vercel.app | false |
| 3 | velora | Nuptis → Velora | medium | live / "Live (mock data)" | 2026-09-15 | B2B · Marketplace · PM craft | enterprise, experiments | velora-nu-eight.vercel.app | false |

Composition invariant satisfied: **projects:3**, distinct ranks 1/2/3, **exactly one `gridSize:'large'`** (TeachSpark). All repos private (S5) → `repoPublic:false`, no github link. Hero media `{}` (real media = M-005).

### Sourced copy / metrics / asOf (EVAL-013)
- **No fabricated metrics.** RailCite and Velora carry **`metrics: []`** at card fidelity (full metric snapshots land with the content tickets TKT-28 / TKT-30). The card renders no numbers, so there is nothing to source on the card itself; every rendered claim (tagline, statusLabel, statusAsOf) traces to CONTENT_INVENTORY.
- **RailCite** — tagline = §1.4 FeaturedWork card copy verbatim (`CS5/Discovery-PRD.md` L3-5), deliberately the abbreviated form so "without ever inventing a citation" survives the 2-line clamp. `statusLabel:"Live"` + `statusAsOf:"2026-09-15"` from live `/api/stats` HTTP 200 (§8.2). `overview.thirtySecond` = §1.5 problem quote verbatim (not user-visible until M-005). Sources: `RC-DISCOVERY-PRD`, `RC-API-STATS`.
- **Velora** — display name `Nuptis → Velora` carries the S3 rename (route/slug `velora`). tagline = §1.4 card proposition verbatim (`CS3/Case-Study-3-…9-Day-Series` Day 7/9). `statusLabel:"Live (mock data)"` per §8.5 (live path built, never run on a real project). Sources: `V-PRD`, `CS3-9DAY-SERIES`.

### DRAFT / omitted-unsourced notes
- **Velora `thirtySecond`** uses the §8.5 verbatim discovery insight ("Onboarding routinely takes 15–30 business days…"). The PRD's own problem line (`PRD.md:11`) is not quoted in CONTENT_INVENTORY, so the sourced insight stands in **rather than a paraphrase** — no invention. Flag as DRAFT for the content ticket (TKT-30) to replace with the exact PRD problem line once verified. Not user-visible in this ticket (case-study stub renders header only).
- No DRAFT on any card-visible field: taglines and status are verbatim-sourced.

## Gates (all green)
- `pnpm typecheck` · `pnpm lint` · `pnpm test` (163 pass, 1 skip) — PASS.
- `pnpm build` — prebuild content gate `content OK (projects:3 …)`; `/work/railcite` + `/work/velora` (+ their OG images) prerendered static; `all routes static` — PASS.
- `pnpm test:e2e --grep featured` — 10 pass / 14 skipped-by-width — PASS. Layout gate confirmed at 1440: 3 cards equal height (±1px), large card > medium + 40px, the two mediums equal width.
- `pnpm eval --only EVAL-001,EVAL-002,EVAL-011,EVAL-013,EVAL-015` — **4 pass · 0 fail · 1 manual (EVAL-001)**, no regression (exit 0). EVAL-011 crawler: 0 dead controls (24 WARN = pre-existing not-yet-built /about, /thinking routes + LinkedIn 429 bot-block).
  - One transient run flaked with 8 "dead" verdicts, all on the footer's **external GitHub link timing out** (`operation aborted due to timeout`, github.com) — untouched by this ticket; two subsequent runs were clean. Recorded as an external-network flake, not a code defect.

## EXE-6 hero + FeaturedWork read (for orchestrator, judged at TKT-14)
FeaturedWork renders as a single equal-height row at ≥1024: TeachSpark occupies ~50% width (2/4 cols), RailCite and Velora ~25% each (1/4). At **1024** the row sits directly under the Ask section and reads as "one hero project + two supporting" — the large card's wider measure lets its longer tagline breathe while the mediums stay compact; not "three identical rectangles." At **1440** the wider container amplifies the same ratio (large ~630px, mediums ~300px). The asymmetry is width-only (card anatomy identical, heights equal), so the grid ratio (currently 2:1:1 on a 4-col track) is the lever the orchestrator can tune at TKT-14 against the hero's avatar/text balance without touching card internals.

## git diff --stat
```
 app/page.tsx                        |  19 ++----
 app/work/[slug]/opengraph-image.tsx |  11 ++--
 app/work/[slug]/page.tsx            |  13 +++-
 components/projects/FeaturedWork.tsx |  (new)
 data/projects.ts                    | 119 +++++++++++++++++++++++++++++++++++-
 docs/reports/TKT-12.md              |  (new)
 tests/e2e/featured.spec.ts          |  (new)
```
