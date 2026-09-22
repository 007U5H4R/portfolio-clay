# Brief — TSK-24 · `CapabilityClusters` + `Impact` (MetricCard shape)

**Ticket:** TSK-24 (Backlog `TASK-36.3`) · parent **TKT-40** · Milestone **M-006** · Type Task · P1 · sp:1
**Branch:** `m-006-pages` (already checked out; commit ONLY here, never `main` — verify `git branch --show-current`)
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TSK-22 (done — `data/experience.ts`, `data/skills.ts`), TSK-23 (done — `app/about/page.tsx` skeleton, `AboutHero`, `ProductJourney`), TKT-20 (done — `MetricCard`).

## Objective
Add the next two `/about` sections **after** `ProductJourney`, in SITEMAP order: **"What I Bring"** (`CapabilityClusters` — 4 clusters) then **"Impact"** (numbers with context via the `MetricCard` shape). Mount both into the existing `app/about/page.tsx` at the insertion point TSK-23 left, BEFORE the `id="experience"` anchor placeholder (TKT-41's timeline goes there next). Do NOT build the timeline, Awards/Research/Education, or the About OG — later tickets own those.

## Read first (in order)
1. `tickets.md` → **TKT-40** (~832–850, esp. AC 2 for Impact kinds/asOf) and **TSK-24** (~861–864).
2. `Design.md` → **§3 line 239** (`CapabilityClusters` = 4 `ClayTile`s in a 2×2 / 4×1 grid, utility tier; `Impact` numbers use the `MetricCard` artifact shape — "never a naked number") and the motion/a11y tables (~280, ~296–307).
3. `SITEMAP.md` line 12 — `/about` section order: AboutHero · My Product Journey · **What I Bring (4 clusters)** · **Impact** · Experience timeline · Awards · Research · Education.
4. `CONTENT_INVENTORY.md` → **§4.3 CapabilityClusters** (~187–194) and **§4.4 Impact** (~196–207). Every string traces here.
5. `data/skills.ts` (exists) — read the real shape: `SkillCluster` = `{ id, name, tone, items[], source }`. Do NOT re-author it; `CapabilityClusters` consumes `skills`.
6. **Pattern references (critical for Impact):**
   - `components/case-study/CaseStudyHeader.tsx` (~38–72) — the canonical way to render `MetricCard`s: build a `Map<string, SourceRef>` from a `sources` array, look up each `metric.source` id → `SourceRef`, `requireSource`/fail-loud if missing, pass `<MetricCard metric={m} source={s} variant="inline"|"card" />`.
   - `components/case-study/artifacts/MetricCard.tsx` — `metric` is the FULL `Metric` (value/label/context/asOf/kind/source all NON-optional); it **throws** at runtime if `asOf` or `source` is missing (EVAL-013). So every Impact metric MUST carry a real `asOf` and a resolvable `source`.
   - `data/projects.ts` — the TeachSpark (`asOf:"2026-08-24"`, `kind:"measured"`) and RailCite (`asOf:"2026-09-15"`, `kind:"measured"`) metric objects already exist. **Reuse the EXACT same value/asOf/context/kind strings** for the matching Impact rows so the two surfaces never diverge.
7. `data/schema.ts` — `Metric` (~31–36) and `SourceRef` shapes; `SkillCluster` (~118).

## Scope — files
- **Create** `data/impact.ts` — export `impactMetrics: Metric[]` (the §4.4 rows) **and** `impactSources: SourceRef[]` (the source refs those metrics resolve to, mirroring the `project.sources` pattern). Each metric: `value` + `label` + `context` + `asOf` + `kind` + `source` (id resolvable in `impactSources`). Module imports schema **as a type only** (no zod value import — keeps it out of the client bundle, per `experience.ts`/`skills.ts` convention). Add a `// source: CONTENT_INVENTORY §4.4` header comment.
  - Row → kind/asOf mapping (TKT-40 **AC 2**, exact):
    - AmEx MARS "35+ AR capabilities · 180+ user stories · 4 Agile teams · −30% cycle time" → `kind:"self-reported"`; asOf = résumé snapshot `"2026-09-15"`; context notes "self-reported in résumé"; source RESUME. (Split into rows as §4.4 lists, or group sensibly — but never invent a number not in §4.4.)
    - AmEx "40+ cloud-native microservices/API capabilities" → `self-reported`, asOf `"2026-09-15"`, RESUME.
    - Devin "−30% development effort · +25% developer productivity" → `self-reported`, asOf `"2026-09-15"`, context "measurement method not recorded", RESUME.
    - Godrej "12 features in 11 months · +25% monitoring effectiveness · +30% productivity · −20% turnaround" → `self-reported`, asOf `"2026-09-15"`, RESUME.
    - TeachSpark "17 joined · 8 activated (47%) · median 37.5 min saved (self-report) · 3 referrals" → `kind:"measured"`, asOf `"2026-08-24"` (REUSE projects.ts wording), context notes "self-reported time saved".
    - RailCite "5,760 documents · 14,406 chunks live; 68% of ingested PDFs needed OCR" → `kind:"measured"`, asOf `"2026-09-15"` (REUSE projects.ts wording).
    - "0 invented citations — enforced by a validator, not sampled" → `kind:"structural"`, asOf = the RailCite validator date `"2026-09-15"`, context "by construction (lib/validate.ts)".
  - Do NOT include the "MISSING — no external validation" §4.4 row as a metric; it is a note, not a number.
- **Create** `components/about/CapabilityClusters.tsx` — server component; heading "What I Bring"; renders the 4 `skills` clusters as `ClayTile`s in a 2×2 (≥md) / 4×1 (<md) or 1×4 grid (utility tier per Design §3), each tile: cluster `name` + its `items` list, keyed to the cluster's own `tone`. No naked new claims — items render verbatim from `skills.ts`.
- **Create** `components/about/Impact.tsx` — server component; heading "Impact"; builds the id→`SourceRef` map from `impactSources`, resolves each `impactMetrics` row's `source` (fail-loud if unresolved, like `CaseStudyHeader`), renders a responsive grid of `<MetricCard variant="card" />` (or `inline` if a row reads better compact — your call, but consistent). The kind badge (Measured/Structural/Self-reported) is rendered by `MetricCard` — do NOT double-print the kind in the context string.
- **Edit** `app/about/page.tsx` — mount `<CapabilityClusters />` then `<Impact />` inside `Container`, AFTER `<ProductJourney/>` and BEFORE the `id="experience"` timeline placeholder. Route MUST stay statically prerendered.

## Acceptance criteria (TKT-40 AC 2, 6; TC-095 / TC-094)
1. `CapabilityClusters` renders the 4 clusters from `skills.ts` (2×2 / stacked responsive); every item verbatim; "SAFe" appears only as a methodology label (it already does in the data), never a certification.
2. `Impact` rows exactly per §4.4 with the kinds above: AmEx/Godrej/Devin `self-reported`; TeachSpark & RailCite `measured` (reusing projects.ts figures/asOf); "0 invented citations" `structural`. Every metric has `asOf` + resolvable `source` (MetricCard would throw otherwise). No DOB/phone/address; no external number invented.
3. `/about` still statically prerendered (`pnpm build` → `/about` in static list; `assert-static` green); `pnpm prebuild` `content OK` (schema passes the new `data/impact.ts`).
4. axe clean at 390 and 1440 (EVAL-006); `expectNoOverflow` at 390/768/1024/1440 (EVAL-008).

## TDD / gates (ALL must pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. `pnpm exec vitest run` — green. If a content/schema unit test enumerates data modules, extend it for `data/impact.ts` (red → green where feasible).
3. Extend `tests/e2e/about.spec.ts` — assert the "What I Bring" + "Impact" sections render, MetricCard kind badges present, no-overflow at the 4 widths, axe clean @390/1440. Run with the project's `workers:1` (host memory-contended; retry once if OOM-killed).
4. `pnpm prebuild` — `content OK`.
5. `pnpm build` — `/about` static; `assert-static` green.
6. Regenerate `/about` screenshots at 390/768/1024/1440 into `docs/screenshots/about/`.

## Constraints
- Everything on `/Volumes/E Drive` (configured). Stage EXPLICIT paths only (your new files + `app/about/page.tsx` + `tests/e2e/about.spec.ts` + screenshots) — never `git add -A`.
- One commit, imperative subject e.g. `feat(m006): TSK-24 CapabilityClusters + Impact on /about`. Co-Authored-By trailer = your actual model.
- The self-reported résumé `asOf` (`2026-09-15`) is a defensible snapshot placeholder — FLAG it in your report for Tushar (he may want a truer résumé-as-of date). Do NOT invent facts beyond §4.3/§4.4.

## Output — `docs/reports/TSK-24.md`
Files created/edited; the full Impact metric table you shipped (value/label/context/asOf/kind/source per row) with its §4.4 trace; how you resolved sources; cluster grid behaviour; ALL gate results with counts + any OOM retries; screenshot paths; the commit SHA; anything needing Tushar's eye (the résumé asOf placeholder, at minimum) — flag, don't block.
