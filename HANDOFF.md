# HANDOFF — Portfolio (M-009 · Illustrated editorial redesign)

Updated 2026-09-26 · **Stage 7 build complete on branch → Stage 8 (Design Critique) pending.** Written by TKT-91 (`TASK-86`, Campfire `portfolio-clay` / milestone `m-8`) on branch `m009/tkt-91`, worktree `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-tkt-91/`, from integration head `f121e25`. This is a docs-only hand-off commit — no product code changed here.

**One paragraph.** Every Phase 0/A/B/C/D build ticket (TKT-69…91, TKT-93…95) is merged into `m009/integration-ab` → `m-009-redesign`. The RC gate at `809e326` is green (full e2e 1050/0, `pnpm eval` 16 pass/2 fail-informational/4 manual) and the preview Lighthouse at `2bd4949` clears the mobile perf/LCP gate but fails desktop CLS by a hair (0.054 > 0.05, a font-swap shift of `h1#hero-h`) — that's TKT-92 round 3, not yet started. Since that RC was cut, TKT-96 (Tushar's post-RC direction: full home banner scene + paper-over-image parallax) has already been coded and merged into `integration-ab` → `m-009-redesign` (`032932e` → `536571e`), so **the RC evidence below is stale relative to the current tip** and must be re-cut once TKT-92r3/96/97/98 land. Three phase gates (hero, Phase A, Phase B) are built and evidenced but **not yet approved by Tushar** — they are taste/sign-off gates that Stage 7's delegated authority (EXE-20) does not cover. Stage 8 (Design Critique, `impeccable`) is next, but it should not open until the gates are resolved and the RC is re-cut, or it will be critiquing a branch that keeps moving under it.

---

## 1. What's built

- **Phase 0** (tokens/fonts, paper primitives, header, band footer, hero + `HeroClip`, tracer, baseline) — TKT-69…74. Hero later restyled to a full-bleed banner per Tushar's hero-gate change request (EXE-15…19): TKT-93 (banner + polaroids + postmark + mask), TKT-94 (Lenis), TKT-95 (page-scene openers pulled forward), TKT-92 (perf, rounds 1–2 done, round 3 open).
- **Phase A** (home: Featured Work, How I think, Ask notebook/panel, OG re-skin) — TKT-75…79. Whole-section `Reveal` on home was tried and reverted (Dev-38): it broke keyboard tab order and axe contrast; How I think keeps its own card reveal.
- **Phase B** (`/work`, case-study template × 11 slugs incl. What I learned/Sources, `/thinking` + essays) — TKT-80…85.
- **Phase C** (`/about`, `/playground`, `/contact`, 404) — TKT-86…88.
- **Phase D** (dead-code removal, QA sweep, hand-off prep) — TKT-89, TKT-90 (sub-tickets 90a clay/avatar cleanup, 90b bug fixes, 90c QA sweep + a11y pass + EVAL-021 checklist, 90d A11Y-1…4 fixes + `/work` bundle −42.5 kB), TKT-91 (this ticket).
- **Post-RC (2026-09-26, Tushar direction)** — TKT-96 (full home banner scene + paper-over-image parallax) coded, merged, **not yet reviewed**. TKT-97 (`CopyButton` test hardening + legacy leftovers) and TKT-98 (OG preview verification) not yet started (branch tips still at `f121e25`).
- **Known-open defect carried from RC:** TKT-92 round 3 — desktop `/` CLS 0.054 (gate 0.05), a font-swap shift of `h1#hero-h`, exposed by the TKT-92r2 banner height cap. Branch `m009/tkt-92r3` exists, cut from `809e326`, no commits yet.
- **QA-A** (from `docs/reports/TKT-90-90c.md`): `/playground` card hover still lifts 3 px under reduced motion — a one-line CSS fix in the TKT-88 `globals.css` block, not yet applied. Confirm it landed before Stage 8 closes.

## 2. Branch / worktree map

