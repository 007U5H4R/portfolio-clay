# Report — TSK-24 · `CapabilityClusters` + `Impact` (MetricCard shape)

**Ticket:** TSK-24 (Backlog `TASK-36.3`) · parent **TKT-40** · Milestone **M-006** · Branch `m-006-pages`

## Files created / edited
- **Created** `data/impact.ts` — `impactMetrics: Metric[]` (19 rows) + `impactSources: SourceRef[]` (5 refs). Schema imported as a type only (no zod value import), matching `experience.ts`/`skills.ts`.
- **Created** `components/about/CapabilityClusters.tsx` — "What I Bring", 4 `ClayTile`s (utility tier) from `data/skills.ts`, 2×2 (`sm:grid-cols-2`) / stacked below.
- **Created** `components/about/Impact.tsx` — "Impact", resolves each metric's source (fail-loud, `CaseStudyHeader` pattern) and renders the reused `ArtifactGrid` + `MetricCard variant="card"`.
- **Edited** `app/about/page.tsx` — mounts `<CapabilityClusters/>` then `<Impact/>` between `<ProductJourney/>` and the `id="experience"` placeholder; updated the file's own doc comment.
- **Edited** `tests/e2e/about.spec.ts` — 2 new test declarations (8 executions across 4 viewports; 6 skipped as viewport-independent, matching the file's existing pattern).
- **Edited** `tests/unit/experience-skills.test.ts` — added a `data/impact (TSK-24)` describe block (6 new tests: schema parse, source resolution, no duplicate source ids, kind-mapping per AC 2, exact reuse-parity against `data/projects.ts`, forbidden-string/PII scan).
- **Regenerated** `docs/screenshots/about/{390,768,1024,1440}.png`.

No other files touched. `data/index.ts`/`Collections`/`validateAll()` were **not** extended to register a 7th "impact" collection — `Metric` is an embedded value type (like `Project.metrics`), not a top-level content entity in that registry's design, and the brief's scope list didn't include `data/index.ts`. The `data/impact.ts` schema/sourcing gate instead lives in the new `tests/unit/experience-skills.test.ts` describe block (mirrors the render-time guard both `Impact.tsx` and `CaseStudyHeader.tsx` already use).

## Impact metric table shipped (§4.4 trace)

| Value | Label | Kind | asOf | Source | §4.4 row |
|---|---|---|---|---|---|
| 35+ | AR capabilities delivered | self-reported | 2026-09-15 | RESUME | AmEx MARS row |
| 180+ | User stories | self-reported | 2026-09-15 | RESUME | AmEx MARS row |
| 4 | Agile teams | self-reported | 2026-09-15 | RESUME | AmEx MARS row |
| -30% | Feature delivery cycle time | self-reported | 2026-09-15 | RESUME | AmEx MARS row |
| 40+ | Cloud-native microservices/API capabilities | self-reported | 2026-09-15 | RESUME | AmEx capabilities row |
| -30% | Development effort (Devin GenAI) | self-reported | 2026-09-15 | RESUME | Devin row |
| +25% | Developer productivity (Devin GenAI) | self-reported | 2026-09-15 | RESUME | Devin row |
| 12 | Features shipped in 11 months | self-reported | 2026-09-15 | RESUME | Godrej row |
| +25% | Service-monitoring effectiveness | self-reported | 2026-09-15 | RESUME | Godrej row |
| +30% | Team productivity | self-reported | 2026-09-15 | RESUME | Godrej row |
| -20% | Turnaround time | self-reported | 2026-09-15 | RESUME | Godrej row |
| 17 | Teachers joined | measured | 2026-08-24 | CS4-FINAL-PRD | TeachSpark row (reused verbatim from `projects.ts` `teachspark.metrics`) |
| 8 (47%) | Activated | measured | 2026-08-24 | CS4-FINAL-PRD | TeachSpark row (reused) |
| 37.5 min | Median time saved | self-reported | 2026-08-24 | CS4-FINAL-PRD | TeachSpark row (reused; kind is self-reported in `projects.ts` too — the time-saved figure specifically, not the whole row) |
| 3 | Referrals | self-reported | 2026-08-24 | CS4-FINAL-PRD | TeachSpark row (reused from chapter-07 artifact `ts-a-referrals`) |
| 5,760 | Documents indexed | measured | 2026-09-15 | RC-API-STATS | RailCite corpus row (reused verbatim from `railcite.metrics`) |
| 14,406 | Chunks indexed (live) | measured | 2026-09-15 | RC-API-STATS | RailCite corpus row (reused from chapter-07 artifact `rc-a-chunks`) |
| 68% | Ingested PDFs needing OCR | measured | 2026-09-07 | RC-FINAL-PRD | RailCite corpus row (reused verbatim; kept its true Final-PRD ingest date rather than flattened to 09-15 — see note below) |
| 0 | Invented citations | structural | 2026-09-15 | RC-VALIDATE | "0 invented citations" row |

The §4.4 "Any external validation of resume metrics… MISSING" row is a note, not a number — **not** modelled as a `Metric`, per the brief.

**Note on the RailCite row's asOf split:** the brief's row-mapping list says `asOf:"2026-09-15" (REUSE projects.ts wording)` for the whole RailCite line, but `projects.ts` itself dates the OCR figure `2026-09-07` (the Final-PRD ingest run date) and the docs/chunks figures `2026-09-15` (live `/api/stats`) — two different, both-correct dates for two different measurements. I kept each figure's own true `asOf` from `projects.ts` rather than force-flattening the OCR row to `2026-09-15`, since "reuse projects.ts wording" and "never invent a fact" both point the same way here (inventing a later `asOf` for a measurement actually taken on 09-07 would itself be a fabricated fact). Flagging this interpretation for Tushar's eye.

## Source resolution
`impactSources` declares 5 `SourceRef`s: `RESUME`, `CS4-FINAL-PRD`, `RC-API-STATS`, `RC-FINAL-PRD`, `RC-VALIDATE` — all `inventory: "§4.4"`. `RESUME`'s label/ref are new (`"Résumé — Impact metrics"`); the other 4 reuse the exact `label`/`ref`/`url` already declared in `data/projects.ts`'s own `sources[]` (same real-world documents, cited from a second module). `Impact.tsx` builds a `Map<string, SourceRef>` and resolves every metric's `source` id, throwing (same message shape as `CaseStudyHeader`) if a row ever references an id `impactSources` doesn't declare — this is a design-time impossibility today (verified by the new vitest describe block) but keeps the render-time invariant symmetric with the rest of the case-study surface.

## Cluster grid behaviour
`CapabilityClusters` renders `data/skills.ts`'s 4 clusters (Product/AI & GenAI/Technology/Execution) as `ClayTile`s, `tier="utility"`, each cluster's own `tone`. `!h-auto !w-full` relaxes `ClayTile`'s fixed-square default (same idiom `HowIThink.tsx` already uses for its 140px stage tiles) so each tile grows to its content and stretches to its grid cell. Grid is `grid-cols-1 sm:grid-cols-2` — 2×2 from `sm` up, single column below. Every item string is rendered verbatim from `skills.ts` (no rewording); "SAFe" appears only inside the Execution cluster's item list as a bare methodology name, never paired with "Agilist"/"certified".

## ALL gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass, 0 errors |
| `pnpm lint` | pass, 0 errors/warnings |
| `pnpm exec vitest run` | pass — **37 test files, 200 tests passed, 1 pre-existing skip** (unrelated `resume-pii.test.ts`). New `data/impact (TSK-24)` block: 6/6 passed. One red→green cycle: the reuse-parity test initially asserted full `toEqual` on the "Invented citations" row against `projects.ts`'s metric, which failed because the brief explicitly gives that one row its own context text (`"by construction (lib/validate.ts)"`) rather than reusing `projects.ts`'s sentence — fixed by relaxing that single row to a `toMatchObject` on value/label/asOf/kind/source (context intentionally differs); re-ran green. |
| `pnpm prebuild` | pass: `content OK (projects:14 experience:4 skills:4 writing:0 knowledge:11 thinking:6)` — unchanged (impact.ts is not a registered `Collections` entity; see note above) |
| `pnpm build` | pass. `/about` still `○` (static) in the route list; `assert-static` printed `all routes static (10)` |
| `tests/e2e/about.spec.ts` (Playwright, `workers:1`, against the production build via `pnpm test:e2e` / `dotenv -e .env.tooling -- playwright test`) | **15 passed, 0 failed, 17 skipped** (skips are the file's existing viewport-independent pattern — content checks run once at w1440, axe/reduced-motion run once at 390+1440). **No OOM, no retries needed.** New tests: `CapabilityClusters renders the 4 skill clusters...` and `Impact renders sourced MetricCards...` both green at w1440 (their designated run). |

`@EVAL-008` (no-overflow + 44px targets) green at all 4 viewports including the new sections. `@EVAL-006` axe WCAG2.1AA clean at 390 and 1440 with both new sections mounted. `@EVAL-010` (ProductJourney reduced-motion) unaffected/still green.

## Screenshots
`docs/screenshots/about/{390,768,1024,1440}.png` — regenerated with the same scroll-through-then-reset capture the file already uses (fires every `Reveal` once). All 4 confirm: "What I Bring" renders as 2 columns of clay tiles (1 column on mobile) with every cluster's items listed; "Impact" renders as a grid of 19 `MetricCard`s (3-up at 1440/1024, fewer per row at narrower widths, 1 column at 390) each showing value, label, context sentence, kind badge (Measured/Structural/Self-reported), "as of" date, and a Source line — no naked numbers anywhere, no horizontal overflow at any width.

## Commit
`feat(m006): TSK-24 CapabilityClusters + Impact on /about` — SHA recorded after commit (see `git log` on `m-006-pages`).

## Flags for Tushar's eye (not blocking)
1. **Résumé `asOf` placeholder (`2026-09-15`)** — every self-reported AmEx/Godrej/Devin metric is dated to the résumé-review snapshot date used elsewhere on this branch (`data/experience.ts`), not a verified "résumé last updated" date. If you have a truer as-of date for the résumé itself, it's a one-line change to the `RESUME_ASOF` constant at the top of `data/impact.ts`.
2. **RailCite OCR figure's `asOf`** kept at its true `2026-09-07` Final-PRD date rather than the `2026-09-15` the brief's summary line mentioned — see the note above the gate table. If you'd rather every RailCite figure show one flattened date for a cleaner read, that's a data-only change (and would technically misstate when the OCR run happened).
3. **Section heading/lead copy** ("Skills" eyebrow / "What I Bring" / lead sentence; "Evidence" eyebrow / "Impact" / lead sentence) is my own framing to give each section a heading, same as `ProductJourney`'s heading in TSK-23 — CONTENT_INVENTORY §4.3/§4.4 only specify the cluster/metric content, not section copy. Flagging in case you want different framing.
4. **19 individual metric cards** is a lot of cards for one section — I split every §4.4 compound row (e.g., the 4-figure AmEx line) into one `Metric` per figure because the schema's `Metric.value` is a single number (the same convention `data/projects.ts` already uses for TeachSpark/RailCite), not a compound string. If you'd prefer fewer, denser cards, that would need either a schema change (out of this ticket's scope) or grouping figures under shared free-text labels, which would blur the "one sourced number per card" invariant `MetricCard`/EVAL-013 depend on.
