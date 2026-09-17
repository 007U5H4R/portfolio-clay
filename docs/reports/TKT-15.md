# TKT-15 · Full project dataset (14 records) — implementer report

**Milestone:** M-004 · **Type:** Task · **Priority:** P1 · **Branch:** `m-004-work`
**Scope:** DATA ONLY (`data/projects.ts`). The `/work` grid UI is TKT-16; case-study chapters land per slug in M-005. No metrics asserted here → card fidelity, matching the existing featured trio.

## Result

- `data/projects.ts` now holds **14 records — 11 personal builds + 3 professional-experience entries**.
- Content-gate (`scripts/validate-content.ts`, EVAL-013): **PASS** — `content OK (projects:14 …)`.
- Forbidden-strings scan (EVAL-016): **0 hits in 71 files** (repo). `--bundle` scan via `pnpm eval` also clean. *Note:* the sandbox-join-code sub-check prints `SKIP` because `tests/forbidden.local.json` is git-ignored and absent in this workspace — expected; nothing to fix here.
- `pnpm eval --only EVAL-013,EVAL-016`: **2 pass · 0 fail** → no regression (`evals/results/eval-run-0.2.0-0513f0e.json`, left unstaged).
- `pnpm typecheck && lint && test && build`: all green. Build generates 11 `/work/[slug]` pages (personal only); professional entries have no case-study page (`generateStaticParams` filters `category==='personal'`).

## Record list (each field traces to CONTENT_INVENTORY §2.2 card prop + the named §8 pack)

### Personal builds (11) — `category: "personal"`
| slug | name | status / statusLabel | grid | filters | repoPublic | live | role |
|---|---|---|---|---|---|---|---|
| teachspark* | TeachSpark | pilot / Live pilot… | large | ai | false | yes | Solo build |
| railcite* | RailCite | live / Live | medium | ai, cloud | false | yes | Solo build |
| velora* | Nuptis → Velora | live / Live (mock data) | medium | enterprise, experiments | false | yes | Solo build |
| cubicle | Cubicle | prototype / **Built, not launched** | small | ai | false | **none** | Team build |
| nuptis | Nuptis | live / Live (mock data) | small | enterprise | false | yes | Solo build |
| bhakti-vilas | Bhakti Vilas | prototype / Live prototype (mock data, team build) | small | experiments | false | yes | Team build |
| token-toli | Token Toli | research / Discovery only | small | experiments | false | none | Team discovery |
| pratyasa | Pratyasa | live / Live | small | experiments | false | yes | Solo build |
| tegaki | Tegaki | pilot / Live pilot | small | experiments | false | yes | Solo build |
| dino-arcade-pwa | Dino Arcade | live / Live (BYO-ROM) | small | experiments | **true** | yes | Solo build |
| cinematic-portfolio | Cinematic Portfolio | live / Live | small | experiments | **true** | yes | Solo build |

\* pre-existing featured trio — untouched (not rewritten).

Slug `dino-arcade-pwa` matches `lib/anchors.ts` `ALL_PROJECT_SLUGS` (the content-gate's link universe), not the abbreviated `dino-arcade` in SITEMAP.md §24 — the anchors list is the authoritative SOT the test consumes.

### Professional experience (3) — `category: "professional"`
| slug | name | tags | filters | role | dates |
|---|---|---|---|---|---|
| mars-ar-modernization | Accounts Receivable Modernization — American Express | Enterprise, Cloud, GenAI | enterprise, cloud, ai | Senior Product Manager | 2026-06 → present |
| cloud-modernization-programs | Cloud & Data Platform Modernization — Quantiphi & Shellkode | Cloud, Data, Delivery | cloud, enterprise | Technical Project Manager | 2022-08 → 2026-06 |
| godrej-smartnet | Godrej Smartnet Platform — Godrej Infotech | Product, Enterprise, **Platform** | enterprise | Assistant Product Manager | 2016-09 → 2018-12 |

All three: no `links.live`, no `demoVideo`, no `featured` (schema-enforced for professional), `sources = RESUME` (§2.3). `status:"archived"` → neutral badge tone so no green "Live" product signal appears; badge text is "Professional experience". "Platform" used instead of "IoT" per §2.3 (resume says "platform" only). Godrej patent/SL numbers, PMP/SAFe, DOB/phone excluded.

## Metrics: none added (no unsourced numbers)
No `metrics[]` were populated on any record — dated/sourced metrics belong to each slug's M-005 content ticket, exactly as the existing featured trio defer them. Consequence: **zero fabrication risk on figures** in this ticket; every metric conflict flagged in CONTENT_INVENTORY (TeachSpark 08-24 vs 08-26, RailCite corpus dates) is untouched and resolved later with `asOf`+`source`.

## DRAFT / soft flags (not blockers)
- **Cubicle `role: "Team build"`** — §8.3 records Tushar's named role as *unrecorded* and warns the card must not claim solo. Chose the sourced, non-fabricated "Team build" (buildathon team of 6). Confirm exact role at the Cubicle content ticket.
- **Token Toli `role: "Team discovery"`** — Guru-pod PRD has 3 co-authors (§8.7); "Team discovery" avoids implying solo authorship.
- **Professional `status:"archived"`** — the enum has no "employment" value; "archived"→neutral tone is the honest choice (never implies a live public product) even for the current AmEx role, whose currency is carried by `duration: "Jun 2026 – present"`.
- **Bhakti-Vilas / Pratyasa / Tegaki `repoPublic:false`** — repos exist but the audit could not verify public visibility → false per AC5.
- **FilterTabs bucket** — Token Toli / Pratyasa / Bhakti-Vilas defaulted to `experiments` (AC2 open decision; `decisions.md` EXE-n once Tushar answers).

## Also changed
- `data/projects.ts`: added lucide icon imports + registry entries (Users, ClipboardList, Music, Search, Award, PenLine, Gamepad2, Film, Landmark, Cloud, Network) so each new card resolves a meaningful icon.
- `tests/unit/schema.test.ts`: added a regression test asserting 14 records / 11 personal / 3 professional / unique slugs / one large / professional entries carry no live·demo·featured.

## Verification
`git diff --stat` (staged):
```
 data/projects.ts          | 505 +++++++++++++++++++++++++++++++++++++++++++++-
 tests/unit/schema.test.ts |  17 +-
 docs/reports/TKT-15.md     | (this report)
```
- typecheck: PASS · lint: PASS · unit tests: 168 passed / 1 skipped · build: PASS (11 SSG case-study pages)
- content-gate: `projects:14` · forbidden-strings: 0 hits · EVAL-013/016: 2 pass, 0 fail