| Branch | Worktree | Tip | State |
|---|---|---|---|
| `m-009-redesign` (main line for this milestone) | `Portfolio-clay-redesign` | `536571e` | integration-ab merged through TKT-96 |
| `m009/integration-ab` | `Portfolio-m009-integration` | `032932e` | RC (`809e326`) + TKT-96 merged |
| `m009/tkt-91` (this hand-off) | `Portfolio-m009-tkt-91` | `f121e25` + this commit | docs-only |
| `m009/tkt-92r2` (perf round 2, merged) | `Portfolio-m009-tkt-92r2` | `cec8f96` | merged into integration-ab |
| `m009/tkt-92r3` (perf round 3, open) | `Portfolio-m009-tkt-92r3` | `809e326` | cut, not started |
| `m009/tkt-96` (home banner scene, coded) | `Portfolio-m009-tkt-96` | `2f2c6d2` | merged into integration-ab/`m-009-redesign`, **not reviewed** |
| `m009/tkt-97` (CopyButton hardening, open) | `Portfolio-m009-tkt-97` | `f121e25` | cut, not started |
| `m009/tkt-98` (OG verification, open) | `Portfolio-m009-tkt-98` | `f121e25` | cut, not started |

Every Phase 0–D per-ticket worktree (TKT-75…90d) still exists under `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-tkt-*/` and is merged; they are dead weight now except as history. **Nothing here has been pushed to `origin`, merged to `main`, deployed, or spent money.** Repo: `github.com/007U5H4R/portfolio-clay` (public).

## 3. RC evidence (from `evals/results/m009-rc-809e326.json` + `docs/reports/TKT-92.md` round 2 + `evals/results/lighthouse-m009-tracer/preview-2bd4949/medians.txt`) — **stale as of TKT-96, re-cut before Stage 8 signs off**

- **Full e2e (production server, 1 worker):** 1050 passed / 0 failed, 15.0 min.
- **`pnpm eval --label m009-rc-809e326`:** 16 pass / 2 fail (both informational — local SwiftShader Lighthouse, EVAL-004/005; the bundle half of EVAL-005 passes) / 0 skip / 4 manual (EVAL-001, 003, 009, 022 — human/inspector review).
- **Preview `2bd4949`, Lighthouse median of 3:**
  - mobile `/`: perf **95**, LCP **2338 ms** (gate ≤ 2500), CLS max 0.032 — **pass**.
  - mobile `/work/teachspark`: perf 98, LCP 2274 ms, CLS max 0.000 — pass.
  - desktop `/`: perf 100, LCP 414 ms, **CLS max 0.054 (gate ≤ 0.05) — fail**, font-swap shift of `h1#hero-h`. → TKT-92 round 3.
  - desktop `/work/teachspark`: perf 100, LCP 470 ms, CLS 0.001 — pass.
