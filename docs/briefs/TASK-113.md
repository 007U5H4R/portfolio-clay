# Brief: TASK-113 · Contact section redesign (scrapbook last page)

**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-task-113/` · **Branch:** `m009/task-113`, cut from `m-009-redesign` @ `93c60a0`. Verify both before you start. Never push, never touch `main` or `m-009-redesign`; the orchestrator merges.
**Model:** Opus 5.5. **Co-Authored-By trailer:** your actual model.
**Campfire:** `TASK-113` (project `portfolio-clay`). Put the ticket ID in every commit message. The orchestrator moves the ticket; you don't.

## The spec
`docs/redesign-mockups/m-009/tushar-2026-09-27/contact-spec.md` holds Tushar's 30-section spec, verbatim. It is the reference of record for this section. Where it conflicts with `Design.md`, **the spec wins** (it's Tushar's newer direction). Record each conflict as a new Design.md §11 row: use the next free `Dev-` number, disposition "Tushar, 2026-09-27 (TASK-113)".
Scope is the `/contact` Contact section only: the opener copy, the actions list and the postcard under the `SceneOpener`. Keep the `SceneOpener`, the band footer, and every other page untouched.

## Decisions already made (don't re-ask)
- **Email:** render it from the single source (`site.email` / wherever `ContactDetails`/`CopyButton` read it today). Never hard-code the address. The spec writes it lowercase; the data's casing wins (email is case-insensitive).
- **Résumé:** `site.resumeAvailable` is `false` today. Show "Resume — available on request" as a `mailto:` link with a subject line, and show "Resume ↓" automatically once the flag is true. The string "Resume — updating" must not appear anywhere on `/contact`.
- **Collage art:** there is **no image-generation spend** (the Higgsfield budget is exhausted, EXE-19). Build the collage (coffee cup, envelope with airmail border, postcard, botanical sprig, sticky note, optional paw stamp) from existing paper primitives (`components/paper/*`: `Sheet`, `Tape`, `Sticky`/`Note`, `Sketch`, `Annotation`), inline SVG, CSS, or crops of existing illustrations in `content/media/illustrations/`. List any asset you think a real illustration would improve as a follow-up in your report. Don't generate one.
- **GitHub postcard row / location flag:** follow the existing S5 rule and the `site.showLocation` rule.
- **Motion:** entrance only, off under `prefers-reduced-motion`. Use the repo's existing motion approach: check `lib/motion.ts` and the existing `Reveal`. Keep first-load JS on `/contact` within the 180 kB budget (`pnpm exec tsx scripts/bundle-budget.ts --route /contact --json`).
- **Parallax:** the page takes part in the TKT-106 torn-edge slide-over. A torn sheet must have a z-index ≥ the section before it (TASK-110, `tests/e2e/parallax-stacking.spec.ts`, in flight on `m009/task-110`). Don't let your section's text paint over the next sheet, or the next sheet's over yours.

## Rules
- Paper tokens / `color-mix()` only (EVAL-020). Type floors apply (EVAL-008): 14 px content text, and 12 px is allowed only with `data-micro-label` plus 4.5:1 contrast. Tap targets must be ≥ 44 px. EVAL-018 decoration counts: update `Design.md` §3.3 for `/contact` with the new counts, and keep `tests/e2e/eval-018-parked.json` as `[]`.
- Update the existing `/contact` tests (`tests/e2e/contact.spec.ts`, unit tests) to the new structure. Don't weaken or delete any assertion that still applies: CopyButton states, mailto, LinkedIn `rel`/`target`, axe, no overflow. Add tests for the new copy and the résumé state.
- Every memory-heavy command (typecheck, build, full vitest, e2e, eval, `next start`) goes through `"/Volumes/E Drive/Dev/.scratch/m009/heavy.sh" <cmd>`. That is a machine-wide lock; other agents share port 3000. Put logs in `/Volumes/E Drive/Dev/.scratch/m009/task-113/`. Everything stays on `/Volumes/E Drive`.
- Stage explicit paths only. Restore any `docs/screenshots/**` churn you didn't intend to produce.

## Gate (all must pass before you report)
`pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` (all routes static), then through the lock:
- `pnpm test:e2e tests/e2e/contact.spec.ts tests/e2e/eval-006.spec.ts tests/e2e/eval-007.spec.ts tests/e2e/eval-008.spec.ts tests/e2e/eval-010.spec.ts tests/e2e/eval-011.spec.ts tests/e2e/eval-018.spec.ts tests/e2e/torn-parallax.spec.ts` across all 4 projects;
- the bundle budget for `/contact`.

Take screenshots of `/contact` at 390, 768, 1024 and 1440, plus one at 1440 with the copy button in its "Copied ✓" state. Save them to `docs/screenshots/m-009/task-113/` and commit them.

## Output
Commit the work and write `docs/reports/TASK-113.md` covering the spec's §30 summary list (files changed, component structure, copy-button behavior, contact link behavior, desktop layout, mobile layout, motion, accessibility, compromises), plus the gate numbers, the new Design §11 rows and the asset follow-ups. Commit the report too.
Final chat reply: ≤ 10 lines, with the commit SHAs, the gate results and any open question for Tushar.
