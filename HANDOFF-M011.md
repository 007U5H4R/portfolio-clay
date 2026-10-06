# HANDOFF — M-011 "Tushar Paper World" (layered parallax paper system)

Created 2026-10-06 ~15:00 IST. Repo `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign`, branch `m-009-redesign` (the integration/preview branch). Campfire milestone **m-10**, kickoff ticket **TASK-151**. **Production FROZEN** — preview only; never touch `main`, never deploy production. **Fully delegated (S33):** take every decision, stage sign-off and style gate on Tushar's behalf; record each as an `EXE-` decision in `decisions.md` with evidence; keep going without asking. **Agents: Sonnet for builds, Opus for reviews/gates; never Fable.**

## 0. What Tushar asked for
Source spec (verbatim): **`docs/specs/m-011/paper-world.md`** — read it by section, never all at once in a brief. His decisions: **S31** full system (materials §02, upper-left light §03, depth/elevation §04–05, mouse+scroll+gyro parallax via one shared `PaperParallaxScene` §06–07 §25–30, paper cards/buttons/icons/cursor §08–11, origami illustration §12–13, transitions + paper waves §14–15, typography + annotations §16–18, project cards with internal parallax §19–20, notebook About §21, paper timeline §22, skills as paper tags §23, contact scene with a fully visible origami sailboat §24, layered asset standard + naming §31–32, consistency/drift rules §33–34); **S32** the empty Portfolio/Certifications frames become origami miniatures (real covers/badges stay in page content); **S33** fully delegated; **S34** lands on preview BEFORE the single production release (M-010 + M-011 ship together).
His complaint that started it: the current scenes are single flat paper-cut images, and Portfolio/Certifications show blank frames.