- **Bundle (first-load JS, gz, budget 180 kB):** `/` **158.5 kB**, `/work` **160.7 kB** (was 203.2 before TKT-90d's CSS-crossfade rewrite of `WorkIndex`).
- **Tokens:** 13/13. **Typecheck/lint/build:** all green, 13 static routes.

<!-- ORCH: fill — the final RC sha (re-cut after TKT-92r3/96/97/98 land) and the eval-run label/file it produces -->
<!-- ORCH: fill — the preview record-run file name and its mobile/desktop perf+LCP+CLS numbers, once re-measured on the post-TKT-96 preview -->

## 4. What Stage 8 (Design Critique, `impeccable`) must open

- `docs/screenshots/m-009/**` — the full mockup-vs-route pack: `home/`, `phase-b/<route>/{390,1440}.png` (+ `deep-{390,1440}.png` for the 6 rich slugs), `pairs/` (`home-{1440,390}.png`, `case-study-{teachspark,tegaki}-{1440,390}.png`), `tkt-90b/work-tabs-390.png`, `not-found/390.png`.
- `docs/a11y-pass.md` — the M-009 reading-order pass (supersedes the M-007 clay-era file). A11Y-1…4 are marked fixed (TKT-90d, `42ae120`) — verify on the real VoiceOver pass (this file is a Playwright ARIA-snapshot proxy, not a VO session). **A11Y-5 is an open content call for Tushar** (see §5).
- `evals/results/eval-021-ff806f5.md` — the per-asset manual checklist. 5 assets are clean, **5 carry a Stage-8 ⚠ with a recommended ✓** (hero slogan text is not a claim; `scene-work`'s growth doodle has no numbers; `scene-playground`'s tablet shows a sketch, not a product UI); the one real visual check is that the `hero-banner` corkboard's garbled pseudo-text stays covered by the polaroids at every width (390/768/1024/1440).
- Merge notes with Stage-8 items, from `docs/reports/`:
  - `TKT-85.md` findings 1–14 (mockup-vs-route deltas: no viewport meta on mockups, same opener scene reused across case studies, ChapterNav stale-marker repro needed, thin-slug (tegaki) sparseness judgment, metric-strip qualifier sizing, `/work` filter row at 390).
  - `INTEGRATION-ABC.md` §4 "Remaining issues" Stage-8 row: TKT-76 torn edge overlapping Featured (z-index), TSK-45 plain-paper strip, TSK-46 arrow override < 900 + postcard email wrap at 390, TKT-84 vs TSK-46 caption alignment.
- **TKT-92r2's polaroid-overhang note** (`docs/reports/TKT-92.md`, "Notes for merge / Stage 8"): the shorter ≥1024 banner (from the 5-second-test height cap) leaves the TKT-93 polaroids overhanging further — the third polaroid crosses well below the torn edge at 1440. Not fixed; TKT-93's CSS block, flagged for Stage 8.
- **A11Y-5** (info, `docs/a11y-pass.md`): `/about`'s experience lead says "open any node", but every story card is always open (Dev-11). Copy is verbatim from `data/*.ts` (D7 — never trimmed/edited without Tushar). Needs Tushar's content call: update the string or accept it as-is.

## 5. Tushar's pending decisions

1. **Hero gate** (TKT-74, EVAL-022 sub-gate) — full-bleed banner, Fraunces h1 + Caveat line, polaroids, postmark, mask; evidence in TKT-79/TKT-92r2 reports.
2. **Phase A gate** (TKT-79) — home assembly; EVAL-001 now 6/6 at both widths after TKT-92r2's height cap.
3. **Phase B gate** (TKT-85) — 11 slugs + 5 essays at 390/1440, one rich + one thin pair.
4. **TKT-96 review** — the post-RC home banner scene + paper-over-image parallax direction is coded and merged but has no implementer report yet and has not been shown to Tushar.
5. **LinkedIn Post Inspector login** — needed for TKT-98's manual OG inspector pass (EVAL-017); Tushar's credentials, not delegable.
6. **Production release** — go/no-go once Stage 8–10 close; domain, sanitised résumé, videos are M-007 hard stops that still stand.
7. **`main` merge** — not proposed yet; nothing on this milestone has touched `main`.

## 6. Hard stops (carried forward, unchanged)

13-token gate (`pnpm tokens:check` 13/13) · thresholds never lowered without a `decisions.md` entry (EV2/EV6) · no PII · decoration budget ≤ 4/section (EVAL-018, parked list must stay `[]`) · reduced-motion/touch/Save-Data → poster-only hero (EVAL-019) · all routes static (TP1) · everything on `/Volumes/E Drive` · commit attribution per the session's own reminder · **never push, merge to `main`, deploy, or spend** without asking first · stable IDs (`M-`, `TKT-`, `TSK-`, `TC-`, `EVAL-`, `TASK-`) never regenerated.

<!-- ORCH: fill — TKT-92r3 outcome (desktop CLS fix, whether the mobile LCP gate still holds after the fix) -->
<!-- ORCH: fill — TKT-96 outcome (implementer report, gate numbers, whether it changes the hero-gate evidence Tushar already has) -->
<!-- ORCH: fill — TKT-97 outcome (CopyButton hardening result, what "legacy leftovers" were found and removed) -->
<!-- ORCH: fill — TKT-98 outcome (OG inspector pass result: 7/7 families, both inspectors, screenshot paths) -->

## 7. Tooling notes

Campfire CLI: `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/dist/backlog"` from the worktree root. GateGuard asks for facts on the first Edit/Write per file and on `git checkout --`/`pkill` — state them and retry. `.env.tooling` has the E-drive Playwright/LHCI cache redirects. CI (`eval.yml`) runs only on `main` pushes/PRs — branch pushes don't trigger it.
