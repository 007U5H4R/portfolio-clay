# TKT-89 (`TASK-84`) · Dead-code removal (S11) — report

Implementer: Claude Opus 5.5 · branch `m009/tkt-89` from `86054cc` · rule: delete only what grep proves unused (orchestrator dispatch), delete-only commit separate.

## Commits
- `f2d2dda` — **delete-only** (53 files, 0 insertions / 1311 deletions): `git revert f2d2dda` restores everything.
- `67b73d0` — docs + rename: `DESIGN_DIRECTION.md` stub, `COMPONENT_ARCHITECTURE.md` §1/§3 paper tree, `tests/e2e/primitives.spec.ts → paper-board.spec.ts` (+ 4 comment cross-refs), stale comments in `tiers.ts`/`globals.css`, one blank line in `clay.test.tsx`.

## S89.01 — proof (grep before delete)
`grep -rln "components/clay|clay/tiers|Clay[A-Z]" app components lib hooks tests scripts` at `86054cc`, excluding the clay tree itself and comment-only mentions, gave **three live consumers**:

| Consumer | Uses | Live? |
|---|---|---|
| `components/projects/DemoVideo.tsx` | `ClayButton` (play button, "View live") | yes: `CaseStudyHeader`, `PrototypeFrame`, `/dev/video` |
| `components/layout/Section.tsx` | `toneClass`, `Tone` | yes: `app/not-found.tsx`, `/dev/primitives` |
| `lib/stages.ts` | `Tone` (`stageTone`, fills schema-required `tone` in `data/thinking-framework.ts`) | yes |

So the S89.01 gate (**nothing imports the clay tree**) does **not** hold. I did not migrate these consumers because the dispatch says delete-only. Every other clay file had no importer outside the deleted set.

## Deleted (all grep-proven unused)
- `components/clay/{ClayCard,ClayFrame,ClayIcon,ClayPill,ClayTile}.tsx`; from `tiers.ts`: `Tier`, `tierClass`, `ClayProps` (their only readers were the deleted primitives)
- `components/hero/Annotation.tsx` (0 importers; `paper/index.ts` exports `paper/Annotation`) + its `.hero-highlight` rule, `@keyframes wash`, reduced-motion `.hero-highlight` override (0 class consumers since TKT-86)
- `scripts/{avatar,avatar-poses}.ts` + `media:avatar`/`media:poses` in `package.json`; `content/media/avatar/**` (read only by those scripts)
- `public/avatar/*` **except `avatar.webp`**: 10 files incl. `avatar-poster.webp`, `avatar-blur.txt` (0 references; the OG route stopped reading the poster in TKT-78)
- `scripts/codemod-tokens.ts` (0 references)
- `globals.css` `@theme`: `--radius-clay`, `--shadow-clay-hover`, `--shadow-clay-press`, `--gradient-clay-volume` (0 consumers after the `tierClass` deletion), plus their `rgba()` values (ledger TKT-69 carry, partial)
- Already gone before this ticket: `components/layout/Footer.tsx`, `components/navigation/NavPill.tsx`, `assets/fonts/Manrope-*`, aurora/glow CSS (`grep -c aurora|glow-halo` = 0 outside a history comment)

## Kept: live consumers (blocks AC1/AC2; needs a follow-up migration)
| Item | Consumers |
|---|---|
| `components/clay/ClayButton.tsx` | `DemoVideo.tsx` ×2 |
| `components/clay/tiers.ts` `Tone`/`toneClass` | `Section.tsx`, `lib/stages.ts` → `data/thinking-framework.ts` |
| `public/avatar/avatar.webp` | `app/dev/video/VideoDevBoard.tsx` (QA fixture poster ×4) |
| `--radius-clay-sm`, `--shadow-clay-rest` (clay `rgba()`) | `ClayButton`, `SkipLink.tsx`, `VideoDevBoard.tsx` |
| `--radius-utility`, `--shadow-utility` (`rgba()`) | `DemoVideo.tsx` ×3, `app/not-found.tsx` ×2 |

**Suggested follow-up (not done: needs product edits, not deletions):** replace `ClayButton` in `DemoVideo` with the paper button pattern (the `hero-btn`/rust pill used on `not-found`); move `Tone` to `data/schema.ts` or `lib/stages.ts` as a plain string union and drop `Section`'s `tone` prop (only `/dev/primitives` passes one); point `VideoDevBoard` at `/media/illustrations/hero-poster.webp`; swap the SkipLink/not-found/DemoVideo classes to `--radius-paper`/`--shadow-paper`; then delete `components/clay/`, `public/avatar/` and the four remaining clay tokens. With that done, AC1/AC2 and the full TKT-69 `rgba()` carry close.