## 1. Run the Full-tier build chain (read `~/.claude/workflow/build-workflow.md` first)
Plan from the prompt like M-010 did (TP15): keep stages lean, but don't skip them.
1. **Discovery + Solution PRD addendum** (`Solution-PRD.md` new §14 "M-011 Paper World"): what changes vs the current system, the conflicts below and how each is resolved, success criteria, non-goals. Self-sign-off as an EXE decision (S33).
2. **Evaluation design** (`evaluation-plan.md` new §10, `evals/eval-cases.json`): new rows for parallax correctness (transform-only, reduced-motion still frame, gyro permission only after a gesture §28, no scroll-jacking §30), layered-asset integrity (every scene's layers exist per theme, transparent where required, ≤ size budgets, lazy-loaded §26), lighting/material consistency (manual style gate), performance (EVAL-005 180 kB home first-load stays binding; no continuous filter animation — see the TASK-143 scar below). Nothing lowered (EV2).
3. **Design.md §14 "Paper World tokens"**: material palette mapped onto (or succeeding) the 13 role tokens (D13) with AA computed in light AND dark; one light direction; depth levels 0–6 + elevations PAPER-0…5 (shadow offsets cast bottom-right, parallax factors 0, .05, .12, .22, .40, .60); motion springs; asset naming §32. Reconcile with what exists: T4's 6-rung `--depth-0…5` scale on `--shadow-ink` (Dev-170…184) → extend/rename, don't duplicate; T2 theme system + `data-theme` (S25) stays.
4. **Breakdown + technical plan** → Campfire tracks under m-10 (suggested): **P0 tokens + PaperParallaxScene primitive** (mouse/scroll/gyro/RM, spring, cleanup, lazy layers) → **P1 layered pilot scene + style gate** (Home hero; riskiest assumption = can Higgsfield produce clean separable transparent layers that recombine into one coherent scene?) → **P2 scenes rollout** (all tabs, light+dark, origami miniatures in Portfolio/Certifications S32) → **P3 paper cards + buttons + icons** → **P4 About notebook + paper timeline + skills tags** → **P5 cursor (cardboard, replacing or evolving T2b's Paper Trail — decide)** → **P6 contact scene** (footer ocean + origami sailboat fully visible; coordinate with TASK-150) → integration gate. Turn each track's section list into subtasks at kickoff (as M-010 did).
5. Execute track by track with lane agents in their own worktrees off `m-009-redesign`; style gate per track (EXE); full gate on a quiet machine before each push to preview.

## 2. Known conflicts to resolve in the PRD (decide + record)
- **Palette** (§02 hexes) vs the 13 approved role tokens (EVAL-020) and their AA pairs in both themes (tokens:check 55/55 now). Dark mode must get paper-world equivalents (never pure black).
- **Cursor** §11 (one cardboard cursor) vs the shipped T2b Paper Trail (cursor.md, EVAL-028).
- **Typography** §16: current Fraunces + Inter + Caveat already fit (editorial serif / neutral sans / handwritten accent) — likely keep; record.
- **Annotations** §18 ("DRAFT", "SHIPPED"…) vs the existing DraftTag system that marks copy pending Tushar's sign-off — don't confuse the two.
- **Parallax with mouse** vs the existing Lenis smooth scroll, T4 divider parallax and T3 SceneBanner; one motion system, not three.
- **Gyroscope** §28: iOS needs a permission request after a user gesture; never on load.

## 3. Sequencing with work already in flight (check before touching shared files)
- **TASK-143** (Gummy Lab `/lab`) is being fixed by another session (Orca tab "TASK-143 Gummy Lab canvas and ESC bugs"; `HANDOFF.md` §1). Its bug A is T4's footer ocean starving the lab's WebGL boot — the fix will touch the footer/ocean.
- **TASK-150** (footer sailboat clipped) is in progress in another session with uncommitted `app/globals.css` `.band-ocean` edits in this worktree.
- So: do Stages 1–4 (docs) and the P1 pilot asset generation now (no shared code); start code tracks that touch the footer, header or global CSS only after TASK-143 and TASK-150 are committed. Work in your own worktrees; never commit other sessions' uncommitted files.

## 4. Assets
Higgsfield (ToolSearch the `mcp__claude_ai_Higgsfield__*` tools): `gpt_image_2_5`, medium, 2k; balance ≈ 557 cr. Layered scenes: generate each layer as its own job on a flat background, then `remove_background` for transparency; or generate a full scene and separate — the pilot decides which works. Budget: pilot ≤ 25 cr; rollout estimate 8 tabs × 4–6 layers × 2 themes ≈ 70–130 cr — show the estimate in the plan. One job at a time (burst 429 otherwise); ≤ 5 min per wait, then fall back. Character likeness: `Portfolio-illustration/illustrations/character-sheet/character-ref-LOCKED.png`. Existing paper-cut originals + prompts: `Portfolio-illustration/illustrations/paper-cut/` (PLAN.md). Cloud sessions cannot download Higgsfield output — make raster art locally.

## 5. Machine rules (scars — read `HANDOFF.md` §3 too)
8 GB RAM: every `next build`, Playwright run, full `pnpm test` and `pnpm typecheck` goes through `/Volumes/E Drive/Dev/.scratch/heavy-gate.sh <label> zsh -c '<cmd>'`. Playwright via `.env.tooling` (`pnpm exec dotenv -e .env.tooling -- …`). Stash `docs/screenshots` churn before commits. Lane agents can hang silently — judge by commits/lock activity; briefs carry anti-hang rules. **Performance scar from TASK-143:** an infinite, 2×-viewport-wide animated background with filters (T4 footer ocean) cost ~200 s of WebGL boot under software GL — continuous animations must pause off-screen/when covered and never animate filters (§26).
Persist progress to Obsidian (`~/Documents/Documents - Tushar's Macbook/Obsidian Vault/Portfolio-illustration/Progress.md`) and memory at each track end.

---

## 6. State for the cloud session (written 2026-10-06 ~17:50 IST, local session wrapping up)
M-011 moves to a claude.ai cloud session to take load off the 8 GB Mac. **Production FROZEN** (preview only, never `main`). S33 delegation stands: decide, record each call as an `EXE-` decision, keep going. Agents: Sonnet builds, Opus reviews/gates, never Fable.

### 6.1 Branches (pushed)
- **`m011/p0`** — base `aa92a99` (M-011 Stage 1–6 docs). Has: pilot layer WebPs `public/media/paper-world/hero-home/` + provenance README; brief `docs/briefs/TASK-156-p0.md`; P0 code; this handoff; the art tools in `scripts/paper-world/` (`key.py` v2 magenta key with shadow-to-ink, `composite.py`, `encode.py`, `onmagenta.py`).
- **`m011/p2-art`** — base `dfd1af3` (a later `m-009-redesign` commit). Has ONLY art: `public/media/paper-world/scene-{work,certifications,experience,about,contact,thinking,playground}/` (light + dark, desktop 2400 px + `-mobile` 1280 px, §32 names `<id>-<layer>[-dark][-mobile].webp`), provenance `public/media/paper-world/README.md`, brief `docs/briefs/TASK-158-art.md`.
- **Not on any pushed branch:** `666b292` on local `m-009-redesign` = decision **EXE-48** (P2 art gate passed 14/14 after one fix round). The TASK-143 session asked that nothing be pushed to `m-009-redesign` until its release gate finishes; it will push later. Its content: first Opus gate failed 4/14 (black cast shadows from key v1, a letter-like mark on the Portfolio house, About fg cutting the man at the waist); fixed by key v2, paint-out, About bg+fg regenerated (About fg at its 2-regen cap); re-gate 14/14 PASS with notes (Portfolio miniatures sit a little flat; About legs read as "standing in tall grass"). If it is missing when you merge, re-add it verbatim from this paragraph.
- **Local only (not in git, not reachable from the cloud):** art masters, prompts, per-scene READMEs and rejected layers in `/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/illustrations/paper-world/<scene>/` (and `pilot-home/`); gate crops `/Volumes/E Drive/Dev/.scratch/m011/gate/`; contact strips `/Volumes/E Drive/Dev/.scratch/m011/<scene>-strip[-dark].png`. Cloud sessions cannot download Higgsfield output, so any new raster art must be made by a local session.

### 6.2 Per track
| Track | Ticket | State |
|---|---|---|
| Stages 1–6 + pilot | TASK-151 | **Done** (`aa92a99`; EXE-39…47; pilot gate EXE-46) |
| P0 tokens + PaperParallaxScene + paperMotion | TASK-156 | **WIP.** 156.2 `af87f2f` (`lib/paper-world/motion.ts` + `tests/unit/paper-motion.test.ts`) and 156.3 `6456c70` (`components/paper-world/{PaperParallaxScene,SceneMotion}.tsx`, `paper-world.module.css`, `content/media/illustrations/layers.ts`, `tests/unit/eval-034.test.ts`) committed by the lane agent, **not reviewed and not verified by the orchestrator**. 156.4/156.5 = `d062de0` WIP: `GyroChip.tsx`, `tests/e2e/eval-032.spec.ts`, `eval-033.spec.ts`, `paper-world-lib.ts`, the fixture on `app/dev/primitives/page.tsx` (needs `ALLOW_DEV_ROUTES=1` at build), EVAL-033 removed from `DEFERRED_SPECS` — **never run.** 156.1 (material tokens `--mat-*`, bottom-right `--depth-*`, `--par-*`, tokens-check pairs in `app/globals.css` + `scripts/tokens-check.ts`) **not started** — it was blocked on other sessions' `globals.css` edits. |
| P1 layered Home hero on the site | TASK-157 | Not started (art ready on `m011/p0`; wire `Hero.tsx` to `PaperParallaxScene id="hero-home"`, keep the polaroids from `Hero.tsx:54-75` aligned). |
| P2 scenes rollout | TASK-158 | **Art done + gated** (158.1–158.6 on `m011/p2-art`); 158.7 (wire every `SceneOpener` to layers, manifest entries, code gate) not started. |
| P3 paper cards, buttons, icons | TASK-159 | Not started (needs 156.1). |
| P4 About notebook, timeline, skills tags | TASK-160 | Not started (after P3). |
| P5 cursor | — | Folded into **TASK-152** (Done by another session, `02c03bc`); P7 checks it against spec §11 (EXE-47). |
| P6 contact scene (waves + full sailboat) | TASK-161 | Not started; TASK-150 (boat fits the strip) is Done (`33dd995`); wait for TASK-155's footer work. |
| P7 integration gate → preview | TASK-162 | Not started. |

### 6.3 Gates NOT yet run
- P0: `pnpm lint`, typecheck, the two unit files, build, EVAL-032/033 e2e, bundle delta (≤ 3 kB gz; `/` ≤ 180 kB gz), Opus code review of P0. Nothing of P0 has been executed by the orchestrator.
- `baseline-m011-p0` (evaluation-plan §10.5) not captured.
- P1/P2 running-site style gates (EVAL-038 code halves), every EVAL-035/036/037 spec, TASK-155's smoothness check, the full gate (P7).

### 6.4 Eval status (EVAL-032…038; catalogue `evals/eval-cases.json` v1.3.0, 38 cases)
| ID | Spec | Status |
|---|---|---|
| EVAL-032 parallax correctness | `tests/e2e/eval-032.spec.ts` (WIP) | written, never run; still listed in `DEFERRED_SPECS` — remove when green |
| EVAL-033 gyro permission | `tests/e2e/eval-033.spec.ts` (WIP) | written, never run; already removed from `DEFERRED_SPECS` (so `--check-specs` now expects it) |
| EVAL-034 layer integrity | `tests/unit/eval-034.test.ts` | written (156.3), result unverified; must be extended to the seven P2 scenes when 158.7 merges |
| EVAL-035 layer loading | — | deferred (P1) |
| EVAL-036 no expensive animation | — | deferred (P6) |
| EVAL-037 material/light | — | deferred (P3) |
| EVAL-038 style gates | manual + `eval-038.spec.ts` (P6) | art gates PASS: P1 pilot art (EXE-46), P2 art (EXE-48); code gates pending |

### 6.5 Exact next steps (cloud)
1. Check out `m011/p0`; merge `origin/m-009-redesign` (when the TASK-143 session has pushed it; it carries TASK-150/152/154/155 work and EXE-48). Resolve conflicts in `scripts/eval-cases.ts` / docs by keeping both sides.
2. Verify P0 as it stands: lint, typecheck, `pnpm vitest run tests/unit/paper-motion.test.ts tests/unit/eval-034.test.ts`, build with `ALLOW_DEV_ROUTES=1`, `tests/e2e/eval-032.spec.ts` + `eval-033.spec.ts`; fix to green against Design.md §14.4 (normative) and the brief `docs/briefs/TASK-156-p0.md`. Then the bundle delta. Then an Opus review of P0 → EXE decision.
3. 156.1 tokens in `globals.css` + `tokens-check.ts` pairs (values in Design.md §14.1, AA computed there) — only after `m-009-redesign` is merged in so other sessions' CSS isn't clobbered.
4. P1: wire the home hero to the layers; EVAL-035 spec; capture `baseline-m011-p0` first; running-site style gate (rest and ±max screenshots, light + dark, 1440 + 390) → EXE.
5. P2: merge `m011/p2-art`, add the seven scenes to `layers.ts`, switch `SceneOpener` to `PaperParallaxScene`, extend EVAL-034, gate → EXE.
6. P3 → P4, P6, then P7 full gate on a quiet machine and push to the preview branch only. Production stays frozen until Tushar's explicit go (S34).
Credits: Higgsfield balance 475.15 after M-011 art (pilot 15.25 + P2 67). Remaining art (P3 icons, P6 waves/boat) must be generated locally.
