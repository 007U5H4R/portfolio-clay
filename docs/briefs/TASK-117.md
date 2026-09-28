# Brief — TASK-117 · About hero redesign

**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-task-117/` · **Branch:** `m009/task-117` (from `m-009-redesign` @ `a9cb3c4`; verify). Never push; never touch `main` or `m-009-redesign`. **Model:** Opus 5.5; trailer = your actual model. **Campfire:** `TASK-117` — ID in every commit message.

## The spec
`docs/redesign-mockups/m-009/tushar-2026-09-28/about-hero-spec.md` — Tushar's 34-section spec, verbatim; reference of record for this section (his two reference images were not available as files). Where it conflicts with Design.md, **the spec wins** — record each conflict as a Design §11 row (next free `Dev-` number on the base at merge time; others take numbers in parallel — renumber at the end), disposition "Tushar, 2026-09-28 (TASK-117)".
Scope: only the `/about` hero / intro section (under the `SceneOpener`, currently `AboutHero` + its stats card / pull-quote). The rest of `/about` stays.

## Decisions already made
- **Copy** is Tushar's own and is used exactly as the spec's §30 lists. "10+ years" is consistent with the existing "counted from 2016" data line — keep that data derivation rather than hard-coding if the current component derives it (show "10+"; if the derivation disagrees, report it rather than inventing).
- **Draft labels:** remove the visible `DraftTag`s *in this section only* (Tushar's explicit direction; supersedes D7/S18 for this section — record in §11 and `decisions.md` is the orchestrator's job, just note it in your report). Other pages' draft tags stay.
- **Polaroid image:** the orchestrator generated a text-free watercolour mountain-sunrise landscape (no people) in the site's style, 4:5 — master at `/Volumes/E Drive/Dev/.scratch/m009/task-117/polaroid-sunrise.png` (Higgsfield `gpt_image_2_5`, job `0d16b793-6b6f-47dc-a460-03e3eef3eb87`, style reference = outpaint input media `c0e1ecc2-5abd-4f52-9ec2-6d99d8b49927` (scene-about), 2.75 credits). Encode it like the other illustrations (WebP/JPEG, sensible byte cap, ~2× the rendered size), add a manifest entry + provenance README row (EVAL-021) with an accurate alt (it's meaningful per spec §26? — the spec calls the photo a "meaningful image": give it a short alt such as "Watercolour of a mountain sunrise"), `next/image`, lazy (not LCP). Do **not** spend credits yourself. If the file is missing when you start, build with a placeholder crop of an existing scene and flag it.
- **Venn sketch:** inline SVG, hand-sketched feel (spec §29).
- **Motion:** entrance only via the repo's existing approach (`lib/motion.ts` / `Reveal` / CSS); nothing continuous; reduced motion shows everything immediately.
- **Parallax:** the section participates in TKT-96/106 slide-overs; `tests/e2e/parallax-stacking.spec.ts` must stay green (a torn sheet's z-index ≥ the section above it; the band footer z 6 beats every section — TASK-115). No text may overlap during scroll at 390/1440 — verify with a mid-scroll screenshot.

## Rules
Paper tokens / `color-mix()` only (EVAL-020); EVAL-008 floors (14 px content; 12 px only with `data-micro-label` + 4.5:1); ≥ 44 px targets; EVAL-018 counts — update Design §3.3 `/about` hero row with the new decoration count and keep `tests/e2e/eval-018-parked.json` `[]`. Update existing `/about` tests (`about.spec.ts`, `about-part2.spec.ts`, unit tests) to the new structure without weakening unrelated assertions; add tests for the copy, the absence of draft labels in the hero, the stats values, reduced motion, and no overflow.
Other agents work in parallel on `/projects` (TASK-116) and the band footer (TASK-118) — don't touch those. `app/globals.css` changes in one block `/* TASK-117 … */ … /* end TASK-117 */`.
Every heavy command via `"/Volumes/E Drive/Dev/.scratch/m009/heavy.sh" <cmd>`. Logs → `/Volumes/E Drive/Dev/.scratch/m009/task-117/`. Everything on `/Volumes/E Drive`. Stage explicit paths; restore unintended `docs/screenshots/**` churn (`git restore` those paths).

## Gate
Before the final gate, merge the latest `m-009-redesign` into your branch. Then `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; e2e through the lock: `about.spec.ts`, `about-part2.spec.ts`, `parallax-stacking.spec.ts`, `torn-parallax.spec.ts`, `scene-opener.spec.ts`, `eval-006/007/008/010/018` (all 4 projects); `pnpm eval --only EVAL-021,EVAL-013 --skip-build`; bundle budget for `/about`. Screenshots of the hero at 390/768/1024/1440 → `docs/screenshots/m-009/task-117/`.

## Output
Commit; `docs/reports/TASK-117.md` (spec §34 summary list + gate numbers + Design rows + asset record). Final reply ≤ 8 lines: SHAs, gate results, open questions for Tushar.
