# Tickets — Clay Portfolio

Stage 5 (Problem Breakdown) · 2026-09-15 · 49 tickets in dependency order (blockers first), 162 sp — revised the same day after Tushar's answers to §0.5 (decisions PB1–PB5 in `decisions.md`). Consumes `Solution-PRD.md`, `Design.md`, `COMPONENT_ARCHITECTURE.md`, `SITEMAP.md`, `evaluation-plan.md`, `decisions.md`, `CONTENT_INVENTORY.md`. Companion: `milestones.md` (M-001…M-007). Consumed by Stage 6 (`technical-plan.md` atomic plans, `test-cases.md` TC-### authoring, Campfire PWA onboarding).

**Addendum 2026-09-24 — M-009 · Illustrated editorial (paper) redesign:** 23 tickets **TKT-69…91** (94 sp) in the "M-009" section below, with their own edges in Appendix D. M-008's TKT-55…68 exist only in Campfire (TASK-50…63, milestone `m-7`) and are superseded by M-009 (S11); their numbers are never reused. Consumes `Solution-PRD.md` §12, `Design.md` (2026-09-24), `evaluation-plan.md` §8, `decisions.md` S11–S21 · EV3–EV6 · D6–D12, `docs/redesign-mockups/m-009/`.

## 0. Conventions

### 0.1 IDs
- `TKT-##` and `TSK-##` are **provisional**. Stage 6 onboarding creates them via `backlog task create` and records the native ID in each ticket's **Backlog ID** field (§0.4 mapping table). After onboarding, native IDs are canonical.
- `TC-TBD` everywhere: test cases are authored in Stage 6 (`test-cases.md`) and back-filled here.
- `EVAL-###` are the stable IDs from `evaluation-plan.md` §3.

### 0.2 Field template (every ticket)
Backlog ID · Type (Bug/Feature/Enhancement/Task/Chore/Docs/Spike) · Priority (P0–P3) · Status (`Planned`) · Milestone · Effort (`sp:` 1/2/3/5/8) · Parent/related · Dependencies (hard blockers) · Description · Objective · Product requirement (citation) · Acceptance criteria (numbered, testable) · Definition of Done · Notes (technical/UX/security) · Related TC · Related EVAL · Blockers (external, esp. Tushar) · Target sequence (phase) · Owner.
Tasks (`TSK-##`) appear only where a ticket has ≥3 clearly separable pieces; they add **implementation notes** and **files likely affected** (paths per `COMPONENT_ARCHITECTURE.md` §1).

### 0.3 Base Definition of Done (referenced as "Base DoD")
```text
[ ] Functional implementation complete
[ ] Acceptance Criteria satisfied
[ ] Required tests created          [ ] Required tests pass
[ ] Required evaluation cases created (eval-cases.json rows for the ticket's EVAL IDs)
[ ] Applicable evaluation suite executed (`pnpm eval`; behaviour-changing tickets always)
[ ] Critical evaluations pass       [ ] No unacceptable regression against baseline-v1.json
[ ] Results persisted (evals/results/)   [ ] Required documentation updated (HANDOFF.md, decisions.md EXE-n if a deviation)
[ ] Required observability added (build output / eval JSON / analytics where applicable)
```
Conditional add-ons used below: **Perf** = `[ ] Performance thresholds pass (EVAL-004/005)`; **Sec** = `[ ] Required security checks pass (EVAL-016)`; **Truth** = `[ ] Every rendered claim traces to a CONTENT_INVENTORY line; MISSING items rendered as labelled placeholders or omitted`.

### 0.4 Provisional → native Backlog ID mapping (filled at Stage 6 onboarding)
| TKT | Backlog ID | TKT | Backlog ID | TKT | Backlog ID |
|---|---|---|---|---|---|
| TKT-01 | TASK-1 | TKT-19 | TASK-19 | TKT-37 | _retired — merged into TKT-54 (TSK-28 → TASK-34.4)_ |
| TKT-02 | TASK-2 | TKT-20 | TASK-20 | TKT-38 | _retired — merged into TKT-54 (TSK-29 → TASK-34.5)_ |
| TKT-03 | TASK-3 | TKT-21 | TASK-21 | TKT-39 | TASK-35 |
| TKT-04 | TASK-4 | TKT-22 | TASK-22 | TKT-40 | TASK-36 |
| TKT-05 | TASK-5 | TKT-23 | TASK-23 | TKT-41 | TASK-37 |
| TKT-06 | TASK-6 | TKT-24 | TASK-24 | TKT-42 | TASK-38 |
| TKT-07 | TASK-7 | TKT-25 | TASK-25 | TKT-43 | TASK-39 |
| TKT-08 | TASK-8 | TKT-26 | TASK-26 | TKT-44 | TASK-40 |
| TKT-09 | TASK-9 | TKT-27 | TASK-27 | TKT-45 | TASK-41 |
| TKT-10 | TASK-10 | TKT-28 | TASK-28 | TKT-46 | TASK-42 |
| TKT-11 | TASK-11 | TKT-29 | TASK-29 | TKT-47 | TASK-43 |
| TKT-12 | TASK-12 | TKT-30 | TASK-30 | TKT-48 | TASK-44 |
| TKT-13 | TASK-13 | TKT-31 | TASK-31 | TKT-49 | TASK-45 |
| TKT-14 | TASK-14 | TKT-32 | TASK-32 | TKT-50 | TASK-46 |
| TKT-15 | TASK-15 | TKT-33 | TASK-33 | TKT-51 | TASK-47 |
| TKT-16 | TASK-16 | TKT-34 | _retired — merged into TKT-54 (TSK-25 → TASK-34.1)_ | TKT-52 | TASK-48 |
| TKT-17 | TASK-17 | TKT-35 | _retired — merged into TKT-54 (TSK-26 → TASK-34.2)_ | TKT-53 | TASK-49 |
| TKT-18 | TASK-18 | TKT-36 | _retired — merged into TKT-54 (TSK-27 → TASK-34.3)_ | TKT-54 | TASK-34 |

Retired IDs are never reused (stable-ID rule); Stage 6 onboards TKT-54 with five subtasks and does not create Backlog items for TKT-34…38.

Onboarded 2026-09-15 (Stage 6.2) via `backlog task create`; machine-readable copy in `backlog/id-map.json`. Milestones: M-001 → `m-0` · M-002 → `m-1` · M-003 → `m-2` · M-004 → `m-3` · M-005 → `m-4` · M-006 → `m-5` · M-007 → `m-6`.

Sub-task mapping (native IDs are `TASK-<parent>.<k>`):

| TSK | Backlog ID | TSK | Backlog ID | TSK | Backlog ID |
|---|---|---|---|---|---|
| TSK-01 | TASK-1.1 | TSK-02 | TASK-1.2 | TSK-03 | TASK-1.3 |
| TSK-04 | TASK-1.4 | TSK-05 | TASK-1.5 | TSK-06 | TASK-1.6 |
| TSK-07 | TASK-1.7 | TSK-08 | TASK-7.1 | TSK-09 | TASK-7.2 |
| TSK-10 | TASK-7.3 | TSK-11 | TASK-7.4 | TSK-12 | TASK-7.5 |
| TSK-13 | TASK-16.1 | TSK-14 | TASK-16.2 | TSK-15 | TASK-16.3 |
| TSK-16 | TASK-19.1 | TSK-17 | TASK-19.2 | TSK-18 | TASK-19.3 |
| TSK-19 | TASK-20.1 | TSK-20 | TASK-20.2 | TSK-21 | TASK-20.3 |
| TSK-22 | TASK-36.1 | TSK-23 | TASK-36.2 | TSK-24 | TASK-36.3 |
| TSK-25 | TASK-34.1 | TSK-26 | TASK-34.2 | TSK-27 | TASK-34.3 |
| TSK-28 | TASK-34.4 | TSK-29 | TASK-34.5 | | |

**M-009 mapping (filled at Stage 6 onboarding; Backlog allocates — never hand-pick).** M-008 consumed TASK-50…63 (TKT-55…68), so M-009's native IDs will start above TASK-63; provisional IDs are `TKT-69…91` and `TSK-30…47`.

| TKT | Backlog ID | TKT | Backlog ID | TKT | Backlog ID |
|---|---|---|---|---|---|
| TKT-69 | _Stage 6_ | TKT-77 | _Stage 6_ | TKT-85 | _Stage 6_ |
| TKT-70 | _Stage 6_ | TKT-78 | _Stage 6_ | TKT-86 | _Stage 6_ |
| TKT-71 | _Stage 6_ | TKT-79 | _Stage 6_ | TKT-87 | _Stage 6_ |
| TKT-72 | _Stage 6_ | TKT-80 | _Stage 6_ | TKT-88 | _Stage 6_ |
| TKT-73 | _Stage 6_ | TKT-81 | _Stage 6_ | TKT-89 | _Stage 6_ |
| TKT-74 | _Stage 6_ | TKT-82 | _Stage 6_ | TKT-90 | _Stage 6_ |
| TKT-75 | _Stage 6_ | TKT-83 | _Stage 6_ | TKT-91 | _Stage 6_ |
| TKT-76 | _Stage 6_ | TKT-84 | _Stage 6_ | | |

Sub-tasks: TSK-30…32 → TKT-69 · TSK-33…35 → TKT-70 · TSK-36…38 → TKT-73 · TSK-39…41 → TKT-80 · TSK-42…44 → TKT-83 · TSK-45…47 → TKT-88 (native `TASK-<parent>.<k>`). Milestone M-009 → the Campfire milestone created at Stage 6 (M-008 is `m-7`).

