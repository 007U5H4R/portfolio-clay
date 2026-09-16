---
id: TASK-1
title: >-
  TKT-01: Tracer bullet: scaffold + tokens + Header + Hero + card + baseline
  eval
status: Done
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 01:53'
labels:
  - P0
  - 'sp:8'
  - tracer
milestone: m-0
dependencies: []
priority: high
type: feature
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The thinnest end-to-end slice that kills the riskiest assumption: does premium claymorphism with the approved avatar and a shared-element card->case-study transition read as "Senior PM" on a real page at 390/768/1024/1440? Builds exactly: project scaffold with the Design.md `@theme` tokens, compacting Header (with MobileMenu so 390 renders), Hero with avatar cutout + eyebrow/headline/support + two CTAs + three floating tiles, one featured `ProjectCard` (TeachSpark) that transitions to a stub `/work/teachspark` whose `CaseStudyHeader` shell is the shared-element target, screenshots at four widths, and the first `pnpm eval` (minimal) run persisted as `baseline-v1.json`. Nothing else.

**Objective.** Fix the visual direction on evidence before any further build; establish the baseline every later eval compares against.
**Product requirement.** Solution-PRD §11 step 4; §5 Home hero spec; Design.md §2 (tokens), §3 Header/Hero/Featured Work/Case study header, §4 motion rows; decisions S2, S4/D5, D1, D2; evaluation-plan §5 baseline.
**Definition of Done.** Base DoD + Perf (recorded, not gated) + docs/screenshots/tracer/ contains 8 files + baseline-v1.json committed + resume placeholder state screenshot included.
**Notes.** Server components by default; `"use client"` only on Header scroll state, MobileMenu, Parallax, ViewTransitionLink. Fonts via `next/font` (Manrope 500-800, Caveat 500-600) with `display: swap`. The current `portfolio/resume.pdf` contains DOB/phone/address and is never copied into this repo (PB5); `.gitignore` still lists `public/resume.pdf` as a guard until TKT-08 lands. Hero support line is DRAFT copy (CONTENT_INVENTORY §1.2) - render it, flag it in the gate.
**Dependencies.** none (Stage 6 `technical-plan.md` must exist before dispatch - workflow guardrail). Sub-tasks TSK-01..TSK-07.
**Related EVAL.** EVAL-001 (informational), EVAL-006, EVAL-008, EVAL-010, EVAL-015 (VT fallback), baseline for EVAL-004/005.
**Target sequence.** Phase 1 · **Owner.** Claude (implementer subagents per task).
Source: tickets.md § TKT-01.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `pnpm dev`, `pnpm build` (static output), `pnpm typecheck`, `pnpm lint` succeed on Next 16 + TypeScript strict + Tailwind 4 + `motion` 13 + lucide-react + pnpm; zero required third-party runtime scripts.
- [ ] #2 `app/globals.css` `@theme` contains every token in Design.md §2 (colour, type scale, spacing, radius, the three clay shadows, utility shadow, volume gradient); OKLCH regenerated from the authoritative hex with `culori` (D2) and the hex round-trip diff is 0.
- [ ] #3 Header: 96px -> 68px after 24px scroll, 12px `backdrop-blur` + 80% `bg` only in compact state; NavPill slides via layout animation; nav `Home · Work · Thinking · About` + `AskAIButton` (disabled state with tooltip "coming in this build", never a dead control); `MobileMenu` full-screen dialog <768 with focus trap, `Esc`/backdrop close, focus return; `SkipLink` to `#main`; subtitle hides <768 (Deviation 5).
- [ ] #4 Hero: 35/65 grid >=1024, `AvatarStage` in hero-tier `ClayFrame` (sky/lavender duotone) at 480x600 / 520x650 / 360x450 / 280x350 per breakpoint; eyebrow, headline with "AI-native products" `accent` span + one-time 700ms wash, supporting line (<=44ch), CTA row ("View My Work ->" -> `/work` placeholder route; resume CTA per AC 10), three `FloatingTiles` (AI Products · People · Progress, copy from CONTENT_INVENTORY §1.2) with `useSpring` parallax (stiffness 120 / damping 20) gated behind `(hover:hover) and (pointer:fine)` and `prefers-reduced-motion: no-preference`; <=1 `Annotation`, `aria-hidden`; fixed mobile order avatar -> headline -> CTAs -> tiles.
- [ ] #5 Avatar renders from `public/avatar/avatar.webp` (transparent, >=1600px long edge) + 2x poster, alt "Clay illustration of Tushar Pathak at a laptop"; the cutout edge shows no halo at 1440 zoom 200%.
- [ ] #6 One `ProjectCard` (featured mode, card tier) for TeachSpark fed from a typed literal: `ClayIcon` -> name -> one sentence -> <=3 `Tag` -> `StatusBadge` -> ghost arrow; whole card is the link; hover rise 5px/icon 1.03/arrow +4px at 200ms; wrapped in `<ViewTransition name="project-teachspark">` with icon `icon-teachspark`; clicking navigates to `/work/teachspark` stub rendering `CaseStudyHeader` shell; Firefox/Safari fall back to plain navigation with identical end state.
- [ ] #7 Screenshots of `/` and `/work/teachspark` at 390/768/1024/1440 saved to `docs/screenshots/tracer/` (8 PNGs) via Playwright.
- [ ] #8 `pnpm eval` (minimal runner) executes Playwright + axe at 390 & 1440 on `/` and Lighthouse CI mobile + desktop on `/` (3 runs, median), writes `evals/results/baseline-v1.json` with commit, branch, timestamp, thresholds; result: axe 0 critical/serious, no horizontal scroll at the four widths, Lighthouse numbers recorded (informational baseline).
- [ ] #9 No other section, route, data file, or component beyond the list above exists in the tree.
- [ ] #10 Resume placeholder (PB5): a single `lib/site.ts` flag `resumeAvailable` (default `false`) drives every resume control. While `false`, the hero CTA (and the MobileMenu action) render a secondary `ClayButton` labelled "Resume - updating" linking to `/contact#resume` with a visually-hidden note "Sanitised resume coming - email me for a copy"; no `public/resume.pdf` exists in the tree or build output; the forbidden-string/PII test asserts the file is absent while the flag is `false`. When TKT-08 flips the flag, the same control renders "Download Resume" -> `/resume.pdf` (`download` attribute). Playwright covers both states.
<!-- AC:END -->
