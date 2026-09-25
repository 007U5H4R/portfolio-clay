# HANDOFF — Portfolio (M-009 · Illustrated editorial redesign)

Updated 2026-09-25 · **Stage 7 Execution, Phase 0 — build tickets done, perf ticket TKT-92 running, hero gate NOT yet passed.** Tushar's hero-gate feedback (reference-style banner, Lenis, per-page scenes, contact outpaint) is built and accepted; the first preview failed the perf gate (EXE-17). Remaining in Phase 0: TKT-92 → push (ask Tushar) → preview eval + Lighthouse → hero gate (TKT-74 S74.05) → `EXE-n`. Nothing past Phase 0 without that EXE entry.

**Where things live.** Worktree `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/`, branch `m-009-redesign` (pushed once at `1941383` with Tushar's OK; local is ahead — **ask before every push**, repo is public). Progress ledger: `docs/ledger.md` (M-009 section — every task, model, commit, finding). Briefs `docs/briefs/<id>.md`, reports `docs/reports/<id>.md`. Preview: https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app. Campfire project `portfolio-clay`, milestone `m-8`; ID map `backlog/id-map.json`. Obsidian: `Obsidian Vault/Portfolio-illustration/Progress.md` + mirrors in `Obsidian Vault/Portfolio-clay/`.

> Start the next session by reading the global `~/.claude/CLAUDE.md`, this file, `docs/ledger.md` (M-009 section, bottom), `decisions.md` EXE-15…19, `Design.md` §11 Dev-19…24, `docs/reports/TKT-92.md` (if it exists), then continue at "NEXT".

---

## 1. Phase 0 — done (all accepted by the orchestrator after review; full e2e 820 passed / 0 failed at `eaf2523`)
| Ticket | Backlog | Result |
|---|---|---|
| TKT-69 tokens + fonts + EVAL-020 | TASK-64 | 13 paper tokens via codemod (368 rewrites), Fraunces axes accepted (no fallback), EVAL-020 PASS |
| TKT-70 paper primitives + EVAL-018 | TASK-65 | primitives + decoration contract; EVAL-018 spec with violating fixture; §3.4 placement rules enforced (fix round 1) |
| TKT-71 header | TASK-66 | one-height header, D8 five-item nav, MobileMenu sheet, progress bar; QA-010 pill overlap at 1024 fixed with a bounding-box regression test |
| TKT-72 band footer | TASK-67 | terracotta band on every route, tagline rendered once (S18); Dev-20 attribution fix |
| TKT-73 hero + clip + motion removal | TASK-68 | HeroClip (TP13) once-and-hold, EVAL-019/021 PASS, M-008 motion system deleted |
| TKT-74 local part | TASK-69 (in progress) | home order fixed, `/about` EVAL-018 hit parked for TKT-86, **baseline-m009-tracer** committed (`7bb6c2b`), Phase-0 QA 23 PASS / 0 FAIL |
| TKT-93 hero banner (EXE-15) | TASK-87 | full-bleed 21:9 outpainted banner, torn edge, centred Fraunces h1 + Caveat line, polaroids over the garbled corkboard, postmark, clip through a registered feathered mask (Δ ≤ 0.01 px) |
| TKT-95 page scene openers (EXE-18) | TASK-90 | every page opens with its scene in the banner style; contact scene outpainted 16:9 (EXE-19) |
| TKT-94 Lenis (EXE-16) | TASK-89 | Lenis 1.3.26, fine pointers only, native for touch + reduced motion; anchors/skip link/dialog handled |

Numbers at `eaf2523`: first-load JS `/` **159.9 kB** gz (≤ 180) · vitest 469 passed / 2 skipped · EVAL-018/019/020/021 PASS · build 13 routes static.
Scar rules added this session (in every brief): run the **full** e2e suite (a subset missed an 80-failure regression from TSK-34) · restart `pnpm start` after each build (Playwright reuses a live :3000) · restore churned `docs/screenshots/**`.

## 2. In flight
- **TKT-92 perf (`TASK-88`)** — implementer (Opus 5.5) dispatched with `docs/briefs/TKT-92.md`. Preview before-numbers (EXE-17, commit `1941383`): mobile `/` perf 85–86, LCP 3.8–4.0 s (hero image = LCP element); `/work/teachspark` perf 87–89, LCP 3.2–3.5 s (text `<p>`). Gate: LCP ≤ 2500 ms, perf ≥ 90 — never edited. Local Lighthouse is informational only.
- Working tree carries ~35 churned `docs/screenshots/**` PNGs from eval runs — not changes; restore them, never commit them.

## 3. NEXT
1. Review TKT-92's report (LCP breakdown, experiments, full e2e) → accept or fix round.
2. **Ask Tushar before pushing** `m-009-redesign` → wait for the Vercel check → `pnpm eval --base-url <preview> --label eval-run-preview-m009-tracer-<sha>` → `lhci autorun` mobile + desktop against `/` and `/work/teachspark` (F5) → copy LHRs to `evals/results/lighthouse-m009-tracer/`.
3. If the preview passes: TKT-74 S74.05 hero gate with Tushar — write `evals/results/gate-m009-hero.md` (EVAL-001 × {390,1440}, EVAL-009 item 6 character match, perf numbers, preview URL) and record his words as **EXE-n** in `decisions.md`. If it fails: another perf pass (fix loop max 5), never a threshold change.
4. Then Session-Clearing block → Phase A (TKT-75…79) in a fresh session.

## 4. Open items for Tushar at the gate
D8 five-item nav · Dev-20 tagline attribution "Source: Tushar Pathak" · Dev-23 polaroids decorative (alt="") · top-left polaroid bleeds off the left edge · postmark without ring text (14 px floor) · ≥ 1920 banner crops ~12 % top/bottom · 150–200 px gap between opener and legacy page titles (Phase B/C tightens) · still-open defaults: hiring-line copy DRAFT, "Bengaluru, India" flag off, AskPanel kept.

## 5. Spend
Higgsfield: 4 credits this stage (hero outpaint 2 + contact outpaint 2) — the approved budget is used up; no further spend is approved.

## 6. Guardrails (carry forward)
13-token gate · never publish PII · reduced-motion/touch/Save-Data → poster-only hero (EVAL-019) · all routes static (TP1) · decoration budget ≤ 4 per section (EVAL-018, parked list must be `[]` by TKT-90) · thresholds never lowered (EV2/EV6) · stable IDs (M-, TKT-, TSK-, TC-, EVAL-, TASK-; M-008's TASK-50…63 never reused) · everything on `/Volumes/E Drive` · commit attribution per the session reminder · ask before any push.

## 7. Tooling notes
Campfire CLI: `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/dist/backlog"` from the worktree root (`task edit TASK-n -s Done`; `--dep` **replaces** the dependency list — pass the full set). GateGuard asks for facts on the first Edit/Write per file and on `git checkout --`/`pkill` — state them and retry. Playwright/LHCI env: `.env.tooling` (E-drive caches). CI (`eval.yml`) runs only on `main` pushes and PRs (E-22) — branch pushes don't trigger it. Vercel preview builds on every push.