### 0.5 Granularity & blocking-edge questions — resolved by Tushar 2026-09-15 (decisions PB1–PB5)
1. **Gate scope (PB1).** TKT-02 blocks the *visual* foundations only. TKT-03 (schema + zod gate) and TKT-07 (eval harness) depend on TKT-01, not TKT-02. TKT-04/05/06 and everything visual still wait for the gate.
2. **Thin content (PB2).** Token Toli, Pratyasa, Tegaki, dino-arcade and cinematic-portfolio are one ticket, **TKT-54** (sp:5, Task) with one task per project; TKT-34…38 are retired in the mapping table above.
3. **Ask prompts (PB3).** Approved: TKT-09 authors the 3 extra prompts from VERIFIED rows; EVAL-012 stays at 11.
4. **Video policy (PB4).** Videos are soft dependencies of every content ticket (DemoVideo's "Demo coming" state). The TeachSpark, RailCite and Velora videos (TKT-22, TKT-23, TKT-24) are **hard blockers of the deployment ticket TKT-50** (and therefore of TKT-53), not of their content tickets.
5. **Resume (PB5).** Until the sanitised PDF exists, every "Download Resume" control renders a labelled **"Resume — updating"** placeholder state (a real link to `/contact#resume`, never a dead control); the current PDF is never committed or published. Explicit acceptance criterion on TKT-01; deploy-time hard check kept on TKT-50; TKT-08 hard-blocks production (TKT-53) because EVAL-002 requires resume 200.

### 0.6 Cross-cutting rules every ticket inherits
Only what the ticket asks · match `Design.md` verbatim (tokens, tiers, motion table, deviations) · `"use client"` only on interactive leaves · every interactive element ≥44×44 with the 3px accent focus ring · reduced-motion mapping per Design.md §4 · never publish PII, PMP/SAFe, TeachSpark sandbox join code, `.env` values, anything under `Game/neogeo/` · "AI Product Manager" never used as a title (S8) · `pnpm typecheck && pnpm lint && pnpm test` green before any ticket is called done.

---

## M-001 · Tracer bullet & visual direction approved

### TKT-01 · Tracer bullet: scaffold + tokens + Header + Hero (real avatar) + one card + one transition + screenshots + baseline eval
- **Backlog ID:** TASK-1 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-001 · **Effort:** sp:8
- **Parent / related:** — (tasks TSK-01…TSK-07 below)
- **Dependencies:** none (Stage 6 `technical-plan.md` must exist before dispatch — workflow guardrail)
- **Description:** The thinnest end-to-end slice that kills the riskiest assumption: does premium claymorphism with the approved avatar and a shared-element card→case-study transition read as "Senior PM" on a real page at 390/768/1024/1440? Builds exactly: project scaffold with the Design.md `@theme` tokens, compacting Header (with MobileMenu so 390 renders), Hero with avatar cutout + eyebrow/headline/support + two CTAs + three floating tiles, one featured `ProjectCard` (TeachSpark) that transitions to a stub `/work/teachspark` whose `CaseStudyHeader` shell is the shared-element target, screenshots at four widths, and the first `pnpm eval` (minimal) run persisted as `baseline-v1.json`. Nothing else.
- **Objective:** Fix the visual direction on evidence before any further build; establish the baseline every later eval compares against.
- **Product requirement:** Solution-PRD §11 step 4 ("Ticket 1 is the brief's tracer bullet"); §5 Home hero spec; Design.md §2 (tokens), §3 Header/Hero/Featured Work/Case study header, §4 motion rows (header compaction, cursor parallax, card hover, shared element); decisions S2, S4/D5, D1, D2; evaluation-plan §5 baseline.
- **Acceptance criteria:**
  1. `pnpm dev`, `pnpm build` (static output), `pnpm typecheck`, `pnpm lint` succeed on Next 16 + TypeScript strict + Tailwind 4 + `motion` 13 + lucide-react + pnpm; zero required third-party runtime scripts.
  2. `app/globals.css` `@theme` contains every token in Design.md §2 (colour, type scale, spacing, radius, the three clay shadows, utility shadow, volume gradient); OKLCH regenerated from the authoritative hex with `culori` (D2) and the hex round-trip diff is 0.
  3. Header: 96px → 68px after 24px scroll, 12px `backdrop-blur` + 80% `bg` only in compact state; NavPill slides via layout animation; nav `Home · Work · Thinking · About` + `AskAIButton` (renders, no panel yet — disabled state with tooltip "coming in this build", never a dead control); `MobileMenu` full-screen dialog <768 with focus trap, `Esc`/backdrop close, focus return; `SkipLink` to `#main`; subtitle hides <768 (Deviation 5).
  4. Hero: 35/65 grid ≥1024, `AvatarStage` in hero-tier `ClayFrame` (sky/lavender duotone) at 480×600 / 520×650 / 360×450 / 280×350 per breakpoint; eyebrow, headline with "AI-native products" `accent` span + one-time 700ms wash, supporting line (≤44ch), CTA row ("View My Work →" → `/work` placeholder route that renders a labelled stub; resume CTA per AC 10), three `FloatingTiles` (AI Products · People · Progress, copy from CONTENT_INVENTORY §1.2) with `useSpring` parallax (stiffness 120 / damping 20) gated behind `(hover:hover) and (pointer:fine)` and `prefers-reduced-motion: no-preference`; ≤1 `Annotation`, `aria-hidden`; fixed mobile order avatar → headline → CTAs → tiles.
  5. Avatar renders from `public/avatar/avatar.webp` (transparent, ≥1600px long edge) + 2× poster, alt "Clay illustration of Tushar Pathak at a laptop"; the cutout edge shows no halo at 1440 zoom 200%.
  6. One `ProjectCard` (featured mode, card tier) for TeachSpark fed from a typed literal (schema comes in TKT-03): `ClayIcon` → name → one sentence → ≤3 `Tag` → `StatusBadge` → ghost arrow; whole card is the link; hover rise 5px/icon 1.03/arrow +4px at 200ms; wrapped in `<ViewTransition name="project-teachspark">` with icon `icon-teachspark`; clicking navigates to `/work/teachspark` stub rendering `CaseStudyHeader` shell (name, one-line problem, meta chips, `ClayFrame` media target); Firefox/Safari fall back to plain navigation with identical end state.
  7. Screenshots of `/` and `/work/teachspark` at 390/768/1024/1440 saved to `docs/screenshots/tracer/` (8 PNGs) via Playwright.
  8. `pnpm eval` (minimal runner) executes Playwright + axe at 390 & 1440 on `/` and Lighthouse CI mobile + desktop on `/` (3 runs, median), writes `evals/results/baseline-v1.json` with commit, branch, timestamp, thresholds; result: axe 0 critical/serious, no horizontal scroll at the four widths, Lighthouse numbers recorded (informational baseline — thresholds enforced from TKT-07 on).
  9. No other section, route, data file, or component beyond the list above exists in the tree.
  10. **Resume placeholder (PB5):** a single `lib/site.ts` flag `resumeAvailable` (default `false`) drives every resume control. While `false`, the hero CTA (and the MobileMenu action) render a secondary `ClayButton` labelled **"Resume — updating"** that links to `/contact#resume` with a visually-hidden note "Sanitised resume coming — email me for a copy" (a real link, so EVAL-011 passes); no `public/resume.pdf` exists in the tree or build output; the forbidden-string/PII test asserts the file is absent while the flag is `false`. When TKT-08 flips the flag to `true`, the same control renders "Download Resume ↓" → `/resume.pdf` (`download` attribute). Playwright covers both states.
- **Definition of Done:** Base DoD + Perf (recorded, not gated) + `[ ] docs/screenshots/tracer/ contains 8 files` + `[ ] baseline-v1.json committed` + `[ ] resume placeholder state screenshot included`.
- **Notes (technical / UX / security):** Server components by default; `"use client"` only on Header scroll state, MobileMenu, Parallax, ViewTransitionLink. Fonts via `next/font` (Manrope 500–800, Caveat 500–600) with `display: swap`. The current `portfolio/resume.pdf` contains DOB/phone/address and is **never copied into this repo**, git-ignored or otherwise (PB5); `.gitignore` still lists `public/resume.pdf` as a belt-and-braces guard until TKT-08 lands. Hero support line is DRAFT copy (CONTENT_INVENTORY §1.2) — render it, flag it in the gate.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001 (informational scoring), EVAL-006, EVAL-008, EVAL-010, EVAL-015 (VT fallback), baseline for EVAL-004/005
- **Blockers:** none
- **Target sequence:** Phase 1 · **Owner:** Claude (implementer subagents per task)

#### TSK-01 · Scaffold Next 16 project + token file
- **Backlog ID:** TASK-1.1 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** —
- **Objective:** Runnable, typed, linted project with the locked design tokens.
- **Acceptance criteria:** (1) `pnpm create next-app` equivalent with App Router, TS strict, Tailwind 4, `motion`, `lucide-react`; (2) `app/globals.css` `@theme` = Design.md §2 with regenerated OKLCH; (3) `app/layout.tsx` sets fonts, metadata defaults, `<main id="main">`; (4) `.gitignore` covers `public/resume.pdf`, `.env*`, `node_modules`, `.next`, Playwright artefacts; (5) pnpm store / caches on E Drive; (6) `lib/site.ts` exports `resumeAvailable: false` and the resume href/label pair (PB5).
- **Implementation notes:** Run `culori` once in a script (`scripts/tokens-check.ts`) that asserts hex→oklch→hex round trip; keep the script as the D2 guard. No dark tokens yet (S9) but keep names theme-neutral.
- **Files:** `package.json`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (empty shell), `scripts/tokens-check.ts`, `lib/site.ts`, `.gitignore`, `.npmrc`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-005 (bundle baseline)

#### TSK-02 · Avatar asset pipeline: cutout → WebP + poster
- **Backlog ID:** TASK-1.2 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** —
- **Objective:** Production avatar files from the approved source.
- **Acceptance criteria:** (1) background removed from `content/media/avatar/avatar-source.png` (1856×2304) — Recraft/Higgsfield `remove_background` or local tool; (2) `public/avatar/avatar.webp` transparent, long edge ≥1600px, ≤300 kB; `public/avatar/avatar@2x.webp`; `public/avatar/avatar-poster.webp` (opaque, on `bg`, for OG/fallback); (3) visual check: hair/beard edge clean, ≤3 supporting objects retained (laptop, plant, books); (4) provenance line appended to `content/media/avatar/candidates/README.md`.
- **Implementation notes:** Any paid tool call needs Tushar's spend approval first (S4). Keep the source PNG untouched.
- **Files:** `public/avatar/*.webp`, `content/media/avatar/candidates/README.md`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-009 (avatar likeness), EVAL-013 (alt text)

#### TSK-03 · Minimal clay primitives for the slice
- **Backlog ID:** TASK-1.3 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** TSK-01
- **Objective:** Only the primitives Header/Hero/card need — `ClayCard`, `ClayButton`, `ClayTile`, `ClayFrame`, `ClayIcon`, `Tag`, `StatusBadge` — reading tokens from `@theme`, with tier/tone props per Design.md §2 table.
- **Acceptance criteria:** (1) `tier` prop selects radius/shadow set; `flat` exposes none; (2) `interactive` adds hover/press physics (200ms ease-out; press 90ms `scale(.98)`); (3) focus ring 3px accent / 3px offset on every interactive primitive; (4) min 44×44 on `ClayButton`.
- **Implementation notes:** Keep APIs identical to what TKT-04 will extend (tone × tier × interactive × `as`). No `ClayPill` yet.
- **Files:** `components/clay/{ClayCard,ClayButton,ClayTile,ClayFrame,ClayIcon}.tsx`, `components/common/{Tag,Icon}.tsx`, `components/projects/StatusBadge.tsx`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-007

#### TSK-04 · Header + NavPill + MobileMenu + SkipLink
- **Backlog ID:** TASK-1.4 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** TSK-03
- **Acceptance criteria:** TKT-01 AC 3 in full; `useScrollY` threshold 24px; compaction 250ms ease, instant under reduced motion; MobileMenu rows 56px; `AskAIButton` + the resume action (placeholder state per TKT-01 AC 10) pinned at sheet bottom.
- **Implementation notes:** `role="dialog" aria-modal` for MobileMenu; use native `<dialog>` or a focus-trap util; `env(safe-area-inset-top)` on the sticky header.
- **Files:** `components/navigation/{Header,NavPill,MobileMenu,AskAIButton}.tsx`, `components/layout/SkipLink.tsx`, `lib/motion.ts` (reduced-motion hook only).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-007, EVAL-008, EVAL-010

#### TSK-05 · Hero + AvatarStage + FloatingTiles + Annotation
- **Backlog ID:** TASK-1.5 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-01 · **Dependencies:** TSK-02, TSK-03
- **Acceptance criteria:** TKT-01 AC 4 and 5 in full; tiles at 0.5×/1×/1.5× parallax depth, vertical offsets −24/0/+24; copy exactly per CONTENT_INVENTORY §1.2 rows (eyebrow, headline, support, tiles); tagline "Observing what others overlook." optional secondary.
- **Implementation notes:** `Parallax` client leaf wraps only the stage; the rest is server-rendered. `next/image` with blur placeholder for the avatar; the avatar is the LCP candidate — `priority`.
- **Files:** `components/hero/{Hero,AvatarStage,FloatingTiles,Annotation}.tsx`, `components/interactions/Parallax.tsx`, `app/page.tsx`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-005, EVAL-010

#### TSK-06 · One ProjectCard + ViewTransitionLink + stub `/work/teachspark`
- **Backlog ID:** TASK-1.6 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** TSK-03
- **Acceptance criteria:** TKT-01 AC 6 in full; transition 450ms `cubic-bezier(.77,0,.175,1)`; reduced motion → plain navigation; `/work` placeholder route renders "Work — coming in this build" (so the hero CTA is never dead).
- **Implementation notes:** React 19.2 `<ViewTransition>`; `ViewTransitionLink` falls back to `next/link` when `document.startViewTransition` is absent. Card data: TeachSpark row from CONTENT_INVENTORY §1.4 (name, proposition, tags AI · WhatsApp · EdTech, status "Live pilot").
- **Files:** `components/projects/ProjectCard.tsx`, `components/interactions/ViewTransitionLink.tsx`, `components/case-study/CaseStudyHeader.tsx` (shell), `app/work/page.tsx` (stub), `app/work/[slug]/page.tsx` (stub, single param).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-011, EVAL-015

#### TSK-07 · Screenshots at four widths + minimal `pnpm eval` + baseline-v1.json
- **Backlog ID:** TASK-1.7 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-01 · **Dependencies:** TSK-04, TSK-05, TSK-06
- **Acceptance criteria:** TKT-01 AC 7 and 8 in full; runner exits non-zero on axe critical/serious or horizontal overflow; JSON schema of the result file is the one TKT-07 will extend (version, commit, branch, timestamp, cases[], totals).
- **Implementation notes:** Playwright Chromium only; `@axe-core/playwright`; `@lhci/cli` with `collect.numberOfRuns=3`; Playwright temp + browsers on E Drive (CLAUDE.md scar). Script: `scripts/eval.ts` orchestrates and writes `evals/results/`.
- **Files:** `scripts/eval.ts`, `playwright.config.ts`, `lighthouserc.json`, `tests/e2e/tracer.spec.ts`, `docs/screenshots/tracer/`, `evals/results/baseline-v1.json`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-004, EVAL-005, EVAL-006, EVAL-008 (baseline)

### TKT-02 · Visual-direction review gate with Tushar
- **Backlog ID:** TASK-2 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-001 · **Effort:** sp:1
- **Parent / related:** TKT-01
- **Dependencies:** TKT-01
- **Description:** Human-in-the-loop checkpoint. Present the 8 tracer screenshots, the running dev server, and `baseline-v1.json`; walk the EVAL-001 six-item checklist at 390 and 1440 and the EVAL-009 premium rubric on the hero; confirm avatar likeness on the page (not the PNG). Capture the decision and any direction corrections.
- **Objective:** Written approval of the visual direction before any further build (Solution-PRD §11 step 4: "visual direction fixed before anything else is built").
- **Product requirement:** Solution-PRD §8 criteria 1 and 8; §9 risks 1–2; evaluation-plan EVAL-001/009 (human review); build-workflow "human-in-the-loop gate".
- **Acceptance criteria:**
  1. Tushar has seen the running page at ≥2 widths and the 8 screenshots.
  2. EVAL-001 scored (6 items × 2 widths) and EVAL-009 scored on the hero (6 items, 0–2) — recorded in `evals/results/gate-tracer.md`.
  3. Explicit written approval ("approved" / "approved with changes: …") — silence is not approval (HANDOFF guardrail).
  4. Any change requests are written back into `Design.md` (with a Deviation entry) and/or `decisions.md` (EXE-1) before TKT-04/05/06 (the visual foundations) start. TKT-03 and TKT-07 may already be running (PB1).
- **Definition of Done:** Base DoD (tests/evals N/A beyond recording) + `[ ] decisions.md EXE-1 records the outcome`.
- **Notes:** If likeness or "student vs Senior PM" fails, the fix loop is on tokens/tiers/avatar treatment inside TKT-01, not new features.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-009
- **Blockers:** Tushar's availability
- **Target sequence:** Phase 1 · **Owner:** Tushar (decision) / Claude (presentation + write-back)

---

## M-002 · Foundations & quality harness

### TKT-03 · Content schema + zod build-time gate + deliberate failing fixture + forbidden-string test
- **Backlog ID:** TASK-3 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:5
- **Parent / related:** feeds TKT-09, TKT-15, TKT-28…33, TKT-54, TKT-40, TKT-43
- **Dependencies:** TKT-01 (not TKT-02 — PB1: no visual surface, runs while the gate is pending)
- **Description:** Implement `data/schema.ts` exactly as COMPONENT_ARCHITECTURE §2 (Project, Experience, Skill cluster, Essay, KnowledgeEntry, ThinkingFramework stage, Artifact union incl. `Generic`, Metric with `value/label/context/asOf/source/kind`, SourceRef), a build step that validates every `data/*.ts` export and fails `next build` on violation, a deliberate failing fixture that proves the gate, and a forbidden-string test over data + built bundle.
- **Objective:** Make "do not invent" mechanical (EVAL-013) before any content is entered.
- **Product requirement:** Solution-PRD §5 cross-cutting ("zod-validated: unsourced claims fail the build"), §7, §8 criterion 7; COMPONENT_ARCHITECTURE §2, §5; evaluation-plan EVAL-013; decision EV1.
- **Acceptance criteria:**
  1. `data/schema.ts` exports zod schemas + inferred TS types for every entity in COMPONENT_ARCHITECTURE §2; `Metric` requires `source`, `asOf` (`YYYY-MM-DD`), `kind ∈ measured|structural|self-reported`; `Project` requires `sources.length ≥ 1`; `Project.tags.length ≤ 3`; `chapters` is a tuple of 8 with fixed ids `context|problem|discovery|bet|built|evaluation|outcome|learned`; `thinking` has exactly 8 nodes each with `source`.
  2. `scripts/validate-content.ts` runs in `prebuild` and in Vitest; a violation prints entity id + zod path and exits non-zero.
  3. `tests/fixtures/invalid-project.fixture.ts` (metric without `asOf`, project without `sources`, forbidden title string) is loaded by a Vitest case that **asserts the gate throws**; a documented one-off `pnpm build` with the fixture wired in fails — run output saved to `evals/results/content-gate-proof.txt`.
  4. Forbidden-string test scans `data/**`, `content/**`, `app/**`, and `.next/` output for: `PMP`, `SAFe Agilist`, DOB pattern, phone patterns, the TeachSpark sandbox join code (value read from a git-ignored `tests/forbidden.local.json`, never committed), `AI Product Manager` used as a title, any `.env` key names — 0 hits.
  5. `data/projects.ts` contains the TeachSpark record at card fidelity migrated from TKT-01's literal and passes the gate.
  6. `pnpm test` green; `pnpm eval` regressed with no Critical change.
- **Definition of Done:** Base DoD + Sec + Truth + `[ ] content-gate-proof.txt persisted`.
- **Notes (technical / security):** Keep schemas in one file; no runtime schema use on the client. The forbidden list must not itself contain the sandbox code in plain text — read from a local file.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-013 (primary), EVAL-016
- **Blockers:** none
- **Target sequence:** Phase 1–2 (may start the moment TKT-01 is merged) · **Owner:** Claude

### TKT-04 · Clay primitive system complete + common primitives
- **Backlog ID:** TASK-4 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:5
- **Parent / related:** extends TSK-03
- **Dependencies:** TKT-02
- **Description:** Finish `components/clay/*` to the full Design.md contract — `ClayCard` (tone × tier × interactive × `as`), `ClayButton` (primary/secondary/ghost, trailing icon), `ClayPill` (interactive filter vs static tag variants, visibly distinct), `ClayTile` (56–180px), `ClayFrame` (4:5 and 16:9 bezels), `ClayIcon` (56/40) — plus `components/common/*` (`Icon` 1.75px stroke 20/24, `Tag`, `ExternalLink`, `CopyButton` skeleton, `VisuallyHidden`, `Prose` ≤60ch flat). Enforce the tier rule structurally: a `flat` tier consumer cannot receive clay shadow/gradient tokens.
- **Objective:** One material system every later ticket composes from; the anti-toy guardrail (D1) enforced in code.
- **Product requirement:** Design.md §2 tiers table, §3 Clay primitives + Common primitives, §4 button press/card hover rows; COMPONENT_ARCHITECTURE §3; decision D1.
- **Acceptance criteria:**
  1. Every primitive listed above exists with the props in Design.md; TypeScript forbids `tier="flat"` combined with `tone` other than neutral or `interactive`.
  2. Tiers map to token sets exactly: hero (radius 32–36, rest/hover/press, volume gradient), card (28, same), utility (14, utility shadow only, no press), flat (none).
  3. `ClayPill` filter variant has hover + active (lavender fill + ink text); tag variant has no hover — Playwright asserts computed styles differ on hover.
  4. All interactive primitives: ≥44×44, 3px accent focus ring / 3px offset, press `scale(.98)` 90ms, hover lift 180ms; reduced motion removes translate, keeps opacity/colour.
  5. Glass (`backdrop-blur` 12px + 80% bg) is exported as a header-only utility, not a clay tier.
  6. A dev-only route `/dev/primitives` (excluded from sitemap and production build) renders every primitive × tier × tone for screenshot review at 390 and 1440; axe 0 critical/serious on it.
  7. Unit tests for class/token mapping; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + `[ ] /dev/primitives screenshots at 390/1440 saved to docs/screenshots/primitives/`.
- **Notes:** Tone colours never carry meaning alone (Design.md §2 error-state rule) — `StatusBadge`/errors pair icon + label. Exclude `/dev/*` via `next.config` in production.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-007, EVAL-008, EVAL-009, EVAL-010
- **Blockers:** none
- **Target sequence:** Phase 2 (parallel with TKT-03) · **Owner:** Claude

### TKT-05 · Layout system: Container · Section · SectionHeading · Reveal · motion lib · Footer shell
- **Backlog ID:** TASK-5 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:3
- **Parent / related:** —
- **Dependencies:** TKT-04
- **Description:** `Container` (1200/1320 max, gutters 24/40/64), `Section` (rhythm 72/96/128, optional accent tone — max one per section), `SectionHeading`, `Reveal` (IntersectionObserver once, 500ms `cubic-bezier(.2,.7,.2,1)`, 70ms stagger, opacity-only under reduced motion), `lib/motion.ts` shared variants + `useReducedMotion`, `ProgressBar`, and the two-tier `Footer` (Design.md §3) with actions wired to `/contact`, LinkedIn, and the resume action (reads `lib/site.ts` — placeholder state until TKT-08, PB5).
- **Objective:** Page composition infrastructure so every page ticket only writes sections.
- **Product requirement:** Design.md §2 spacing/container tokens, §3 Footer, §4 section reveal row; COMPONENT_ARCHITECTURE §1 layout/, §4 Reveal; CONTENT_INVENTORY §1.6.
- **Acceptance criteria:**
  1. Container/Section measured at 390/768/1024/1440 match Design.md values (Playwright computed-style assertions).
  2. `Reveal` fires once; under `prefers-reduced-motion: reduce` no transform is animated (EVAL-010 assertion).
  3. Footer: tier 1 headline "Still curious? Let's build what's next." + Download Resume · LinkedIn (`https://www.linkedin.com/in/pathaktushar`) · Let's Talk (`/contact`); tier 2 name + title, nav links Work · Thinking · About · Contact, "Built with curiosity." credit, 40px bottom + safe-area inset; all links resolve (crawler-ready).
  4. Footer copy sourced: email/LinkedIn from CONTENT_INVENTORY §1.6; GitHub link shown only to the profile (`https://github.com/007U5H4R`) — repo links remain data-gated (S5).
  5. `pnpm eval` regressed.
- **Definition of Done:** Base DoD.
- **Notes:** `Footer` is a server component; `Reveal`/`ProgressBar` client leaves.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-008, EVAL-010, EVAL-011
- **Blockers:** none
- **Target sequence:** Phase 2 · **Owner:** Claude

### TKT-06 · SEO: metadata builders · OG image generator (1200×630 per page family) · sitemap · robots
- **Backlog ID:** TASK-6 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:3
- **Parent / related:** consumed by every page ticket; validated in TKT-51
- **Dependencies:** TKT-02
- **Description:** `lib/seo.ts` (title/description/canonical/OG/Twitter builders with absolute HTTPS base URL from env `NEXT_PUBLIC_SITE_URL`), `app/opengraph-image.tsx` + a reusable `ImageResponse` template for the seven page families (home, work, case study dynamic, about, thinking, playground, contact) using the clay palette + Manrope + avatar poster, `app/sitemap.ts`, `app/robots.ts`, and a tag-level test.
- **Objective:** Link previews render correctly everywhere the site is shared (Solution-PRD §8 criterion 9; global CLAUDE.md link-preview rule).
- **Product requirement:** Solution-PRD §5 cross-cutting (OG/Twitter, sitemap/robots); SITEMAP.md "SEO / sharing"; COMPONENT_ARCHITECTURE §1 `opengraph-image.tsx`; evaluation-plan EVAL-017.
- **Acceptance criteria:**
  1. Every route emits `<title>`, description, canonical, `og:title/description/image/url/type`, `twitter:card=summary_large_image`, `twitter:image` — all URLs absolute HTTPS.
  2. OG images are 1200×630 PNG, generated at build for static families and per-slug for `/work/[slug]` (name + one-liner + status), ≤300 kB each, text contrast ≥4.5:1.
  3. `/sitemap.xml` lists every static route + 11 case studies + essays; `/robots.txt` allows all, points to the sitemap; `/dev/*` excluded.
  4. Vitest tag test over rendered HTML for all page families (runs in `pnpm eval` as EVAL-017 automated part).
  5. Base URL falls back to the Vercel preview URL when env is unset (so previews validate).
- **Definition of Done:** Base DoD.
- **Notes:** Human inspector validation (LinkedIn Post Inspector, opengraph.xyz) is TKT-51 — needs a public URL.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-017 (tag part), EVAL-004 (SEO score)
- **Blockers:** none
- **Target sequence:** Phase 2 · **Owner:** Claude

### TKT-07 · Test & evaluation harness: Vitest · Playwright (4 widths) · axe · Lighthouse CI · dead-control crawler · `pnpm eval`
- **Backlog ID:** TASK-7 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:8
- **Parent / related:** extends TSK-07; tasks TSK-08…TSK-12
- **Dependencies:** TKT-01, TKT-03 (not TKT-02/05 — PB1: the harness has no visual surface; it crawls whatever routes exist and grows as pages land)
- **Description:** Turn the minimal tracer runner into the single command every ticket regresses against: `pnpm eval` = Vitest (schema, providers, format, SEO tags) + Playwright at 390/768/1024/1440 (nav, no-overflow, keyboard paths, reduced-motion, VT fallback, video states, recruiter path) + axe on every route at 390 & 1440 + Lighthouse CI mobile+desktop on `/`, `/work`, `/work/teachspark`, `/about` (3-run median, thresholds enforced) + dead-control crawler + `evals/eval-cases.json` (17 EVAL rows as data) + results/provenance writer (`eval-run-<version>.json`) + baseline comparison that fails on Critical regression.
- **Objective:** Evidence-first delivery — one reproducible command, results persisted, never hand-entered.
- **Product requirement:** evaluation-plan §5 (single command, results file, baseline, regression), §3 automated cases; COMPONENT_ARCHITECTURE §5; Solution-PRD §8 criteria 2, 4, 5; decision EV2.
- **Acceptance criteria:**
  1. `pnpm eval` runs all layers and writes `evals/results/eval-run-<pkg-version>-<shortsha>.json` with version, commit, branch, timestamp, environment, per-EVAL status (PASS/FAIL/SKIP + measured values), totals, and `regressions[]` vs `baseline-v1.json`.
  2. `evals/eval-cases.json` mirrors evaluation-plan §3 (id, category, method, threshold, priority, automated:boolean).
  3. Playwright suite skeletons exist for EVAL-002, 006, 007, 008, 010, 011, 014, 015 with the currently-buildable ones passing and the rest marked `test.fixme` **per EVAL id** (never silently absent); routes not yet built are skipped with reason.
  4. Dead-control crawler: visits every route in the sitemap, enumerates visible `a[href]`, `button`, `[role=button]`, `[role=tab]`, asserts each has an href that resolves 200 (internal) / HEAD 200–399 (external, cached) or a click handler that changes DOM/URL/aria-state; reports 0 dead (EVAL-011).
  5. Lighthouse CI asserts ≥ 90/95/95/95 on the four routes mobile + desktop; JS ≤ 180 kB gz on `/` from `next build` output (EVAL-005).
  6. Exit code non-zero on any Critical EVAL failure or regression; CI-friendly (GitHub Actions workflow file included, runs on PR).
  7. README section `docs/eval.md` documents how to run, where results go, how to add a case.
- **Definition of Done:** Base DoD + `[ ] First full eval-run-*.json persisted and compared to baseline-v1.json`.
- **Notes:** Playwright browsers/temp on E Drive; Chromium only (COMPONENT_ARCHITECTURE §5); VT fallback tested by stubbing `document.startViewTransition = undefined`. Keep the crawler's external HEAD requests rate-limited and cached per run.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, 004, 005, 006, 007, 008, 010, 011, 012 (runner slot), 013, 014, 015, 016, 017 (tag part)
- **Blockers:** none
- **Target sequence:** Phase 1–2 (starts after TKT-03; finishes once TKT-05/06 exist to crawl) · **Owner:** Claude

#### TSK-08 · Vitest layer + eval-cases.json
- **Backlog ID:** TASK-7.1 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-07 · **Dependencies:** TKT-03
- **Acceptance criteria:** Vitest config (jsdom + node projects); schema tests from TKT-03 run here; `evals/eval-cases.json` authored; `format.ts` helpers tested.
- **Files:** `vitest.config.ts`, `evals/eval-cases.json`, `tests/unit/*.test.ts`, `lib/format.ts`.
- **Related EVAL:** EVAL-012 slot, EVAL-013

#### TSK-09 · Playwright project: 4 viewports, fixtures, axe, reduced-motion, VT-off contexts
- **Backlog ID:** TASK-7.2 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-07 · **Dependencies:** TSK-08
- **Acceptance criteria:** projects `w390/w768/w1024/w1440`; shared fixtures for `reducedMotion`, `noViewTransitions`; axe helper asserting 0 critical/serious; overflow helper (`scrollWidth <= clientWidth`); spec files per EVAL id.
- **Files:** `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/eval-00{2,6,7,8}.spec.ts`, `tests/e2e/eval-01{0,4,5}.spec.ts`.
- **Related EVAL:** EVAL-002, 006, 007, 008, 010, 014, 015

#### TSK-10 · Dead-control crawler (EVAL-011)
- **Backlog ID:** TASK-7.3 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-07 · **Dependencies:** TSK-09
- **Acceptance criteria:** TKT-07 AC 4; route list comes from `app/sitemap.ts` when TKT-06 has landed, else from a static `tests/e2e/routes.json` (the crawler must not wait on the visual gate — PB1); report lists every control checked; whitelist file for intentionally external targets; runs at 390 and 1440 (mobile menu controls included).
- **Files:** `tests/e2e/eval-011-dead-controls.spec.ts`, `tests/e2e/crawler.ts`, `tests/e2e/crawler-allowlist.json`.
- **Related EVAL:** EVAL-011

#### TSK-11 · Lighthouse CI + bundle budget (EVAL-004/005)
- **Backlog ID:** TASK-7.4 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-07 · **Dependencies:** TSK-08
- **Acceptance criteria:** `lighthouserc.json` with the four routes, mobile + desktop presets, `numberOfRuns: 3`, assertions ≥ 0.90/0.95/0.95/0.95; `scripts/bundle-budget.ts` reads `.next` build manifest for `/` first-load JS gz ≤ 180 kB; LCP ≤ 2.5 s, CLS < 0.05 asserted.
- **Files:** `lighthouserc.json`, `scripts/bundle-budget.ts`.
- **Related EVAL:** EVAL-004, EVAL-005

#### TSK-12 · `pnpm eval` orchestrator + results/provenance + baseline diff + CI workflow
- **Backlog ID:** TASK-7.5 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-07 · **Dependencies:** TSK-09, TSK-10, TSK-11
- **Acceptance criteria:** TKT-07 AC 1, 6, 7; `--only EVAL-012` filter flag; `--baseline <file>` flag; never overwrites an existing results file (versioned by sha).
- **Files:** `scripts/eval.ts`, `evals/results/`, `.github/workflows/eval.yml`, `docs/eval.md`.
- **Related EVAL:** all automated

### TKT-08 · Sanitised resume PDF + PII gate
- **Backlog ID:** TASK-8 · **Type:** Chore · **Priority:** P0 · **Status:** Planned · **Milestone:** M-002 · **Effort:** sp:1
- **Parent / related:** flips the site-wide resume placeholder (TKT-01 AC 10); hard-blocks TKT-53 (production — EVAL-002 needs resume 200); TKT-50 keeps the deploy-time check regardless (PB5)
- **Dependencies:** TKT-03 (forbidden-string test)
- **Description:** Tushar re-exports `resume.pdf` without DOB, phone numbers, and street address; corrects "Patent No. 044152784" → **IN 429867** (certificate wins — CONTENT_INVENTORY summary line 8); either aligns the title with "Senior Product Manager" (S8) or accepts the mismatch in writing. Claude adds a `pdftotext`-based test that fails if any PII pattern or the wrong patent number is present in `public/resume.pdf`, commits the sanitised file, removes the `.gitignore` guard, and flips `resumeAvailable` to `true` in `lib/site.ts` so every control switches from "Resume — updating" to "Download Resume ↓".
- **Objective:** The resume can be published and downloaded (recruiter path, EVAL-002) without leaking PII (EVAL-013/016).
- **Product requirement:** Solution-PRD §7 (excluded PII), §10 (dependency on Tushar), §8 criterion 2 (resume 200); CONTENT_INVENTORY §1.1, §7, §10; decision S8.
- **Acceptance criteria:**
  1. `public/resume.pdf` present, committed, ≤2 MB; `pdftotext` output contains no DOB, phone, or address pattern; contains "429867"; does not contain "044152784" labelled as patent number.
  2. Vitest case `resume-pii.test.ts` enforces AC 1 and runs in `pnpm eval` (EVAL-013 extension).
  3. Title decision recorded in `decisions.md` (EXE-n) — updated PDF or accepted mismatch.
  4. `resumeAvailable: true`; every resume control on the site links to `/resume.pdf` (`download` attribute) and returns 200; the placeholder state no longer renders anywhere (Playwright asserts both).
- **Definition of Done:** Base DoD + Sec.
- **Notes (security):** Until AC 1 is met no resume file exists in the repo or any build (PB5); TKT-50's pre-deploy check fails if a PDF is present while the PII test fails, or if `resumeAvailable` is `true` without a passing PDF.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-013, EVAL-016
- **Blockers:** **Tushar** — sanitised export + title decision
- **Target sequence:** Phase 2 (any time; hard-blocks production in Phase 7) · **Owner:** Tushar (file) / Claude (test)

---

## M-003 · Home complete

### TKT-09 · Ask knowledge data + `AnswerProvider` adapter + `LocalKnowledgeProvider` + coverage tests
- **Backlog ID:** TASK-9 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:5
- **Parent / related:** feeds TKT-10, TKT-11
- **Dependencies:** TKT-03, TKT-07
- **Description:** `data/knowledge.ts` (KnowledgeEntry[]: prompt, aliases/synonyms, answer ≤3 sentences, evidence[] ≥2 {label, href}, sources[]), `lib/ask/adapter.ts` (`AnswerProvider`, `Answer`), `lib/ask/local-provider.ts` (normalise → intent match via synonym table → score → top entry; empty when below threshold; never fabricates), `lib/ask/rag-provider.ts` stub (not wired), and Vitest coverage: every suggested prompt (11) → `kind:'answer'` with ≥2 evidence links; 5 off-topic queries → `kind:'empty'`; 0 answers containing text absent from `knowledge.ts`.
- **Objective:** Honest, deterministic "Ask my portfolio" backend behind an adapter so RAG is a later drop-in (S7).
- **Product requirement:** Solution-PRD §4 S7, §5 Ask spec, §8 criterion 6; COMPONENT_ARCHITECTURE §4 AnswerProvider contract; CONTENT_INVENTORY §9 (8 DRAFT answers) + §1.3; evaluation-plan EVAL-012.
- **Acceptance criteria:**
  1. 8 entries transcribed verbatim from CONTENT_INVENTORY §9 (answers, evidence hrefs, sources), status `draft:true` until Tushar signs off; "Ten years" replaced by "7+ years" per the §9 note.
  2. 3 additional entries authored **only** from VERIFIED rows — topics approved by Tushar (PB3): "What did you learn when an assumption failed?", "How do you evaluate an AI product?", "What is your research background?" — each with sources listed, `draft:true`; EVAL-012 threshold stays at 11.
  3. Every entry passes the zod `KnowledgeEntry` schema (evidence ≥2, sources ≥1).
  4. `LocalKnowledgeProvider.ask()` resolves in <20 ms; matching handles case, punctuation, common synonyms ("projects/products/built", "AI/GenAI/LLM", "enterprise/corporate/AmEx"); ties broken deterministically.
  5. Vitest: 11/11 answered with ≥2 evidence links; 5/5 off-topic empty ("weather in Paris", "write me a poem", "what is your salary", "phone number", "lorem ipsum"); a "no fabrication" test asserts every answer string is byte-identical to a `knowledge.ts` answer.
  6. `Answer.text` for empty state = CONTENT_INVENTORY §1.3 fallback copy; `matched[]` exposes the entry id for evidence rendering.
  7. Runs under `pnpm eval --only EVAL-012`.
- **Definition of Done:** Base DoD + Truth.
- **Notes:** No AI evals (EV1). The provider is pure and server/client agnostic; UI copy (TKT-10) must say answers come from portfolio content. Off-topic PII probes ("phone number") must return empty, never a value.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-012 (primary), EVAL-013
- **Blockers:** Tushar — sign-off on 8 + 3 answers (non-blocking; ships as `draft:true`, rendered with the "from portfolio content" note)
- **Target sequence:** Phase 3 · **Owner:** Claude

### TKT-10 · `AskPortfolio` inline field + `useAsk` + `AnswerView` + `SuggestedPrompts` + `EvidenceLinks` (five states)
- **Backlog ID:** TASK-10 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:5
- **Parent / related:** TKT-09; sibling TKT-11
- **Dependencies:** TKT-09, TKT-04, TKT-05
- **Description:** Home section: 56–64px rounded field inside a card-tier `ClayCard` (max 720px), placeholder "Ask about my work…", 5 `SuggestedPrompts` as interactive `ClayPill`s; on submit the card expands in place (layout animation spring 210/26, min 240px, tone → lavender) revealing `AnswerView` (answer ≤65ch + 2–3 `EvidenceLinks` pills + ghost "Ask another"); shared `useAsk(provider)` state machine idle → loading (≤150ms skeleton, always shown) → answer → empty (+3 fresh prompts) → error (ink on blush + alert icon + Try again). Never navigates.
- **Objective:** The brief's hard requirement: search that becomes an answer inline, honestly labelled.
- **Product requirement:** Solution-PRD §5 Home "Ask my portfolio"; Design.md §3 Ask section, §4 "Ask inline expand" row; COMPONENT_ARCHITECTURE §4 AskPortfolio states; evaluation-plan EVAL-007/012/014-style state coverage.
- **Acceptance criteria:**
  1. All five states reachable and visually distinct (Playwright drives each via a mocked provider); loading skeleton visible ≥150ms even when the provider resolves instantly.
  2. Submit via Enter, button, or prompt-pill click; URL unchanged; DOM focus moves to the answer heading (no trap); page remains scrollable.
  3. Visible microcopy: "Answers come from this portfolio's content — nothing generated." (S7) present in idle and answer states.
  4. Evidence pills link to real routes/anchors (crawler passes even before case-study anchors exist — link to route root until TKT-28+ adds anchors, then update).
  5. Reduced motion: height snaps, content fades 150ms; keyboard: Tab order field → pills → answer → evidence → Ask another; axe 0 critical/serious at 390 & 1440.
  6. Mobile: pills wrap to 2 rows; card padding/gutter per Design.md; no overflow.
- **Definition of Done:** Base DoD.
- **Notes:** `"use client"` on `AskPortfolio` only; the provider is injected via context so TKT-11 reuses `useAsk`. Error state is exercised by a provider that throws (test only).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-007, EVAL-008, EVAL-010, EVAL-011, EVAL-012
- **Blockers:** none
- **Target sequence:** Phase 3 · **Owner:** Claude

### TKT-11 · `AskPanel` global drawer (≥768) / bottom sheet (<768) + `AskAIButton` wiring
- **Backlog ID:** TASK-11 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:5
- **Parent / related:** TKT-10
- **Dependencies:** TKT-10
- **Description:** Global Ask surface mounted in `app/layout.tsx`: right drawer 400px (1024–1439) / 480px (≥1440), 16px inset, scrim dims page 20%, `role="dialog" aria-modal="true"`, header "Ask AI" + 44×44 close, body reuses `useAsk` and the same views as TKT-10 with 6 suggested prompts; <768 becomes a 90vh bottom sheet (D3, Deviation 2). Slide-in 320ms `cubic-bezier(0.32,0.72,0,1)`; instant under reduced motion, scrim still fades. Enables the header `AskAIButton` (replacing the tracer's disabled state) and the MobileMenu one.
- **Objective:** Ask is reachable from every page while the page stays visible (brief: not a chatbot widget, not a centred modal).
- **Product requirement:** Solution-PRD §5 cross-cutting (right-side panel 400–480px); Design.md §3 AskPanel, §4 slide-in row, Deviation 2; COMPONENT_ARCHITECTURE §4; decision D3; evaluation-plan EVAL-007.
- **Acceptance criteria:**
  1. Opens from header/mobile-menu buttons on every route; focus trapped; `Esc`, scrim click, close button all close and return focus to the trigger; body scroll locked while open, page content still visible behind scrim at ≥768.
  2. Widths per breakpoint measured; bottom sheet at 390 slides from bottom, input in lower half, safe-area inset respected.
  3. Keyboard-only script: open → type → Enter → read answer → activate evidence link → close (EVAL-007) passes at 390 and 1440.
  4. Same five states as TKT-10; panel is context-aware (`ctx.route` passed to provider) but v1 provider ignores it.
  5. axe 0 critical/serious with the panel open; no overflow.
  6. `pnpm eval` regressed (nav + keyboard suites).
- **Definition of Done:** Base DoD.
- **Notes:** Render the panel lazily (dynamic import on first open) to protect the home JS budget (EVAL-005). Use `inert` on the page root while open.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-005, EVAL-006, EVAL-007, EVAL-010, EVAL-011
- **Blockers:** none
- **Target sequence:** Phase 3 · **Owner:** Claude

### TKT-12 · Featured Work section (3 data-driven cards) + generalised card→case-study transition
- **Backlog ID:** TASK-12 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:3
- **Parent / related:** generalises TSK-06
- **Dependencies:** TKT-03, TKT-04, TKT-05
- **Description:** `FeaturedWork` reads `projects.filter(featured)` sorted 1–3 (TeachSpark, RailCite, Velora framed "Nuptis → Velora"), renders three card-tier `ProjectCard`s in a row ≥1024 / stacked below, each wrapped in `ViewTransition name="project-{slug}"`. Adds RailCite and Velora records at card fidelity to `data/projects.ts`. Cubicle swap rule implemented as data (`featured` field), not code.
- **Objective:** Three proof projects visible within the recruiter's 30 seconds.
- **Product requirement:** Solution-PRD §4 S3, §5 Featured Work; Design.md §3 Featured Work; SITEMAP.md featured slugs; CONTENT_INVENTORY §1.4; decision S3.
- **Acceptance criteria:**
  1. Exactly 3 cards, order 1–3 from data; card anatomy per Design.md (icon, name, one sentence ≤2 lines, ≤3 tags, StatusBadge, ghost arrow); whole card clickable; equal heights ≥1024.
  2. Copy verbatim from CONTENT_INVENTORY §1.4 (propositions, tags, statuses); Velora card title "Nuptis → Velora"; TeachSpark status badge text carries the "uptime unverified" caveat until TKT-22 re-verifies.
  3. Hover/press/focus states per Design.md §4; reduced motion removes the rise.
  4. Click → `/work/{slug}` with shared-element transition (or plain navigation fallback); RailCite/Velora resolve to the stub route until TKT-19.
  5. Schema gate passes for the two new records (sources present); `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Truth.
- **Notes:** No product images on featured cards (Design.md anatomy) — the RailCite screenshot gap does not block this ticket.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-002 (hop 1), EVAL-011, EVAL-013, EVAL-015
- **Blockers:** none
- **Target sequence:** Phase 3 · **Owner:** Claude

### TKT-13 · How I Think module (6 stages · principle · real example · link)
- **Backlog ID:** TASK-13 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:3
- **Parent / related:** —
- **Dependencies:** TKT-03, TKT-04, TKT-05
- **Description:** `data/thinking-framework.ts` (6 stages Problem · Insight · Bet · Build · Evaluate · Impact — label, one-line principle, real example quote, source, link, stage colour) and the `HowIThink` module: horizontal row of 6 utility-light `ClayTile`s connected by a thin line ≥1024, vertical stack with left line <1024; hover emphasises principle (desktop); click/Enter expands one card below the row (200ms; instant under reduced motion) with the example + "See how I tested this in {Project} →"; one open at a time; outside click/`Esc` closes.
- **Objective:** Show the operating model with evidence, not adjectives.
- **Product requirement:** Solution-PRD §5 Home "How I Think"; Design.md §3 How I Think, §4 stage expand row; COMPONENT_ARCHITECTURE §1 `thinking-framework.ts`; CONTENT_INVENTORY §1.5 (six sourced examples).
- **Acceptance criteria:**
  1. Six examples verbatim from CONTENT_INVENTORY §1.5 with their sources and target links (`/work/railcite#02-problem`, `/work/velora#03-discovery`, `/work/teachspark#04-product-bet`, `/work/railcite#05-what-i-built`, `/work/teachspark#06-evaluation`, `/work/teachspark#07-outcome`); the Insight example is attributed to the team as the row instructs.
  2. Stage colours per Design.md (Insight→butter, Build→peach, Evaluate/Impact→mint, etc.) and the same mapping exported for reuse.
  3. Keyboard: tiles are buttons with `aria-expanded`; arrow keys move between stages; `Esc` closes; focus stays on the tile.
  4. Links resolve (route root until chapter anchors exist; anchors verified by the crawler after TKT-28/29/30).
  5. No overflow at 390; axe clean; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Truth.
- **Notes:** The ≤1 accent colour per section rule: the module itself is the section's accent — no other tinted element in this section.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003 (supports mapping), EVAL-007, EVAL-011, EVAL-013
- **Blockers:** none
- **Target sequence:** Phase 3 · **Owner:** Claude

### TKT-14 · Final CTA + home assembly (fixed order) + home OG + 5-second test pack
- **Backlog ID:** TASK-14 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-003 · **Effort:** sp:3
- **Parent / related:** closes M-003
- **Dependencies:** TKT-06, TKT-10, TKT-11, TKT-12, TKT-13
- **Description:** `FinalCTA` section ("Building something AI-native? Let's talk." + email `CopyButton` + Let's Talk → `/contact` + Download Resume), assemble `app/page.tsx` in the fixed order Header · Hero · Ask · Featured Work · How I Think · Final CTA · Footer (mobile order per Design.md §3), home OG image via TKT-06 template, `Reveal` on sections, then produce the EVAL-001 review pack (screenshots at 390 & 1440, six-item checklist scored by Claude, presented to Tushar) and the EVAL-005 budget check.
- **Objective:** Home passes the 5-second test and the performance budget with every section live.
- **Product requirement:** Solution-PRD §5 Home, §8 criteria 1 and 4; Design.md §3 Footer/Contact actions reuse; CONTENT_INVENTORY §1.6; evaluation-plan EVAL-001, EVAL-005.
- **Acceptance criteria:**
  1. Section order exact at all widths; section gaps 72/96/128; ≤1 accent colour visible per section (screenshot review).
  2. `FinalCTA` copy from CONTENT_INVENTORY §1.6; `CopyButton` copies `Tushar_Pathak@outlook.com` with "Copied" toast and a visible-text fallback when the clipboard API is blocked.
  3. EVAL-001: 6/6 at 390 and 1440 scored by Claude, screenshots saved to `docs/screenshots/home/`, presented to Tushar for confirmation.
  4. EVAL-005 on `/`: first-load JS ≤ 180 kB gz, LCP ≤ 2.5 s, CLS < 0.05 (Lighthouse mobile); Lighthouse ≥ 90/95/95/95 mobile + desktop.
  5. Full `pnpm eval` green; no Critical regression vs baseline.
- **Definition of Done:** Base DoD + Perf + `[ ] EVAL-001 pack reviewed by Tushar`.
- **Notes:** If JS budget fails, the first lever is lazy-loading `AskPanel` and `motion` features, not removing sections.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-004, EVAL-005, EVAL-006, EVAL-008, EVAL-011
- **Blockers:** Tushar — EVAL-001 confirmation (can be batched with the next checkpoint)
- **Target sequence:** Phase 3 (last) · **Owner:** Claude

---

## M-004 · Work page & case-study system

### TKT-15 · Expand `data/projects.ts` to all 14 entries at card fidelity
- **Backlog ID:** TASK-15 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:3
- **Parent / related:** expand step of expand → migrate → contract (chapters land per slug in M-005)
- **Dependencies:** TKT-03, TKT-12
- **Description:** Add the remaining 8 personal builds (cubicle, nuptis, bhakti-vilas, token-toli, pratyasa, tegaki, dino-arcade, cinematic-portfolio) and the 3 professional entries (mars-ar-modernization, cloud-modernization-programs, godrej-smartnet) at card fidelity: slug, name, tagline, category, tags ≤3, filters, status, gridSize, role, dates, links (live, repoPublic false except cinematic + dino-arcade, github field populated but gated — S5), sources. Chapters/thinking/metrics stay empty arrays flagged `deepDive:false` until their content ticket.
- **Objective:** `/work` and every `/work/[slug]` route can render from data with no invented content.
- **Product requirement:** Solution-PRD §4 S3/S5, §5 Work; SITEMAP.md slugs + filter mapping; CONTENT_INVENTORY §2.2, §2.3; COMPONENT_ARCHITECTURE §2.
- **Acceptance criteria:**
  1. 14 records pass the schema gate; every field's value traces to the cited CONTENT_INVENTORY row (propositions verbatim, tags as listed, statuses as listed incl. Cubicle "Built, not launched", Nuptis/Velora "Live (mock data)", Bhakti-Vilas "Live prototype (mock data, team build)", Pratyasa/Tegaki/dino/cinematic as listed).
  2. Filters per SITEMAP.md mapping; Token Toli / Pratyasa / Bhakti-Vilas under `experiments` by default (open decision — `decisions.md` EXE-n once Tushar answers).
  3. `gridSize`: teachspark large; railcite, velora medium; rest small (featured order drives large/medium).
  4. Professional entries: `category:'professional'`, no `links.live`, no `demoVideo`, `tags` per §2.3 ("Platform" not "IoT"), sources = `RESUME`.
  5. `repoPublic:true` only for cinematic-portfolio and dino-arcade-pwa; Bhakti-Vilas/Pratyasa/Tegaki repos marked unverified → false.
  6. `generateStaticParams` yields 11 slugs; build green.
- **Definition of Done:** Base DoD + Truth.
- **Notes:** Corporate items must never imply a public product (Solution-PRD §5).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-013
- **Blockers:** Tushar — FilterTabs bucket decision (default applied, non-blocking)
- **Target sequence:** Phase 4 · **Owner:** Claude

### TKT-16 · `/work` page: WorkHero · FilterTabs (URL-synced) · EditorialGrid · ProjectCard grid mode · empty states
- **Backlog ID:** TASK-16 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:5
- **Parent / related:** tasks TSK-13…TSK-15
- **Dependencies:** TKT-15, TKT-04, TKT-05, TKT-06
- **Description:** Replace the stub `/work` with the full page: flat `WorkHero` (h1 + lead from CONTENT_INVENTORY §2.1), `FilterTabs` (All · AI · Enterprise · Cloud · Experiments; `?filter=` URL sync; layout-animated indicator spring 260/28; horizontal scroll with 16–24px peek <768 — Deviation 3), `EditorialGrid` (12-col: card[0] 8×2, card[1–2] 4×1 rail, rest 4×1 3-up; 768–1023 large full + 2-up; <768 single column with large media 4:3), `ProjectCard` grid mode with `DemoVideo` slot (TKT-18) and `AnimatePresence` filter transitions (fade-out 150 / fade-in 200; opacity-only under reduced motion), per-filter empty state (never possible with current data, but rendered when a filter yields 0), work OG image.
- **Objective:** Every project browsable with editorial hierarchy — never nine identical rectangles.
- **Product requirement:** Solution-PRD §5 Work; Design.md §3 Work page, §4 filter change row, Deviation 3; COMPONENT_ARCHITECTURE §4 FilterTabs→EditorialGrid; SITEMAP.md filter mapping.
- **Acceptance criteria:**
  1. Grid spans measured at 1440/1024/768/390 match Design.md; only personal projects in the grid; professional entries are not cards here (TKT-17).
  2. Filter click updates `?filter=`, back/forward restores state, deep link `/work?filter=ai` renders filtered on first paint (server-read search param), `role="tablist"`/`tab`/`aria-selected` semantics, arrow-key navigation.
  3. Each filter yields exactly the SITEMAP.md set (Playwright asserts card slugs per filter).
  4. <768: tab row scrolls horizontally with a visible peek, no page-level horizontal overflow.
  5. Empty state component renders with honest copy + "Show all" when a filter yields 0 (tested by injecting an empty dataset).
  6. Hover/press/focus per Design.md; cards keep the `ViewTransition` wrapper.
  7. axe clean at 390 & 1440; Lighthouse `/work` ≥ 90/95/95/95; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Perf.
- **Notes:** `"use client"` on FilterTabs + grid wrapper only; cards themselves stay server-renderable (pass data down).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002 (hop 2), EVAL-004, EVAL-007, EVAL-008, EVAL-010, EVAL-011
- **Blockers:** none
- **Target sequence:** Phase 4 · **Owner:** Claude

#### TSK-13 · FilterTabs + URL sync + keyboard semantics
- **Backlog ID:** TASK-16.1 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-16 · **Dependencies:** TKT-04
- **Acceptance criteria:** TKT-16 AC 2, 4; indicator animation per Design.md; reduced-motion crossfade.
- **Files:** `components/projects/FilterTabs.tsx`, `app/work/page.tsx` (searchParams), `lib/filters.ts`.
- **Related EVAL:** EVAL-007, EVAL-008, EVAL-010

#### TSK-14 · EditorialGrid sizing + AnimatePresence + empty state
- **Backlog ID:** TASK-16.2 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-16 · **Dependencies:** TSK-13, TKT-15
- **Acceptance criteria:** TKT-16 AC 1, 3, 5, 6.
- **Files:** `components/projects/{EditorialGrid,ProjectCard}.tsx` (grid mode), `components/projects/EmptyState.tsx`.
- **Related EVAL:** EVAL-008, EVAL-011

#### TSK-15 · WorkHero + page assembly + OG + Playwright suite
- **Backlog ID:** TASK-16.3 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-16 · **Dependencies:** TSK-14, TKT-06
- **Acceptance criteria:** TKT-16 AC 7; `tests/e2e/work.spec.ts` covers per-filter slug sets and deep links.
- **Files:** `components/projects/WorkHero.tsx`, `app/work/page.tsx`, `app/work/opengraph-image.tsx`, `tests/e2e/work.spec.ts`.
- **Related EVAL:** EVAL-004, EVAL-017

### TKT-17 · `ExperienceStrip` — professional experience, flat, inline expand, no product affordance
- **Backlog ID:** TASK-17 · **Type:** Feature · **Priority:** P2 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:2
- **Parent / related:** TKT-16
- **Dependencies:** TKT-16
- **Description:** Below the personal grid: a flat, bordered strip labelled "Professional experience — corporate work, not a public product." with one flat row per professional entry (title, company, dates, tags), inline expand-on-click for the one-paragraph summary, and a "See my experience →" link to `/about#experience`. No arrow, no live link, no image (CONTENT_INVENTORY §2.3: nothing may be published without employer clearance).
- **Objective:** Corporate experience proves level and scale without pretending to be a product.
- **Product requirement:** Solution-PRD §5 Work ("corporate items never imply a public product"), §6; Design.md §3 ExperienceStrip; CONTENT_INVENTORY §2.3.
- **Acceptance criteria:**
  1. Three rows from `category:'professional'` data, copy verbatim from §2.3; no `DemoVideo`, no external link, no `ViewTransition`.
  2. Expand/collapse via button with `aria-expanded`; one open at a time; instant under reduced motion.
  3. Visually distinct from the grid (flat tier, border) at every width; label text present and read by screen readers.
  4. Filters that include professional tags (Enterprise/Cloud/AI) also filter the strip rows (SITEMAP.md mapping).
  5. axe clean; crawler passes; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Truth.
- **Notes:** Godrej tag is "Platform" (not "IoT" — unverified).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-007, EVAL-011, EVAL-013
- **Blockers:** none
- **Target sequence:** Phase 4 · **Owner:** Claude

### TKT-18 · `DemoVideo` component — four states, poster-first, `preload="none"`, intent load
- **Backlog ID:** TASK-18 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:3
- **Parent / related:** consumed by ProjectCard grid mode, CaseStudyHeader, PrototypeFrame
- **Dependencies:** TKT-04
- **Description:** Poster (`next/image`) + centred 56×56 play `ClayButton`; states `no-video` ("Demo coming" badge over poster/placeholder, never a broken player), `loading` (spinner overlay), `playing` (native controls, muted, `preload="none"`, `<video>` mounted only on intent — click, or 50 % in view on desktop pointer devices), `error` (overlay "View live →" to the project's live URL, or "Demo coming" when no live URL). Duration caption from data.
- **Objective:** Demo videos never cost Lighthouse points and never break honestly-missing cases (S6).
- **Product requirement:** Solution-PRD §4 S6, §9 video-weight risk; Design.md §3 DemoVideo, §4 poster→play row; COMPONENT_ARCHITECTURE §4; DESIGN_DIRECTION §9 budgets; evaluation-plan EVAL-014.
- **Acceptance criteria:**
  1. All four states rendered and screenshot-tested with fixtures (missing src, slow network via Playwright route throttling, 404 src, valid src).
  2. No `<video>` element in the DOM before intent; after intent `preload="none"`, `muted`, `playsInline`, `controls`.
  3. Play button ≥44×44, labelled "Play demo: {project}"; keyboard operable; reduced motion unaffected (opacity/scale of the icon only).
  4. Poster is the LCP candidate when the component is above the fold; WebP posters ≤120 kB.
  5. Error overlay link resolves (crawler) and is announced.
  6. `pnpm eval --only EVAL-014` green.
- **Definition of Done:** Base DoD + Perf (Lighthouse on `/work` unaffected by the component: ≥ 90 mobile).
- **Notes:** Videos live at `public/video/<slug>.mp4` (H.264, ≤4 MB) + `public/video/<slug>-poster.webp` (media tickets TKT-22…27 fill them).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-004, EVAL-005, EVAL-011, EVAL-014, EVAL-015
- **Blockers:** none
- **Target sequence:** Phase 4 (parallel with TKT-16) · **Owner:** Claude

### TKT-19 · Case-study page shell: `CaseStudyHeader` (metrics) · `OverviewToggle` · `Chapter` · `ChapterNav` · `NextProject` · per-slug OG
- **Backlog ID:** TASK-19 · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:5
- **Parent / related:** replaces TSK-06 stub; tasks TSK-16…TSK-18
- **Dependencies:** TKT-15, TKT-05, TKT-06, TKT-18
- **Description:** `/work/[slug]` renders any `Project`: flat header 60/40 (name, one-line problem, role/duration/status chips, 2–3 inline `MetricCard`s with value + label + context + asOf + kind badge; right: hero media in `ClayFrame` = VT target `project-{slug}`, media = image, `DemoVideo`, or a labelled placeholder), `OverviewToggle` (30-sec default | Deep dive; 200ms crossfade + layout animation; hidden when `deepDive:false`), `Chapter` (flat h3 + `Prose` ≤600px + artifacts 1/2/3-up within the text column), `ChapterNav` (sticky left rail ≥1024 numbered 01–08 with active underline; sticky horizontal pill row <1024 — Deviation 4), chapters with empty bodies are omitted (short honest page), `NextProject` band, per-slug OG image, `ProgressBar`.
- **Objective:** One template that scales depth with evidence for all 11 case studies.
- **Product requirement:** Solution-PRD §5 Case study; Design.md §3 Case study, §4 shared element row, Deviation 4; COMPONENT_ARCHITECTURE §1 `work/[slug]`, §4 ProjectCard→CaseStudyHeader; CONTENT_INVENTORY §3.
- **Acceptance criteria:**
  1. All 11 slugs build statically; slugs with empty chapters render header + 30-sec overview + "Deep dive coming — this project is documented as {status}" note + NextProject, and pass axe.
  2. Header metrics render only from `Project.metrics` with all five fields; kind badge text measured / structural / self-reported; asOf shown as "as of {date}".
  3. Shared-element transition from any `ProjectCard` lands on the header media; icon `icon-{slug}` also transitions; fallback plain navigation verified with VT disabled.
  4. `OverviewToggle` keyboard operable (`role="radiogroup"`), crossfade per spec, reduced motion instant; default 30-sec.
  5. `ChapterNav` highlights the chapter in view (IO), anchors `#01-context` … `#08-what-i-learned` match the ids used by How I Think and Ask evidence links (`#02-problem`, `#03-discovery`, `#04-product-bet`, `#05-what-i-built`, `#06-evaluation`, `#07-outcome`); prose measure ≤600px at 768–1023 with the pill nav.
  6. `NextProject` cycles through personal projects in `/work` order; thumbnail hover 200ms.
  7. Lighthouse `/work/teachspark` ≥ 90/95/95/95 (with TeachSpark still at card fidelity — re-checked in TKT-28).
- **Definition of Done:** Base DoD + Perf.
- **Notes:** Anchor id scheme is load-bearing for TKT-13/TKT-09 links — fix it here and document in `docs/anchors.md`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002 (hop 3), EVAL-004, EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-015, EVAL-017
- **Blockers:** none
- **Target sequence:** Phase 4 · **Owner:** Claude

#### TSK-16 · CaseStudyHeader + MetricCard-inline + hero media slot + generateStaticParams + OG
- **Backlog ID:** TASK-19.1 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-19 · **Dependencies:** TKT-15, TKT-18
- **Acceptance criteria:** TKT-19 AC 1–3, 7.
- **Files:** `app/work/[slug]/page.tsx`, `app/work/[slug]/opengraph-image.tsx`, `components/case-study/CaseStudyHeader.tsx`, `components/case-study/artifacts/MetricCard.tsx` (inline variant), `lib/seo.ts`.
- **Related EVAL:** EVAL-013, EVAL-015, EVAL-017

#### TSK-17 · OverviewToggle + Chapter + ChapterNav (rail / pill row) + anchors
- **Backlog ID:** TASK-19.2 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-19 · **Dependencies:** TSK-16
- **Acceptance criteria:** TKT-19 AC 4, 5; `docs/anchors.md` written.
- **Files:** `components/case-study/{OverviewToggle,Chapter,ChapterNav}.tsx`, `components/common/Prose.tsx`, `docs/anchors.md`.
- **Related EVAL:** EVAL-007, EVAL-008, EVAL-010

#### TSK-18 · NextProject + ProgressBar + Playwright suite for the shell
- **Backlog ID:** TASK-19.3 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-19 · **Dependencies:** TSK-17
- **Acceptance criteria:** TKT-19 AC 6; `tests/e2e/case-study.spec.ts` covers all 11 slugs (render, axe, anchors, VT fallback).
- **Files:** `components/case-study/NextProject.tsx`, `components/interactions/ProgressBar.tsx`, `tests/e2e/case-study.spec.ts`.
- **Related EVAL:** EVAL-006, EVAL-011, EVAL-015

### TKT-20 · Artifact components (8): Insight · Hypothesis · Metric · Decision · Evaluation · Experiment · PrototypeFrame · ArtifactCard (generic)
- **Backlog ID:** TASK-20 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:5
- **Parent / related:** tasks TSK-19…TSK-21; consumed by TKT-19 chapters, TKT-40 Impact
- **Dependencies:** TKT-04
- **Description:** One shared card-tier `ClayCard` DNA, shape varies by type per Design.md §3: `InsightCard` (quote, butter left bar, source caption), `HypothesisCard` ("We believe…" / "We'll know when…" split), `MetricCard` (tabular-nums value, label, context, asOf, kind badge), `DecisionCard` (Chosen with mint check vs Rejected muted), `EvaluationCard` (method → result → limitation rows), `ExperimentCard` (setup → result → learning mini-connector), `PrototypeFrame` (`ClayFrame` bezel around image/`DemoVideo` + caption), `ArtifactCard` (generic: PRD/deck/ledger link with type icon). A renderer maps `Artifact.type` → component.
- **Objective:** Typed evidence blocks so chapters are built from artifacts, not prose alone (Solution-PRD §5).
- **Product requirement:** Solution-PRD §5 Case study ("typed artifacts"); Design.md §3 Artifacts; COMPONENT_ARCHITECTURE §1 artifacts/, §2 Artifact union; DESIGN_DIRECTION §7 (shape per type).
- **Acceptance criteria:**
  1. Eight components + `ArtifactRenderer`; every one reads only card-tier tokens; text zones inside remain flat; source caption present on every artifact (link when the source is a URL, path label otherwise — never a local filesystem path rendered publicly).
  2. `MetricCard` refuses to render without context/asOf/kind (type-level); kind badge pairs icon + text.
  3. Layout 1-up / 2-up ≥768 / 3-up ≥1024 inside the chapter column; never full-bleed.
  4. `/dev/artifacts` fixture page renders every type with realistic TeachSpark/RailCite pack data for screenshot review at 390 & 1440; axe clean.
  5. Unit tests for the renderer mapping and MetricCard guards; `pnpm eval` regressed.
- **Definition of Done:** Base DoD.
- **Notes (security):** Source captions must show a human label (e.g. "Final PRD, 24 Aug 2026"), not `/Volumes/E Drive/...` paths — the schema keeps the path in `sources[]` for traceability, the UI renders `label` only.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003, EVAL-006, EVAL-008, EVAL-009, EVAL-013
- **Blockers:** none
- **Target sequence:** Phase 4 (parallel with TKT-16/19) · **Owner:** Claude

#### TSK-19 · InsightCard · HypothesisCard · MetricCard (full)
- **Backlog ID:** TASK-20.1 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-20 · **Dependencies:** TKT-04
- **Files:** `components/case-study/artifacts/{InsightCard,HypothesisCard,MetricCard}.tsx`, `components/case-study/artifacts/ArtifactRenderer.tsx`.
- **Related EVAL:** EVAL-013

#### TSK-20 · DecisionCard · EvaluationCard · ExperimentCard
- **Backlog ID:** TASK-20.2 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Effort:** sp:2 · **Parent:** TKT-20 · **Dependencies:** TSK-19
- **Files:** `components/case-study/artifacts/{DecisionCard,EvaluationCard,ExperimentCard}.tsx`.
- **Related EVAL:** EVAL-003

#### TSK-21 · PrototypeFrame · ArtifactCard (generic) · `/dev/artifacts` fixtures + tests
- **Backlog ID:** TASK-20.3 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-20 · **Dependencies:** TSK-20, TKT-18
- **Files:** `components/case-study/artifacts/{PrototypeFrame,ArtifactCard}.tsx`, `app/dev/artifacts/page.tsx`, `tests/unit/artifacts.test.tsx`.
- **Related EVAL:** EVAL-006, EVAL-009

### TKT-21 · `ShowTheThinking` + `ThinkingNode` (8-node user-triggered sequential reveal, vertical at every breakpoint)
- **Backlog ID:** TASK-21 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-004 · **Effort:** sp:3
- **Parent / related:** mounted by TKT-19 below chapter 08
- **Dependencies:** TKT-04, TKT-05
- **Description:** `ClayButton` toggle "Show the thinking ↓"; on open, 8 `ThinkingNode`s (Observation → User problem → Insight → Hypothesis → Product decision → Prototype → Evaluation → Outcome; stage label + text + source link) reveal top-to-bottom at 220ms with 120ms stagger and a `clip-path` connector draw-in; nodes exist in the DOM collapsed (screen-reader discoverable); never auto-plays; all at once + opacity-only under reduced motion; vertical list only (D4, Deviation 6).
- **Objective:** The portfolio's signature interaction — the reasoning chain, user-triggered, honest, accessible.
- **Product requirement:** Solution-PRD §5 Case study ("Show the thinking"); Design.md §3 ShowTheThinking, §4 node reveal row, Deviation 6; COMPONENT_ARCHITECTURE §4; decision D4; evaluation-plan EVAL-007/010.
- **Acceptance criteria:**
  1. Renders from `Project.thinking` (8 nodes, each with `source`); hidden entirely when the chain is empty (thin projects) — no empty toggle.
  2. Toggle has `aria-expanded` + `aria-controls`; nodes are in the DOM before open (`hidden` attribute pattern that still exposes them to AT via a visually-hidden summary, or `aria-expanded` region — pick one, document it).
  3. Reveal timing per spec; reduced motion: all nodes visible instantly, opacity only (Playwright asserts no transform animation).
  4. Keyboard: toggle → nodes' source links in order; `Esc` not required; focus remains on the toggle after open.
  5. One column at 390/768/1024/1440; no overflow; axe clean.
  6. `/dev/thinking` fixture with the TeachSpark chain for screenshots; `pnpm eval` regressed.
- **Definition of Done:** Base DoD.
- **Notes:** Only `transform`/`opacity`/`clip-path` animate (Design.md §4 hardware-acceleration rule).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003, EVAL-006, EVAL-007, EVAL-008, EVAL-010
- **Blockers:** none
- **Target sequence:** Phase 4 · **Owner:** Claude

---

## M-005 · Case-study content (11) & media

### Media tickets (parallelisable; start any time after TKT-01)

### TKT-22 · TeachSpark media: re-encode 42.85 MB mp4 → ≤4 MB + poster; screenshots from `origin/main`; live-status re-check
- **Backlog ID:** TASK-22 · **Type:** Chore · **Priority:** P1 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:2
- **Parent / related:** feeds TKT-28 (soft), TKT-12 badge copy; **hard blocker of TKT-50** (featured-3 video — PB4)
- **Dependencies:** TKT-01
- **Description:** Source `/Volumes/E Drive/Dev/Code/Claude/Case Study 4/teachspark/TeachSpark.mp4` (42.85 MB, 2026-08-23). Trim to a 20–40 s highlight, encode H.264 (yuv420p, faststart) ≤4 MB, extract WebP poster (first meaningful frame), optional AV1/WebM secondary source. Pull product screenshots from the teachspark repo's `origin/main` `docs/screenshots/` (git fetch + `git show`, no checkout into the portfolio tree). Re-verify `https://teachspark-production.up.railway.app` returns 200 and record the date; if down, record that and set the status copy accordingly.
- **Objective:** Web-ready TeachSpark demo + hero media, and a dated live-status fact.
- **Product requirement:** Solution-PRD §4 S6, §9 video weight; DESIGN_DIRECTION §9 (≤4 MB, poster, preload none); CONTENT_INVENTORY §8.1 Video/Artifacts/MISSING; decision S6.
- **Acceptance criteria:**
  1. `public/video/teachspark.mp4` ≤4 MB, 20–40 s, 1280px wide max, plays in Chromium/Safari; `public/video/teachspark-poster.webp` ≤120 kB.
  2. ≥3 product screenshots saved to `content/media/teachspark/` with a `SOURCES.md` line each (commit sha on `origin/main`); web-optimised copies in `public/media/teachspark/`.
  3. Live status checked with date; result written to `content/media/teachspark/SOURCES.md` and reflected in `data/projects.ts` status copy (TKT-28 consumes).
  4. No sandbox join code visible in any frame or screenshot (manual frame check; forbidden-string test cannot see pixels — note the manual step in SOURCES.md).
- **Definition of Done:** Base DoD (eval: EVAL-014 fixture swap to real file) + Sec (frame check).
- **Notes:** ffmpeg on E Drive scratch; keep the 42.85 MB original out of the repo.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-004 (`/work/teachspark` weight), EVAL-014, EVAL-016
- **Blockers:** none
- **Target sequence:** Phase 2–5 (filler) · **Owner:** Claude

### TKT-23 · RailCite media: screen-recorded demo (≤4 MB) + poster + product screenshots from the live app
- **Backlog ID:** TASK-23 · **Type:** Chore · **Priority:** P1 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:2
- **Parent / related:** soft dependency of TKT-29 (hero media placeholder until captured); **hard blocker of TKT-50** (featured-3 video — PB4)
- **Dependencies:** TKT-01
- **Description:** Playwright `recordVideo` (or Chrome MCP) session on `https://railcite.vercel.app`: sign-in path if required (use a demo account only if one exists — never a personal credential in a recording), a real query that answers with citations, a query that **refuses** (the product's signature behaviour), 20–40 s; encode ≤4 MB + poster; capture 4–6 product screenshots at 1440 and 390 (console, answer with citations, refusal state, stats). Record corpus figures shown with the fetch date.
- **Objective:** RailCite's first real product imagery — currently only the mascot exists (CONTENT_INVENTORY §8.2 MISSING).
- **Product requirement:** S6; CONTENT_INVENTORY §1.4 (RailCite image MISSING), §8.2; DESIGN_DIRECTION §9.
- **Acceptance criteria:**
  1. `public/video/railcite.mp4` ≤4 MB showing at least one cited answer and one refusal; poster ≤120 kB.
  2. ≥4 screenshots in `content/media/railcite/` + optimised copies; `SOURCES.md` with URL, date, viewport, and the live `/api/stats` numbers at capture time.
  3. No JWT/session token, email, or personal data visible in any frame.
  4. If auth blocks recording, document the exact blocker and ship poster-only ("Demo coming").
- **Definition of Done:** Base DoD + Sec.
- **Notes:** Respect the app's rate limits (Voyage 3 RPM — CONTENT_INVENTORY §8.2); space queries.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-014, EVAL-016
- **Blockers:** possible — RailCite auth (if it blocks recording, AC 4's poster-only fallback does **not** satisfy PB4 — escalate to Tushar before TKT-50)
- **Target sequence:** Phase 2–5 (filler; must close before TKT-50) · **Owner:** Claude

### TKT-24 · Nuptis + Velora media: screen-recorded demos (≤4 MB each) + posters
- **Backlog ID:** TASK-24 · **Type:** Chore · **Priority:** P1 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:2
- **Parent / related:** soft dependency of TKT-30/31; **hard blocker of TKT-50** because Velora is featured (PB4) — Nuptis rides along in the same session
- **Dependencies:** TKT-01
- **Description:** Record `https://nuptis.vercel.app/` (dashboard → onboarding → contingency drawer → payments) and `https://velora-nu-eight.vercel.app/` (role select → discover swipe → trust profile → bids) 20–40 s each; encode ≤4 MB; posters. Screenshots already exist in the packs (§8.4/§8.5) — reuse, don't recapture, unless the live UI diverges.
- **Acceptance criteria:** (1) `public/video/{nuptis,velora}.mp4` ≤4 MB + posters; (2) `SOURCES.md` per slug with URL + date; (3) mock-data nature stated in the caption data (status "Live (mock data)").
- **Definition of Done:** Base DoD.
- **Product requirement:** S6; CONTENT_INVENTORY §8.4, §8.5 Video MISSING. **Related TC:** TC-TBD · **Related EVAL:** EVAL-014 · **Blockers:** none · **Target sequence:** filler · **Owner:** Claude

### TKT-25 · Bhakti-Vilas media: screen-recorded demo + UI screenshots from the live prototype
- **Backlog ID:** TASK-25 · **Type:** Chore · **Priority:** P2 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:2
- **Parent / related:** soft dependency of TKT-33 (hero media placeholder until captured — PB4)
- **Dependencies:** TKT-01
- **Description:** Record `https://bhakti-vilas.vercel.app/` verified flow (session booking learn → date → circle map → payment → QR pass, per §8.6) at 390 and 1440; capture 4–6 UI screenshots; encode ≤4 MB + poster. Fake phone+OTP login uses obviously fake numbers.
- **Acceptance criteria:** (1) video + poster in `public/video/`; (2) screenshots in `content/media/bhakti-vilas/` + `SOURCES.md`; (3) no real phone number typed or visible.
- **Definition of Done:** Base DoD + Sec.
- **Product requirement:** S6; CONTENT_INVENTORY §8.6 Artifacts ("UI screenshots MISSING — capture from live URL"). **Related TC:** TC-TBD · **Related EVAL:** EVAL-014, EVAL-016 · **Blockers:** none · **Target sequence:** filler · **Owner:** Claude

### TKT-26 · Pratyasa (device footage re-encode) · Tegaki · dino-arcade · cinematic-portfolio media
- **Backlog ID:** TASK-26 · **Type:** Chore · **Priority:** P2 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:3
- **Dependencies:** TKT-01
- **Description:** Pratyasa: re-encode `PT/pratyasa-site/assets/demo.mp4` (device footage — a product screen-recording is not needed, §8.8) ≤4 MB + poster. Tegaki: record `https://tegaki-one.vercel.app` landing → how it works → pricing → sign-in screen (do not complete checkout; do not sign in with a personal Google account) ≤4 MB. dino-arcade: record `https://007u5h4r.github.io/dino-arcade-pwa/` cabinet UI **without loading any ROM** (BYO-ROM framing, §8.10; nothing under `Game/neogeo/` is ever used) + take the MISSING screenshot. cinematic-portfolio: record a 20–30 s scroll of `https://tushar-pathak.vercel.app/` ≤4 MB.
- **Acceptance criteria:** (1) four `public/video/<slug>.mp4` ≤4 MB + posters; (2) dino-arcade screenshot in `content/media/dino-arcade/`; (3) `SOURCES.md` per slug; (4) no ROM/BIOS content, no personal account, no payment step recorded.
- **Definition of Done:** Base DoD + Sec.
- **Product requirement:** S6; CONTENT_INVENTORY §8.8–8.11 Video/MISSING rows; AUDIT §7 exclusions. **Related TC:** TC-TBD · **Related EVAL:** EVAL-014, EVAL-016 · **Blockers:** none · **Target sequence:** filler · **Owner:** Claude

### TKT-27 · Cubicle media — conditional on deployment (else "Built, not launched", no video)
- **Backlog ID:** TASK-27 · **Type:** Chore · **Priority:** P3 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:2
- **Dependencies:** TKT-01; **external:** Tushar deploys Cubicle (decision S3 deadline 2026-09-16)
- **Description:** Only if a live URL exists: record the debate → four artifacts flow (~90 s claim — record what actually happens, no speed-up beyond 2×, label if sped up), ≤4 MB + poster, screenshots, then flip `featured` per S3 (Cubicle replaces slot 3 only if deployed **with screenshots**). Otherwise: close this ticket as "Not applicable — not deployed" and keep the card at "Built, not launched" with `DemoVideo` in `no-video` state.
- **Acceptance criteria:** either (1a) media files + `SOURCES.md` + `decisions.md` EXE-n recording the featured swap, or (1b) explicit N/A closure with date; (2) never a local `/dev/office` harness recording presented as the product.
- **Definition of Done:** Base DoD (or documented N/A).
- **Product requirement:** S3, S6; CONTENT_INVENTORY §8.3 (MISSING: live URL, deployment, any real run). **Related TC:** TC-TBD · **Related EVAL:** EVAL-013, EVAL-014 · **Blockers:** **Tushar** — deployment · **Target sequence:** filler · **Owner:** Tushar (deploy) / Claude (capture)

### Content-entry tickets (TeachSpark, RailCite, Velora first; the five thin case studies share TKT-54 — PB2)

Common contract for TKT-28…TKT-33 and TKT-54 (repeated by reference, not copy): **Type** Task · **Status** Planned · **Milestone** M-005 · **Dependencies** TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists); **media tickets are soft for every content ticket (PB4)** — a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder · **Product requirement** Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field→chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2 · **Acceptance criteria (shared):** (a) every chapter body, artifact, metric, thinking node and learning traces to a line in the named pack — a reviewer trace table is attached to the PR; (b) every metric has value/label/context/asOf/kind/source, self-reported and structural claims labelled as such; (c) every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") — never paraphrased into existence; (d) authorship phrasing "built with Claude Code" where the pack says so, product-model facts stated separately; (e) hero media from the pack's artifacts (or the media ticket), alt text written; (f) schema gate green; `/work/<slug>` axe clean at 390 & 1440; anchors resolve; `pnpm eval` regressed · **Definition of Done:** Base DoD + Truth · **Related TC:** TC-TBD · **Related EVAL (shared):** EVAL-003 (for TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot) · **Owner:** Claude · **Target sequence:** Phase 5.

### TKT-28 · Content: TeachSpark (`teachspark`) — full depth
- **Backlog ID:** TASK-28 · **Priority:** P0 · **Effort:** sp:5 · **Source pack:** CONTENT_INVENTORY §8.1 (+ §1.5 examples) · **Media:** TKT-22 (soft; video/screenshots) · **Dependencies:** common + **Tushar's canonical metric snapshot decision** (recommended 2026-08-24 Final PRD, test handsets excluded).
- **Description:** Author all 8 chapters, artifacts (persona `InsightCard` "Meera", whitespace/blue-ocean `PrototypeFrame`s from `CS4/docs/assets/`, `HypothesisCard` central hypothesis + A1–A8 summary, `DecisionCard` "Capability, not dependency" vs task-execution, `ExperimentCard` `is_test` exclusion with the 10→8 / 37.5→30 movement, `EvaluationCard` QA gates + 32 event types + Mixpanel funnel, `MetricCard`s for the funnel 72→17→17→12→8→5, median 37.5 min self-reported, referrals 3, all asOf 2026-08-24), the 8-node thinking chain (Observation "my mother, who teaches Sanskrit" … Outcome mentor challenge → Wave 1 trust & clarity), learnings (mentor quotes, drop-off retro, "Bangalore four different ways"), 30-sec overview, status copy from TKT-22's live check.
- **Specific acceptance criteria:** (1) exactly one metric snapshot date used everywhere (no mixing 08-24 and 08-26 — pack rule); (2) "625 tests" never appears (not reproduced); tests figure is "335 passed / 2 skipped (phase-6, 2026-08-21)"; (3) role text: solo MVP build, group discovery Sat–Mon; (4) live status text reflects TKT-22's dated check; (5) EVAL-003 mapping rows for TeachSpark filled in the traceability table (TKT-39).
- **MISSING → placeholders/omissions:** teacher interview notes/counts · pilot testimonials · retention/K-factor · LLM output-quality evals · production WhatsApp number · (screenshots/video if TKT-22 is late).
- **Blockers:** Tushar — metric date decision. **Related EVAL:** shared + EVAL-004 (`/work/teachspark` Lighthouse route re-check with full content).

### TKT-29 · Content: RailCite (`railcite`) — full depth
- **Backlog ID:** TASK-29 · **Priority:** P0 · **Effort:** sp:5 · **Source pack:** §8.2 (+ §1.5) · **Media:** TKT-23 (soft — PB4; no product screenshots exist yet, so the hero slot renders a labelled placeholder until the capture lands) · **Dependencies:** common + **Tushar's corpus-figure policy** (recommended "live, as of <date>" with footnote).
- **Description:** 8 chapters; artifacts: persona `InsightCard` "Ravi" (composite CCI), Master-Circular-caveat `InsightCard`, `HypothesisCard` (Final PRD §7.1), `DecisionCard` "Refuse is a first-class success state" vs answer-always, `ExperimentCard` threshold calibration 0.45→0.32 (5 relevant + 3 irrelevant queries), `EvaluationCard` (impeccable critique 22/40 with P0 "starter refuses" — state as found, fix record MISSING), `MetricCard`s (5,760 docs / 14,406 chunks live 2026-09-15 · 68 % OCR of 5,687 at 7 Sep · 193 lineage links · tests 345/1/2 on 2026-09-15 · "0 invented citations — by construction", kind structural), architecture `PrototypeFrame` (deck slide or a diagram built from the pipeline description — labelled as illustration), thinking chain, learnings ("staleness is a correctness bug", temperature rejection found by live smoke, "The feature is a citation. The product is trust.").
- **Specific acceptance criteria:** (1) citation validity always labelled "by construction", never a percentage over N queries; (2) decks' "148 tests / 5,687 docs" never used as current; (3) the failing test is disclosed as "1 stale expectation", not hidden; (4) EVAL-003 rows for RailCite filled.
- **MISSING → placeholders/omissions:** CCI user-testing record · usage/Mixpanel · measured time-to-cited-answer · groundedness/retrieval/latency evals · mentor feedback · P0 fix record · refreshed deck figures.
- **Blockers:** Tushar — corpus figure policy (TKT-23 is soft here; it hard-blocks TKT-50 instead).

### TKT-30 · Content: Velora (`velora`) — full depth (framed Nuptis → Velora)
- **Backlog ID:** TASK-30 · **Priority:** P1 · **Effort:** sp:3 · **Source pack:** §8.5 (+ §8.4 for the pivot, §1.5 Insight) · **Media:** TKT-24 (soft; screenshots exist) · **Dependencies:** common.
- **Description:** 8 chapters with the kill/pivot as the spine ("Weddings were blue — but a shallow pool…"); artifacts: `InsightCard` team-pooled interview quotes (attributed to team), `HypothesisCard` H1 coordination-not-speed, `DecisionCard` Nuptis killed → Velora, `EvaluationCard` 10/10 vitest + 0 overflow + bundle 156 kB gz (task-6.3 review), `PrototypeFrame`s from `CS3/Velora/docs/screenshots/`, `MetricCard`s limited to what exists (tests 10/10 asOf 2026-09-15); thinking chain; learnings ("Nothing below presents a hypothesis as a validated fact").
- **Specific acceptance criteria:** (1) team baseline table (15–30 days, <10 % active work) presented as secondary research, never as own data; (2) "Trust Scores are authored, not verified" disclosed; (3) no users/pilot claimed; (4) EVAL-003 rows for Velora filled.
- **MISSING:** usage/pilot data · Tushar-attributed interviews · mentor feedback · Figma URL · live Supabase validation.
- **Blockers:** none.

### TKT-31 · Content: Nuptis (`nuptis`)
- **Backlog ID:** TASK-31 · **Priority:** P1 · **Effort:** sp:3 · **Source pack:** §8.4 · **Media:** TKT-24 (soft; 8 screenshots exist) · **Dependencies:** common.
- **Description:** Chapters emphasising problem framing, risk-tier verification insight, North Star definition, explicit cut list, the kill decision (linking to `/work/velora`); artifacts: `InsightCard` risk-tier quote, `HypothesisCard` North Star, `DecisionCard` cut list, `EvaluationCard` mobile sweep (9 routes, 1 bug), `PrototypeFrame`s dashboard/contingency; metrics: "none measured" stated explicitly (no `MetricCard`s); thinking chain; learnings (self-feedback quote).
- **Specific acceptance criteria:** (1) "No AI" stated — Assistant is keyword-matched canned responses; (2) "no automated tests" disclosed; (3) status "Live (mock data)".
- **MISSING:** pilot/usage data · analytics sheet · tests · mentor feedback · Excalidraw export · public repo.
- **Blockers:** none.

### TKT-32 · Content: Cubicle (`cubicle`) — full chapters, honest "built, not launched"
- **Backlog ID:** TASK-32 · **Priority:** P1 · **Effort:** sp:3 · **Source pack:** §8.3 · **Media:** TKT-27 (soft/conditional) · **Dependencies:** common; **Tushar:** team names + his named role.
- **Description:** Chapters on problem, Aarav persona, visible-collaboration insight, debate protocol + stop rules, four-artifact architecture, QA evidence (326 tests / 97 TC rows PASS 29 · BLOCKED 17 · Planned 48, gates), outcome = no live run; artifacts: `InsightCard` "Nobody makes the collaboration visible", `HypothesisCard` targets (activation ≥60 % etc. — as targets, unmeasured), `DecisionCard` "Trust first, ownership second, autonomy last", `EvaluationCard` QA gates, `MetricCard`s build-quality only (tests, contrast) — cost/latency "unmeasured" never shown as numbers; thinking chain; learnings L1/L2/L8.
- **Specific acceptance criteria:** (1) role text never claims solo — "team of 6; my named role: {pending}" placeholder until Tushar supplies; (2) no product metrics; (3) status "Built, not launched" unless TKT-27 flips it.
- **MISSING:** live URL · deployment · real run · product metrics · interviews · team names/role · screenshots · evals · final deck · OG.
- **Blockers:** Tushar — role/team names (placeholder otherwise).

### TKT-33 · Content: Bhakti-Vilas (`bhakti-vilas`) — team build, shorter page
- **Backlog ID:** TASK-33 · **Priority:** P2 · **Effort:** sp:2 · **Source pack:** §8.6 · **Media:** TKT-25 (soft — PB4; hero placeholder until UI screenshots are captured) · **Dependencies:** common.
- **Description:** Shorter chapter set (Context, Problem, Discovery, Bet, Built, Learned; Evaluation/Outcome brief); Tushar's named contribution (segmentation, hypotheses, interview guides; Madhu Mukti solution doc); artifacts: `InsightCard` "Distance was never the variable. Availability was.", `HypothesisCard` "Insure the visit, don't vet the person", `DecisionCard` health meaning coded not front-loaded, `EvaluationCard` mentor Q&A (11 sources, "well-evidenced hypothesis"), `PrototypeFrame` from TKT-25 captures; metrics: team survey numbers attributed to the team; product metrics MISSING; disclosures: translation ~90/500 strings, medical copy unreviewed.
- **Specific acceptance criteria:** (1) team build with commit split stated (5 Tushar / 3 Shivali); (2) staged-reveal funnel shown only as "directional estimates"; (3) status "Live prototype (mock data, team build)".
- **MISSING:** UI screenshots (TKT-25, soft) · usage · tests · team PRD authors · mentor grade · Tushar-fielded interviews.
- **Blockers:** none.

### TKT-54 · Content: five thin case studies — Token Toli · Pratyasa · Tegaki · dino-arcade · cinematic-portfolio (one task each)
- **Backlog ID:** TASK-34 · **Type:** Task · **Priority:** P2 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:5
- **Parent / related:** tasks TSK-25…TSK-29; supersedes retired TKT-34…38 (PB2 — one ticket, one context window, five short honest pages)
- **Dependencies:** common (TKT-19, TKT-20, TKT-21; TKT-15 records exist) · **Media:** TKT-26 (soft — PB4)
- **Description:** Author the five evidence-thin case studies as short, honest pages (`deepDive:false` where chapters stay short; `ShowTheThinking` hidden when a chain has fewer than 8 sourced nodes). Each task names its CONTENT_INVENTORY §8 pack and MISSING list and closes independently; the ticket closes when all five tasks pass the shared contract.
- **Objective:** Every personal build has a truthful page without padding thin evidence into a full narrative.
- **Product requirement:** Solution-PRD §5 Case study ("discovery-only and playground items get shorter, honest pages"), §7; CONTENT_INVENTORY §3 + §8.7–8.11.
- **Acceptance criteria:** the common contract (a)–(f) per task, plus each task's specific criteria below; (g) none of the five pages renders a `MetricCard` that is not in its pack; (h) `pnpm eval` regressed once after all five land.
- **Definition of Done:** Base DoD + Truth.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-011, EVAL-013, EVAL-014 (video slot for Pratyasa/Tegaki/dino/cinematic)
- **Blockers:** none
- **Target sequence:** Phase 5 (after TKT-28–33) · **Owner:** Claude

#### TSK-25 · Token Toli (`token-toli`) — discovery-only page
- **Backlog ID:** TASK-34.1 · **Type:** Task · **Priority:** P2 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-54 · **Dependencies:** common · **Source pack:** §8.7 · **Media:** none (no standalone images — `ClayIcon` + text-only artifacts)
- **Description:** Discovery-framed page: Context, Problem, Discovery (three named-respondent quotes), Bet (MVP focus statement + sizing, labelled as estimate), Evaluation (self-critique "20–30 structured interviews"), Outcome (not selected; carried into Week 3), Learned ("Performing the problem instead of presenting it"); artifacts: `InsightCard` "The binding constraint is trust, not demand", `HypothesisCard` H1.1–H1.3 with their validation status, `DecisionCard` MVP focus; no `MetricCard`s except respondent count if Tushar confirms.
- **Specific acceptance criteria:** (1) status "Discovery only", no live/video; (2) team "44 interviews" attributed to the team PRD, not Tushar; (3) respondent count shown as "11 named respondents" only (explicit count MISSING → no total).
- **MISSING:** explicit interview count · author page · mentor feedback · figures · section attribution.
- **Files:** `data/projects.ts` (token-toli record), `content/media/token-toli/SOURCES.md`.

#### TSK-26 · Pratyasa (`pratyasa`) — record page
- **Backlog ID:** TASK-34.2 · **Type:** Task · **Priority:** P2 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-54 · **Dependencies:** common · **Source pack:** §8.8 (+ §4.7 Research) · **Media:** TKT-26 (soft; assets exist)
- **Description:** Short page: Context (co-inventor, 2nd of 5; hardware/firmware/Android/validation contribution quote), Problem (no presentable record), Bet (credibility page, not sales page), Built (static, zero third-party requests, `verify-facts.py` in CI), Evaluation (mechanical fact checker), Learned; artifacts: `DecisionCard` contributor-not-owner + safety framing, `EvaluationCard` fact-checker, `PrototypeFrame` device photo/case; device figures from the paper omitted on the case page and kept on `/about#research`.
- **Specific acceptance criteria:** (1) patent IN 429867 + rights line "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic"; (2) no product-metric language.
- **MISSING:** Soft Matter DOI (About, not here).
- **Files:** `data/projects.ts` (pratyasa record), `content/media/pratyasa/SOURCES.md`.

#### TSK-27 · Tegaki (`tegaki`)
- **Backlog ID:** TASK-34.3 · **Type:** Task · **Priority:** P2 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-54 · **Dependencies:** common · **Source pack:** §8.9 · **Media:** TKT-26 (soft; 6 screenshots exist)
- **Description:** Chapters: Context (productising a manual practice), Problem/pilot question, Insight (operator half unspecified), Hypothesis (5–10 pilot users), Bet (pilot reframe, honesty guard), Built (Next 16 + Supabase, 18 RLS migrations, signed-URL delivery, cron retention), Evaluation (31 test files, three-layer guardrails), Outcome (no pilot users recorded), Learned (none recorded → omit chapter); artifacts: `InsightCard`, `HypothesisCard`, `DecisionCard`, `EvaluationCard`, `PrototypeFrame`s.
- **Specific acceptance criteria:** (1) "No AI in product; report generation is manual/offline" stated; Master Prompt never described beyond "internal"; (2) checkout "confirms without charging" disclosed; (3) no pilot numbers.
- **MISSING:** pilot/order counts · lesson-learnt · sample report consent.
- **Files:** `data/projects.ts` (tegaki record), `content/media/tegaki/SOURCES.md`.

#### TSK-28 · dino-arcade-pwa (`dino-arcade`)
- **Backlog ID:** TASK-34.4 · **Type:** Task · **Priority:** P3 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-54 · **Dependencies:** common · **Source pack:** §8.10 · **Media:** TKT-26 (soft)
- **Description:** Minimal honest page (`deepDive:false`): Context, Bet (BYO-ROM as the load-bearing decision), Built (vendored EmulatorJS + FBNeo, IndexedDB, service worker, no backend/analytics), Outcome (live); one `DecisionCard`; repo link visible (`repoPublic:true`).
- **Specific acceptance criteria:** (1) public framing strictly "BYO-ROM — no game data ships"; (2) no reference to `Game/`; (3) test results omitted (MISSING).
- **MISSING:** screenshot (TKT-26) · test results.
- **Files:** `data/projects.ts` (dino-arcade record), `content/media/dino-arcade/SOURCES.md`.

#### TSK-29 · cinematic-portfolio (`cinematic-portfolio`)
- **Backlog ID:** TASK-34.5 · **Type:** Task · **Priority:** P2 · **Status:** Planned · **Effort:** sp:1 · **Parent:** TKT-54 · **Dependencies:** common · **Source pack:** §8.11 · **Media:** TKT-26 (soft; posters/stills exist)
- **Description:** Chapters: Context (recruiters ask "who is Tushar Pathak?"), Bet (film as backdrop; reduced-motion static fallback), Built (static, Lenis, 289 scrub frames, Higgsfield film), Evaluation (QA-A 8/8, QA-B 11/11, QA-C 12/12; scrub 0.04 ms/frame mean, 0 frames >16 ms; 1 Critical + 2 Important fixed), Outcome (live 2026-08-26), Learned (Higgsfield gating/refunds/start_image); artifacts: `DecisionCard`, `EvaluationCard`, `MetricCard` film cost 197 credits (measured, asOf 2026-08-26), `PrototypeFrame` posters; repo link visible (public).
- **Specific acceptance criteria:** (1) stats "7+ · 40+ · 180+ · 30 %" attributed to the resume and marked self-reported if shown; (2) cross-link to `/playground`.
- **MISSING:** OG human check for that site (irrelevant here).
- **Files:** `data/projects.ts` (cinematic-portfolio record), `content/media/cinematic-portfolio/SOURCES.md`.

Retired (PB2, IDs never reused): TKT-34 → TSK-25 · TKT-35 → TSK-26 · TKT-36 → TSK-27 · TKT-37 → TSK-28 · TKT-38 → TSK-29.

### TKT-39 · Verify product-leader question traceability (EVAL-003) against the rendered case studies
- **Backlog ID:** TASK-35 · **Type:** Docs · **Priority:** P1 · **Status:** Planned · **Milestone:** M-005 · **Effort:** sp:1
- **Dependencies:** TKT-28, TKT-29, TKT-30 (+ `test-cases.md` traceability table from Stage 6)
- **Description:** Walk the 8 product-leader questions (brief §43, as tabulated in `test-cases.md`) against the live `/work/teachspark`, `/work/railcite`, `/work/velora` pages; for each question record the artifact id/anchor that answers it; fix gaps by adding a sourced artifact (never by inventing) or record the gap explicitly.
- **Objective:** Solution-PRD §8 criterion 3 proven with anchors, not assertion.
- **Acceptance criteria:** (1) 8/8 questions mapped to ≥1 rendered artifact with a URL#anchor; (2) mapping persisted in `test-cases.md` and `evals/results/eval-003-<sha>.md`; (3) any unmapped question logged as a QA finding with a proposed sourced fix.
- **Definition of Done:** Base DoD (manual eval persisted).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003 · **Blockers:** none · **Target sequence:** Phase 5 (end) · **Owner:** Claude (review) / Tushar (confirm)

---

## M-006 · About · Thinking · Playground · Contact · 404

### TKT-40 · About page part 1: `experience.ts` + `skills.ts` data · `AboutHero` · `ProductJourney` · capability clusters · `Impact`
- **Backlog ID:** TASK-36 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:5
- **Parent / related:** tasks TSK-22…TSK-24; continued by TKT-41, TKT-42
- **Dependencies:** TKT-03, TKT-04, TKT-05, TKT-06, TKT-20 (MetricCard)
- **Description:** Author `data/experience.ts` (4 roles: context · responsibility · scale · what changed · outcomes, resume-sourced; scale MISSING where the pack says so) and `data/skills.ts` (4 clusters); build `AboutHero` (flat hero variant: headline "Senior Product Manager. Product Thinker · AI Builder · Problem Solver.", bio paragraph per §4.1 with "AI Product Manager" omitted, avatar), `ProductJourney` (4 stages with the connector-line pattern, reveal-only, plus the 2019–2022 note pending Tushar's framing), 4 `ClayTile` clusters (2×2 / 4×1), `Impact` using `MetricCard` shape — every number with context + "self-reported" where resume-only.
- **Objective:** The person and the level, evidence-labelled.
- **Product requirement:** Solution-PRD §5 About; Design.md §3 Timeline section (AboutHero/clusters/Impact), §3 ProductJourney; SITEMAP.md `/about`; CONTENT_INVENTORY §4.1–4.4, §10 decisions.
- **Acceptance criteria:**
  1. Data passes schema; every string traces to §4.1–4.4; "SAFe" appears only as a methodology, never a certification; no DOB/phone/address.
  2. Impact rows exactly as §4.4 with labels: AmEx/Godrej/Devin metrics `kind:self-reported`; TeachSpark `measured` (self-reported time saved noted); RailCite corpus `measured` asOf 2026-09-15; "0 invented citations" `structural`.
  3. ProductJourney stage copy per §4.2; the gap note renders only after Tushar confirms framing (else omitted).
  4. "via IntraEdge" rendered per Tushar's decision (default: "American Express (via IntraEdge)" as the resume states).
  5. Years wording "7+ years" (resume) unless Tushar overrides.
  6. axe clean; no overflow; `pnpm eval` regressed; Lighthouse `/about` ≥ 90/95/95/95 (re-checked after TKT-42).
- **Definition of Done:** Base DoD + Truth.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002 (hop 4), EVAL-004, EVAL-006, EVAL-008, EVAL-013
- **Blockers:** Tushar — IntraEdge wording, gap framing, years wording (defaults applied)
- **Target sequence:** Phase 6 · **Owner:** Claude

#### TSK-22 · `experience.ts` + `skills.ts` authoring (resume-sourced)
- **Backlog ID:** TASK-36.1 · **Type:** Task · **Priority:** P1 · **Effort:** sp:2 · **Parent:** TKT-40 · **Dependencies:** TKT-03
- **Files:** `data/experience.ts`, `data/skills.ts`, `data/schema.ts` (if a field is missing — extend with evidence only).
- **Related EVAL:** EVAL-013

#### TSK-23 · AboutHero + ProductJourney
- **Backlog ID:** TASK-36.2 · **Type:** Task · **Priority:** P1 · **Effort:** sp:2 · **Parent:** TKT-40 · **Dependencies:** TSK-22, TKT-04
- **Files:** `components/hero/Hero.tsx` (variant) or `components/about/AboutHero.tsx`, `components/timeline/ProductJourney.tsx`, `app/about/page.tsx`.
- **Related EVAL:** EVAL-008, EVAL-010

#### TSK-24 · Capability clusters + Impact (MetricCard shape)
- **Backlog ID:** TASK-36.3 · **Type:** Task · **Priority:** P1 · **Effort:** sp:1 · **Parent:** TKT-40 · **Dependencies:** TSK-22, TKT-20
- **Files:** `components/about/{CapabilityClusters,Impact}.tsx`.
- **Related EVAL:** EVAL-009, EVAL-013

### TKT-41 · `ExperienceTimeline` + `TimelineNode` + `StoryCard` (horizontal ≥1024 / vertical below; URL hash per role)
- **Backlog ID:** TASK-37 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:5
- **Dependencies:** TKT-40
- **Description:** Single connecting line with 4 nodes (Godrej · Quantiphi · Shellkode · AmEx), label above / dates below; hover scales node 1.1 + brightens adjoining segment; click/Enter opens a lavender card-tier `StoryCard` (Context / Role / Scale / What changed / Outcomes as a 2-col definition grid ≥768, 1-col <768; 44×44 close; spring 240/30, instant under reduced motion), one open at a time, `#experience-{role}` hash; <1024 rotates vertical with accordion cards.
- **Objective:** Corporate proof of level, explorable, keyboard-complete (one of the two most novel interactions — EVAL-007/010 name it explicitly).
- **Product requirement:** Solution-PRD §5 About ("interactive experience timeline"); Design.md §3 Timeline, §4 StoryCard row; COMPONENT_ARCHITECTURE §4 ExperienceTimeline; CONTENT_INVENTORY §4.5.
- **Acceptance criteria:**
  1. Four roles from `experience.ts`; "Scale: not recorded" rendered where MISSING; outcomes labelled self-reported.
  2. Keyboard: Tab to nodes, Enter/Space opens, `Esc` closes and returns focus, arrow keys move between nodes; `aria-expanded`/`aria-controls`; deep link `/about#experience-amex` opens that card on load.
  3. Exactly one card open; opening another closes the first with layout animation; reduced motion snaps.
  4. Vertical layout at 390/768; horizontal at 1024/1440; no overflow; axe clean.
  5. `/about#experience` anchor exists for the `/work` ExperienceStrip link and Ask evidence.
  6. `pnpm eval` regressed (keyboard + reduced-motion suites).
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-011
- **Blockers:** none
- **Target sequence:** Phase 6 · **Owner:** Claude

### TKT-42 · About page part 2: Awards · Research · Education + assembly + OG
- **Backlog ID:** TASK-38 · **Type:** Feature · **Priority:** P2 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:2
- **Dependencies:** TKT-40, TKT-41
- **Description:** Awards (3, text only — certificates MISSING), Research (patent IN 429867 with inventors and rights line; Langmuir 2025 paper with DOI link; Soft Matter 2023 by title only until DOI/authors supplied), Education (M.Tech NIT Calicut 2022; B.E. BIT Durg 2016; languages optional), assemble `/about` in SITEMAP order, about OG, "Let's talk" → `/contact`, Download Resume.
- **Acceptance criteria:** (1) copy verbatim from §4.6–4.8; PMP/SAFe absent; (2) patent number 429867 everywhere; (3) Soft Matter row has no fabricated DOI — "DOI pending" placeholder; (4) page order per SITEMAP.md; (5) Lighthouse `/about` ≥ 90/95/95/95; axe clean; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Perf + Truth.
- **Product requirement:** Solution-PRD §5 About; CONTENT_INVENTORY §4.6–4.8. **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-004, EVAL-013, EVAL-017 · **Blockers:** Tushar — Soft Matter DOI (placeholder otherwise) · **Target sequence:** Phase 6 · **Owner:** Claude

### TKT-43 · `/thinking` list + `/thinking/[slug]` essay route with DRAFT entries
- **Backlog ID:** TASK-39 · **Type:** Feature · **Priority:** P2 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:3
- **Dependencies:** TKT-03, TKT-05, TKT-06
- **Description:** `data/writing.ts` with the 5 candidate essays (title, dek, backing passage quoted with source, related project, `draft:true`, reading time); `ThinkingHero` (h1 only), `ThinkingList` (numbered rows, large type, hover per Design.md), `EssayBody` (`Prose`, title, "Draft — pending sign-off" `Tag` instead of a date, body = the sourced passage(s) + a one-paragraph DRAFT framing, related-project `ExternalLink` card); empty-state copy "Essays in progress — five drafts, none published yet." when zero non-draft essays exist (rendered above the list, list still shows drafts); thinking OG.
- **Objective:** The editorial voice exists honestly — drafts labelled, never faked (Solution-PRD §5 Thinking).
- **Product requirement:** Solution-PRD §5 Thinking; Design.md §3 Thinking; SITEMAP.md `/thinking`, `/thinking/[slug]`; CONTENT_INVENTORY §5.
- **Acceptance criteria:** (1) 5 entries verbatim from §5 with sources; (2) DRAFT tag visible on list rows and essay pages; no publish dates; (3) essay body contains only quoted passages + clearly-marked framing, ≤600px measure; (4) essay slugs in sitemap; (5) axe clean; crawler passes; `pnpm eval` regressed.
- **Definition of Done:** Base DoD + Truth.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-011, EVAL-013, EVAL-017 · **Blockers:** Tushar — title sign-off (non-blocking) · **Target sequence:** Phase 6 · **Owner:** Claude

### TKT-44 · `/playground` — hero + 4 tiles (stronger clay permitted)
- **Backlog ID:** TASK-40 · **Type:** Feature · **Priority:** P2 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:2
- **Dependencies:** TKT-04, TKT-05, TKT-06, TKT-15
- **Description:** Flat hero "Small experiments. Big questions."; 2×2 / 1-col grid of `ClayTile`s for Pratyasa (butter), Tegaki (peach), dino-arcade (blush), cinematic-portfolio (mint) reading from project data; each tile fully clickable to the live URL (`target=_blank rel=noopener`), deeper hover shadow allowed; one-line description per §6; playground OG.
- **Acceptance criteria:** (1) four tiles, copy from §6 (no Slag City / Mock Interview / Game); (2) ≥44×44, focus ring, `aria-label` includes "opens in new tab"; (3) crawler treats external targets as resolved (HEAD 200–399); (4) axe clean; no overflow.
- **Definition of Done:** Base DoD + Truth.
- **Product requirement:** Solution-PRD §5 Playground; Design.md §3 Playground; CONTENT_INVENTORY §6. **Related TC:** TC-TBD · **Related EVAL:** EVAL-008, EVAL-009, EVAL-011 · **Blockers:** none · **Target sequence:** Phase 6 · **Owner:** Claude

### TKT-45 · `/contact` — `ContactCard` + `CopyButton` (copy email · mailto · LinkedIn · resume)
- **Backlog ID:** TASK-41 · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:2
- **Dependencies:** TKT-04, TKT-05, TKT-06 (TKT-08 is soft — the resume control renders the PB5 placeholder until the sanitised PDF lands)
- **Description:** Single centred hero-tier lavender `ClayCard` (max 640px): "Still curious?" → `CopyButton` (email; idle → copied 2 s → error fallback with selectable text) → mailto `ClayButton` → LinkedIn `ClayButton` (external) → resume action (reads `lib/site.ts`; the `#resume` anchor is the target of every placeholder link, with the "email me for a copy" note); 2×2 grid ≥768 / stacked <768; "Bengaluru, India" city line; contact OG. No form (S10).
- **Acceptance criteria:** (1) email/LinkedIn/city verbatim from §7; no phone; (2) all four controls ≥44×44 with 12px gaps; (3) `CopyButton` states tested incl. clipboard denied; (4) `#resume` anchor exists; resume control renders placeholder while `resumeAvailable` is `false` and a 200 download once TKT-08 flips it (Playwright covers both); (5) axe clean; crawler passes.
- **Definition of Done:** Base DoD + Sec (no PII beyond email/city).
- **Product requirement:** Solution-PRD §4 S10, §5 cross-links; Design.md §3 Contact; CONTENT_INVENTORY §7. **Related TC:** TC-TBD · **Related EVAL:** EVAL-002 (final hop), EVAL-007, EVAL-011, EVAL-013 · **Blockers:** none · **Target sequence:** Phase 6 · **Owner:** Claude

### TKT-46 · 404 page (`not-found.tsx`)
- **Backlog ID:** TASK-42 · **Type:** Feature · **Priority:** P3 · **Status:** Planned · **Milestone:** M-006 · **Effort:** sp:1
- **Dependencies:** TKT-05
- **Description:** Flat page with one clay tile, headline, links to `/`, `/work`, `/contact`; correct 404 status; header/footer present; reduced-motion safe.
- **Acceptance criteria:** (1) `/nope` returns 404 with the page; (2) links resolve; (3) axe clean at 390/1440.
- **Definition of Done:** Base DoD.
- **Product requirement:** Solution-PRD §5 routes (404); SITEMAP.md. **Related TC:** TC-TBD · **Related EVAL:** EVAL-011, EVAL-015 · **Blockers:** none · **Target sequence:** Phase 6 · **Owner:** Claude

---

## M-007 · Quality sweeps, deployment & production verification

### TKT-47 · Responsive sweep — every route at 390/768/1024/1440
- **Backlog ID:** TASK-43 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:3
- **Dependencies:** TKT-14, TKT-16, TKT-17, TKT-19, TKT-28…33, TKT-54, TKT-42, TKT-43, TKT-44, TKT-45, TKT-46
- **Description:** Playwright screenshot pack for every route (incl. all 11 case studies and 5 essays) at the four widths → `docs/screenshots/<route>/<width>.png`; automated asserts: no horizontal overflow, no control <44×44, no text <14px, images have intrinsic sizes (CLS); manual review pass for clipping, wrap, and the FilterTabs peek; fix list executed as small commits.
- **Acceptance criteria:** (1) 0 overflow, 0 sub-44px controls, 0 sub-14px text across all routes × widths; (2) screenshot pack committed; (3) defects fixed or logged as `QA-###` with reason; (4) `pnpm eval --only EVAL-008` green.
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-008 · **Blockers:** none · **Target sequence:** Phase 7 · **Owner:** Claude (QA-tester subagent, separate from implementers)

### TKT-48 · Accessibility sweep — axe on every route, keyboard paths, reduced motion, screen-reader pass
- **Backlog ID:** TASK-44 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:3
- **Dependencies:** same as TKT-47
- **Description:** Run axe at 390 & 1440 on every route; execute the full keyboard scripts (nav, MobileMenu, FilterTabs, ExperienceTimeline, AskPanel open/answer/close, ShowTheThinking, OverviewToggle, CopyButton); reduced-motion run asserting no transform animations; a VoiceOver pass on `/`, `/work/teachspark`, `/about` (manual, notes persisted); contrast check of every token pairing actually used.
- **Acceptance criteria:** (1) axe 0 critical/serious everywhere; (2) 100 % of listed flows completable by keyboard with visible focus; (3) reduced-motion assertion green on all routes; (4) VoiceOver notes in `docs/a11y-pass.md`; (5) fixes applied or `QA-###` logged.
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-007, EVAL-010 · **Blockers:** none · **Target sequence:** Phase 7 · **Owner:** Claude (QA-tester subagent)

### TKT-49 · Performance pass — Lighthouse on the four routes (mobile + desktop), JS budget, LCP/CLS, fonts, images, video
- **Backlog ID:** TASK-45 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:3
- **Dependencies:** same as TKT-47 (+ TKT-22 real media on `/work/teachspark`)
- **Description:** Measure first (`pnpm eval --only EVAL-004,EVAL-005`, 3-run median) then fix the largest offenders: font subsetting/`display:swap`, `next/image` sizes/priority, lazy `AskPanel`/`motion` chunks, clay shadow paint cost on long pages, video posters ≤120 kB, third-party = none. Record before/after in `evals/results/`.
- **Acceptance criteria:** (1) ≥ 90/95/95/95 mobile + desktop on `/`, `/work`, `/work/teachspark`, `/about`; (2) `/` first-load JS ≤ 180 kB gz, LCP ≤ 2.5 s, CLS < 0.05; (3) before/after JSON persisted; (4) no threshold lowered (EV2).
- **Definition of Done:** Base DoD + Perf.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-004, EVAL-005 · **Blockers:** none · **Target sequence:** Phase 7 · **Owner:** Claude

### TKT-50 · Vercel project `portfolio-clay` — preview deployment, security headers, Analytics, env, deploy guard
- **Backlog ID:** TASK-46 · **Type:** Chore · **Priority:** P0 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:2
- **Dependencies:** TKT-47, TKT-48, TKT-49, **TKT-22, TKT-23, TKT-24** (featured-3 demo videos — hard, PB4). TKT-08 is *not* a blocker of the preview (PB5 placeholder is acceptable on a preview); it hard-blocks TKT-53.
- **Description:** Create the new Vercel project (S1 — never the cinematic site's project), connect the repo, static output, `NEXT_PUBLIC_SITE_URL`, security headers in `next.config` (CSP appropriate for a static site with no third-party scripts, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS), Vercel Analytics + Speed Insights (basic), `pnpm audit` gate, and a **pre-deploy check script** (PB5) that fails the build if: a `public/resume.pdf` exists and the PII/patent test fails · `resumeAvailable` is `true` without a passing PDF · any PII pattern appears in the output bundle · any of `public/video/{teachspark,railcite,velora}.mp4` is missing or >4 MB (PB4). Deploy a **preview**; run the full `pnpm eval` against the preview URL.
- **Acceptance criteria:** (1) preview URL serves every route + `/sitemap.xml` + `/robots.txt` 200, and either `/resume.pdf` 200 (flag true) or the placeholder state on every resume control (flag false); (2) headers present (curl check persisted); (3) `pnpm audit` 0 high/critical; (4) secret/PII grep on the deployed bundle 0 hits; (5) the three featured videos play from the preview URL with posters; (6) `pnpm eval` against the preview persisted as `eval-run-preview-<sha>.json`; (7) rollback path documented in `docs/deploy.md`; (8) pre-deploy check script has a unit test for each failure mode.
- **Definition of Done:** Base DoD + Sec.
- **Notes:** Domain not needed for preview; production domain in TKT-53. Blast radius: new project only — verify the Vercel team/project before linking.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-014, EVAL-016 · **Blockers:** TKT-22/23/24 (videos) · **Target sequence:** Phase 7 · **Owner:** Claude (Tushar approves the Vercel project creation)

### TKT-51 · Link-preview validation — OG/Twitter per page family on LinkedIn Post Inspector + opengraph.xyz
- **Backlog ID:** TASK-47 · **Type:** Task · **Priority:** P1 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:2
- **Dependencies:** TKT-50
- **Description:** For each page family (home, work, one case study, about, thinking, playground, contact): fetch tags on the preview URL, render on opengraph.xyz and LinkedIn Post Inspector (human step — screenshots persisted), fix image sizing/absolute URL issues; re-run after production (TKT-53) because absolute URLs change with the domain.
- **Acceptance criteria:** (1) 7 families render title + description + 1200×630 image on both inspectors; (2) screenshots in `docs/og/`; (3) tag test green on preview; (4) re-validation checklist attached to TKT-53.
- **Definition of Done:** Base DoD (manual eval persisted).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-017 · **Blockers:** none · **Target sequence:** Phase 7 · **Owner:** Claude (Tushar for LinkedIn login if required)

### TKT-52 · Hand-off to review — full `pnpm eval` record run, evidence pack, HANDOFF for Stages 8–10
- **Backlog ID:** TASK-48 · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:2
- **Dependencies:** TKT-39, TKT-47, TKT-48, TKT-49, TKT-50, TKT-51
- **Description:** Run the complete suite against the preview deployment and persist `evals/results/eval-run-v1.0.0-rc.json`; assemble the Stage-8 pack (screenshot set from TKT-47, `/dev/primitives` and `/dev/artifacts` boards), the Stage-9 pack (branch diff stats, test/eval results, open `QA-###`), the Stage-10 inputs (headers, audit, PII grep); update `tickets.md` statuses, `HANDOFF.md` and the Obsidian/auto-memory mirrors; present the Session-Clearing block.
- **Acceptance criteria:** (1) every Critical EVAL PASS, no High unaddressed (or explicitly parked with reason) per evaluation-plan §6; (2) results file has full provenance; (3) `git diff main..HEAD --stat` reviewed — only intended files; (4) HANDOFF names exactly what Stage 8 must open.
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** all 17 · **Blockers:** none · **Target sequence:** Phase 7 · **Owner:** Claude

### TKT-53 · Production deployment on the new domain + production verification + monitoring + release provenance
- **Backlog ID:** TASK-49 · **Type:** Chore · **Priority:** P0 · **Status:** Planned · **Milestone:** M-007 · **Effort:** sp:3
- **Dependencies:** TKT-52, **TKT-08** (sanitised resume — hard; EVAL-002 requires `/resume.pdf` 200 on production, PB5) **and** Stage 8–10 approval with `QA-report.md` gate = READY (workflow rule — not started before)
- **Description:** Attach Tushar's domain to the Vercel project, set `NEXT_PUBLIC_SITE_URL`, promote to production, then verify evidence-first: open every route on the production domain, recruiter path end-to-end (EVAL-002), resume 200, sitemap/robots, headers, OG re-validation (TKT-51 checklist), Lighthouse record run on production, Analytics receiving events; record release provenance (commit, build id, domain, date) in `HANDOFF.md` and `decisions.md` (EXE-n); confirm the cinematic site and `portfolio/index.html` are untouched.
- **Acceptance criteria:** (1) production URL passes `pnpm eval` (persisted as `eval-run-v1.0.0.json`); (2) EVAL-002 journey ≤6 clicks green on production; (3) OG previews re-validated on the final domain; (4) Vercel Analytics dashboard shows traffic from the verification run; (5) rollback tested once (redeploy previous build) or documented as one-click; (6) release provenance recorded; (7) monitoring note answers "how would we know at 3 AM": Vercel error/latency dashboards + a weekly `pnpm eval` cron against production (GitHub Actions) proposed and either enabled or explicitly deferred.
- **Definition of Done:** Base DoD + Perf + Sec + `[ ] Release provenance recorded`.
- **Notes:** Externally visible — confirm scope with Tushar before promotion; never touch the existing cinematic Vercel project.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-004, EVAL-016, EVAL-017 · **Blockers:** Tushar — domain; sanitised resume (TKT-08); Stage 8–10 sign-off · **Target sequence:** Phase 7 (last) · **Owner:** Claude (Tushar approves promotion)

---

## M-009 · Illustrated editorial (paper) redesign — Stage 5, 2026-09-24

Conventions as §0, plus: **Paper DoD** = Base DoD + `[ ] Decoration counts match Design.md §3.3 for every section the ticket builds (EVAL-018 green on the route at 390 & 1440)` + `[ ] Copy verbatim from data/*.ts; any mockup difference is a Design.md §11 row` + `[ ] pnpm tokens:check 13/13, no colour literal outside globals.css / lib/og.tsx (EVAL-020)` + `[ ] Reduced-motion mapping per Design.md §8`. "Design.md" below means the 2026-09-24 paper spec. Baseline for regressions = `evals/results/baseline-m009-tracer.json` (EV6) once TKT-74 writes it; `baseline-v1.json` before that. Every ticket that touches tokens, fonts, the hero, decorations or OG images runs `pnpm eval` (evaluation-plan §8.6). Tushar-pending items are carried as **variants** inside the ticket, never as blockers: D8 (TKT-71), D9 (TKT-84/88), "Bengaluru, India" (TKT-72), `AskPanel` (TKT-77).

### Phase 0 · Tracer — tokens · fonts · primitives · header · band · hero on `/` → baseline → Tushar's hero gate

### TKT-69 · Paper tokens + fonts: 13-token swap with a repo-wide codemod, Fraunces/Inter/Caveat via `next/font`, EVAL-020 test
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Parent / related:** — (tasks TSK-30…32 below) · **Dependencies:** none (Stage 6 `technical-plan.md` must exist before dispatch)
- **Description:** Swap the 13 clay tokens for the 13 paper tokens **in one commit** (S12): `app/globals.css` `@theme` gets exactly the Design.md §2.1 names/OKLCH, the `color-mix` derived custom properties and the `body::before` grain; `scripts/tokens-check.ts` `AUTHORITATIVE` gets the 13 paper hexes; a codemod renames every retired token reference in `app/**`, `components/**`, `lib/**`, `tests/**` (`bg→paper`, `surface→ivory`, `lavender→paper-2`, `ink→navy`, `ink-2→navy-2`, `ink-3→ink-soft`, `accent→rust`, `accent-deep→terracotta`, `mint→forest`, `sky→green-2`, `blush→steel`, `peach→note`, `butter→kraft`, incl. Tailwind utilities like `bg-lavender/30`, `text-ink-3`, `tone-*`) so every legacy page keeps rendering and the gate stays 13/13 from the first commit. Fonts: `next/font/google` Fraunces (variable, `axes: ["opsz","SOFT"]`, 400–700), Inter 400/500/600, Caveat 400/600; `--font-display/--font-body/--font-hand` per §2.2; Manrope and `--font-manrope` removed. `tests/unit/eval-020.test.ts` wraps `tokens-check` + the greps (0 literals outside `globals.css` + `lib/og.tsx`, 0 retired names).
- **Objective:** Make the palette and type system mechanical on day one so every later ticket inherits the gate instead of re-negotiating it; measure the font cost in the tracer.
- **Product requirement:** Solution-PRD §12.2 (tokens, type), §12.6.2; Design.md §2.1–2.3; decisions S12, S13, D2; evaluation-plan §8.2 EVAL-020, §8.5 (fonts).
- **Acceptance criteria:**
  1. `pnpm tokens:check` prints 13/13 for exactly `paper, ivory, paper-2, navy, navy-2, ink-soft, rust, terracotta, forest, green-2, steel, note, kraft`; `globals.css` declares no other `--color-*`; `pnpm tokens:check --write` is a no-op afterwards.
  2. `grep -rE "\b(bg|surface|ink|ink-2|ink-3|accent|accent-deep|lavender|sky|mint|blush|peach|butter)\b"` over `app/ components/ lib/` as token/utility references returns 0 hits (the EVAL-020 grep, with the allow-list of English words documented in the test); every derived value uses `color-mix()` on a token — no second literal.
  3. `next/font` loads the three families self-hosted (`display: "swap"`, `latin`); the built page issues **zero** requests to `fonts.googleapis.com`/`fonts.gstatic.com` (CSP unchanged, TP9); Fraunces headings render with `font-variation-settings` `opsz`/`SOFT` — or, if the loader rejects the axes, static Fraunces 500 with the settings dropped and a `Design.md` §11 row (Solution-PRD §12.7).
  4. Base type applied: `body` Inter 16/1.6 navy antialiased; headings Fraunces 500, `text-wrap: balance`; `.font-hand` utility = Caveat.
  5. `tests/unit/eval-020.test.ts` green and wired into `pnpm eval` (EVAL-020 status computed from real output); `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green on the codemodded tree; every existing Playwright suite still passes or has its selector/colour assertions updated in the same commit (no test deleted).
  6. First-load JS on `/` measured with `bundle-budget --json` before and after (fonts are CSS, but the number is recorded for TKT-74).
- **Definition of Done:** Base DoD + Perf (recorded, gated at TKT-74) + `[ ] tokens:check 13/13 in CI`.
- **Notes:** Expand→migrate→contract collapses into one atomic rename because the 13-count gate forbids the "expand" step (S12 rejected side-by-side tokens). Run the codemod as a script kept in `scripts/` for review, then delete it in TKT-89. Keep the hex authoritative table in Design.md §2.1 as the source (D2). Do **not** restyle any component here — colours change, shapes don't.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-020, EVAL-004/005 (recorded), EVAL-006 (contrast pairs §2.1)
- **Blockers:** none · **Target sequence:** Phase 0 · **Owner:** Claude

#### TSK-30 · `globals.css` `@theme` + derived properties + grain + `tokens-check` AUTHORITATIVE + codemod
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-69 · **Dependencies:** —
- **Implementation notes:** Paste the §2.1 `@theme` block verbatim; add the §2.1 derived table as `:root` custom properties; `body::before` grain (fixed, `pointer-events: none`, z-index below content). Codemod = a `scripts/codemod-tokens.ts` mapping applied to class strings, CSS `var(--color-*)` and `@apply`; review the diff for false positives (`bg-` prefix collisions like `bg-white` are not tokens).
- **Files likely affected:** `app/globals.css`, `scripts/tokens-check.ts`, `scripts/codemod-tokens.ts` (temporary), every `components/**/*.tsx` and `app/**/*.tsx` with a token class, `tests/unit/tiers.test.ts`, `tests/unit/clay.test.tsx` (colour assertions).

#### TSK-31 · Fonts: Fraunces + Inter + Caveat via `next/font/google`; Manrope removed
- **Type:** Task · **Priority:** P0 · **Effort:** sp:1 · **Parent:** TKT-69 · **Dependencies:** TSK-30
- **Implementation notes:** `app/layout.tsx` font loaders + `className` variables; `--font-*` in `@theme`; delete the Manrope loader; check `assets/fonts/Manrope-*.ttf` stays until TKT-78 replaces the OG fonts (OG uses static TTFs, not `next/font`). Verify no runtime font request with `tests/e2e/smoke.spec.ts` (network listener) or the existing CSP report.
- **Files likely affected:** `app/layout.tsx`, `app/globals.css`, `tests/e2e/smoke.spec.ts`.

#### TSK-32 · `tests/unit/eval-020.test.ts` + `pnpm eval` wiring
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-69 · **Dependencies:** TSK-30
- **Implementation notes:** Spawn `scripts/tokens-check.ts`, parse "13/13"; count `--color-*` declarations in `globals.css`; regex for hex/rgb/hsl/oklch literals over `app/**` + `components/**` excluding `globals.css` and `lib/og.tsx`; retired-name grep with a word-boundary + Tailwind-prefix pattern. `scripts/eval.ts` already maps `eval-0xx` Vitest files by name (Stage 3) — confirm EVAL-020 shows PASS in `pnpm eval --only EVAL-020`.
- **Files likely affected:** `tests/unit/eval-020.test.ts`, `scripts/eval.ts` (only if the generic mapping needs a fix), `docs/eval.md`.

### TKT-70 · Paper primitives + the decoration contract (`data-decor` / `data-paper` / `data-fastener` / `data-flat` / `data-hand`) + EVAL-018 spec
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Parent / related:** — (tasks TSK-33…35 below) · **Dependencies:** TKT-69
- **Description:** Build `components/paper/*` exactly as Design.md §3.1: `TornEdge` (44–46 px SVG, `data-decor="torn"`, first child of its section), `Sticky` (note/kraft, `data-decor="sticky"`, `aria-hidden`), `Annotation` (Caveat caption with optional arrow SVG, `data-decor="annotation"`, `aria-hidden`), `Sketch` (variants: `underline`, `spark`, `path`, `chain`, `flow`, `tools`, `arrow`; `data-decor="sketch"`; draw-in via `stroke-dashoffset`, complete under reduced motion), `Note` (`data-decor="note"`), `Tape`/`Pin` (`data-fastener`, ≤ 2 per host, rendered inside the host), free-standing `Tape` (`data-decor="tape"`), `Sheet` (`data-paper="card|index|postcard|notebook|photo|tag"`, rotation caps, `--shadow-paper`), `Illustration` (`data-illustration="<id>"`, renders `illustration(id).alt`, alt-as-caption on load error), `FlatZone` (`data-flat`), `Hand` (`data-hand="quote|cta|label"` with the §3.4 limits enforced at render in dev), `DraftTag`/`StatusBadge` on paper (`data-paper="tag"`, Inter). `Prose` wraps its children in `data-flat`. `/dev/primitives` re-boarded with every primitive + a count readout. `tests/e2e/eval-018.spec.ts` implements §3.2 (per-section counts at 390/1440, Caveat computed-font check, flat zones, `aria-hidden`) over every route in `tests/e2e/routes.json` + all slugs + 404; `EVAL-018` removed from `DEFERRED_SPECS`.
- **Objective:** Make the anti-scrapbook guard (S15/EV5/D6) a component contract every page ticket inherits, and make it measurable before any page is built.
- **Product requirement:** Solution-PRD §12.2 (material), §12.6.4; Design.md §3 (normative), §2.3 (radius/rotation/shadow), §8 (draw-ins); decisions S15, EV5, D6; evaluation-plan §8.2 EVAL-018, §8.7.
- **Acceptance criteria:**
  1. Every primitive renders the attribute the §3.1 table specifies and nothing else counts: unit tests assert `data-decor` values ∈ `{torn, sticky, annotation, sketch, note, tape}`, `data-fastener ∈ {tape, pin}`, `data-paper` values, `data-flat`, `data-hand` values, `aria-hidden="true"` on every text-bearing decoration.
  2. A `Sheet` refuses a third fastener (dev-time warning + test); rotation props are clamped to the §3.1 caps; a `Hand` label > 3 words, a `cta` > 6 words or a `quote` > 240 chars / without `cite` fails a unit test fixture.
  3. `tests/e2e/eval-018.spec.ts` counts per `<section>` + `<header>` + `<footer>` using nearest-ancestor-section ownership, fails on > 4, on Caveat outside `[data-decor]`/`aria-hidden`/valid `data-hand`, on any `[data-decor]` inside `[data-flat]`, on an unhidden text decoration; it is proven with a fixture page (`/dev/primitives?violate=1`) that fails all four rules and a clean board that passes.
  4. `pnpm eval --only EVAL-018` runs the spec (no longer deferred) and writes real counts into the run JSON; on the legacy (not yet redesigned) routes any hit is listed, not hidden — parked with a reason in the tracer run and assigned to that page's ticket.
  5. Draw-ins: `stroke-dashoffset` 400 → 0 over 1.1 s, delay 0.5 s, once; `prefers-reduced-motion` renders them complete; `Reveal` restyled to opacity + 12 px (§8) — no scale.
  6. `/dev/primitives` shows every primitive at 390 and 1440 with its planned rotation, and the page itself passes EVAL-018.
- **Definition of Done:** Paper DoD + `[ ] EVAL-018 removed from DEFERRED_SPECS` + `[ ] docs/eval.md updated for EVAL-018`.
- **Notes:** These replace `components/clay/*` **without** deleting them yet (legacy pages still import clay until Phase C; TKT-89 deletes). Keep the primitives server components except `Sketch` when it needs `IntersectionObserver` for the draw-in trigger (CSS-only on load is preferred — §8 says "once on load"). Illustration ids come from TKT-73's manifest; until it lands `Illustration` reads a typed stub with the nine ids.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-018, EVAL-010 (draw-ins under reduced motion), EVAL-006 (`aria-hidden` decorations)
- **Blockers:** none · **Target sequence:** Phase 0 · **Owner:** Claude

#### TSK-33 · Counted decorations: `TornEdge` · `Sticky` · `Annotation` · `Sketch` (7 variants) · `Note` · free `Tape`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-70 · **Dependencies:** TKT-69
- **Implementation notes:** SVG paths lifted from the mockups (`docs/redesign-mockups/m-009/*.html`); torn edge as a full-width 44–46 px SVG with `preserveAspectRatio="none"`; annotation arrow optional child; every text decoration forces `aria-hidden` (no prop to disable).
- **Files likely affected:** `components/paper/{TornEdge,Sticky,Annotation,Sketch,Note,Tape}.tsx`, `components/paper/index.ts`, `tests/unit/paper.test.tsx`.

#### TSK-34 · Content paper: `Sheet` · fasteners (`Tape`/`Pin` on a host) · `Illustration` · `FlatZone` · `Hand` · `DraftTag`/`StatusBadge` on paper · `Prose` flat
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-70 · **Dependencies:** TSK-33
- **Implementation notes:** `Sheet` variants map to the §3.1 rows (radius `3px 10px 10px 3px`, `--shadow-paper`, notebook rules/margin/holes, postcard stamp chrome, photo frame padding + caption slot); fastener count enforced via `React.Children` scan in dev; `Hand` validates in dev and renders a plain `<span>`/`<blockquote>` with `data-hand`.
- **Files likely affected:** `components/paper/{Sheet,Fastener,Illustration,FlatZone,Hand}.tsx`, `components/common/{Prose,Tag}.tsx`, `components/projects/StatusBadge.tsx`, `tests/unit/paper.test.tsx`.

#### TSK-35 · `tests/e2e/eval-018.spec.ts` + violating fixture + `/dev/primitives` board + `DEFERRED_SPECS` update
- **Type:** Task · **Priority:** P0 · **Effort:** sp:1 · **Parent:** TKT-70 · **Dependencies:** TSK-34
- **Implementation notes:** Walk `section, header, footer` in page context; for each `[data-decor]` find `closest('section, header, footer')`; computed `font-family` check via `getComputedStyle`; report as a table in the run JSON details. Route list = `tests/e2e/routes.json` + `generateStaticParams` slugs + `/404`.
- **Files likely affected:** `tests/e2e/eval-018.spec.ts`, `tests/e2e/fixtures.ts`, `app/dev/primitives/page.tsx`, `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `docs/eval.md`.

### TKT-71 · Header (no compaction, D12) + `MobileMenu` paper sheet + nav (D8 variant) + reading progress + `AskAIButton` ghost
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-69, TKT-70
- **Description:** Restyle `Header` per Design.md §4.1: sticky one-height bar (`--header-bg` + 10 px blur, `data-scrolled` hairline after 8 px, `env(safe-area-inset-top)`), brand = 40×40 hand-drawn "TP" monogram SVG + two-line wordmark with the Caveat subline "Build · Learn · Solve · Grow" as the header's single `Annotation` (removed from the DOM < 640), serif nav (Fraunces 18, ink-stroke SVG underline on `aria-current`/hover, ≥ 44 px hit areas, hidden < 1024), "Let's connect →" navy pill (`data-hand="cta"`, hidden < 1024), 44 px menu button (`aria-expanded`/`aria-controls`) opening `MobileMenu` as the native `<dialog>` restyled to a full-width paper sheet (rows 56 px, then pill + résumé row, focus trap, `Esc`/backdrop, focus return); `AskAIButton` as a 44 px icon-only ghost after the nav / a row in the sheet (S21 default); reading-progress 3 px rust bar on `/work/[slug]`; `SkipLink` unchanged. **Delete** the rest→compact logic (`useScrollY` hysteresis, height animation, `NavPill` layout spring) with its tests. **D8 variant:** implement the nav from `lib/nav.ts`; ship with `Playground` added as the fifth item (proposed default) behind a single edit of `navItems` + the file's doc comment; if Tushar keeps four items, revert that one edit and TKT-72 adds a "Playground" band link instead so EVAL-011 reachability holds.
- **Objective:** Global chrome that every route shares, with the F6-scar compaction code gone for good.
- **Product requirement:** Design.md §1 (mobile), §4.1; decisions D12, D8, S21; Solution-PRD §12.2 (header row); evaluation-plan EVAL-007/008/011.
- **Acceptance criteria:** (1) header height constant across scroll at 390/768/1024/1440 (Playwright measures before/after 400 px scroll); `data-scrolled` toggles the border only; (2) nav hidden < 1024 and the sheet reachable by keyboard: Tab → menu button → Enter → focus inside the dialog → `Esc` returns focus (EVAL-007 script updated); (3) `aria-current="page"` on the active item renders the underline; every control ≥ 44×44; (4) the subline annotation is absent from the DOM < 640 and `aria-hidden` ≥ 640; the header passes EVAL-018 with count 1; (5) `lib/nav.ts` = 5 items (D8) and `tests/unit/routes.test.ts` + the crawler allow-list agree; a one-line revert path is documented in the ticket; (6) reading progress bar present only on case studies, `aria-hidden`, `transform: scaleX`; (7) `hooks/useScrollY`/hysteresis code and `NavPill` removed with their unit tests; `tests/e2e/layout.spec.ts` updated; (8) axe 0 critical/serious on `/` at 390 & 1440.
- **Definition of Done:** Paper DoD.
- **Notes:** `"use client"` only on the scroll listener, the menu button/dialog, and `AskAIButton`. Monogram SVG is authored (no illustration spend). The pill target `/contact` is the same as the band's — one path, not two behaviours.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-007, EVAL-008, EVAL-011, EVAL-018
- **Blockers:** D8 confirmation (non-blocking; default applied) · **Target sequence:** Phase 0 · **Owner:** Claude

### TKT-72 · `BandFooter` on every route (S16) + `hero.tagline` rendered (S18 regression test) + home `FinalCTA` removed
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-69, TKT-70
- **Description:** Replace `components/layout/Footer.tsx` with `BandFooter` per Design.md §4.2 markup: `<footer class="band" aria-labelledby="band-h">` → `TornEdge` (terracotta) → body on terracotta + `--band-hatch`: eyebrow "Let's connect", h2 "Let's *build* / something people can use." (`em` in `note`, second line in **kraft** — Dev-13), hiring line Inter 18 `--on-band-muted` + the site `DraftTag` (copy DRAFT until Tushar signs it), Email row (`Tushar_Pathak@outlook.com` → `/contact`), Social row = LinkedIn · GitHub (only while `links.github` public — S5) · résumé (`resumeAction()`; placeholder state PB5), © bar "© 2026 Tushar Pathak. Built with curiosity, chai & Claude Code." · `hero.tagline` in Caveat 17 `note` as `data-hand="quote"` · "Bengaluru, India" behind a `site.showLocation` flag (default **false** until Tushar confirms — HANDOFF §6; flipping is one edit). `env(safe-area-inset-bottom)` padding; margin-top `clamp(48px, 6vw, 88px)`. Delete `components/home/FinalCTA.tsx` and its section on `/` (S16). **Regression test (S18):** `tests/unit/band-footer.test.tsx` asserts `hero.tagline.text` renders once, in the © bar, with `data-hand="quote"`; `tests/e2e/layout.spec.ts` asserts exactly one `<footer>` per route and its landmark/links.
- **Objective:** One closing CTA on every page, with the previously unrendered tagline finally shown where the mockup places it.
- **Product requirement:** Design.md §4.2, §2.1 contrast (ivory/note/kraft on terracotta), §3.3 (band = 1 decoration); decisions S16, S18, S5; evaluation-plan §8.5 (band → EVAL-006/008/011/013/016/022).
- **Acceptance criteria:** (1) every route (incl. 404 and all slugs) renders exactly one `<footer>` = the band, and `FinalCTA` no longer exists; (2) contrast: h2 line 2 kraft on terracotta ≥ 4:1, hiring line/labels ≥ 4.5:1 (axe + the §2.1 table); (3) social circles 56 px with `aria-label`s, hover −2 px, focus ring kraft; GitHub circle absent when no public repo link; résumé control renders the PB5 placeholder while `resumeAvailable` is false; (4) EVAL-011 crawler: every band link resolves; (5) `hero.tagline` rendered once site-wide (unit + e2e), `data-hand="quote"` with the `cite`-equivalent (`Source:` sr-only) so EVAL-018's quote rule holds; (6) "Bengaluru, India" hidden by default and covered by a flag test; (7) band section count = 1 (`torn`) under EVAL-018; (8) the forbidden-strings/PII test still passes (email is the approved public contact, EXE-8).
- **Definition of Done:** Paper DoD + Sec (EVAL-016 grep incl. the band).
- **Notes:** The hiring-line copy is DRAFT (Solution-PRD §12.8) — render with `DraftTag`, never silently. The D8-fallback "Playground" band link is added here only if Tushar keeps a four-item nav.
- **Related TC:** TC-TBD (S18 tagline regression = a named TC at Stage 6) · **Related EVAL:** EVAL-006, EVAL-008, EVAL-011, EVAL-013, EVAL-016, EVAL-018, EVAL-022
- **Blockers:** Tushar — "Bengaluru, India" confirmation (non-blocking, flag) · **Target sequence:** Phase 0 · **Owner:** Claude

### TKT-73 · Hero: illustration manifest + provenance + shipped assets, hero section + `HeroClip` (D10), EVAL-019/021 tests, hero motion system removed
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:8
- **Parent / related:** — (tasks TSK-36…38 below) · **Dependencies:** TKT-69, TKT-70
- **Description:** (a) Copy the shipped renditions from disk (`docs/redesign-mockups/m-009/README.md` paths) into `content/media/illustrations/` (six `scene-*.jpg`, `hero-desk` poster source, `reference/character-sheet-b.jpg`) and `public/media/illustrations/` (`hero-animation.webm` 176 kB, `hero-animation.mp4` 312 kB, `hero-poster.webp` 87 kB); author `content/media/illustrations/manifest.ts` with the nine entries and the **exact** alt strings of Design.md §6.3, and `README.md` with the §6.2 provenance columns; `tests/unit/eval-021.test.ts` (both-ways provenance, alt prefix, forbidden-strings over filenames + alts). (b) Rebuild the `/` hero per §5: copy column from `data/hero.ts` (eyebrow, h1 with the rust underline `Sketch` on "people can use.", hand-sub `Annotation`, support, CTAs "View my work →" / "Ask my portfolio" → `#ask`), `<figure data-illustration="hero-desk">` with the `next/image` poster (`priority`, `sizes`, alt from the manifest) and the `figcaption` annotation; `HeroClip` client component implementing §5.3 exactly (mode detection once, video mounted only in default mode, `play()` rejection/`error` → unmount, `ended` untouched, no `loop`); `tests/e2e/eval-019.spec.ts` (4 modes × 2 widths, attributes, `ended` ≤ 4 s, `currentTime` monotonic, asset caps) and `EVAL-019` removed from `DEFERRED_SPECS`. (c) Delete the hero motion system: `components/hero/{AvatarScene,AvatarStage,FloatingTiles,HeroActivationContext}.tsx`, `components/interactions/Parallax.tsx`, `hooks/usePointerParallax.ts`, `lib/heroMotion.ts`, `components/projects/ProductScene.tsx` (M-008), their tests (`Parallax.test.tsx`, `motion.test.tsx` hero cases, `avatar-edge.spec.ts`), and `site.avatarAlt`. `public/avatar/*`, `content/media/avatar/`, `scripts/avatar*.ts` stay until TKT-89 (the OG route still reads the avatar poster until TKT-78).
- **Objective:** The tracer's riskiest slice: an illustrated hero + one-shot clip that is the LCP element, honest in every fallback mode, with the M-008 motion system's JS gone so EVAL-005 can be re-measured.
- **Product requirement:** Solution-PRD §12.2 (hero), §12.5, §12.6.1/3; Design.md §5 (contract), §6 (manifest/alts), §3.3 (`/` hero = 3), §8; decisions S14, S20, D10, EV4, EV6; evaluation-plan EVAL-019, EVAL-021, EVAL-010, EVAL-013, EVAL-001.
- **Acceptance criteria:**
  1. `illustration(id)` is the only source of `src`/`alt` for every illustration; the nine manifest ids match §6.1; `README.md` has a row per id with model, reference media ids, prompt summary, date, credits; `eval-021.test.ts` green both ways and fails when a fixture asset/row is added on one side only.
  2. Static HTML of `/` contains the poster `<img>` with `fetchpriority="high"`, `loading="eager"`, intrinsic 1280×684, the §6.3 alt, and **no** `<video>`; hydration in default mode mounts `<video autoplay muted playsinline preload="metadata" poster>` with webm then mp4 sources and no `loop`/`controls`; reduced-motion, `hasTouch`/coarse pointer, and `saveData` contexts never mount a `<video>` (4/4 modes at 390 and 1440).
  3. Default mode: `ended` fires ≤ 4000 ms after navigation; `currentTime` never decreases over the next 3 s including a scroll and a `visibilitychange`; the last frame stays painted (screenshot diff vs `hero-end.webp` tolerance documented).
  4. Asset caps asserted from disk: webm ≤ 200 kB, mp4 ≤ 350 kB, poster ≤ 120 kB.
  5. Hero section decoration count = 3 (hand-sub, underline sketch, caption); no `FloatingTiles`; 5-second-test elements present in the first viewport at 390 and 1440 (screenshots for TKT-74).
  6. Hero motion system files listed above are deleted; `pnpm typecheck`/`lint`/`test` green; `bundle-budget --json` on `/` recorded (target ≤ 180 kB gz — gated at TKT-74, EV6).
  7. `pnpm eval --only EVAL-019,EVAL-021` executes both (no longer deferred) and writes real values.
- **Definition of Done:** Paper DoD + Perf (recorded) + `[ ] EVAL-019 removed from DEFERRED_SPECS` + `[ ] EVAL-021 provenance README committed`.
- **Notes:** Never call `load()`/`play()` twice or touch `currentTime`; ignore later media-query changes (§5.3.4). The poster file serves both `<img src>` and `<video poster>`. Character sheet is stored for the Stage-8 drift check only and is never rendered on a page (`usedOn: []`). No Higgsfield spend (§12.4).
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-019, EVAL-021, EVAL-010, EVAL-013, EVAL-001, EVAL-004/005 (LCP element), EVAL-018
- **Blockers:** none (assets exist on disk) · **Target sequence:** Phase 0 · **Owner:** Claude

#### TSK-36 · Assets into the repo + `manifest.ts` + `README.md` provenance + `eval-021.test.ts`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-73 · **Dependencies:** TKT-69
- **Implementation notes:** Scenes as JPEG source renditions ≤ 600 kB each (re-encode with sharp from the PNG masters if the mockup JPEGs are larger), `next/image` produces AVIF/WebP; hero clip/poster copied byte-exact from `animation/export/`. README rows per Design.md §6.2 (media ids `df5cca50…`, `f49a95f5…`, dates 2026-09-23/24, 1 credit each).
- **Files likely affected:** `content/media/illustrations/**`, `public/media/illustrations/**`, `tests/unit/eval-021.test.ts`, `scripts/forbidden-strings.ts` (export the list for reuse), `docs/eval.md`.

#### TSK-37 · Hero section + `HeroClip` + `tests/e2e/eval-019.spec.ts`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:3 · **Parent:** TKT-73 · **Dependencies:** TSK-36, TKT-70
- **Implementation notes:** `components/hero/Hero.tsx` server component with the §5.1 grid; `components/hero/HeroClip.tsx` `"use client"`, `useEffect` once, state `"idle" | "video" | "poster"`; Playwright fixtures: `reducedMotion: "reduce"`, `hasTouch: true` + `isMobile`, `addInitScript` stubbing `navigator.connection = { saveData: true }`; file-size assertions via `fs.statSync`.
- **Files likely affected:** `components/hero/{Hero,HeroClip}.tsx`, `app/page.tsx`, `tests/e2e/eval-019.spec.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/home.spec.ts`, `scripts/eval-cases.ts` (`DEFERRED_SPECS`).

#### TSK-38 · Remove the hero motion system + `ProductScene` + their tests; record the JS number
- **Type:** Task · **Priority:** P0 · **Effort:** sp:1 · **Parent:** TKT-73 · **Dependencies:** TSK-37
- **Implementation notes:** Delete-only diff; grep for remaining imports; `lib/motion.ts` keeps the easing tokens used by §8 rows; `motion` stays a dependency (`LazyMotion`/`m`) for the Ask expand + filter reflow.
- **Files likely affected:** `components/hero/{AvatarScene,AvatarStage,FloatingTiles,HeroActivationContext}.tsx`, `components/interactions/Parallax.tsx`, `components/projects/ProductScene.tsx`, `hooks/usePointerParallax.ts`, `lib/heroMotion.ts`, `lib/site.ts` (`avatarAlt`), `tests/unit/{Parallax,motion}.test.tsx`, `tests/e2e/avatar-edge.spec.ts`, `tests/unit/site.test.ts`.

### TKT-74 · Phase-0 tracer: assembly on `/`, `pnpm eval --label baseline-m009-tracer`, Vercel preview, Tushar's hero gate (EVAL-022 sub-gate)
- **Backlog ID:** _Stage 6_ · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:2
- **Dependencies:** TKT-71, TKT-72, TKT-73 (TKT-69/70 transitively)
- **Description:** Assemble `/` as hero → (legacy Featured/How-I-think/Ask in paper colours) → band; screenshots at 390/768/1024/1440 → `docs/screenshots/m-009/tracer/`; run the full `pnpm eval --label baseline-m009-tracer` (EVAL-018/019/020/021 now real, EVAL-005 from `bundle-budget --json`) and persist `evals/results/baseline-m009-tracer.json` (EV6); deploy a Vercel **preview** of the branch; Lighthouse mobile + desktop on the preview (LCP element must be the hero poster, LCP ≤ 2.5 s); Fraunces-axes result recorded; present the hero to Tushar on the preview and record his written approval (or change list) as `decisions.md` EXE-n. Legacy-page EVAL-018 hits are parked with reasons and mapped to their Phase A–C tickets.
- **Objective:** The human gate Solution-PRD §12.6.7 requires before any other page is built, on evidence from a real deployment.
- **Product requirement:** Solution-PRD §12.6.1/3/7, §12.9 step 5; evaluation-plan §8.6 (baseline), EVAL-022 sub-gate, EVAL-004/005; decisions EV6, S14.
- **Acceptance criteria:** (1) `baseline-m009-tracer.json` committed with provenance (commit, branch, timestamp, `automated_scope`); (2) `bundle-budget` on `/` ≤ 180 kB gz — if not, a perf ticket is opened before Phase A and the budget is untouched (EV6); (3) preview Lighthouse JSON shows the poster as `largest-contentful-paint-element`, LCP ≤ 2.5 s mobile, perf ≥ 90; (4) EVAL-019 4/4, EVAL-020 13/13, EVAL-021 100 %, EVAL-018 green on `/` (legacy routes parked with reasons); (5) tracer screenshot pack (8 PNG) committed; (6) Tushar's approval **in writing** recorded as EXE-n with any change requests written into `Design.md` §11 before TKT-75 starts; (7) `HANDOFF.md` updated with the gate outcome.
- **Definition of Done:** Base DoD + Perf + `[ ] Tushar approved the hero on the preview` + `[ ] baseline-m009-tracer.json is the diff baseline for every later run`.
- **Notes:** Verify the poster/video on the **preview**, never `next dev` (M-008 image-cache scar). Preview deploy uses the existing `portfolio-clay` Vercel project's preview branch — production untouched.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-022 (sub-gate), EVAL-004, EVAL-005, EVAL-001, EVAL-018, EVAL-019, EVAL-020, EVAL-021
- **Blockers:** Tushar — hero approval · **Target sequence:** Phase 0 (gate) · **Owner:** Claude (Tushar approves)

### Phase A · Home complete + OG

### TKT-75 · Featured Work: three taped project cards (TeachSpark flow sketch, RailCite quote card, Nuptis → Velora) from data
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-74
- **Description:** Rebuild `FeaturedWork` + `ProjectCard` (featured mode) per Design.md §7.1: `section#work-featured` on `paper-2` with `TornEdge`, head grid (h2 "Real problems. / Real products." + lead; the RailCite quote-card `Annotation` with dashed arrow), grid `1.35fr 1fr`: TeachSpark large card (`Sheet card`, tape left, kicker, h3, tagline, the flow `Sketch`, VERIFIED metrics row with `asOf`, "Read the case study →" `data-hand="cta"`, sticky "Capability, not dependency."), RailCite card (tape centre, metrics 5,760 / 0 invented citations in forest), Nuptis → Velora card (tape right; metrics only if VERIFIED rows exist — the mockup's "10/10 unit tests" is dropped, Dev-01); whole card = link with `aria-label`; hover lift preserving rotation. Decoration count = 4 (Dev-03: no h2 spark, no Velora sticky).
- **Objective:** The three proof cards carry the VERIFIED numbers that left the hero tiles, in the approved paper form.
- **Product requirement:** Design.md §7.1 (Featured), §3.3 row, §11 Dev-01/03; Solution-PRD §12.3 (`/`); decisions S3, D7; EVAL-001, EVAL-002 (hop to case study), EVAL-011, EVAL-018.
- **Acceptance criteria:** (1) copy/metrics/status/tags byte-equal to `data/projects.ts` (unit snapshot against the data); (2) 3 cards, whole-card links to `/work/<slug>` (EVAL-002 hop); (3) ≤ 1024 two columns with the large card spanning, ≤ 640 one column, no overflow at 390; (4) EVAL-018: section = 4 (`torn`, quote annotation, flow sketch, sticky); fasteners ≤ 2 per card; (5) reduced motion: hover shadow only; (6) `tests/e2e/featured.spec.ts` + `tests/unit/ProjectCard.test.tsx` updated, `tests/e2e/eval-015.spec.ts` still green (plain-link navigation, no VT regression).
- **Definition of Done:** Paper DoD.
- **Notes:** `ViewTransitionLink` stays as the link primitive (EXE-5 CSS-only VT) — only its skin changes.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-002, EVAL-011, EVAL-013, EVAL-015, EVAL-018
- **Blockers:** none · **Target sequence:** Phase A · **Owner:** Claude

### TKT-76 · How I think: six pinned stage cards over the journey path sketch (static, quotes always visible)
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-74
- **Description:** Rebuild `HowIThink` per Design.md §7.1: `section#how-i-think` (`paper`, torn), head with eyebrow + h2 "A product journey, not a process." `[data]` + right-aligned lead; six `Sheet card`s pinned (alternating rotation, odd offset 28 px) over the dashed `path` `Sketch` (absolute, removed from the DOM ≤ 1024); card = Caveat numeral (`data-hand="label"`), h3 stage, principle (Inter, `DraftTag` when DRAFT), the VERIFIED example as `<blockquote data-hand="quote">` + `cite`, link pill "See how I tested this in {project}". No expand/roving-tabindex (deleted with tests). 3-up ≤ 1024, 2-up ≤ 640, 1-up ≤ 440.
- **Objective:** The framework section in the approved journey form with every quote sourced and visible.
- **Product requirement:** Design.md §7.1 (How I think), §3.3 (count 2), §3.4 quote/label limits; `data/thinking-framework.ts`; decisions D7, S15; EVAL-003, EVAL-007, EVAL-018.
- **Acceptance criteria:** (1) six stages, wording from data (unit snapshot), each quote ≤ 240 chars with `cite`; (2) links resolve to the case-study anchors (`lib/anchors.ts`) — crawler green; (3) EVAL-018 count = 2 (`torn`, path sketch) at 1440 and 1 at 390 (sketch removed from the DOM); every Caveat element has a valid `data-hand`; (4) keyboard: only the link pills are focusable; roving-tabindex code removed with `tests/e2e/how-i-think.spec.ts` rewritten; (5) `Reveal` stagger 70 ms, reduced motion instant.
- **Definition of Done:** Paper DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003, EVAL-007, EVAL-011, EVAL-018, EVAL-013
- **Blockers:** none · **Target sequence:** Phase A · **Owner:** Claude

### TKT-77 · Ask my portfolio as the notebook (inline) + `AskPanel` as a notebook drawer / bottom sheet (S21) — five states restyled, EVAL-012 unchanged
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-74
- **Description:** Restyle `AskPortfolio`, `AnswerView`, `SuggestedPrompts`, `EvidenceLinks` per Design.md §7.1 (Ask): `section#ask` (`paper-2`, torn), left eyebrow/h2/lead from data, right the `Sheet notebook` (+0.5°) with the prompt `Annotation`, sr-only label, Inter 18 underline input, navy "Ask →" pill (`data-hand="cta"`), five data chips, and the five states on ruled paper: idle microcopy · **loading** two shimmer lines + sr-only status · **answer** h3 "Answer" + `DraftBadge` + text + evidence pills + "Ask another" · **empty** FALLBACK line + 3 fresh chips · **error** rust-bordered ivory panel + glyph + "Try again". `AskPanel` (kept, S21 default): same body as a notebook sheet in the existing drawer (≥ 768, 400/480 px) / 90 vh bottom sheet (< 768, D3) with a 20 % navy scrim; `AskPanelLazy` unchanged. Logic, adapter, provider, synonym table untouched (TP3).
- **Objective:** Keep the deterministic Ask feature and its Critical evals intact while the surface becomes paper.
- **Product requirement:** Design.md §7.1 (Ask), §7.9 states, §8 (expand/sheet rows), §3.3 (count 2); decisions S7, S21, D3, TP3; EVAL-012 (11/11 · 0 fabrications), EVAL-007 (panel keyboard path), EVAL-014/015 states.
- **Acceptance criteria:** (1) `tests/unit/eval-012.test.ts`, `ask-*.test.ts`, `use-ask.test.tsx` untouched and green; (2) all five states render on the notebook (`tests/e2e/ask-inline.spec.ts` updated with the new selectors, `/dev/ask` board restyled); (3) panel keyboard path (open → type → answer → close, focus return) green in `ask-panel.spec.ts`/EVAL-007; (4) submitting never navigates; focus lands on "Answer"; (5) EVAL-018 count = 2 (`torn`, prompt annotation); the input value and answer text are Inter (Dev-04); (6) reduced motion: instant height, 150 ms opacity; (7) the panel trigger is the TKT-71 ghost button — **if Tushar drops the panel**, this ticket instead removes `AskPanel`/`AskPanelLazy`/`AskAIButton` and retires EVAL-007's panel clause via a recorded decision (never by omission).
- **Definition of Done:** Paper DoD + `[ ] EVAL-012 11/11 · 0 fabricated (unchanged)`.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-012, EVAL-007, EVAL-014, EVAL-015, EVAL-018
- **Blockers:** S21 keep/drop (non-blocking; default keep) · **Target sequence:** Phase A · **Owner:** Claude

### TKT-78 · OG images re-skinned in the paper style (D11) — `lib/og.tsx`, static Fraunces/Inter/Caveat TTFs, hero poster PNG, EVAL-017 re-run
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-69, TKT-73 (poster asset) — does **not** wait for the TKT-74 gate
- **Description:** Change only the template skin in `lib/og.tsx` per Design.md §9: paper canvas, terracotta torn strip, tape scrap, Inter 600 eyebrow with rust dot, Fraunces title (72 → 56 → 44 step-down kept), Inter subtitle, ivory/steel badge, "Tushar Pathak" footer, per-family Caveat caption; home + case-study families embed the hero poster (WebP → PNG via sharp, 520 px, ivory frame, −1.5°); other families text-only. Fonts: `assets/fonts/{Fraunces_144pt-Medium,Inter-Regular,Inter-SemiBold,Caveat-Regular}.ttf` (OFL, licence file kept), Manrope TTFs deleted. Hex copies of the palette live only here (EVAL-020 allow-list). Routes, sizes, copy (`content-brief.md` OG table), `buildMetadata()` untouched. `tests/unit/seo.test.ts` + `tests/e2e/eval-017.spec.ts` re-run; the manual inspector pass is TKT-91's.
- **Objective:** No og:image carries the superseded identity (EVAL-017 M-009 failure condition).
- **Product requirement:** Design.md §9; decisions D11, EV3; evaluation-plan §8.3 EVAL-017; `~/.claude/web-deliverables.md` link-preview gate.
- **Acceptance criteria:** (1) all seven `opengraph-image.tsx` families build, 1200×630 PNG ≤ 300 kB each (test asserts); (2) tag test green (absolute HTTPS `og:url`/`og:image`, `twitter:card`, `og:image:alt`); (3) a snapshot of each family committed to `docs/og/m-009/` for Stage-8 review; (4) no Manrope file or reference remains; (5) `pnpm eval --only EVAL-017` automated part green; (6) the avatar poster is no longer read by any OG route (unblocks TKT-89).
- **Definition of Done:** Base DoD + `[ ] docs/og/m-009/ snapshots committed`.
- **Notes:** Satori: static TTFs only, PNG/JPEG only, no oklch — hence the hex allow-list. Re-scrape with `?v=N` on WhatsApp after any later change.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-017, EVAL-020 (allow-list)
- **Blockers:** none · **Target sequence:** Phase A (parallel with TKT-75–77) · **Owner:** Claude

### TKT-79 · Home assembly + Phase A gate: section order, `Reveal`, 5-second-test pack, `pnpm eval` on `/`
- **Backlog ID:** _Stage 6_ · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:2
- **Dependencies:** TKT-75, TKT-76, TKT-77, TKT-78
- **Description:** `app/page.tsx` = hero → Featured → How I think → Ask → band with the alternating `paper`/`paper-2` fills and torn edges; `Reveal` on sections; screenshots at four widths → `docs/screenshots/m-009/home/`; EVAL-001 5-second checklist scored at 390 and 1440 (Claude + Tushar, informational until Stage 8); `pnpm eval` full run diffed against `baseline-m009-tracer.json`; home mockup side-by-side pair captured for Stage 8; Tushar's Phase-A approval recorded; `HANDOFF.md` updated.
- **Acceptance criteria:** (1) EVAL-018 on `/`: hero 3 · featured 4 · how-I-think 2 · ask 2 · header 1 · band 1; (2) EVAL-005 ≤ 180 kB gz still; (3) EVAL-001 6/6 elements present in the first viewport at both widths; (4) no Critical regression vs the tracer baseline; (5) approval recorded (EXE-n or a HANDOFF line quoting Tushar).
- **Definition of Done:** Paper DoD + Perf.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-001, EVAL-004, EVAL-005, EVAL-018, EVAL-022 (evidence)
- **Blockers:** Tushar — Phase-A checkpoint · **Target sequence:** Phase A (gate) · **Owner:** Claude

### Phase B · Work + case-study template (11 slugs) + Thinking/essay

### TKT-80 · `/work`: scene-bleed opener, serif filter tabs, numbered editorial index (`<ol>`), conditional `EmptyState` card (Dev-05), `<details>` experience strip
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Parent / related:** — (tasks TSK-39…41 below) · **Dependencies:** TKT-79
- **Description:** Rebuild `/work` per Design.md §7.2: `WorkHero` = scene bleed `scene-work` (one `<img>` restyled per breakpoint — Dev-06; 4:3 masked photo < 1024) with eyebrow, oversized h1 "Work" + underline `Sketch`, lead from data, caption `Annotation`; index section (`paper-2`, torn, sr-only h2) with `FilterTabs` as ink-underlined Fraunces tabs (`role="tablist"`, `?filter=` sync unchanged — TP7), "start here ↓" annotation, `EditorialGrid` → numbered `<ol>` index (rank 1 flagship opener card cols 1–7 with giant rust numeral + tape, rank 2 opener cols 8–12 with the "trust is the product." sticky, ranks 3–11 slim rows `64px 1fr 240px 260px`; numerals re-sequence on filter change; status dot + text + `asOf`), `EmptyState` as the pinned index card rendered **only** when 0 rows (Dev-05); `ExperienceStrip` as three `<details name="job">` rows with the hand-drawn chevron, hidden when no row matches. Responsive rules per §7.2.
- **Objective:** The project index in the approved editorial form with filters, URL sync and the corporate/product separation preserved.
- **Product requirement:** Design.md §7.2, §6.4 (scene bleed), §3.3 (opener 2 · index 3 · strip 1), §11 Dev-05/06; decisions TP7, S3; EVAL-002, EVAL-007 (tabs, details), EVAL-008, EVAL-011, EVAL-018, EVAL-013.
- **Acceptance criteria:** (1) filter tabs keyboard-operable (arrow keys, `aria-selected`), URL-synced, deep link `?filter=` renders the right subset after hydration (`tests/unit/filters.test.tsx`, `tests/e2e/work.spec.ts` updated); (2) 11 personal builds numbered 01–11 in data order, re-sequenced per filter; every row/opener is a link; (3) `EmptyState` card in the DOM only for an empty filter (Playwright toggles a filter with 0 rows — Experiments if none, else a fixture); (4) strip: one `<details>` open at a time (`name`), keyboard path, hidden under "Experiments"; no live-link/arrow affordance on corporate rows; (5) EVAL-018 per section = 2 / 3 / 1 at both widths (the "start here" arrow hides < 900 inside the same object); (6) one `<img>` for the scene, alt from the manifest, no duplicate announcement; `sizes` per placement, no CLS; (7) no overflow at 390 (rows collapse `40px 1fr`).
- **Definition of Done:** Paper DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-007, EVAL-008, EVAL-011, EVAL-013, EVAL-018, EVAL-021
- **Blockers:** none · **Target sequence:** Phase B · **Owner:** Claude

#### TSK-39 · `WorkHero` scene bleed (one `<img>`) + opener copy + caption
- **Type:** Task · **Priority:** P0 · **Effort:** sp:1 · **Parent:** TKT-80 · **Dependencies:** TKT-79
- **Files likely affected:** `components/projects/WorkHero.tsx`, `components/paper/Illustration.tsx` (bleed variant), `app/work/page.tsx`, `tests/e2e/work.spec.ts`.

#### TSK-40 · `FilterTabs` serif tabs + numbered `<ol>` index (openers + rows) + conditional `EmptyState`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:3 · **Parent:** TKT-80 · **Dependencies:** TSK-39
- **Implementation notes:** `EditorialGrid` renamed/rewritten as `WorkIndex`; rank logic reuses `lib/filters.ts`; `motion` layout reflow kept for re-sequencing (§8), opacity crossfade under reduced motion.
- **Files likely affected:** `components/projects/{FilterTabs,EditorialGrid→WorkIndex,ProjectCard,EmptyState,WorkGrid}.tsx`, `lib/filters.ts`, `tests/unit/{filters,work-grid,ProjectCard}.test.tsx`, `tests/e2e/work.spec.ts`.

#### TSK-41 · `ExperienceStrip` as `<details name="job">` rows
- **Type:** Task · **Priority:** P1 · **Effort:** sp:1 · **Parent:** TKT-80 · **Dependencies:** TSK-40
- **Files likely affected:** `components/projects/ExperienceStrip.tsx`, `tests/e2e/work.spec.ts`, `tests/e2e/eval-007.spec.ts`.

### TKT-81 · Case-study template part 1: paper header (taped photo + "Hero media coming" tag), metric strip, overview folder tabs + notebook, thin-project degradation, next-project navy band — all 11 slugs
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Dependencies:** TKT-79
- **Description:** Rebuild `CaseStudyHeader`, the metric strip, `OverviewToggle`, `NextProject` per Design.md §7.3: header grid `56fr 44fr` (crumb, h1, lead ≤ 44ch, Role/Duration + `StatusBadge` ivory pill), taped `Sheet photo` with `scene-casestudy` + the kraft "Hero media coming" `data-paper="tag"` (Inter 11 **navy** — Dev-13) + sub-line annotation + caption; when `hero.image`/`demoVideo` exists the frame shows it and the tag disappears (`DemoVideo` states inside the frame); metric strip (`paper-2`, torn-fill) with 3 pinned `Sheet index` metric cards (value Fraunces, kind badge **Inter**, `asOf`, `Source:`) + the "smaller, honest number" annotation only for ≥ 2 metrics, section omitted for 0–1; overview: eyebrow, annotation, `OverviewToggle` as folder tabs (`role="radiogroup"`), notebook with `thirtySecond` on ruled lines; thin projects: no toggle, "Deep dive coming" kraft tag with the status label; `NextProject` navy band (torn, kraft eyebrow, h2 `{name} →`, "next up" annotation, whole band a link, kraft focus ring). `generateStaticParams`/OG untouched.
- **Objective:** A template that renders every one of the 11 projects honestly — rich or thin — in the paper form.
- **Product requirement:** Design.md §7.3 (header · metric strip · overview · next), §7.9 states, §3.3 rows (2 · 2 · 2 · 2), §11 Dev-13; Solution-PRD §12.3 (`/work/[slug]`), §12.5d; decisions S18 (honest placeholder), PB4, TP8; EVAL-002, EVAL-007, EVAL-014, EVAL-018, EVAL-013.
- **Acceptance criteria:** (1) all 11 slugs build and render at 390 & 1440 with no invented content (Playwright sweep over `generateStaticParams`); (2) `teachspark` (rich) shows 3 metric cards + annotation; a thin slug shows no metric section and the "Deep dive coming" tag; (3) `DemoVideo` four states still pass `tests/e2e/eval-014.spec.ts` inside the photo frame (fixture); (4) overview tabs keyboard-operable; `#deep` and `#01-context…` anchors unchanged (TP8 tests); (5) EVAL-018: header 2 · metric strip 2 (or absent) · overview 2 · next 2; kind badges Inter; (6) "Hero media coming" tag text is navy on kraft ≥ 4.5:1 (axe); (7) `tests/e2e/case-study.spec.ts` updated, EVAL-002 hop `/work → /work/[slug]` green.
- **Definition of Done:** Paper DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-007, EVAL-013, EVAL-014, EVAL-018, EVAL-021
- **Blockers:** none · **Target sequence:** Phase B · **Owner:** Claude

### TKT-82 · Case-study template part 2: "What I learned" renders `learnings[]` (S18, regression test) + derived "Sources" section
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-81
- **Description:** Two new sections per Design.md §7.3: `Learnings` (`section.learned`, `paper-2`, torn; grid `1fr 1.35fr`; notebook with a numbered list — Caveat numerals `data-hand="label"`, Inter 16 on 32 px lines; omitted when `learnings` is empty) and `Sources` (`section.sources`, dashed rule, h2 "Where every line on this page comes from", 2-column `<ol>` of the project's **unique** source labels derived from `metrics[].source` + artifact sources — public URL where one exists; no new content). **Regression test (S18):** `tests/unit/case-study-learnings.test.tsx` asserts every `learnings[]` string of a fixture renders once and the section is absent for `[]`; `tests/unit/case-study-sources.test.ts` asserts de-duplication and that every rendered label exists in the data.
- **Objective:** Previously defined-but-unrendered data becomes visible, and provenance gets a page-level index, without adding a single new fact.
- **Product requirement:** Design.md §7.3 (What I learned, Sources), §3.3 (1 · 0); decisions S18; Solution-PRD §12.3, §12.5d, §7 truth rules; EVAL-003, EVAL-013, EVAL-018.
- **Acceptance criteria:** (1) `teachspark` shows its `learnings[]` verbatim; a thin slug with `[]` shows no section; (2) Sources lists each unique label once with a link only where the data has a public URL; labels are byte-equal to data; (3) EVAL-018: learned 1 (`torn`), sources 0; `<ol>` inside Sources is not a flat-zone violation (no decoration inside); (4) crawler: source links resolve or are allow-listed (EVAL-011); (5) the two regression tests are named TCs at Stage 6 and green.
- **Definition of Done:** Paper DoD + Truth.
- **Related TC:** TC-TBD (S18 learnings regression) · **Related EVAL:** EVAL-003, EVAL-011, EVAL-013, EVAL-018
- **Blockers:** none · **Target sequence:** Phase B · **Owner:** Claude

### TKT-83 · Case-study deep dive: chapters with `data-flat` prose, `ChapterNav` (hidden < 1024, Dev-09), the 8 artifact paper forms (Dev-04), `ShowTheThinking` chain
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:8
- **Parent / related:** — (tasks TSK-42…44 below) · **Dependencies:** TKT-81
- **Description:** Per Design.md §7.3 (Deep dive): `section#deep` grid `200px 1fr`, sticky `ChapterNav` (Fraunces 16, Caveat numerals `data-hand="label"`, ink underline on `aria-current`; **not rendered < 1024**); chapters as nested `<section class="chapter">` (h2 with Caveat numeral label, `Prose` **`data-flat`** ≤ 68ch, artifact cluster ±0.6°); artifact forms, all `data-paper`: `insight` hand pull-quote (`blockquote data-hand="quote"` + cite + Source), `hypothesis` note card with Caveat labels and **Inter** text + status pill, `metric` pinned ruled index card, `decision` ivory card with Chosen/Rejected labels, `evaluation` paper-2 `dl` with Caveat `dt`, `experiment` Setup/Result/Learning, `prototype` taped 16:9 frame (image/video/alt-as-caption), `generic` kraft doc tag; `ShowTheThinking` nested section: sr-only h2, "Show the thinking ↓" button (`aria-expanded`), annotation "the chain, start to finish", dashed chain `Sketch`, 42 px medallions with Caveat numerals, pinned Inter label tags, text ≤ 60ch, source links; nodes in the DOM collapsed, 120 ms stagger reveal, never auto-plays, all-at-once under reduced motion. `/dev/artifacts` and `/dev/thinking` boards restyled.
- **Objective:** The evidence layer in paper, with the flat reading zones that keep a case study from reading as a scrapbook.
- **Product requirement:** Design.md §7.3 (deep dive, artifacts, Show the thinking), §3.2 rule 4 (flat zones), §3.3 (0 · 0 · 2), §3.4, §8, §11 Dev-04/09; decisions D4 (vertical chain), DC1, TP8; EVAL-003, EVAL-006, EVAL-007, EVAL-010, EVAL-018.
- **Acceptance criteria:** (1) every chapter `Prose` is inside `[data-flat]` and contains 0 `[data-decor]` at both widths (EVAL-018 rule 4) while `data-hand="quote"` blockquotes remain allowed; (2) all 8 artifact types render from `tests/unit/artifacts.test.tsx` fixtures with the §7.3 form and Inter for hypothesis text / kind badges / status text (Dev-04); (3) `ChapterNav` absent from the DOM < 1024, `aria-current` tracks the visible chapter ≥ 1024; anchors `#01-context…` resolve (TP8 tests); (4) `ShowTheThinking`: button toggles `aria-expanded`, 8 nodes revealed in order on click only, keyboard path green (EVAL-007), reduced motion all-at-once (EVAL-010); (5) EVAL-018: deep-dive outer 0, each chapter 0, thinking 2; (6) axe 0 critical/serious on `/work/teachspark` at 390 & 1440; (7) `tests/e2e/{artifacts,case-study}.spec.ts` updated; EVAL-003 mapping unchanged (TKT-39 traceability still 8/8).
- **Definition of Done:** Paper DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-003, EVAL-006, EVAL-007, EVAL-010, EVAL-018, EVAL-013
- **Blockers:** none · **Target sequence:** Phase B · **Owner:** Claude

#### TSK-42 · `Chapter` + `ChapterNav` + `Prose` flat + deep-dive grid
- **Type:** Task · **Priority:** P0 · **Effort:** sp:2 · **Parent:** TKT-83 · **Dependencies:** TKT-81
- **Files likely affected:** `components/case-study/{Chapter,ChapterNav}.tsx`, `components/common/Prose.tsx`, `app/work/[slug]/page.tsx`, `tests/unit/anchors.test.ts`, `tests/e2e/case-study.spec.ts`.

#### TSK-43 · The 8 artifact paper forms + `ArtifactShell`/`ArtifactGrid` cluster + `/dev/artifacts`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:3 · **Parent:** TKT-83 · **Dependencies:** TSK-42, TKT-70
- **Files likely affected:** `components/case-study/artifacts/*.tsx`, `app/dev/artifacts/page.tsx`, `tests/unit/artifacts.test.tsx`, `tests/e2e/artifacts.spec.ts`.

#### TSK-44 · `ShowTheThinking` + `ThinkingNode` chain on paper + `/dev/thinking`
- **Type:** Task · **Priority:** P0 · **Effort:** sp:3 · **Parent:** TKT-83 · **Dependencies:** TSK-42
- **Files likely affected:** `components/interactions/{ShowTheThinking,ThinkingNode}.tsx`, `app/dev/thinking/page.tsx`, `tests/unit/thinking-motion.test.ts`, `tests/e2e/eval-007.spec.ts`, `tests/e2e/eval-010.spec.ts`.

### TKT-84 · `/thinking` opener + essays ruled sheet (Dev-02 empty-state line) and `/thinking/[slug]` essay page — double "Draft — pending sign-off:" prefix fixed (S18, regression test); quiet-close dropped (D9)
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Dependencies:** TKT-79
- **Description:** Per Design.md §7.5–7.6: `ThinkingHero` grid `52fr 48fr` (eyebrow, oversized h1 "Thinking" + underline sketch, hand-sub annotation, taped `scene-thinking` photo with caption); essays section (`paper-2`, torn): visible h2 **"Essays"** with the underline sketch, the Inter empty-state line "Essays in progress — five drafts, none published yet." while 0 essays are published (Dev-02), sticky "start here ↓", margin annotation rendered **only ≥ 1320** (removed from the DOM below), the `Sheet notebook` with 5 entry rows (Caveat numeral label, h3 link, dek, meta with reading time · related project · `DraftTag`). Essay page: `article` grid `minmax(0,68ch) minmax(220px,1fr)`, crumb "← Thinking" (`data-hand="cta"`), header (eyebrow "Essay · nn", h1, dek, meta with **one** `DraftTag`), `.prose` **`data-flat`** with each passage as `blockquote.pull data-hand="quote"` + Inter cite and the framing paragraph in Inter — **`EssayBody` stops prefixing "Draft — pending sign-off: "** so the data's own prefix renders once; pager; margin aside (`aria-label="Pinned to the margin"`) with the pinned 5:4 photo + one generic sticky. The mockup's "quiet close" section is **not built** (D9 default; if Tushar keeps it, a follow-up ticket adds it with 2 decorations). **Regression test (S18):** `tests/unit/writing.test.ts` + `tests/e2e/thinking.spec.ts` assert the string "Draft — pending sign-off:" occurs exactly once per essay page.
- **Objective:** The editorial voice in paper with the DRAFT status stated once, honestly.
- **Product requirement:** Design.md §7.5, §7.6, §3.3 (opener 3 · essays 4 · essay 2), §11 Dev-02/16/17; decisions S18, D9, D7; EVAL-006, EVAL-011, EVAL-013, EVAL-018.
- **Acceptance criteria:** (1) 5 entries from `data/writing.ts` in order, each linking to its slug; the empty-state line present while `published` count is 0 and absent otherwise (fixture); (2) essay page: `DraftTag` once in the meta, prefix once in the paragraph (regression tests green), pull quotes ≤ 240 chars with cites; (3) EVAL-018: opener 3, essays 4 at 1440 / 3 at 390 (margin annotation removed from the DOM < 1320), essay 2, `.prose` flat with 0 decorations; (4) pager prev/next resolve (crawler); (5) no overflow at 390; margin moves under the header < 900; (6) reduced motion: underline drawn complete.
- **Definition of Done:** Paper DoD.
- **Related TC:** TC-TBD (S18 double-prefix regression) · **Related EVAL:** EVAL-006, EVAL-011, EVAL-013, EVAL-018, EVAL-021
- **Blockers:** D9 confirmation (non-blocking; default drop) · **Target sequence:** Phase B · **Owner:** Claude

### TKT-85 · Phase B gate: 11 slugs + 5 essays at 390/1440, `pnpm eval`, one rich + one thin mockup pair
- **Backlog ID:** _Stage 6_ · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:2
- **Dependencies:** TKT-80, TKT-82, TKT-83, TKT-84
- **Description:** Playwright screenshot sweep of `/work`, all 11 `/work/[slug]`, `/thinking`, all 5 essays at the four widths → `docs/screenshots/m-009/phase-b/`; full `pnpm eval` diffed against the tracer baseline (EVAL-018 must be green on every Phase 0–B route; remaining parked hits only on `/about`, `/playground`, `/contact`, 404); side-by-side pairs for `work.html`, `case-study.html` (teachspark + one thin slug), `thinking.html`, `essay.html` captured for Stage 8; Tushar's Phase-B approval recorded; `HANDOFF.md` updated.
- **Acceptance criteria:** (1) 0 overflow, 0 sub-44 px controls, axe 0 critical/serious across the sweep; (2) EVAL-018 green on every Phase B route; (3) no Critical regression vs baseline; (4) EVAL-005 on `/work/teachspark` recorded; (5) approval recorded.
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-008, EVAL-018, EVAL-022 (evidence)
- **Blockers:** Tushar — Phase-B checkpoint · **Target sequence:** Phase B (gate) · **Owner:** Claude

### Phase C · About · Playground · Contact · 404

### TKT-86 · `/about` part 1: scene-bleed hero + stats card + pull-quote note (Dev-10), product journey path, capability notebooks, impact index cards
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Dependencies:** TKT-85
- **Description:** Per Design.md §7.4: `AboutHero` = `scene-about` bleed (`clamp(520px, 62vw, 860px)`, masks) with the copy in the sky (eyebrow, three-line h1 + `DraftTag`, hand-sub annotation `aria-hidden` — Dev-10), the taped stats card (10+ / 3 / ∞, explanatory line in Inter 13), caption annotation, pull-quote on a pinned `Sheet index` (`blockquote data-hand="quote"` + `DraftTag`); `ProductJourney` = 4 pinned year cards over the path sketch + "start here ↘" annotation (both removed from the DOM < 900), closing line as Fraunces lead + `DraftTag`; `CapabilityClusters` = 4 `Sheet notebook`s on a 12-col grid with hand-drawn ticks; `Impact` = tier 1 eight pinned ruled index cards (kind badge **Inter** + asOf + Source), tier 2 résumé groups with Inter labels, sticky "dated, labelled, never rounded up." (DC2 tiers preserved).
- **Objective:** The person and the proof of level, in paper, with every number still dated and labelled.
- **Product requirement:** Design.md §7.4 (hero · journey · capabilities · impact), §3.3 (2 · 3 · 1 · 2), §11 Dev-04/10; decisions DC2, S18, D7; EVAL-002 (résumé reachable — via the band), EVAL-006, EVAL-008, EVAL-013, EVAL-018.
- **Acceptance criteria:** (1) copy from `data/{experience,skills,impact}.ts` (unit snapshots); (2) the DRAFT subline is `aria-hidden` and the h1 carries the narrative (Dev-10 — screen-reader text checked in `tests/e2e/about.spec.ts`); (3) EVAL-018 per section = 2 / 3 (1 at 390) / 1 / 2; (4) impact cards: value + label + context + kind badge (Inter) + asOf + Source on every card; (5) scene = one `<img>`, alt from the manifest; < 900 copy stacks above a 4:3 masked photo; (6) no overflow at 390; stats 2-up ≤ 640.
- **Definition of Done:** Paper DoD + Truth.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-008, EVAL-013, EVAL-018, EVAL-021
- **Blockers:** none · **Target sequence:** Phase C · **Owner:** Claude

### TKT-87 · `/about` part 2: experience timeline always-open (Dev-11) with the lead fixed (S18, regression test), awards · research · education, page-foot CTA, assembly
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Dependencies:** TKT-86
- **Description:** Per Design.md §7.4: `ExperienceTimeline` = vertical dashed rail (`220px 1fr`), sticky company node (Fraunces 24, Inter tabular dates), `StoryCard` as `Sheet card` with the `dl` in **`data-flat`** (Context/Role/Scale/What changed/Outcomes with kind badges, "not recorded" Inter italic, Source), **all four roles rendered open** with `id="experience-{id}"` anchors preserved (Dev-11; the click-to-open + URL-hash logic and its tests are removed); lead **fixed** to "Four roles, oldest to newest — open any node for the context, scale, and what changed." (S18); `Awards` as 3 kraft-eyelet tags, `Research` patent card with the "TP" stamp note + papers list ("DOI pending" as an Inter `Tag`), `Education` on a kraft rule + Inter languages line; `section#about-cta` (h2 "Let's build what's next.", "Let's talk", `resumeAction()`, colophon TP10 wording); `/about` assembled hero → journey → capabilities → impact → experience → proof → CTA → band. **Regression test (S18):** `tests/unit/experience-skills.test.ts` asserts the lead string and that the rendered order is oldest → newest matching the data.
- **Objective:** Close the About page with the timeline honest about its order and keyboard-trivial.
- **Product requirement:** Design.md §7.4 (experience · proof · CTA), §3.2 rule 4 (story `dl` flat), §3.3 (1 · 2 · 1), §11 Dev-04/11/16; decisions S18, TP10; EVAL-002 (résumé from `/about`), EVAL-007, EVAL-013, EVAL-018.
- **Acceptance criteria:** (1) four story cards open on load, anchors `#experience-<id>` scroll to the card (`tests/e2e/timeline.spec.ts` rewritten; `timeline-logic.ts` open/close logic deleted with its tests); (2) lead regression test green; order oldest → newest; (3) EVAL-018: experience 1, proof 2, CTA 1; every story `dl` inside `[data-flat]` with 0 decorations; (4) résumé control renders `resumeAction()` (placeholder state PB5) — EVAL-002 path from `/about`; (5) patent link + DOI pill resolve (crawler); "DOI pending" is Inter; (6) axe 0 critical/serious at 390 & 1440.
- **Definition of Done:** Paper DoD + Truth.
- **Related TC:** TC-TBD (S18 timeline-lead regression) · **Related EVAL:** EVAL-002, EVAL-007, EVAL-011, EVAL-013, EVAL-018
- **Blockers:** none · **Target sequence:** Phase C · **Owner:** Claude

### TKT-88 · `/playground` bench (Dev-07) · `/contact` opener + postcard + `CopyButton` states · 404 with the tools sketch
- **Backlog ID:** _Stage 6_ · **Type:** Feature · **Priority:** P1 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Parent / related:** — (tasks TSK-45…47 below) · **Dependencies:** TKT-85
- **Description:** Three small pages per Design.md §7.7, §7.8, §4.3. **Playground:** opener (eyebrow, h1 + underline sketch, "go poke at it" annotation with arrow, wide masked `scene-playground` with the caption chip), bench board (`paper-2`, torn; h2 eyebrow + annotation; four cards on the 12-col board — lined index card / kraft label / pinned card / wide taped card — Caveat numeral label, h3, tagline, live link with external icon + sr-only "(opens in new tab)" + `rel="noopener"`; **no tone line, no Caveat notebook sheet** — Dev-07; tools `Sketch` bottom-right). The mockup's quiet close is not built (D9). **Contact:** opener grid `44fr 56fr` with the taped `scene-contact` portrait + caption + the sticky "No form here…", copy column (eyebrow, h1 "Still curious?", annotation, actions `<ul>` with Caveat numerals: address + `CopyButton` idle/copied/error states with the selectable `<output>` fallback and sr-only live region · "Email me →" mailto · "LinkedIn ↗" · `#resume` row with `resumeAction()` + visible note), location line "Bengaluru, India" (already on this page today — unchanged); details section (`paper-2`, torn; annotation + arrow sketch; `Sheet postcard` with the stamp chrome, rows email/linkedin/github/from, Caveat labels `data-hand="label"`, Inter values). **404:** one `paper` section — eyebrow "Lost?", h1 "This page wandered off.", lead, "Back home" / "See the work" / "Get in touch", the tools sketch reused; band follows.
- **Objective:** Close the funnel's remaining routes in paper with their screen states and PII rules intact.
- **Product requirement:** Design.md §7.7, §7.8, §4.3, §7.9 (`CopyButton`), §3.3 (3 · 3 / 3 · 3 / 1), §11 Dev-07; decisions S10, D9, EXE-8; Solution-PRD §12.3; EVAL-002 (contact endpoint), EVAL-007 (`CopyButton`), EVAL-011 (external links), EVAL-013/016 (PII), EVAL-018.
- **Acceptance criteria:** (1) playground: 4 experiments from data, live URLs in new tabs with `rel="noopener"`, no tone/status line, 6-col ≤ 1024, 1-col ≤ 640; (2) contact: copy → "Copied" 2 s; clipboard failure → "Copy failed" + selectable address (`tests/unit/copy-button.test.tsx` + `tests/e2e/contact.spec.ts` updated); mailto/LinkedIn/résumé resolve; no phone/DOB/address anywhere (PII grep); (3) 404: renders at `/definitely-missing` with the three CTAs and the band, axe clean (`tests/e2e/not-found.spec.ts`); (4) EVAL-018: playground 3 / 3, contact 3 / 3, 404 = 1; postcard labels are valid `data-hand="label"` (≤ 3 words); (5) no overflow at 390; portrait max 420 px < 900.
- **Definition of Done:** Paper DoD + Sec.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-002, EVAL-007, EVAL-011, EVAL-013, EVAL-016, EVAL-018, EVAL-021
- **Blockers:** D9 confirmation (non-blocking; default drop) · **Target sequence:** Phase C (parallel with TKT-86/87) · **Owner:** Claude

#### TSK-45 · `/playground` opener + bench board
- **Type:** Task · **Priority:** P1 · **Effort:** sp:2 · **Parent:** TKT-88 · **Dependencies:** TKT-85
- **Files likely affected:** `components/playground/{PlaygroundHero,PlaygroundGrid}.tsx`, `app/playground/page.tsx`, `tests/e2e/playground.spec.ts`.

#### TSK-46 · `/contact` opener + actions list + postcard + `CopyButton` states
- **Type:** Task · **Priority:** P1 · **Effort:** sp:2 · **Parent:** TKT-88 · **Dependencies:** TKT-85
- **Files likely affected:** `components/contact/ContactCard.tsx`, `components/common/CopyButton.tsx`, `app/contact/page.tsx`, `tests/unit/copy-button.test.tsx`, `tests/e2e/contact.spec.ts`.

#### TSK-47 · 404 in the paper system
- **Type:** Task · **Priority:** P2 · **Effort:** sp:1 · **Parent:** TKT-88 · **Dependencies:** TSK-45 (tools sketch)
- **Files likely affected:** `app/not-found.tsx`, `tests/e2e/not-found.spec.ts`.

### Phase D · Dead-code removal · redesign QA · record run · deviations · PWA sync · hand-off

### TKT-89 · Dead-code removal (S11): clay primitives + tiers, aurora/glow, avatar system + assets + scripts, Manrope, `Footer`, codemod script
- **Backlog ID:** _Stage 6_ · **Type:** Chore · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-78, TKT-87, TKT-88 (every consumer migrated)
- **Description:** Delete-only diff: `components/clay/*` + `tiers.ts` + `tests/unit/{clay,ClayButton,ClayCard,ClayPrimitives,tiers}.test.tsx` + `tests/e2e/primitives.spec.ts` (replaced by the paper board tests); the M-008 aurora/glow layer (CSS + any `Aurora` component); `public/avatar/*`, `content/media/avatar/`, `scripts/{avatar,avatar-poses}.ts` + `media:avatar`/`media:poses` package scripts + `public/avatar/avatar-blur.txt`; `components/layout/Footer.tsx`, `components/navigation/NavPill.tsx`, `components/hero/{Annotation}.tsx` (replaced by `paper/Annotation`), `scripts/codemod-tokens.ts`; `DESIGN_DIRECTION.md` replaced by a one-paragraph "superseded by Design.md (S11)" stub; `COMPONENT_ARCHITECTURE.md` §1 updated to the paper tree; `docs/eval.md` current. Then `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, `pnpm tokens:check`, `bundle-budget --json`, `pnpm audit`.
- **Objective:** Nothing of the clay or M-008 visual layer survives in the tree, so EVAL-020's "0 retired names" and EVAL-005 hold on the real code, not on tree-shaking luck.
- **Product requirement:** Solution-PRD §12.2 (removed, not restyled), §12.9 Phase D; decisions S11, S14, D12; evaluation-plan §8.5 (dead code → EVAL-020 + Stage-9 review).
- **Acceptance criteria:** (1) `grep -ri "clay\|aurora\|avatar\|manrope"` over `app/ components/ lib/ hooks/ public/ content/ scripts/ package.json` returns only the historical mentions in docs and the OG allow-list comment; (2) `pnpm build` output lists no `public/avatar` asset; (3) EVAL-020 13/13 · 0 · 0 and EVAL-016 PII grep green; (4) `bundle-budget --json` ≤ 180 kB gz recorded; (5) 316+ unit / Playwright counts reconciled: every deleted test is replaced or its behaviour no longer exists (listed in the PR description); (6) `git diff --stat` shows deletions + the two doc updates only.
- **Definition of Done:** Base DoD + Perf + Sec.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-005, EVAL-016, EVAL-020
- **Blockers:** none · **Target sequence:** Phase D · **Owner:** Claude

### TKT-90 · Redesign QA sweep: responsive · a11y · reduced motion · EVAL-018/019/020/021 · contrast · mockup-pair screenshot pack for Stage 8
- **Backlog ID:** _Stage 6_ · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:5
- **Dependencies:** TKT-89
- **Description:** Every route (sitemap + 11 slugs + 5 essays + 404) at 390/768/1024/1440: overflow, ≥ 44 px targets, ≥ 12 px text (EXE-7 micro-label rule), intrinsic image sizes, axe at 390 & 1440, keyboard scripts (nav + sheet, tabs, `details`, folder tabs, Ask inline + panel, Show the thinking, `CopyButton`, band links), reduced-motion run (every §8 row collapses; hero poster only), token-pair contrast check of every pair actually used (§2.1 table), EVAL-018 full sweep 0/0/0/0, EVAL-019 4/4, EVAL-020, EVAL-021 automated + the **manual per-asset checklist** drafted (`evals/results/eval-021-<sha>.md`: depicts no metric/logo/UI/claim) for Stage 8 to confirm; the Stage-8 screenshot pack `docs/screenshots/m-009/<route>/<width>.png` **plus** mockup pairs (`docs/redesign-mockups/m-009/*.html` rendered at 1440/390 beside the built route) for EVAL-022; fixes as small commits or `QA-###` rows with reasons.
- **Acceptance criteria:** (1) 0 overflow, 0 sub-44 px controls, 0 sub-12 px text across routes × widths; (2) axe 0 critical/serious everywhere incl. 404; (3) 100 % of the keyboard flows completable with visible focus (2 px rust, 3 px offset); (4) EVAL-018/019/020/021 green in one `pnpm eval` run; (5) screenshot + mockup-pair packs committed; (6) defects fixed or `QA-###` logged; (7) VoiceOver notes for `/`, `/work/teachspark`, `/about` appended to `docs/a11y-pass.md`.
- **Definition of Done:** Base DoD.
- **Related TC:** TC-TBD · **Related EVAL:** EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-018, EVAL-019, EVAL-020, EVAL-021, EVAL-022 (evidence)
- **Blockers:** none · **Target sequence:** Phase D · **Owner:** Claude (QA-tester subagent, separate from implementers)

### TKT-91 · Hand-off to Stages 8–10: preview record run (`eval-run-m009-rc-<sha>.json`), OG inspector pass, `Design.md` §11 current, PWA sync, HANDOFF
- **Backlog ID:** _Stage 6_ · **Type:** Task · **Priority:** P0 · **Status:** Planned · **Milestone:** M-009 · **Effort:** sp:3
- **Dependencies:** TKT-90
- **Description:** Deploy the branch preview; run the complete `pnpm eval` against the preview URL and persist `evals/results/eval-run-m009-rc-<sha>.json` with provenance (commit, branch, environment = preview, dataset v1.1.0, `bundle-budget --json` number, Lighthouse LCP element); repeat the manual EVAL-017 pass (LinkedIn Post Inspector + opengraph.xyz, 7 families, screenshots → `docs/og/m-009/`); reconcile `Design.md` §11 with every deviation found in Phases 0–D (dispositions recorded; Tushar's pending rows resolved or still marked pending); update `tickets.md` statuses, `milestones.md` M-009 status, Campfire (milestone, tickets, tasks, `sp:`), `HANDOFF.md` (Stage 8 inputs: pack paths, open `QA-###`, parked EVAL hits, the eval-021 checklist), Obsidian + auto-memory mirrors; present the Session-Clearing block.
- **Acceptance criteria:** (1) every Critical EVAL PASS and no High unaddressed or explicitly parked with a reason (evaluation-plan §6 + §8.4); (2) EVAL-005 ≤ 180 kB gz from `bundle-budget --json` on the record run; LCP element = hero poster on the preview; (3) 7/7 OG families render on both inspectors in the paper skin; (4) `Design.md` §11 has a row for every deviation the packs show; (5) `git diff main..HEAD --stat` reviewed — only intended files; (6) PWA synchronized (statuses, `sp:`, dependencies); (7) HANDOFF names exactly what Stage 8 must open.
- **Definition of Done:** Base DoD + Perf + Sec + `[ ] Record run persisted with provenance` + `[ ] PWA synchronized`.
- **Related TC:** TC-TBD · **Related EVAL:** all 22 (record run); EVAL-017 (manual), EVAL-022 (evidence hand-off)
- **Blockers:** Tushar — inspector logins if required · **Target sequence:** Phase D (last) · **Owner:** Claude

### M-009 granularity & blocking-edge questions for Tushar (Stage 5 gate — answer before Stage 6)
1. **Gate strictness.** Phase gates (TKT-74, TKT-79, TKT-85) are hard blockers of the next phase, matching §12.9's sequential phases; only TKT-78 (OG) runs across the Phase-0 gate. Keep strict, or allow Phase B build tickets to start once the hero is approved and treat the Phase-A gate as review-only?
2. **Token codemod in the tracer (TKT-69).** The 13-count gate forbids expand→migrate→contract, so the tracer renames every retired token repo-wide in one commit; legacy pages render in paper colours with clay shapes until their phase. Accept, or prefer a temporary 26-token `tokens-check` exemption (a decision entry) so the swap can be page-by-page?
3. **Case-study split.** TKT-81 (header · metrics · overview · next) + TKT-82 (learned + sources) + TKT-83 (deep dive, sp:8 with 3 tasks). Merge 81+82, or keep 82 separate because it is the S18 "render unrendered data" scope with its own regression tests?
4. **Phase C bundling.** `/playground` · `/contact` · 404 share TKT-88 (three tasks, sp:5). Split into three tickets for the PWA, or keep one?
5. **Pending decisions carried as variants:** D8 five-item nav (TKT-71), D9 quiet-close dropped (TKT-84/88), "Bengaluru, India" flag default off (TKT-72), `AskPanel` kept (TKT-77). Confirm the defaults now so Stage 6 plans one variant each, or leave them open until each ticket's dispatch?

---

## Appendix A · Dependency edges (adjacency, for the Stage 6 Gantt)

```
TKT-01 → {02, 03, 22, 23, 24, 25, 26, 27}          (PB1: 03 no longer waits for the gate)
02 → {04, 06}                                       (visual foundations only)
03 → {07, 08, 09, 12, 13, 15, 40, 43}
04 → {05, 10, 12, 13, 16, 18, 20, 21, 40, 44, 45}
05 → {10, 12, 13, 16, 19, 21, 40, 43, 44, 45, 46}
06 → {14, 16, 19, 40, 43, 44, 45}  ;  06 ⇢ 07 (TSK-10 upgrades from static route list to sitemap)
07 → {09}
08 → 53 (hard, PB5)  ;  08 ⇢ {01, 05, 45, 50} (flips the placeholder; never blocks them)
09 → 10 → 11 → 14 ;  12 → {14, 15} ;  13 → 14
15 → {16, 19, 44} ;  16 → 17 ;  18 → 19 ;  19 → {28…33, 54} ;  20 → {28…33, 54, 40} ;  21 → {28…33, 54}
22 ⇢ 28 ; 23 ⇢ 29 ; 24 ⇢ {30, 31} ; 25 ⇢ 33 ; 26 ⇢ 54 ; 27 ⇢ 32          (PB4: all media soft for content)
{22, 23, 24} → 50                                                          (PB4: featured-3 videos hard for deployment)
{28, 29, 30} → 39
40 → 41 → 42
{14, 16, 17, 19, 28…33, 54, 42, 43, 44, 45, 46} → {47, 48, 49}
{47, 48, 49, 22, 23, 24} → 50 → 51 ;  {39, 47, 48, 49, 50, 51} → 52 ;  {52, 08} → 53 (+ Stage 8–10 gate)
```
`→` hard blocker · `⇢` soft (content ships with the honest no-video / placeholder state).

## Appendix B · Critical path (longest hard chain)

TKT-01 → TKT-02 → TKT-04 → TKT-05 → TKT-12 → TKT-15 → TKT-19 → TKT-28 (TKT-20/21 in parallel) → TKT-39 → TKT-48 → TKT-50 → TKT-51 → TKT-52 → TKT-53. After PB1 the schema/harness chain (TKT-01 → 03 → 07 → 09) runs off the gate's path in parallel, so the visual-foundation chain through TKT-04/05/12 is now the spine. Media capture (TKT-22/23/24) must close before TKT-50 (PB4). Tushar's inputs on the path: TKT-02 approval, TeachSpark metric date (TKT-28), sanitised resume (TKT-08 → TKT-53), domain (TKT-53), Stage 8–10 sign-off.

## Appendix C · Deliberately not ticketed
Dark mode / theme toggle (S9) · contact form backend (S10) · RAG provider beyond the stub (S7) · CMS/MDX/blog/RSS · corporate case-study pages · analytics beyond Vercel basic · i18n · testimonials/logos/certifications · icon asset creation for Cubicle/Token Toli (cards use `ClayIcon`) · Stage 8–10 review work and `QA-report.md`/`lesson-learnt.md` authoring (workflow stages, not tickets) · any change to the cinematic site or `portfolio/index.html`.

**M-009 additions (Solution-PRD §12.4):** dark mode (S19) · new content, metrics or essays · new Higgsfield spend (dog-ear layer, 1080p upscale, a 404 illustration) · the Thinking/Playground "quiet close" sections (D9 default) · production go-live inputs (videos, sanitised résumé, domain — M-007's TKT-08/50/53 stand) · merging `m-008-visual-wow` on its own (S11) · Stage 8 critique / Stage 9 review / Stage 10 security + `QA-report.md` addendum (workflow stages; TKT-90/91 only prepare their evidence).

## Appendix D · M-009 dependency edges, critical path, Tushar inputs (for the Stage 6 Gantt)

```
Phase 0   69 → {70, 71, 72, 73, 78}
          70 → {71, 72, 73, 75, 76, 77, 80, 81, 82, 83, 84, 86, 87, 88}
          {71, 72, 73} → 74                                  (74 = tracer + hero gate, Tushar)
Phase A   74 → {75, 76, 77} ;  {69, 73} → 78                 (78 runs across the gate)
          {75, 76, 77, 78} → 79                              (79 = Phase-A gate, Tushar)
Phase B   79 → {80, 81, 84} ;  81 → {82, 83}
          {80, 82, 83, 84} → 85                              (85 = Phase-B gate, Tushar)
Phase C   85 → {86, 88} ;  86 → 87
Phase D   {78, 87, 88} → 89 → 90 → 91
```
`→` hard blocker. Inside a phase, tickets with no edge between them run in parallel with separate implementers (disjoint files): 71 ∥ 72 ∥ 73 · 75 ∥ 76 ∥ 77 ∥ 78 · 80 ∥ 81 ∥ 84 · 86 ∥ 88.

**Critical path (longest hard chain):** TKT-69 → 70 → 73 → 74 (hero gate) → 77 → 79 (gate) → 81 → 83 → 85 (gate) → 86 → 87 → 89 → 90 → 91 — 14 tickets, 60 sp of the 94. Tushar on the path: hero approval (74), Phase A/B checkpoints (79, 85), D8/D9/location/AskPanel confirmations (defaults applied if silent).

**sp by phase:** Phase 0 = 26 (69:5 · 70:5 · 71:3 · 72:3 · 73:8 · 74:2) · Phase A = 14 (75:3 · 76:3 · 77:3 · 78:3 · 79:2) · Phase B = 28 (80:5 · 81:5 · 82:3 · 83:8 · 84:5 · 85:2) · Phase C = 15 (86:5 · 87:5 · 88:5) · Phase D = 11 (89:3 · 90:5 · 91:3) · **total 94**.

**S18 regression tests (TC- rows at Stage 6):** `hero.tagline` in the band © bar (TKT-72) · `learnings[]` "What I learned" (TKT-82) · single "Draft — pending sign-off:" prefix (TKT-84) · About timeline lead wording + oldest → newest order (TKT-87).