## Deleted-test ledger (AC5)
| Deleted test | Replacement / reason |
|---|---|
| `tests/unit/ClayCard.test.tsx` (4) | behaviour removed (ClayCard deleted) |
| `tests/unit/ClayPrimitives.test.tsx` (5) + snapshot | behaviour removed (ClayTile/Frame/Icon deleted) |
| `tests/unit/clay.test.tsx`: ClayCard ×3, ClayPill ×3, ClayTile ×1 | behaviour removed. The ClayButton ×3 and common-primitives ×4 blocks **kept** (still live) |
| `tests/unit/tiers.test.ts`: tierClass ×2, glass ×1, D1 `ClayProps` ×4 | behaviour removed. "toneClass covers every tone" **kept** |
| `tests/unit/ClayButton.test.tsx` | **kept** (ClayButton live) |
| `tests/e2e/primitives.spec.ts` | renamed to `paper-board.spec.ts` unchanged (plan S89.02); same 3 tests |

## AC checklist
Gate run under `heavy.sh` on `67b73d0` (logs: `/Volumes/E Drive/Dev/.scratch/m009/tkt89/`):
- [ ] **AC1** grep clean: **partial**. The kept live consumers above still match `clay|avatar`; the rest are history comments (merge notes).
- [ ] **AC2** no `public/avatar` in the build: `ls .next/static/media | grep -ci avatar` = **0**, but `public/avatar/avatar.webp` is still copied as a static file (dev QA fixture).
- [x] **AC3** `pnpm tokens:check` → `13/13 tokens round-trip OK`; `pnpm eval --only EVAL-005,EVAL-016,EVAL-020 --skip-build` → EVAL-016 PASS, EVAL-020 PASS. EVAL-005 FAIL is marked *informational*: bundle passes, but local mobile LCP was 4068 ms under host load. TKT-92r2 owns the hero LCP, and local Lighthouse is informational only.
- [x] **AC4** `bundle-budget --json`: `/` first-load **158.6 kB gz** ≤ 180 (eval: 218.7 → 158.6 vs the stored baseline).
- [x] **AC5** deleted-test ledger above. Unit: **541 passed / 2 skipped (53 files)**, 0 failed.
- [x] **AC6** diff shape: `f2d2dda` is deletions only; `67b73d0` is docs, the rename and comment-only edits.
- typecheck exit 0 · lint exit 0 (0 problems) · build exit 0 · `pnpm audit --audit-level high` exit 0 (2 high are already on the ignore list).
- **FULL e2e:** 903 passed · 20 failed · 1021 skipped. The 20 failures (EVAL-008 deep-dive overflow ×12 on 6 slugs at 390/768; EVAL-008 sub-14 px text on `/` and `/about` ×8) **exactly match** the integration QA base run at `86054cc` (`.scratch/m009/integ/e2e-run1.log`, also 903/20; `diff` of the failure lists is empty). **0 new failures** from TKT-89.
- `tests/e2e/eval-018-parked.json` = `[]`.

## Shared-file edits
- `app/globals.css`: deletions only in the base `@theme` block (4 token lines) and the base `.hero-highlight`/`@keyframes wash`/reduced-motion blocks (TKT-89 is the only ticket allowed to delete from the base). Two comment lines reworded (radius, shadows). Nothing appended.
- `package.json`: 2 script lines removed.
- `tests/e2e/{ask-inline,eval-014,layout,paper-drawin}.spec.ts`: comment-only `primitives.spec.ts → paper-board.spec.ts`.

## Merge notes / calls made (EXE-20)
- **Not touched:** `docs/eval.md` (FANOUT-AB lists it as don't-touch; the plan's S89.02 lists it). The orchestrator should update the retired-names / EVAL-020 lines at merge.
- Residual `grep -rniE "clay|aurora|avatar|manrope"` hits outside the kept consumers are history comments: `globals.css` l.39/41 (EXE-9 hero), l.109, l.203; `Tag.tsx`, `PlaygroundGrid.tsx`, `EvidenceLinks.tsx`, `SuggestedPrompts.tsx`, `Container.tsx`, `CopyButton.tsx` (its "ClayButton is gone" comment is inaccurate), `scripts/tokens-check.ts`; `package.json` `"name": "portfolio-clay"` (not renamed: a package rename is out of scope). `data/hero.ts` has a stale `.hero-highlight` comment (data file, D7, left alone).
- `lib/og.tsx` no longer has any hit, so no allow-list comment is needed.
