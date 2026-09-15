# Tickets — Clay Portfolio

Stage 5 (Problem Breakdown) · 2026-09-15 · 49 tickets in dependency order (blockers first), 162 sp — revised the same day after Tushar's answers to §0.5 (decisions PB1–PB5 in `decisions.md`). Consumes `Solution-PRD.md`, `Design.md`, `COMPONENT_ARCHITECTURE.md`, `SITEMAP.md`, `evaluation-plan.md`, `decisions.md`, `CONTENT_INVENTORY.md`. Companion: `milestones.md` (M-001…M-007). Consumed by Stage 6 (`technical-plan.md` atomic plans, `test-cases.md` TC-### authoring, Campfire PWA onboarding).

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
