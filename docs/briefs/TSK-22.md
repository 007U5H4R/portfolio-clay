# Brief — TSK-22 · `data/experience.ts` + `data/skills.ts` (resume-sourced data authoring)

**Ticket:** TSK-22 (Backlog `TASK-36.1`) · parent **TKT-40** · Milestone **M-006** · Type Task · P1 · sp:2
**Branch:** `m-006-pages` (already checked out; commit on it, never on `main`)
**Model tier:** standard. **Co-Authored-By trailer:** use YOUR session's actual model, not a hardcoded one.

## Objective
Author two typed, fully-sourced content collections — professional experience and capability/skill clusters — and wire them into the build-time truth gate. **Data only. Do NOT build any React components or touch `app/about/**` (that is TSK-23/TSK-24).**

## Read first (in order)
1. `tickets.md` → **TKT-40** (lines ~832–850) and **TSK-22** (~851–855) for ACs.
2. `CONTENT_INVENTORY.md` → **§4.1 AboutHero, §4.2 ProductJourney, §4.3 CapabilityClusters, §4.5 ExperienceTimeline** (lines ~167–247). This is the ONLY source of truth for copy — every string you author must trace to it.
3. `data/schema.ts` → the `Experience`, `Outcome`, `SkillCluster`, `SourceRef`, `Tone`, `Slug` schemas (lines ~111–150). Author to these EXACTLY. Extend the schema only if a genuinely required field is missing, and only with evidence — flag it in your report if so.
4. `data/index.ts` → lines 44–48 (`collections` with `experience: []`, `skills: []` placeholders) and the `validateAll()` spec list (~88–93). You will replace the placeholders with real imports.
5. `data/knowledge.ts` → follow its authoring pattern (how it declares `sources`, `SourceRef` ids, and per-item source references).
6. `test-cases.md` → **TC-094** (lines ~1073–1083) — your data must satisfy every assertion there.
7. `decisions.md` → skim EXE-1..9 and the S/PB decisions; the M-006 defaults below are already the agreed calls.

## Scope — files
- **Create** `data/experience.ts` — export `const experience: Experience[]`.
- **Create** `data/skills.ts` — export `const skills: SkillCluster[]`.
- **Edit** `data/index.ts` — `import { experience } from "./experience"`, `import { skills } from "./skills"`, and set `collections.experience = experience`, `collections.skills = skills` (replace the `[]` placeholders on lines 47–48).
- Do **not** create `data/impact.ts` — Impact data is TSK-24's scope. Do not touch `app/**`, `components/**`.

## Acceptance criteria (from TKT-40 AC 1 + TC-094)
1. **4 roles**, ids `godrej`, `quantiphi`, `shellkode`, `amex` (matching the TimelineNode hash ids TKT-41 will use), each with `context · responsibility · scale · whatChanged · outcomes` per schema.
2. `scale` = the literal marker **`'not recorded'`** wherever CONTENT_INVENTORY §4.5 says the figure is MISSING — never invent a number.
3. Every authored string **traces to CONTENT_INVENTORY §4.1–4.5**. No paraphrase that adds unstated facts.
4. **Truth/PII guardrails:** "SAFe" may appear ONLY as a methodology mention — never "SAFe Agilist" / "SAFe certified"; "PMP" must be absent; **no DOB, phone, or home address** anywhere.
5. **Outcomes labelling** — each outcome/metric carries its evidence `kind`: employer/self-reported figures are `self-reported`; do not mark anything `measured` that the resume only asserts. (Impact-card `kind` labels — AmEx/Godrej/Devin `self-reported`, TeachSpark `measured`, RailCite corpus `measured` asOf 2026-09-15, "0 invented citations" `structural` — are TSK-24's Impact rows; you only own the Experience `outcomes` here, labelled `self-reported` unless the pack says measured.)
6. **4 skill clusters** with a `tone` each and 3–6 items, each with a `source` id (per schema).

## M-006 defaults (already decided — apply, don't re-ask)
- Employer wording: **"American Express (via IntraEdge)"** exactly as the resume states.
- Tenure wording: **"7+ years"**.
- The **2019–2022 gap note is OMITTED** (renders only after Tushar frames it — not your job).
- Positioning is **"Senior Product Manager"** (S8) — bio must NOT say "AI Product Manager".

## TDD / gate (this stack has runners — use them)
1. `pnpm typecheck` — clean.
2. `pnpm exec vitest run` — if a data/validate test exists, extend it to cover `experience`/`skills`; otherwise add a small `tests/unit/*.test.ts` asserting `validateAll()` returns no issues for the new collections and that the 4 role ids + 4 clusters are present. Red → green.
3. `pnpm prebuild` (runs `scripts/validate-content.ts` = the truth gate) — must pass with the new collections wired in.
4. Confirm no forbidden strings: grep your two new files for `PMP`, `SAFe Agilist`, `SAFe certified`, and any phone/DOB/address pattern — must be empty.

## Constraints
- Everything on `/Volumes/E Drive` (already configured). Stage with **explicit paths** (`git add data/experience.ts data/skills.ts data/index.ts` + your test) — never `git add -A` (untracked eval-run churn must not be swept in).
- One commit, imperative subject, e.g. `feat(m006): TSK-22 experience + skills data (sourced)`. End with the Co-Authored-By trailer for your actual model.
- If CONTENT_INVENTORY is ambiguous or a required figure is MISSING with no marker guidance, choose the honest option (`'not recorded'` / omit) and record the choice in your report — do not block, do not invent.

## Output — write a report to `docs/reports/TSK-22.md`
Cover: files created/edited; the 4 roles + 4 clusters authored (ids); gate results (typecheck / vitest / prebuild pass-fail with counts); how each MISSING field was handled; any schema extension (with evidence); forbidden-string/PII grep result; the commit SHA; and any decision that needs Tushar's eventual eye (flag, don't block).
