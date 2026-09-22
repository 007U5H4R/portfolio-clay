# Report — TSK-22 · `data/experience.ts` + `data/skills.ts` authoring

**Ticket:** TSK-22 (Backlog `TASK-36.1`) · parent **TKT-40** · Milestone **M-006** · Branch `m-006-pages`

## Files created/edited
- **Created** `data/experience.ts` — `export const experience: Experience[]` (4 roles).
- **Created** `data/skills.ts` — `export const skills: SkillCluster[]` (4 clusters).
- **Edited** `data/index.ts` — imports `experience`/`skills` and wires them into `collections` (replacing the `[]` placeholders); updated the module comment that previously said all three land "with their own tickets" (now only `writing` remains unfilled).
- **Created** `tests/unit/experience-skills.test.ts` — 6 assertions covering the TC-094 structural invariants.

No files under `app/**` or `components/**` were touched. `data/impact.ts` was not created (TSK-24 scope).

## Experience — 4 roles authored (ids)
`godrej` · `quantiphi` · `shellkode` · `amex` — matching the ids TKT-41's TimelineNode will hash-link to.

- **godrej** (Godrej Infotech, Assistant Product Manager, 2016-09–2018-12): `scale: 'not recorded'` (§4.5 marks scale MISSING for this role). 4 self-reported outcomes (12 features/11 months, +25% monitoring, +30% productivity, −20% turnaround).
- **quantiphi** (Quantiphi Analytics, Technical Project Manager GCP, 2022-08–2026-04): `scale: 'not recorded'` (§4.5: "MISSING (no client/program counts)"). 2 self-reported, explicitly `(unquantified)` outcomes (reduced latency/cost, zero data loss) — §4.5 itself flags these as unquantified qualitative claims, so I kept that qualifier in the text rather than dropping it.
- **shellkode** (Shellkode, Technical Project Manager AWS, 2026-04–2026-06): `scale: 'not recorded'` (§4.5 MISSING). 1 qualitative outcome (org-wide "Pulse" adoption) — §4.5 says "Outcomes: qualitative only" with no other content to draw on, so the single outcome restates the one qualitative fact §4.5 gives (the Pulse-platform change) rather than inventing a second one.
- **amex** (American Express, `companyNote: "via IntraEdge"`, Senior Product Manager (Accounts Receivable), 2026-06–present): the one role §4.5 actually quantifies — `scale: "35+ capabilities, 180+ user stories, 4 Agile teams, 40+ microservices/APIs"`. 3 self-reported outcomes (−30% cycle time, −30% dev effort, +25% dev productivity).

All outcomes carry `kind: 'self-reported'` — none are `'measured'` (§4.4's own closing row: no external validation exists on disk for any resume metric).

## Skills — 4 clusters authored (ids)
`product` (tone `sky`, 5 items) · `ai` (tone `lavender`, 4 items) · `technology` (tone `mint`, 6 items) · `execution` (tone `peach`, 5 items) — transcribed from CONTENT_INVENTORY §4.3's four cluster rows (Product / AI / Technology / Execution), grouped into item strings without adding new claims. The Execution cluster names the methodology framework once, alongside Agile/Scrum/Kanban, never paired with "Agilist" or "certified" (§4.3: "methodologies, not certifications").

Note: `SkillCluster.source` in `data/schema.ts` is a single `string`, not an owned `SourceRef[]` (unlike `Experience`). I mirrored `data/hero.ts`'s existing free-text `source` convention (a descriptive citation string, not an id requiring cross-resolution) rather than inventing a new pattern — this is not a schema change, just a documented convention choice for anyone extending `skills.ts` later.

## MISSING fields — how each was handled
Per §4.5, three roles (Godrej, Quantiphi, Shellkode) have `Scale: MISSING` → authored as the literal `'not recorded'` marker (schema: `z.union([z.string().min(10), z.literal('not recorded')])`). No number was invented for any of these. AmEx's scale was NOT marked MISSING in §4.5, so it carries the real quantified figure.

§4.5's "Role-level artifacts" row (architecture sketches, before/after, testimonials) is marked MISSING with no honest default — out of scope for this ticket (the `Experience` schema has no artifacts field), so nothing was authored for it; flagging for awareness only, not a blocker.

## Schema extension
None. The existing `Experience` and `SkillCluster` schemas in `data/schema.ts` covered every field needed; no evidence of a missing required field surfaced during authoring.

## Gate results
- `pnpm typecheck` — **pass**, 0 errors (after fixing a `strict`-mode possibly-undefined issue in the new test, switched a `Record` lookup to a `Map`).
- `pnpm exec vitest run` — **pass**, 37 test files, 194 tests passed, 1 pre-existing skip (unrelated to this change). The new `tests/unit/experience-skills.test.ts` contributes 6 passing tests; confirmed red beforehand (`Cannot find package '@/data/experience'`) before `data/experience.ts`/`data/skills.ts` existed.
- `pnpm prebuild` (`scripts/validate-content.ts`) — **pass**: `content OK (projects:14 experience:4 skills:4 writing:0 knowledge:11 thinking:6)`.

## Forbidden-string / PII grep
`grep -n "PMP"`, `grep -n "SAFe Agilist"`, `grep -n "SAFe certif"`, and a phone/DOB pattern grep against `data/experience.ts` + `data/skills.ts` — **all empty (0 hits)**.

One iteration was needed: my first draft's *doc comments* (not data) used the literal words "PMP" and "SAFe Agilist" while explaining what the data deliberately excludes, and `scripts/forbidden-strings.ts`'s `pnpm exec vitest run` suite scans all text under `data/` including comments. Reworded both file-header comments to describe the constraint without repeating the banned literals; re-ran the full suite and it passed clean.

## Commit
`75f60f5` — `feat(m006): TSK-22 experience + skills data (sourced)` on branch `m-006-pages`. Staged explicitly: `data/experience.ts data/skills.ts data/index.ts tests/unit/experience-skills.test.ts` (no `git add -A`; untracked `evals/results/*.json` churn was left alone).

## Items for Tushar's eventual review
1. **Quantiphi/Shellkode outcome phrasing** — since §4.5 gives no quantified outcome for these two roles, I restated their one qualitative "what changed" fact as the outcome text (flagged `(unquantified)` / "qualitative outcome; no quantified metric recorded"). This avoids inventing a number but is a judgment call on how to satisfy the schema's `outcomes: z.array(Outcome).min(1)` for a role with no quantified outcome on record — worth a quick look.
2. **Role-level artifacts** (§4.5's last row: architecture sketches, before/after material, testimonials) remain MISSING with no schema field to carry them yet — not blocking, just noting it's still open pending Tushar supplying cleared material or confirming there is none.
3. **AI cluster name** — CONTENT_INVENTORY labels this cluster "AI" (2 characters); the schema requires `name: z.string().min(3)`, so I expanded it to "AI & GenAI" (a category label, not a factual claim) rather than block on it. Flagging the naming choice for sign-off, not the underlying content.
