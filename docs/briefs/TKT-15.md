# Implementer brief — TKT-15 · Full project dataset (14 records) (M-004)

Fresh implementer. Execute **TKT-15** (per §B M-004 ticket-level plan + the tickets.md TKT-15 acceptance criteria). Model tier: most-capable (content fidelity + no fabrication). Branch `m-004-work`. Standard guardrails: everything on `/Volumes/E Drive` (`.env.tooling` for e2e; Chromium installed — don't reinstall; the runner is `workers:1` serial — expect slow e2e); don't `git init`/switch branches or touch `main`, `backlog/`, `docs/ledger.md`, `docs/briefs/`, sibling `portfolio/`; explicit-path staging (never `git add -A`); leave re-rendered `docs/screenshots/**` + `evals/results/tkt-*.json` unstaged. Use YOUR session's Co-Authored-By trailer (check your attribution reminder — don't hardcode a model).

## Read first
- `technical-plan.md` §B M-004 → **TKT-15** (ticket-level plan) + `tickets.md` TKT-15 acceptance criteria — authoritative.
- `data/schema.ts` (the rules — every metric needs `asOf`+`source` in `sources[]`; professional entries have NO `links.live`; `repoPublic:false` unless a public github; ≤3 tags; personal vs professional `kind`). `data/projects.ts` (TeachSpark/RailCite/Velora already exist — ADD the rest, don't duplicate/rewrite those).
- `CONTENT_INVENTORY.md` (per-project copy, verbatim) + `AUDIT.md` (the verified live URLs + facts — the audit confirmed which URLs return 200 and which projects are deployed). `Design.md` §3 for the record fields the Work grid needs.

## Scope
- `data/projects.ts` — add the remaining project records so the collection holds the full **14 records** (the 11 personal builds + the professional-experience entries) at grid fidelity: slug/name/tagline/tags/filters/status/statusLabel/`kind`/gridSize/icon/role/dates/duration/links/hero. Featured trio keeps ranks 1/2/3; non-featured have no featured rank. Cubicle = "built, not launched" (not deployed — no live link) per the audit; the featured Cubicle-swap is conditional and NOT default.
- Content-truth (EVAL-013/016): every metric/claim traces to CONTENT_INVENTORY/AUDIT with a `source` + `asOf` — **do NOT fabricate** any number, uptime, or outcome; if a figure isn't sourced, omit it (render the record without it) and flag DRAFT. **EXCLUDE forbidden content**: no PMP/SAFe claims, no TeachSpark sandbox join code, no DOB/phone/address, no ROMs (forbidden-strings gate). Professional entries: no live-product links.

## Rules
- This ticket is DATA ONLY (the `/work` grid UI is TKT-16). Everything on E Drive; content-gate must pass (`validateAll`). Every step gated; if the schema can't be satisfied with sourced content for a record, STOP and report the breaker (don't invent).
- Commit: `feat(m004): TKT-15 full project dataset (14 records)` + your session's Co-Authored-By trailer. Explicit paths.

## Finish
`pnpm typecheck && lint && test && build` green (prebuild content-gate reports the new project count); `pnpm eval --only EVAL-013,EVAL-016` no regression (no forbidden strings, all sourced). Write `docs/reports/TKT-15.md` (the record list + each record's sourced status/metrics or DRAFT/omitted flags + which are personal vs professional, `git diff --stat`). Final 5-line summary: record count + kinds, content-gate result, any DRAFT/omitted-unsourced notes, forbidden-string scan clean, blockers, commit SHA.
