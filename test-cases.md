# Test Cases — Clay Portfolio

Stage 6.4 (Technical Planning · planned test suite) · 2026-09-15 · **M-009 addendum 2026-09-24: TC-122…177 (see the M-009 section before Appendix A)** · consumes `Solution-PRD.md` (§5, §8), `evaluation-plan.md` (EVAL-001…017), `tickets.md` (TKT-01…54, TSK-01…29), `milestones.md` (M-001…007), `Design.md` (§2 tiers, §3 component states, §4 motion + reduced-motion mapping, §5 checklist, Deviations 1–6), `COMPONENT_ARCHITECTURE.md` §4–§5, `SITEMAP.md`, `decisions.md` (S1–S10, EV1–EV2, D1–D5, PB1–PB5). Consumed by Execution QA gates (Stage 7, per phase), Stage 9B (test execution), `QA-report.md`.

## 0. Conventions

- **IDs are stable.** `TC-001…TC-121` (v1) and `TC-122…TC-177` (M-009, 2026-09-24), never reused or renumbered. New cases append at the end (`TC-178+`); retired cases keep their ID with status `Retired — reason`. M-009 cases that supersede a v1 case for the paper system say so in their Notes; the v1 case stays as history.
- **Order.** Grouped by milestone in execution order; inside a milestone by ticket. Cross-cutting sweeps live in M-007 but are also run at each phase QA gate on whatever routes exist.
- **Fields per case.** Title · Related (M-/TKT-/TSK-) · EVAL · Component · Objective · Preconditions · Steps · Test data · Expected · Type · Priority · Automation (Y/N + tool) · Status · Defect ref · Notes. A case with **EVAL: —** is functional-only by design (no product-quality metric attached).
- **Types.** functional · integration · e2e · regression · negative · edge/boundary · validation · error-handling · accessibility · responsive · performance · security-functional · content-integrity · deployment-smoke · visual-review.
- **Tools.** Vitest (unit/data/schema/tag tests, node + jsdom) · Playwright (Chromium, projects `w390 / w768 / w1024 / w1440`, fixtures `reducedMotion`, `noViewTransitions`, `touch`) · axe (`@axe-core/playwright`, 0 critical/serious) · LHCI (`@lhci/cli`, mobile + desktop presets, 3-run median) · script (`scripts/*.ts` run inside `pnpm eval`) · manual (human or Claude review with persisted evidence).
- **Widths.** "4 widths" = 390 / 768 / 1024 / 1440. "Both widths" = 390 and 1440.
- **Status vocabulary** (filled in Stage 7/9): `Planned` → `PASS` / `FAIL` / `BLOCKED` / `NOT APPLICABLE`. A FAIL always carries a `QA-###` defect ref; failed cases are never deleted.
- **Positive controls.** Every gate-type test (schema gate, forbidden strings, dead-control crawler, PII test, pre-deploy check, budgets) has a deliberately failing fixture so "0 findings" is proven to mean "0 findings", not "scanner did nothing".
- **Truth rule.** Content-integrity cases compare rendered strings against `CONTENT_INVENTORY.md` rows by section number; the pack line is the oracle, never the ticket text.

---

## M-001 · Tracer bullet & visual direction approved

### TC-001 · Scaffold builds, type-checks and lints; static output; zero third-party runtime scripts
- **Related:** M-001 · TKT-01 (TSK-01) · **EVAL:** EVAL-005 (baseline)
- **Component:** project scaffold (`package.json`, `next.config`, `app/layout.tsx`)
- **Objective:** Prove the stack in TKT-01 AC 1 runs end-to-end before any feature is judged.
- **Preconditions:** clean checkout on the feature branch; pnpm store on E Drive.
- **Steps:** 1. `pnpm install --frozen-lockfile`. 2. `pnpm typecheck`. 3. `pnpm lint`. 4. `pnpm build`. 5. Inspect `.next` output mode and every `<script src>` in the built `/` HTML. 6. `pnpm dev` and load `/`.
- **Test data:** —
- **Expected:** all four commands exit 0; build is static (no server functions for v1 routes); no `<script src>` points off-origin; `/` renders with `<main id="main">`; `.gitignore` contains `public/resume.pdf`, `.env*`, `node_modules`, `.next`, Playwright artefact dirs.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — script (CI) · **Status:** Planned · **Defect:** —
- **Notes:** Third-party-script check is a Vitest over built HTML so it keeps running on every later ticket.

### TC-002 · Token file completeness and OKLCH round-trip (D2)
- **Related:** M-001 · TKT-01 (TSK-01) · **EVAL:** — (functional-only; feeds EVAL-009 indirectly)
- **Component:** `app/globals.css` `@theme`, `scripts/tokens-check.ts`
- **Objective:** Every Design.md §2 token exists and OKLCH values are exact conversions of the authoritative hex.
- **Preconditions:** TC-001 green.
- **Steps:** 1. Run `scripts/tokens-check.ts`. 2. Parse `@theme`; assert presence of every token name in Design.md §2 (13 colours, 6 type sizes + tracking/leading, 13 spaces, section gaps, container, 4 radii, 3 clay shadows, utility shadow, volume gradient). 3. For each colour: hex → oklch via `culori` → hex; diff against Design.md hex.
- **Test data:** Design.md §2 tables (hex column is the oracle).
- **Expected:** 0 missing tokens; round-trip diff 0 for all 13 colours; the three clay shadow strings match DESIGN_DIRECTION §5 verbatim.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Keeps running forever as the D2 guard; a token rename fails this test on purpose.

### TC-003 · Header compaction and NavPill
- **Related:** M-001 · TKT-01 (TSK-04) · **EVAL:** EVAL-010
- **Component:** `Header`, `NavPill`
- **Objective:** TKT-01 AC 3 geometry and motion, incl. reduced-motion mapping.
- **Preconditions:** `/` renders with enough height to scroll.
- **Steps:** 1. At 1440, measure header height at scrollY 0. 2. Scroll to 23px, measure; scroll to 25px, measure; wait 300ms. 3. Read computed `backdrop-filter` and background alpha in both states. 4. Navigate Home → Work; observe `NavPill` moves (layout animation) to the active item. 5. Repeat step 2 under `reducedMotion` fixture and assert transition duration is 0/instant.
- **Test data:** scroll offsets 0 / 23 / 25 px.
- **Expected:** 96px at rest, 68px after >24px; blur 12px and 80% `bg` only in compact; compaction transition 250ms ease (instant under reduced motion); pill wraps the active route label; header uses `env(safe-area-inset-top)`.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright (w1440 + reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** Subtitle "Senior Product Manager" hidden <768 (Deviation 5) is asserted in TC-007.

### TC-004 · MobileMenu dialog: focus trap, close paths, focus return, pinned actions
- **Related:** M-001 · TKT-01 (TSK-04) · **EVAL:** EVAL-007, EVAL-008
- **Component:** `MobileMenu`, `AskAIButton`, resume action
- **Objective:** The mobile menu is a real dialog (COMPONENT_ARCHITECTURE §4) with 44px targets and correct focus handling.
- **Preconditions:** viewport 390 (also run 768 where the hamburger shows).
- **Steps:** 1. Tab to hamburger; press Enter. 2. Assert `role="dialog"` + `aria-modal="true"`; Tab through all items and past the last one. 3. Press `Esc`. 4. Reopen; click backdrop. 5. Reopen; measure each nav row height and every control's box. 6. Assert `AskAIButton` and the resume action are the last two items, pinned at the sheet bottom. 7. Under `reducedMotion`, reopen and assert no transform animation.
- **Test data:** —
- **Expected:** focus never leaves the dialog while open; `Esc` and backdrop both close and return focus to the hamburger; rows 56px; every control ≥44×44; page behind is `inert`/not tabbable; menu contents included in the dead-control crawl (TC-037).
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright (w390, w768) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-005 · SkipLink and landmarks on every route
- **Related:** M-001 · TKT-01 (TSK-04); re-run every milestone · **EVAL:** EVAL-006, EVAL-007
- **Component:** `SkipLink`, `app/layout.tsx`
- **Objective:** First Tab on any route reveals a skip link that moves focus to `#main`; landmarks present.
- **Preconditions:** route list (static `tests/e2e/routes.json` until sitemap exists — PB1).
- **Steps:** 1. Load route; press Tab once. 2. Assert the skip link is visible (not `sr-only` while focused) top-left. 3. Press Enter; assert `document.activeElement` is inside `#main` and scroll moved. 4. Assert `header`, `main`, `footer`, `nav` landmarks exist exactly once (nav may repeat in footer with distinct `aria-label`).
- **Test data:** all routes.
- **Expected:** as above on every route at 390 and 1440.
- **Type:** accessibility · **Priority:** P1 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-006 · Tracer `AskAIButton` disabled state is not a dead control
- **Related:** M-001 · TKT-01 AC 3 · **EVAL:** EVAL-011
- **Component:** `AskAIButton` (pre-TKT-11)
- **Objective:** Before the panel exists the button must communicate state, not silently do nothing.
- **Preconditions:** TKT-11 not yet merged.
- **Steps:** 1. Locate header Ask AI button. 2. Assert `disabled` or `aria-disabled="true"`. 3. Hover/focus; assert tooltip text "coming in this build" is rendered and associated (`aria-describedby`). 4. Run the crawler rule: a disabled control with an accessible description is allowlisted as intentional.
- **Test data:** —
- **Expected:** disabled + described; crawler reports it as "intentionally disabled", not dead. After TKT-11 this case becomes `NOT APPLICABLE` and TC-050 takes over.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Time-boxed case; document the flip in the results file.

### TC-007 · Hero layout and stacking at the four widths
- **Related:** M-001 · TKT-01 (TSK-05) · **EVAL:** EVAL-008, EVAL-001
- **Component:** `Hero`, `AvatarStage`, `FloatingTiles`, `Header` subtitle
- **Objective:** Design.md §3 Hero geometry per breakpoint and the fixed mobile order.
- **Preconditions:** `/` built with the real avatar.
- **Steps:** 1. At 1440: assert 2-col grid ≈35/65, column gap 96px, container ≤1320px, `AvatarStage` 520×650. 2. At 1024: gap 64px, stage 480×600. 3. At 768: single column, stage 360×450 centred, text left-aligned. 4. At 390: stage 280×350, CTAs full-width stacked, tiles single column; DOM/visual order avatar → headline → CTAs → tiles. 5. Assert header subtitle absent <768 and present ≥768. 6. Assert `scrollWidth <= clientWidth` at all four widths. 7. Assert ≤1 `Annotation`, `aria-hidden="true"`, rotation ≤6°.
- **Test data:** —
- **Expected:** all measurements within ±2px of spec; no horizontal overflow; first viewport at 390 and 1440 contains name, eyebrow/title, headline with "AI-native products", ≥1 floating tile, both CTAs (structural precondition for TC-060).
- **Type:** responsive · **Priority:** P0 · **Automation:** Y — Playwright (4 widths) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-008 · Hero copy and the one-time "AI-native products" wash
- **Related:** M-001 · TKT-01 AC 4 (TSK-05) · **EVAL:** EVAL-001, EVAL-013
- **Component:** `Hero` headline/eyebrow/support/tiles
- **Objective:** Copy is verbatim from CONTENT_INVENTORY §1.2; the highlight wash runs once and is removed under reduced motion.
- **Preconditions:** —
- **Steps:** 1. Compare eyebrow, headline, support line (≤44ch), three tile labels (AI Products · People · Progress) and tagline against §1.2 rows. 2. Assert the `accent` span wraps exactly "AI-native products". 3. On first paint, sample the span's `background-position` at 0ms and 800ms; reload and assert no second animation (sessionStorage/one-time flag or CSS `animation-iteration-count: 1`). 4. Under `reducedMotion`, assert no animation on the span.
- **Test data:** CONTENT_INVENTORY §1.2.
- **Expected:** byte-identical copy; wash ≤700ms, runs once; support line flagged DRAFT in the gate notes (TC-018) since §1.2 marks it DRAFT.
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** "AI Product Manager" must not appear anywhere in the hero (covered mechanically by TC-022).

### TC-009 · Avatar asset files and alt text
- **Related:** M-001 · TKT-01 AC 5 (TSK-02) · **EVAL:** EVAL-006, EVAL-013
- **Component:** `public/avatar/*`, `AvatarStage`
- **Objective:** Production avatar files meet the size/format contract and the alt text is exact.
- **Preconditions:** TSK-02 done; `content/media/avatar/avatar-source.png` untouched (1856×2304).
- **Steps:** 1. Read `avatar.webp`, `avatar@2x.webp`, `avatar-poster.webp` metadata (sharp). 2. Assert alpha channel on the first two, opaque poster. 3. Assert long edge ≥1600px and file ≤300 kB for `avatar.webp`. 4. Render `/`; read the avatar `<img alt>`. 5. Assert source PNG checksum unchanged. 6. Assert a provenance line was appended to `content/media/avatar/candidates/README.md`.
- **Test data:** D5 job id `4f4d066f-…` in README.
- **Expected:** all assertions hold; alt = "Clay illustration of Tushar Pathak at a laptop"; `next/image` marks it `priority` (LCP candidate).
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-010 · Avatar cutout edge quality and likeness on the rendered page
- **Related:** M-001 · TKT-01 AC 5 (TSK-02), TKT-02 · **EVAL:** EVAL-009
- **Component:** `AvatarStage` on `/`
- **Objective:** No halo/fringe on the soft clay frame; ≤3 supporting objects; recognisably Tushar on the page, not just the PNG.
- **Preconditions:** `/` at 1440.
- **Steps:** 1. Zoom browser to 200%; inspect hair/beard/shoulder edges against the sky/lavender frame. 2. Count supporting objects (laptop, plant, books). 3. Tushar views the running page and confirms likeness in writing.
- **Test data:** —
- **Expected:** no visible halo or hard matte line; ≤3 objects; written "resembles me" recorded in `evals/results/gate-tracer.md`.
- **Type:** visual-review · **Priority:** P0 · **Automation:** N — manual (Tushar + Claude) · **Status:** Planned · **Defect:** —
- **Notes:** Hard gate (evaluation-plan §4 "avatar not recognisably Tushar" is a critical failure).

### TC-011 · Floating-tile parallax gating (pointer, touch, reduced motion) and depths
- **Related:** M-001 · TKT-01 AC 4 (TSK-05) · **EVAL:** EVAL-010
- **Component:** `Parallax`, `FloatingTiles`, `AvatarStage`
- **Objective:** Parallax runs only on fine pointers without reduced-motion; static everywhere else; depth ratios per spec.
- **Preconditions:** `/` at 1440 (pointer) and 390 (touch emulation).
- **Steps:** 1. Desktop, no preference: move mouse across the hero; sample tile transforms; assert three tiles move at ≈0.5×/1×/1.5× of the avatar offset and settle (≈450ms, spring 120/20). 2. Same viewport under `reducedMotion`: move mouse; assert transforms stay identity. 3. Emulate `(hover:none) and (pointer:coarse)` at 390; dispatch pointer/touch moves; assert identity transforms and no spring listeners attached (no `mousemove` handler registered on the stage). 4. Assert vertical offsets −24/0/+24px at rest.
- **Test data:** pointer path (200,200)→(900,600).
- **Expected:** as above; no layout shift measured during motion (CLS 0 for the hero).
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright (w1440, reducedMotion, touch fixture) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-012 · Hero CTAs resolve ("View My Work" → `/work` stub; resume action)
- **Related:** M-001 · TKT-01 AC 4, AC 10 (TSK-05, TSK-06) · **EVAL:** EVAL-011, EVAL-002 (hop 1 precursor)
- **Component:** `ClayButton` CTAs, `app/work/page.tsx` stub
- **Objective:** Neither CTA is dead at any point in the build.
- **Preconditions:** TKT-16 not yet merged (stub state); re-run after TKT-16 (real page).
- **Steps:** 1. Click "View My Work →"; assert navigation to `/work` returning 200 and rendering the labelled stub "Work — coming in this build" (or the real page after TKT-16). 2. Click the resume control; assert behaviour per TC-013 for the current flag state. 3. Keyboard: Tab to each CTA, Enter activates.
- **Test data:** —
- **Expected:** both CTAs navigate; focus ring visible on both; ≥44×44.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-013 · Resume control state machine (PB5): placeholder vs download
- **Related:** M-001/M-002/M-006 · TKT-01 AC 10, TKT-05 AC 3, TKT-08 AC 4, TKT-45 AC 4 · **EVAL:** EVAL-011, EVAL-002, EVAL-013, EVAL-016
- **Component:** `lib/site.ts` `resumeAvailable`, every resume control (Hero, MobileMenu, Footer, `/about`, `/contact`)
- **Objective:** One flag drives every resume control; the placeholder is a real link; no PDF exists while the flag is false.
- **Preconditions:** two Playwright runs, one per flag value (env/build-time override).
- **Steps (flag `false`):** 1. On every route, enumerate resume controls. 2. Assert label "Resume — updating", `href="/contact#resume"`, visually-hidden note "Sanitised resume coming — email me for a copy". 3. Assert no `public/resume.pdf` in the tree and no `/resume.pdf` in build output (`GET` → 404). **Steps (flag `true`):** 4. Assert label "Download Resume ↓", `href="/resume.pdf"`, `download` attribute; `GET /resume.pdf` → 200 `application/pdf`. 5. Assert the placeholder string appears nowhere in the DOM.
- **Test data:** flag values `false` / `true`.
- **Expected:** all controls agree with the flag in both runs; secondary `ClayButton` variant in placeholder state.
- **Type:** functional / security-functional · **Priority:** P0 · **Automation:** Y — Playwright + Vitest (file-absence assertion in the forbidden-string suite) · **Status:** Planned · **Defect:** —
- **Notes:** The `true` run is `BLOCKED` until TKT-08 lands — record as such, never skip silently.

### TC-014 · Featured `ProjectCard` anatomy and hover physics
- **Related:** M-001 · TKT-01 AC 6 (TSK-06) · **EVAL:** EVAL-008, EVAL-010
- **Component:** `ProjectCard` (featured mode), `ClayIcon`, `Tag`, `StatusBadge`
- **Objective:** Card anatomy order and hover/press/focus per Design.md §3/§4.
- **Preconditions:** TeachSpark card on `/`.
- **Steps:** 1. Assert DOM order: icon → name → one sentence (≤2 lines) → ≤3 tags → status badge → ghost arrow (44×44). 2. Assert the whole card is one `<a>` (single accessible link, name as accessible name). 3. Hover: after 200ms measure translateY −5px, icon scale 1.03, arrow translateX +4px. 4. Focus-visible: 3px accent ring, 3px offset. 5. Under `reducedMotion`: hover produces no translate; colour/opacity change only.
- **Test data:** CONTENT_INVENTORY §1.4 TeachSpark row (tags AI · WhatsApp · EdTech, status "Live pilot").
- **Expected:** as above; card copy verbatim from §1.4.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Generalised to three cards in TC-054/055.

### TC-015 · Shared-element transition and its fallbacks
- **Related:** M-001 · TKT-01 AC 6 (TSK-06); regression for TKT-12, TKT-19 · **EVAL:** EVAL-015, EVAL-010
- **Component:** `ViewTransitionLink`, `<ViewTransition name="project-{slug}">`, `CaseStudyHeader`
- **Objective:** Card → case-study header transitions when supported; identical end state with VT absent or reduced motion.
- **Preconditions:** `/` and `/work/teachspark` (stub, later full).
- **Steps:** 1. Chromium default: click card; assert `document.startViewTransition` was invoked (spy), duration 450ms with `cubic-bezier(.77,0,.175,1)`; landing element has `view-transition-name: project-teachspark` and icon `icon-teachspark`. 2. `noViewTransitions` fixture (`startViewTransition = undefined`): click; assert plain navigation, URL `/work/teachspark`, same DOM snapshot of the header as run 1. 3. `reducedMotion`: click; assert VT not invoked, same end state. 4. Browser back returns to `/` without error.
- **Test data:** slug `teachspark`.
- **Expected:** three runs converge on the same header DOM; no console errors.
- **Type:** functional / regression · **Priority:** P0 · **Automation:** Y — Playwright (default, noViewTransitions, reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** Safari/Firefox are not in the automated matrix (COMPONENT_ARCHITECTURE §5 Chromium only) — the `noViewTransitions` fixture is the proxy; one manual Safari smoke is folded into TC-107.

### TC-016 · Tracer screenshot pack and tree scope guard
- **Related:** M-001 · TKT-01 AC 7, AC 9 (TSK-07) · **EVAL:** EVAL-001, EVAL-009 (inputs)
- **Component:** `docs/screenshots/tracer/`, repo tree
- **Objective:** Eight full-page screenshots exist for the gate; nothing beyond the tracer scope exists in the tree.
- **Preconditions:** TSK-04–06 merged.
- **Steps:** 1. Run the screenshot script for `/` and `/work/teachspark` at 4 widths. 2. Assert 8 PNGs named `<route>-<width>.png`, non-empty, dimensions match viewport width. 3. List `app/`, `components/`, `data/`; diff against the TKT-01 file list (TSK-01…07 "Files" fields). 4. Include the resume placeholder state screenshot (DoD).
- **Test data:** TKT-01 file lists.
- **Expected:** 8 (+1 placeholder) files; no route/component/data file outside the tracer list.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — script (screenshots) / manual (scope diff) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-017 · Minimal `pnpm eval` writes `baseline-v1.json` and fails on axe/overflow
- **Related:** M-001 · TKT-01 AC 8 (TSK-07) · **EVAL:** EVAL-004, EVAL-005, EVAL-006, EVAL-008 (baseline)
- **Component:** `scripts/eval.ts`, `tests/e2e/tracer.spec.ts`, `lighthouserc.json`
- **Objective:** The baseline every later run compares against exists with provenance, and the runner's exit code is meaningful.
- **Preconditions:** `pnpm build` done; Playwright browsers on E Drive.
- **Steps:** 1. Run `pnpm eval`. 2. Assert `evals/results/baseline-v1.json` contains `version`, `commit`, `branch`, `timestamp`, `thresholds`, `cases[]`, `totals`; axe results for `/` at 390 & 1440; overflow results at 4 widths; Lighthouse mobile+desktop medians of 3 runs. 3. Negative control: inject a fixture page with an `aria-hidden` focusable button (axe serious) and a 2000px-wide element; run the runner against it; assert non-zero exit. 4. Assert the JSON schema equals the one TSK-12 extends (`schemas/eval-result.schema.json`).
- **Test data:** fixture page under `tests/fixtures/`.
- **Expected:** baseline written once and committed; negative control exits non-zero with the failing case named.
- **Type:** functional / negative · **Priority:** P0 · **Automation:** Y — script + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Lighthouse numbers informational here; thresholds enforced from TKT-07 (TC-038).

### TC-018 · Visual-direction gate with Tushar (TKT-02)
- **Related:** M-001 · TKT-02 AC 1–4 · **EVAL:** EVAL-001, EVAL-009
- **Component:** rendered `/` and `/work/teachspark`
- **Objective:** Written approval of the direction on evidence; direction changes written back before visual foundations start.
- **Preconditions:** TC-016 pack; running dev server; `baseline-v1.json`.
- **Steps:** 1. Present 8 screenshots + live page at ≥2 widths. 2. Score EVAL-001 (6 items × 390/1440) and EVAL-009 (6 items, 0–2) on the hero; record in `evals/results/gate-tracer.md`. 3. Obtain explicit "approved" / "approved with changes: …". 4. Write changes to `Design.md` (Deviation entry) and/or `decisions.md` EXE-1.
- **Test data:** EVAL-001 checklist; EVAL-009 rubric.
- **Expected:** EVAL-001 6/6 both widths (informational at this stage); EVAL-009 ≥10/12 with no 0; written approval; EXE-1 recorded. Silence = not approved.
- **Type:** visual-review · **Priority:** P0 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** If likeness or "student vs Senior PM" fails, fix loop stays inside TKT-01 (tokens/tiers/avatar).

---

## M-002 · Foundations & quality harness

### TC-019 · Content schema shape (`data/schema.ts`)
- **Related:** M-002 · TKT-03 AC 1, AC 5 · **EVAL:** EVAL-013
- **Component:** zod schemas `Project`, `Metric`, `Experience`, `SkillCluster`, `Essay`, `KnowledgeEntry`, `ThinkingStage`, `Artifact` union, `SourceRef`
- **Objective:** The schema encodes every truth rule from COMPONENT_ARCHITECTURE §2 so violations are impossible to author.
- **Preconditions:** TKT-03 merged.
- **Steps:** 1. Parse a minimal valid `Project` (the migrated TeachSpark card record) — expect success. 2. Mutate one field at a time and expect failure: metric without `source`; metric `asOf` "2026-8-24" (bad format); metric `kind: "estimated"`; `sources: []`; 4 tags; 7 chapters; chapter id `"intro"`; chapters in wrong order; `thinking` with 7 nodes; thinking node without `source`; `featured: 4`; `links.repoPublic` missing. 3. Assert inferred TS types exist for every entity (type-level test).
- **Test data:** `tests/fixtures/valid-project.fixture.ts` + 12 single-field mutations.
- **Expected:** 1 pass, 12 failures each naming the zod path; `Artifact` union includes `Generic`.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Table-driven; each mutation is one `it()` so a regression names the exact rule.

### TC-020 · Build-time gate reports entity id + path and fails `next build`
- **Related:** M-002 · TKT-03 AC 2 · **EVAL:** EVAL-013
- **Component:** `scripts/validate-content.ts`, `prebuild`
- **Objective:** Violations are impossible to ship, and the error is actionable.
- **Preconditions:** TC-019 green.
- **Steps:** 1. Run `pnpm validate-content` on real data — exit 0. 2. Point it at a data module exporting one invalid record; capture stderr and exit code. 3. Assert `prebuild` in `package.json` invokes it so `pnpm build` inherits the failure.
- **Test data:** invalid module with `slug: "broken"` and metric lacking `asOf`.
- **Expected:** exit ≠0; stderr contains `broken` and `metrics[0].asOf`; `pnpm build` aborts before `next build`.
- **Type:** error-handling · **Priority:** P0 · **Automation:** Y — Vitest (spawns the script) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-021 · Deliberate failing fixture proves the gate (EVAL-013 proof)
- **Related:** M-002 · TKT-03 AC 3 · **EVAL:** EVAL-013
- **Component:** `tests/fixtures/invalid-project.fixture.ts`, `evals/results/content-gate-proof.txt`
- **Objective:** Solution-PRD §8 criterion 7 — the build demonstrably fails on an unsourced metric, a sourceless project and a forbidden title.
- **Preconditions:** TC-020 green.
- **Steps:** 1. Vitest: load the fixture through the gate; `expect(() => gate(fixture)).toThrow()` for each of its three violations individually and together. 2. One-off: wire the fixture into `data/index.ts` behind `CONTENT_GATE_PROOF=1`, run `pnpm build`, capture full output to `evals/results/content-gate-proof.txt`, unwire. 3. Assert the proof file exists, names all three violations, and the commit sha.
- **Test data:** fixture: metric without `asOf`; project without `sources`; title "AI Product Manager".
- **Expected:** Vitest green (throws as expected); proof file persisted and referenced from `eval-cases.json` EVAL-013.
- **Type:** negative · **Priority:** P0 · **Automation:** Y — Vitest (step 1) / script (step 2, run once per schema change) · **Status:** Planned · **Defect:** —
- **Notes:** Release gate: EVAL-013 "not proven" is a critical failure (evaluation-plan §4).

### TC-022 · Forbidden-string scan over data, content, app and built bundle — with positive control
- **Related:** M-002 · TKT-03 AC 4; TKT-40 AC 1; TKT-42 AC 1; TKT-45 DoD · **EVAL:** EVAL-013, EVAL-016
- **Component:** `tests/unit/forbidden-strings.test.ts`, `tests/forbidden.local.json` (git-ignored)
- **Objective:** PII, unverified credentials, the sandbox code, and the banned title never reach the repo or the bundle.
- **Preconditions:** `pnpm build` done; local forbidden file present (CI uses an encrypted secret or skips the sandbox-code rule with an explicit `SKIP` line in the results, never a silent pass).
- **Steps:** 1. Scan `data/**`, `content/**`, `app/**`, `.next/**` (HTML, JS, JSON, RSC payloads) for: `PMP`, `SAFe Agilist`, DOB patterns (`\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b` near "DOB|Date of Birth|born"), phone patterns (`\+?91[\s-]?\d{5}[\s-]?\d{5}`, `\(\d{3}\)`, generic 10-digit runs near "phone|mobile|tel"), the sandbox join code (from the local file), `AI Product Manager` in heading/title/meta contexts, any key name from `.env.example`, and `/Volumes/E Drive` (local path leak — TKT-20 note). 2. Positive control: write a temp fixture containing each pattern; assert each is caught. 3. Assert `public/resume.pdf` absent while `resumeAvailable === false` (PB5).
- **Test data:** pattern table + positive-control fixture.
- **Expected:** 0 hits on real tree/bundle; 100% of positive-control patterns detected; the sandbox code never appears in the test source itself.
- **Type:** security-functional · **Priority:** P0 · **Automation:** Y — Vitest (in `pnpm eval`) · **Status:** Planned · **Defect:** —
- **Notes:** "SAFe" alone is allowed as a methodology mention (TKT-40 AC 1) — the rule is `SAFe Agilist|SAFe certified|PMP`.

### TC-023 · Clay tier → token mapping and the type-level flat-tier guard (D1)
- **Related:** M-002 · TKT-04 AC 1, AC 2 · **EVAL:** EVAL-009
- **Component:** `ClayCard`, `ClayButton`, `ClayPill`, `ClayTile`, `ClayFrame`, `ClayIcon`
- **Objective:** Tiers are a mechanical guardrail: each tier resolves to exactly its token set; `flat` cannot be combined with tone/interactive.
- **Preconditions:** TKT-04 merged; `/dev/primitives` route available.
- **Steps:** 1. Vitest (jsdom): render each primitive per tier; assert class/style output maps hero → radius 32–36 + rest/hover/press + volume gradient; card → radius 28 + same; utility → radius 14 + `--shadow-utility` only, no press class; flat → no radius/shadow/gradient tokens. 2. Type test: a `.test-d.ts` file with `<ClayCard tier="flat" tone="mint" />` and `<ClayCard tier="flat" interactive />` must fail `tsc` (expect-type `@ts-expect-error`). 3. Playwright on `/dev/primitives`: computed `box-shadow` for a utility card never contains the clay inset pair; hero/card do.
- **Test data:** all tones × tiers.
- **Expected:** all mappings exact; both negative type cases produce compile errors; TypeScript also forbids `tone` other than neutral on flat.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Vitest + tsc type test + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-024 · `ClayPill` filter vs tag variants are visibly and behaviourally distinct
- **Related:** M-002 · TKT-04 AC 3 · **EVAL:** EVAL-009, EVAL-006
- **Component:** `ClayPill`, `Tag`, `FilterTabs` pill
- **Objective:** A static tag is never mistaken for a control (Design.md Law of Similarity note).
- **Preconditions:** `/dev/primitives`.
- **Steps:** 1. Hover the filter-variant pill; capture computed background/shadow before and after. 2. Hover the tag variant; capture the same. 3. Activate the filter pill; assert `lavender` fill + `ink` text. 4. Assert the tag variant is not focusable and has no `role=button`; the filter variant is a `button`/`tab`.
- **Test data:** —
- **Expected:** filter styles differ on hover; tag styles identical before/after; semantics as stated.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-025 · Interactive primitives: hit area, focus ring, press/hover physics, reduced motion
- **Related:** M-002 · TKT-04 AC 4; TSK-03 · **EVAL:** EVAL-007, EVAL-008, EVAL-010
- **Component:** `ClayButton` (3 variants), interactive `ClayCard`, `ClayPill` (filter), `ClayTile` (link)
- **Objective:** Every interactive primitive satisfies the Design.md §3/§4 contract in one place so page tests can rely on it.
- **Preconditions:** `/dev/primitives` at 390 and 1440.
- **Steps:** 1. For every interactive primitive: bounding box ≥44×44. 2. Keyboard-focus each; assert `outline`/`box-shadow` ring 3px `accent`, 3px offset. 3. `mousedown`: transform `scale(.98)` within 90ms; hover: lift within 180ms. 4. `reducedMotion`: hover produces no `translate`; press scale may remain; opacity/colour transitions allowed. 5. Ghost variant: transparent background, icon-only with accessible name.
- **Test data:** —
- **Expected:** 0 sub-44 controls; ring on all; timings within ±20ms; reduced-motion assertions hold.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright (w390, w1440, reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** Primary button text colour must be `bg`/white on `accent` with ≥4.5:1 (checked by TC-112).

### TC-026 · `/dev/*` routes: excluded from sitemap and production build; axe clean; glass utility header-only
- **Related:** M-002 · TKT-04 AC 5, AC 6; TKT-20 AC 4; TKT-21 AC 6 · **EVAL:** EVAL-006, EVAL-016
- **Component:** `app/dev/{primitives,artifacts,thinking}/page.tsx`, `next.config`, `app/sitemap.ts`
- **Objective:** Fixture boards exist for review but never ship; glass is not a clay tier.
- **Preconditions:** dev and production builds available.
- **Steps:** 1. Dev: load each `/dev/*` route at 390 & 1440; run axe; take screenshots to `docs/screenshots/{primitives,artifacts,thinking}/`. 2. Production build: `GET /dev/primitives` → 404; sitemap contains no `/dev/`. 3. Grep component sources: `backdrop-blur`/glass utility class used only in `Header`.
- **Test data:** —
- **Expected:** axe 0 critical/serious on all fixture boards; 404 + no sitemap entry in production; glass utility single consumer.
- **Type:** validation / accessibility · **Priority:** P1 · **Automation:** Y — Playwright + axe + Vitest (grep) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-027 · `Container` / `Section` measurements at the four widths
- **Related:** M-002 · TKT-05 AC 1 · **EVAL:** EVAL-008
- **Component:** `Container`, `Section`, `SectionHeading`
- **Objective:** Layout tokens applied exactly (Design.md §2 spacing/container).
- **Preconditions:** a page with ≥2 sections (`/` after TKT-14, or `/dev/primitives` layout board before).
- **Steps:** 1. At each width read container `max-width` and horizontal padding; section vertical gaps between consecutive sections.
- **Test data:** —
- **Expected:** 390: gutter 24, gap 72 · 768: gutter 40, gap 96 · 1024: gutter 64, gap 128, max 1200 · 1440: gutter 64, gap 128, max 1320; at most one accent-toned `Section` background per section.
- **Type:** responsive · **Priority:** P1 · **Automation:** Y — Playwright (4 widths) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-028 · `Reveal` fires once and is opacity-only under reduced motion
- **Related:** M-002 · TKT-05 AC 2 · **EVAL:** EVAL-010
- **Component:** `Reveal`, `lib/motion.ts` `useReducedMotion`
- **Objective:** Section reveal matches the motion table row and never re-triggers.
- **Preconditions:** a long page with revealed sections.
- **Steps:** 1. Scroll a section into view; sample opacity/transform at 0/250/500ms; scroll away and back; assert no second animation. 2. Assert curve `cubic-bezier(.2,.7,.2,1)` 500ms, 70ms stagger between siblings. 3. `reducedMotion`: assert the element is visible immediately with no `transform` transition (only opacity ≤ ~1ms).
- **Test data:** —
- **Expected:** as above; IntersectionObserver disconnected after first fire.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright (default + reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-029 · Footer content, links and safe-area
- **Related:** M-002 · TKT-05 AC 3, AC 4 · **EVAL:** EVAL-011, EVAL-013
- **Component:** `Footer`
- **Objective:** Footer copy is sourced and every footer control resolves.
- **Preconditions:** footer mounted in `app/layout.tsx`.
- **Steps:** 1. Assert tier-1 headline "Still curious? Let's build what's next." and three actions: resume (per TC-013 state), LinkedIn `https://www.linkedin.com/in/pathaktushar`, Let's Talk → `/contact`. 2. Tier 2: name + title "Senior Product Manager", nav Work · Thinking · About · Contact, "Built with curiosity." credit, GitHub profile link `https://github.com/007U5H4R` only (no repo links). 3. Computed bottom padding ≥40px + `env(safe-area-inset-bottom)`. 4. External links have `rel="noopener"` and `target="_blank"`. 5. Crawler (TC-037) covers resolution.
- **Test data:** CONTENT_INVENTORY §1.6.
- **Expected:** copy verbatim; all hrefs as listed; no repo URLs while `repoPublic` gating applies (S5).
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Footer tier-2 credit is "Built with curiosity." per brief §39 (orchestrator ruling TP10, 2026-09-15); authorship line "Designed and built with Claude Code" lives in the `/about` colophon, not the footer.

### TC-030 · Per-route metadata: title, description, canonical, OG and Twitter tags absolute HTTPS
- **Related:** M-002 · TKT-06 AC 1, AC 4; TSK-15, TSK-16, TKT-42, TKT-43 · **EVAL:** EVAL-017 (tag part), EVAL-004 (SEO)
- **Component:** `lib/seo.ts`, per-route `generateMetadata`
- **Objective:** Every page family emits complete, absolute link-preview tags.
- **Preconditions:** `pnpm build`; `NEXT_PUBLIC_SITE_URL` set to an `https://` value.
- **Steps:** 1. For each route (static list + all 11 slugs + 5 essays): parse built HTML `<head>`. 2. Assert `<title>` unique per route, `meta[name=description]` 50–160 chars, `link[rel=canonical]` absolute https matching the route, `og:title`, `og:description`, `og:image` (absolute https, `.png`), `og:url`, `og:type`, `twitter:card=summary_large_image`, `twitter:image`. 3. Assert no tag contains `http://`, `localhost`, or a relative path.
- **Test data:** all routes.
- **Expected:** 0 missing tags; 0 relative/insecure URLs; titles unique.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — Vitest (runs in `pnpm eval`) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-031 · OG images: 1200×630, per family and per slug, ≤300 kB, text contrast
- **Related:** M-002 · TKT-06 AC 2 · **EVAL:** EVAL-017
- **Component:** `app/**/opengraph-image.tsx`, `ImageResponse` template
- **Objective:** Purpose-built preview image per family (home, work, case study ×11, about, thinking, playground, contact).
- **Preconditions:** `pnpm build`.
- **Steps:** 1. Fetch every `og:image` URL from TC-030; read dimensions and byte size. 2. Assert case-study images differ per slug (hash) and contain name + one-liner + status. 3. Manual: sample 3 images, measure text/background contrast with a picker.
- **Test data:** —
- **Expected:** all 1200×630 PNG ≤300 kB; 11 distinct case-study images; contrast ≥4.5:1 on sampled text.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — Vitest (dimensions/size/hash) / N — manual (contrast) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-032 · `sitemap.xml` and `robots.txt`
- **Related:** M-002 · TKT-06 AC 3; TKT-43 AC 4 · **EVAL:** EVAL-017, EVAL-004
- **Component:** `app/sitemap.ts`, `app/robots.ts`
- **Objective:** Complete, honest crawl surface.
- **Preconditions:** `pnpm build` served.
- **Steps:** 1. `GET /sitemap.xml`; parse `<loc>` set. 2. `GET /robots.txt`.
- **Test data:** expected set = `/`, `/work`, 11 `/work/<slug>`, `/about`, `/thinking`, 5 `/thinking/<slug>`, `/playground`, `/contact`.
- **Expected:** `<loc>` set equals expected exactly (no `/dev/*`, no 404 page, no professional-experience slugs); all absolute https; robots allows `/`, disallows `/dev/`, includes `Sitemap:` line pointing to the sitemap URL.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Until TKT-43 lands the essay entries are `NOT APPLICABLE`, recorded as such.

### TC-033 · Base URL fallback to the Vercel preview URL
- **Related:** M-002 · TKT-06 AC 5 · **EVAL:** EVAL-017
- **Component:** `lib/seo.ts` base-URL resolver
- **Objective:** Previews validate on inspectors without manual env edits.
- **Preconditions:** unit test environment.
- **Steps:** 1. With `NEXT_PUBLIC_SITE_URL` unset and `VERCEL_URL=foo.vercel.app`, call the resolver. 2. With both unset. 3. With `NEXT_PUBLIC_SITE_URL=https://example.com`.
- **Test data:** three env permutations.
- **Expected:** `https://foo.vercel.app` · `http://localhost:3000` (dev only, flagged) · `https://example.com`; never a trailing slash.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-034 · `pnpm eval` orchestrator: results file, provenance, baseline diff, flags, exit code
- **Related:** M-002 · TKT-07 AC 1, AC 6 (TSK-12) · **EVAL:** all automated
- **Component:** `scripts/eval.ts`, `evals/results/`
- **Objective:** One reproducible command whose output is trustworthy evidence.
- **Preconditions:** TC-017 baseline exists.
- **Steps:** 1. Run `pnpm eval`; assert `evals/results/eval-run-<pkg-version>-<shortsha>.json` created with `version`, `commit`, `branch`, `timestamp`, `environment` (node, OS, browser versions), per-EVAL `status ∈ PASS|FAIL|SKIP`, `measured`, `totals`, `regressions[]`. 2. Run again unchanged; assert the existing file is not overwritten (suffix or refusal). 3. `pnpm eval --only EVAL-012`; assert only that case executed and others `SKIP` with reason. 4. `pnpm eval --baseline tests/fixtures/baseline-worse.json` where a Critical case is marked PASS in baseline but fails now; assert exit ≠0 and `regressions[]` names it. 5. Simulate a Critical FAIL (fixture) and assert exit ≠0; a Medium FAIL alone exits 0 but is recorded.
- **Test data:** fixture baselines.
- **Expected:** as above; results are never hand-entered (file is produced solely by the script).
- **Type:** functional / negative · **Priority:** P0 · **Automation:** Y — Vitest (spawns script with fixtures) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-035 · `evals/eval-cases.json` mirrors `evaluation-plan.md` §3
- **Related:** M-002 · TKT-07 AC 2 (TSK-08) · **EVAL:** all 17
- **Component:** `evals/eval-cases.json`
- **Objective:** The runner's case list cannot drift from the plan.
- **Preconditions:** —
- **Steps:** 1. Parse `evaluation-plan.md` §3 table (17 rows). 2. Parse JSON. 3. Compare id, category, method, threshold, priority, `automated:boolean` (manual: 001, 003, 009, 017-inspector part).
- **Test data:** —
- **Expected:** 17/17 rows identical; no extra ids.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-036 · Playwright suite skeletons exist per EVAL id; unbuilt routes skip with reason
- **Related:** M-002 · TKT-07 AC 3 (TSK-09) · **EVAL:** EVAL-002, 006, 007, 008, 010, 011, 014, 015
- **Component:** `tests/e2e/eval-*.spec.ts`, `tests/e2e/fixtures.ts`
- **Objective:** No EVAL is silently absent from the run.
- **Preconditions:** —
- **Steps:** 1. `playwright test --list`; assert a spec exists for each listed EVAL id; each has ≥1 test or a `test.fixme('EVAL-0xx: <reason>')`. 2. Assert projects `w390/w768/w1024/w1440` and fixtures `reducedMotion`, `noViewTransitions`, `touch` are defined. 3. Assert helper `expectNoOverflow` and `expectAxeClean` exist and are used by ≥1 spec each. 4. Run against a build missing `/about`; assert the About tests report `skipped: route not built` (not passed).
- **Test data:** —
- **Expected:** all present; skips carry reasons in the results JSON.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-037 · Dead-control crawler (EVAL-011) with positive control
- **Related:** M-002 · TKT-07 AC 4 (TSK-10); every page ticket's "crawler passes" AC · **EVAL:** EVAL-011
- **Component:** `tests/e2e/crawler.ts`, `eval-011-dead-controls.spec.ts`, `crawler-allowlist.json`
- **Objective:** Zero dead buttons/links across the site, including inside dialogs and menus.
- **Preconditions:** route source = `app/sitemap.ts` (or `routes.json` before TKT-06 — PB1).
- **Steps:** 1. For each route at 390 and 1440: enumerate visible `a[href]`, `button`, `[role=button]`, `[role=tab]`, `[role=switch]`; also open MobileMenu (390), AskPanel, StoryCards, How-I-Think tiles and enumerate their controls. 2. For links: internal → `GET` 200 and, for hash targets, element with that id exists; external → HEAD 200–399 (cached per run, rate-limited, allowlist for known HEAD-hostile hosts with a GET fallback). 3. For buttons: click and assert a change in DOM, URL, `aria-*` state, clipboard call, or dialog open; disabled+described controls (TC-006) are reported as intentional. 4. Emit a report listing every control checked. 5. Positive control: serve a fixture page with a `<button>` that does nothing and an `<a href="/nowhere">`; assert both reported dead.
- **Test data:** allowlist; fixture page.
- **Expected:** 0 dead on the real site; report count ≥ number of controls in the DOM; positive control detects 2/2.
- **Type:** functional / negative · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** `mailto:` and `tel:` are validated syntactically; `download` links are fetched.

### TC-038 · Lighthouse CI configuration and bundle budget enforce thresholds (with failing scenario)
- **Related:** M-002 · TKT-07 AC 5 (TSK-11) · **EVAL:** EVAL-004, EVAL-005
- **Component:** `lighthouserc.json`, `scripts/bundle-budget.ts`
- **Objective:** Thresholds are enforced by config, not by reading numbers.
- **Preconditions:** `pnpm build`.
- **Steps:** 1. Assert config lists `/`, `/work`, `/work/teachspark`, `/about` × mobile + desktop, `numberOfRuns: 3`, assertions perf ≥0.90, a11y ≥0.95, BP ≥0.95, SEO ≥0.95, LCP ≤2500ms, CLS <0.05. 2. Run `bundle-budget.ts`; assert it reads `.next` manifests for `/` first-load JS gzipped and prints the value. 3. Failing scenario: run the budget script with `--limit 1` and assert non-zero exit; run LHCI against a fixture page with a 3 MB blocking script and assert the perf assertion fails.
- **Test data:** fixture heavy page.
- **Expected:** config exact; budget ≤180 kB gz on `/`; both failing scenarios exit non-zero.
- **Type:** validation / negative · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** The record runs themselves are TC-061/069/079/099 (per route) and TC-113 (sweep).

### TC-039 · CI workflow runs `pnpm eval` on PR; `docs/eval.md` documents it
- **Related:** M-002 · TKT-07 AC 6, AC 7 (TSK-12) · **EVAL:** —
- **Component:** `.github/workflows/eval.yml`, `docs/eval.md`
- **Objective:** The gate runs without a human remembering to run it.
- **Preconditions:** repo on GitHub with Actions enabled (if the repo is not yet remote, this case is `BLOCKED` with the exact `gh` command recorded).
- **Steps:** 1. Open a PR touching `data/`; observe the workflow triggers, installs Playwright browsers, runs `pnpm eval`, uploads `evals/results/*.json` as an artefact. 2. Read `docs/eval.md`: run command, results location, baseline flag, how to add a case.
- **Test data:** —
- **Expected:** green check on the PR; artefact present; doc sections present.
- **Type:** deployment-smoke · **Priority:** P2 · **Automation:** N — manual (observed once; thereafter CI itself is the check) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-040 · Resume PDF PII / patent test (with negative control)
- **Related:** M-002 · TKT-08 AC 1, AC 2 · **EVAL:** EVAL-013, EVAL-016
- **Component:** `tests/unit/resume-pii.test.ts`, `public/resume.pdf`
- **Objective:** Only a sanitised PDF can exist in the repo.
- **Preconditions:** `pdftotext` available; sanitised PDF delivered by Tushar (else `BLOCKED`).
- **Steps:** 1. `pdftotext public/resume.pdf -`; assert no DOB pattern, no phone pattern, no street-address pattern (pin code + "Road|Street|Layout|Nagar" heuristics), contains `429867`, does not contain `044152784`; file ≤2 MB. 2. Negative control: run the same assertions against the current unsanitised `portfolio/resume.pdf` **read from its original location** (never copied) and assert the test fails. 3. Assert the test runs inside `pnpm eval` under EVAL-013.
- **Test data:** —
- **Expected:** sanitised file passes; unsanitised file fails on ≥3 rules; title mismatch decision recorded in `decisions.md` (EXE-n) — asserted by grep for "resume title".
- **Type:** security-functional · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** The negative-control path is skipped in CI (file not present) with an explicit `SKIP` reason.

### TC-041 · Site-wide resume flip regression (after TKT-08)
- **Related:** M-002/M-007 · TKT-08 AC 4 · **EVAL:** EVAL-002, EVAL-011
- **Component:** every resume control
- **Objective:** After `resumeAvailable: true`, no placeholder remains and every control downloads.
- **Preconditions:** TKT-08 merged; `.gitignore` guard removed.
- **Steps:** 1. Run TC-013 "flag true" branch on all routes. 2. `GET /resume.pdf` → 200, `content-type: application/pdf`, size = committed file. 3. Grep the built bundle for "Resume — updating" → 0.
- **Test data:** —
- **Expected:** as above.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

---

## M-003 · Home complete

### TC-042 · Knowledge entries: 8 verbatim + 3 authored, schema, draft flags, "7+ years"
- **Related:** M-003 · TKT-09 AC 1–3 · **EVAL:** EVAL-012, EVAL-013
- **Component:** `data/knowledge.ts`, `KnowledgeEntry` schema
- **Objective:** The Ask corpus is exactly the sourced content — nothing more.
- **Preconditions:** TKT-09 merged.
- **Steps:** 1. Assert 11 entries. 2. For the 8 from CONTENT_INVENTORY §9: answer text, evidence hrefs and sources byte-identical to the rows, except "Ten years" → "7+ years" (assert "Ten years" absent). 3. For the 3 PB3 entries: prompts exactly "What did you learn when an assumption failed?", "How do you evaluate an AI product?", "What is your research background?"; every source id resolves to a VERIFIED row in `CONTENT_INVENTORY.md`. 4. All 11 `draft:true` until a sign-off entry exists in `decisions.md`. 5. Each entry: evidence ≥2, sources ≥1, answer ≤3 sentences.
- **Test data:** CONTENT_INVENTORY §9, §1.3.
- **Expected:** all assertions hold; schema green.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-043 · EVAL-012 coverage: 11 prompts answered, 5 off-topic empty, zero fabrication
- **Related:** M-003 · TKT-09 AC 5, AC 7 · **EVAL:** EVAL-012
- **Component:** `LocalKnowledgeProvider.ask()`
- **Objective:** Solution-PRD §8 criterion 6, mechanically.
- **Preconditions:** TC-042 green.
- **Steps:** 1. For each of the 11 suggested prompts (home 5 + panel 6, read from the same constant the UI uses): `ask(prompt)` → `kind:'answer'`, `evidence.length ≥ 2`, each evidence `href` matches an internal route/anchor pattern. 2. For "weather in Paris", "write me a poem", "what is your salary", "phone number", "lorem ipsum": `kind:'empty'`, `evidence` empty, `text` = §1.3 fallback copy. 3. No-fabrication: for every `answer` result, `text` is byte-identical to some `knowledge.ts` answer; `matched[]` contains that entry id. 4. Runs under `pnpm eval --only EVAL-012` and writes counts to the results JSON.
- **Test data:** 11 prompts + 5 off-topic strings.
- **Expected:** 11/11 · 5/5 · 0 fabricated; threshold never lowered (PB3/EV2).
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-044 · Matching robustness, determinism and latency
- **Related:** M-003 · TKT-09 AC 4; TKT-11 AC 4 · **EVAL:** EVAL-012
- **Component:** `LocalKnowledgeProvider` normaliser + synonym table
- **Objective:** Real phrasing variants hit the right entry; ties are stable; the call is effectively instant.
- **Preconditions:** —
- **Steps:** 1. Variants of each prompt: upper/lower case, trailing "?", extra spaces, synonyms ("projects/products/built", "AI/GenAI/LLM", "enterprise/corporate/AmEx") → same `matched[0]` as the canonical prompt. 2. Construct two entries with equal score; call 100× → identical result. 3. Latency: 200 calls, assert p95 <20ms (warm), single cold call <50ms. 4. `ask(q, {route:'/about'})` returns the same as without ctx (v1 ignores route).
- **Test data:** variant table (≥3 per prompt).
- **Expected:** all variants resolve; deterministic; p95 <20ms.
- **Type:** functional / performance · **Priority:** P1 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Latency asserted as p95 over many runs, not a single timing, to avoid CI flake.

### TC-045 · PII probes and empty-state contract
- **Related:** M-003 · TKT-09 AC 6, Notes · **EVAL:** EVAL-012, EVAL-013
- **Component:** `LocalKnowledgeProvider`
- **Objective:** The provider never returns personal data and the empty answer is the sourced copy.
- **Preconditions:** —
- **Steps:** 1. Probes: "phone number", "what's your mobile", "date of birth", "home address", "salary", "join code", "sandbox code" → `kind:'empty'`. 2. Assert no answer string across the corpus matches the TC-022 PII patterns. 3. Empty `text` equals CONTENT_INVENTORY §1.3 fallback; `evidence` empty; 3 fresh prompt suggestions supplied.
- **Test data:** 7 probes.
- **Expected:** 7/7 empty; 0 PII matches.
- **Type:** negative / security-functional · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-046 · `AskPortfolio` five states via mocked provider; loading skeleton ≥150ms
- **Related:** M-003 · TKT-10 AC 1 · **EVAL:** EVAL-014-style state coverage, EVAL-007
- **Component:** `AskPortfolio`, `useAsk`, `AnswerView`
- **Objective:** Every state is reachable and visually distinct (four-screen-states rule + error).
- **Preconditions:** provider injected via context; Playwright can swap it with `page.addInitScript`/test seam.
- **Steps:** 1. Idle: 5 prompt pills, field placeholder "Ask about my work…", card height 56–64px. 2. Submit with an instantly-resolving provider: assert skeleton (2 shimmer lines) visible for ≥150ms (use `page.clock`), then answer; card tone lavender, min height 240px. 3. Provider returning `kind:'empty'`: assert "I don't have that in the portfolio yet" + 3 fresh pills. 4. Provider that throws: `ink` on `blush` surface + alert icon + "Try again"; clicking Try again re-invokes. 5. Screenshot each state at 390 and 1440.
- **Test data:** mock providers ×3.
- **Expected:** 5 distinct states; skeleton never shorter than 150ms; error state has `role="alert"`.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-047 · `AskPortfolio` submit paths, focus move, no navigation, evidence links
- **Related:** M-003 · TKT-10 AC 2, AC 4 · **EVAL:** EVAL-007, EVAL-011
- **Component:** `AskPortfolio`, `EvidenceLinks`
- **Objective:** Search becomes an answer in place; focus moves sensibly; links are real.
- **Preconditions:** real provider.
- **Steps:** 1. Type a prompt + Enter; 2. Reset ("Ask another"), click submit button; 3. Reset, click a prompt pill. For each: assert URL unchanged, `document.activeElement` is the answer heading (`tabindex=-1`), page still scrollable (`document.body` overflow not hidden), card expanded via layout animation (spring 210/26 ≈280ms). 4. Assert evidence pills (2–3) link to internal routes/anchors and are included in the TC-037 crawl. 5. "Ask another" collapses to idle and returns focus to the field.
- **Test data:** first suggested prompt.
- **Expected:** all three paths identical outcome; no focus trap.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Evidence anchors point to route roots until TKT-28+ add chapter anchors (TKT-10 AC 4); TC-077 re-checks anchors later.

### TC-048 · Honesty microcopy present in idle and answer states (S7)
- **Related:** M-003 · TKT-10 AC 3; milestone DoD "Ask copy verified in DOM" · **EVAL:** EVAL-013
- **Component:** `AskPortfolio`, `AskPanel`
- **Objective:** The UI never implies generated answers.
- **Preconditions:** —
- **Steps:** 1. In idle and after an answer, on both surfaces, assert visible text "Answers come from this portfolio's content — nothing generated." 2. Grep the DOM for "AI-generated", "powered by", "chatbot" → 0.
- **Test data:** —
- **Expected:** microcopy present ×4 (2 surfaces × 2 states); no contradicting copy.
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-049 · `AskPortfolio` keyboard order, reduced motion, mobile wrap, axe
- **Related:** M-003 · TKT-10 AC 5, AC 6 · **EVAL:** EVAL-006, EVAL-007, EVAL-008, EVAL-010
- **Component:** `AskPortfolio`
- **Objective:** Accessibility and responsive contract of the inline surface.
- **Preconditions:** —
- **Steps:** 1. Tab order: field → 5 pills → (after answer) answer heading → evidence pills → Ask another. 2. `reducedMotion`: submit; assert card height changes without transition and content fades ≤150ms. 3. At 390: pills wrap to exactly 2 rows; card padding/gutter per Design.md; `expectNoOverflow`. 4. axe at 390 and 1440 in idle and answer states.
- **Test data:** —
- **Expected:** order exact; no transform animation under reduced motion; 0 overflow; axe 0 critical/serious.
- **Type:** accessibility / responsive · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-050 · `AskPanel` open/close contract on every route; focus trap; scroll lock; page visible
- **Related:** M-003 · TKT-11 AC 1, AC 5 · **EVAL:** EVAL-006, EVAL-007
- **Component:** `AskPanel`, `AskAIButton` (header + MobileMenu)
- **Objective:** The global Ask surface is a correct modal dialog that keeps the page visible.
- **Preconditions:** TKT-11 merged (TC-006 becomes N/A).
- **Steps:** For each route at 1440 and 390: 1. Open from the header button (1440) / MobileMenu button (390). 2. Assert `role="dialog" aria-modal="true"`, title "Ask AI", 44×44 close button, focus inside; Tab cycles inside; page root `inert`. 3. Assert `body` scroll locked; at ≥768 page content is visible behind a 20% scrim (scrim opacity, panel does not cover the full width). 4. Close via `Esc`, via scrim click, via close button — each returns focus to the exact trigger. 5. axe with the panel open at both widths; `expectNoOverflow`.
- **Test data:** all routes.
- **Expected:** all assertions on every route; 0 axe critical/serious.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-051 · `AskPanel` geometry: drawer widths and the <768 bottom sheet (D3, Deviation 2)
- **Related:** M-003 · TKT-11 AC 2 · **EVAL:** EVAL-008, EVAL-010
- **Component:** `AskPanel`
- **Objective:** Breakpoint-specific presentation per Design.md.
- **Preconditions:** —
- **Steps:** 1. 1440: panel width 480px, 16px inset top/bottom, right-anchored. 2. 1024: 400px. 3. 768: right drawer (400px) per D3 wording. 4. 390: bottom sheet height 90vh; entry animates `translateY` from 100% → 0 over 320ms `cubic-bezier(0.32,0.72,0,1)`; input field's top ≥ 50% of viewport height; bottom padding includes `env(safe-area-inset-bottom)`. 5. `reducedMotion`: panel appears instantly; scrim fades 150ms opacity only.
- **Test data:** —
- **Expected:** measurements ±2px; sheet slides from the bottom edge; reduced-motion mapping per §4.
- **Type:** responsive · **Priority:** P1 · **Automation:** Y — Playwright (4 widths + reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-052 · Keyboard-only Ask journey (EVAL-007 named flow)
- **Related:** M-003 · TKT-11 AC 3 · **EVAL:** EVAL-007
- **Component:** `AskPanel`
- **Objective:** Open → type → Enter → read answer → activate evidence → close, keyboard only, focus always visible.
- **Preconditions:** —
- **Steps:** At 390 and 1440, mouse disabled: 1. Tab to Ask AI (via MobileMenu at 390), Enter. 2. Focus lands in the field; type prompt; Enter. 3. Tab to answer heading, then to first evidence link; assert focus ring visible at every stop (computed outline). 4. Enter on evidence → navigates to the target route; panel closes; focus lands on the target page's `#main` or the anchor. 5. Reopen; `Esc` closes; focus returns to trigger.
- **Test data:** panel prompt #1.
- **Expected:** completed with no mouse events; focus ring visible on every stop.
- **Type:** accessibility / e2e · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-053 · `AskPanel` lazy chunk and shared state machine
- **Related:** M-003 · TKT-11 AC 4, Notes · **EVAL:** EVAL-005
- **Component:** dynamic import of `AskPanel`
- **Objective:** The panel does not tax the home first-load budget and reuses `useAsk` states.
- **Preconditions:** `pnpm build`.
- **Steps:** 1. Read `.next` build manifest for `/`: assert the `AskPanel` chunk is not in first-load JS; a network trace on `/` load shows no request for it until the button is pressed. 2. Drive the five states inside the panel with the mock providers from TC-046; assert identical DOM structure to the inline surface. 3. Assert the provider receives `ctx.route` equal to the current pathname.
- **Test data:** —
- **Expected:** chunk loaded on first open only; five states identical; ctx passed.
- **Type:** performance / functional · **Priority:** P1 · **Automation:** Y — Playwright + script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-054 · Featured Work: exactly three data-driven cards, order, copy, layout
- **Related:** M-003 · TKT-12 AC 1, AC 2, AC 5 · **EVAL:** EVAL-001, EVAL-013
- **Component:** `FeaturedWork`, `data/projects.ts` featured records
- **Objective:** Three proof projects, verbatim, with the Cubicle swap governed by data (S3).
- **Preconditions:** RailCite and Velora records at card fidelity.
- **Steps:** 1. Assert exactly 3 `ProjectCard`s, order = `featured` 1 → 3 (TeachSpark, RailCite, Velora). 2. Card copy vs CONTENT_INVENTORY §1.4: propositions, ≤3 tags, statuses; Velora title "Nuptis → Velora"; TeachSpark badge carries the "uptime unverified" caveat until TKT-22 records a dated check (then the caveat must be gone — regression). 3. ≥1024: one row, 32px gap, equal heights (±1px); <1024 stacked, 24px gap. 4. Vitest: setting `featured` on a fourth record fails the schema (max 3) or the component renders only 3 with a console warning — pick and assert. 5. Schema gate green for the two new records.
- **Test data:** §1.4 rows.
- **Expected:** as above.
- **Type:** functional / content-integrity · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-055 · Featured cards: hover/press/focus, reduced motion, transition to each slug
- **Related:** M-003 · TKT-12 AC 3, AC 4 · **EVAL:** EVAL-002 (hop 1), EVAL-010, EVAL-011, EVAL-015
- **Component:** `ProjectCard` ×3, `ViewTransitionLink`
- **Objective:** TC-014/TC-015 generalised to all three featured slugs.
- **Preconditions:** —
- **Steps:** 1. Repeat TC-014 steps 3–5 on each card. 2. Repeat TC-015 runs (default, `noViewTransitions`, `reducedMotion`) for `railcite` and `velora`; landing route is the stub until TKT-19, the full page after — both must return 200 and carry `view-transition-name: project-{slug}`.
- **Test data:** slugs teachspark, railcite, velora.
- **Expected:** identical physics across cards; 3 slugs × 3 modes navigate to the same end state.
- **Type:** regression · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-056 · How I Think data: six verbatim examples, sources, target links, stage colours
- **Related:** M-003 · TKT-13 AC 1, AC 2 · **EVAL:** EVAL-003 (supports), EVAL-013
- **Component:** `data/thinking-framework.ts`
- **Objective:** The operating model is evidenced, not adjectival.
- **Preconditions:** —
- **Steps:** 1. Assert 6 stages in order Problem · Insight · Bet · Build · Evaluate · Impact. 2. Example quotes and sources byte-identical to CONTENT_INVENTORY §1.5; Insight example attributed to the team as the row instructs. 3. Links exactly: `/work/railcite#02-problem`, `/work/velora#03-discovery`, `/work/teachspark#04-product-bet`, `/work/railcite#05-what-i-built`, `/work/teachspark#06-evaluation`, `/work/teachspark#07-outcome`. 4. Stage colour map exported and equals Design.md (Insight→butter, Build→peach, Evaluate/Impact→mint, …); same map consumed wherever a stage is referenced (grep for a second hard-coded mapping → 0).
- **Test data:** §1.5.
- **Expected:** all assertions hold.
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Anchor resolution is TC-077 (after TKT-19); until then links resolve to route roots (TKT-13 AC 4).

### TC-057 · How I Think interaction, keyboard, layout, reduced motion
- **Related:** M-003 · TKT-13 AC 3–5 · **EVAL:** EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-011
- **Component:** `HowIThink`, `ClayTile` ×6
- **Objective:** One-open-at-a-time expansion that is fully keyboard operable.
- **Preconditions:** `/` at 4 widths.
- **Steps:** 1. ≥1024: six tiles in a row connected by a line below; hover a tile → principle emphasised within 200ms (desktop only — assert no change on the `touch` fixture). 2. Click tile 2: card expands below the row (200ms) with example + "See how I tested this in {Project} →"; click tile 4: tile 2 closes, tile 4 opens. 3. Keyboard: tiles are `<button aria-expanded>`; ArrowRight/Left moves focus between stages; Enter toggles; `Esc` closes and focus stays on the tile; outside click closes. 4. <1024: vertical stack, line on the left. 5. `reducedMotion`: expansion instant. 6. `expectNoOverflow` at 390; axe at 390/1440 with one card open; link in the card resolves (crawler).
- **Test data:** —
- **Expected:** as above; the module is the section's only tinted element (visual check in TC-058).
- **Type:** functional / accessibility · **Priority:** P1 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-058 · Home section order, rhythm, one accent per section
- **Related:** M-003 · TKT-14 AC 1 · **EVAL:** EVAL-008, EVAL-009
- **Component:** `app/page.tsx`
- **Objective:** Fixed composition at all widths.
- **Preconditions:** all home tickets merged.
- **Steps:** 1. At 4 widths assert DOM order Header · Hero · Ask · Featured Work · How I Think · Final CTA · Footer and mobile visual order avatar → headline → CTAs → tiles → Ask → projects → How I Think → final CTA. 2. Measure inter-section gaps (72/96/128). 3. Manual (screenshot review): count distinct tinted tone surfaces per section — ≤1 accent colour visible per section.
- **Test data:** —
- **Expected:** order exact; gaps per width; every section passes the one-accent rule.
- **Type:** responsive / visual-review · **Priority:** P1 · **Automation:** Y — Playwright (order/gaps) / N — manual (accent count) · **Status:** Planned · **Defect:** —
- **Notes:** "Accent colour visible" has no mechanical definition; scored by reviewer, evidence = screenshots.

### TC-059 · `CopyButton`: copy, "Copied" toast, revert, clipboard-denied fallback
- **Related:** M-003/M-006 · TKT-14 AC 2; TKT-45 AC 3 · **EVAL:** EVAL-007, EVAL-011
- **Component:** `CopyButton` on `/` FinalCTA and `/contact`
- **Objective:** Copy-email works and fails visibly, never silently.
- **Preconditions:** run on both surfaces.
- **Steps:** 1. Grant clipboard permission; click; assert `navigator.clipboard.writeText` called with `Tushar_Pathak@outlook.com`; icon morphs to check (160ms); toast "Copied" visible; reverts after 2s (`page.clock`). 2. Deny/stub clipboard to reject; click; assert error state renders the email as selectable visible text with an alert icon (ink on blush), no uncaught error. 3. Keyboard: Enter/Space triggers; `aria-live` announces "Copied".
- **Test data:** —
- **Expected:** both states correct on both pages.
- **Type:** functional / error-handling · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** FinalCTA copy verbatim from CONTENT_INVENTORY §1.6 asserted in the same spec.

### TC-060 · Five-second test on `/` (EVAL-001)
- **Related:** M-003 · TKT-14 AC 3; TKT-02 (informational earlier) · **EVAL:** EVAL-001
- **Component:** rendered `/` first viewport
- **Objective:** Solution-PRD §8 criterion 1.
- **Preconditions:** screenshots `docs/screenshots/home/390.png` and `1440.png` of the first viewport (no scroll).
- **Steps:** 1. Claude scores the 6 items (name · Senior PM · builds AI products · cares about user problems · actually builds · projects to explore) at each width, citing the element that carries each. 2. Tushar confirms (or corrects) in writing. 3. Persist scores in `evals/results/eval-001-<sha>.md`.
- **Test data:** 6-item checklist.
- **Expected:** 6/6 at both widths; any miss is a `QA-###` against the Hero, never a threshold change.
- **Type:** visual-review · **Priority:** P0 · **Automation:** N — manual (structural precondition automated in TC-007) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-061 · Home performance budget and Lighthouse (EVAL-004/005 on `/`)
- **Related:** M-003 · TKT-14 AC 4, AC 5 · **EVAL:** EVAL-004, EVAL-005
- **Component:** `/`
- **Objective:** Home meets the budgets with every section live.
- **Preconditions:** `pnpm build`; served locally (record run repeats on preview in TC-113).
- **Steps:** 1. `pnpm eval --only EVAL-004,EVAL-005` → LHCI mobile + desktop on `/`, 3 runs median; `bundle-budget.ts`. 2. Read LCP element: must be the avatar image.
- **Test data:** —
- **Expected:** perf ≥90, a11y ≥95, BP ≥95, SEO ≥95 (both presets); first-load JS ≤180 kB gz; LCP ≤2.5s; CLS <0.05; results persisted.
- **Type:** performance · **Priority:** P0 · **Automation:** Y — LHCI + script · **Status:** Planned · **Defect:** —
- **Notes:** First lever on failure is lazy `AskPanel`/`motion` chunks (TKT-14 note), never removing sections.

---

## M-004 · Work page & case-study system

### TC-062 · Fourteen project records at card fidelity: gate, statuses, filters, grid sizes, gating flags
- **Related:** M-004 · TKT-15 AC 1–6 · **EVAL:** EVAL-013
- **Component:** `data/projects.ts`, `generateStaticParams`
- **Objective:** `/work` and every slug can render from data with no invented content.
- **Preconditions:** TKT-15 merged.
- **Steps:** 1. Schema gate over all 14 records. 2. Per record compare `name`, `tagline`, `tags`, `status` to CONTENT_INVENTORY §2.2/§2.3 rows (incl. Cubicle "Built, not launched", Nuptis/Velora "Live (mock data)", Bhakti-Vilas "Live prototype (mock data, team build)"). 3. `filters` equal the SITEMAP.md mapping; Token Toli / Pratyasa / Bhakti-Vilas under `experiments` (default until EXE-n). 4. `gridSize`: teachspark large; railcite, velora medium; rest small. 5. Professional entries: `category:'professional'`, no `links.live`, no `demoVideo`, Godrej tag "Platform", sources = `RESUME`. 6. `repoPublic:true` only for `cinematic-portfolio`, `dino-arcade`; `github` populated but gated for others. 7. `generateStaticParams()` returns exactly the 11 personal slugs. 8. Chapters/metrics/thinking empty and `deepDive:false` for records without a content ticket yet.
- **Test data:** §2.2, §2.3, SITEMAP.md.
- **Expected:** all assertions hold; build green.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-063 · `EditorialGrid` spans at the four widths; only personal projects in the grid
- **Related:** M-004 · TKT-16 AC 1 (TSK-14) · **EVAL:** EVAL-008
- **Component:** `EditorialGrid`, `ProjectCard` grid mode
- **Objective:** Never nine identical rectangles (Design.md §3 sizing math).
- **Preconditions:** `/work?filter=all`.
- **Steps:** 1. 1440/1024: card[0] spans 8 cols × 2 rows; card[1–2] 4 cols × 1 row in the right rail; remaining cards 4 cols × 1 row, 3-up. 2. 768: large full width; medium 2-up; small 2-up. 3. 390: single column; large card media ratio 4:3 (measure). 4. Assert grid contains exactly 11 cards and none has `category:'professional'`.
- **Test data:** —
- **Expected:** spans and ratios per spec; 11 cards; `expectNoOverflow`.
- **Type:** responsive · **Priority:** P0 · **Automation:** Y — Playwright (4 widths) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-064 · `FilterTabs` URL sync, history, deep link on first paint, tab semantics
- **Related:** M-004 · TKT-16 AC 2 (TSK-13) · **EVAL:** EVAL-007, EVAL-011
- **Component:** `FilterTabs`, `app/work/page.tsx` searchParams, `lib/filters.ts`
- **Objective:** Filters are shareable, restorable and keyboard-native.
- **Preconditions:** —
- **Steps:** 1. Click "AI": URL becomes `/work?filter=ai` without full reload. 2. Click "Cloud", then browser Back: "AI" active and grid restored; Forward: "Cloud". 3. Load `/work?filter=ai` cold with JS disabled: the server HTML already shows only AI cards (no flash of "All"). 4. Assert `role="tablist"`, each pill `role="tab"`, `aria-selected` on the active one, `aria-controls` → grid id. 5. Keyboard: focus a tab; ArrowRight/Left move selection (roving tabindex), Home/End jump; Enter/Space activate. 6. Indicator layout animation spring 260/28; `reducedMotion`: opacity-only crossfade, no spring reflow.
- **Test data:** filters all/ai/enterprise/cloud/experiments.
- **Expected:** as above; invalid `?filter=zzz` falls back to All without error.
- **Type:** functional / accessibility · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-065 · Each filter yields exactly the SITEMAP.md set (grid + strip)
- **Related:** M-004 · TKT-16 AC 3; TKT-17 AC 4 · **EVAL:** EVAL-011
- **Component:** `FilterTabs`, `EditorialGrid`, `ExperienceStrip`
- **Objective:** Filter mapping is data-correct, including the professional strip rows.
- **Preconditions:** TKT-17 merged for the strip assertions.
- **Steps:** For each filter read visible card slugs and strip row ids.
- **Test data / Expected:** AI → {teachspark, railcite, cubicle} + strip {mars}; Enterprise → {velora} + strip {mars, cloud-modernization, godrej-smartnet}; Cloud → {railcite} + strip {cloud-modernization, mars}; Experiments → {nuptis, bhakti-vilas, token-toli, pratyasa, tegaki, dino-arcade, cinematic-portfolio}, strip empty; All → 11 + 3.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright (`tests/e2e/work.spec.ts`) · **Status:** Planned · **Defect:** —
- **Notes:** If Tushar's bucket decision (EXE-n) moves Token Toli / Pratyasa / Bhakti-Vilas, update the expected set here and in SITEMAP.md in the same commit.

### TC-066 · `FilterTabs` horizontal scroll with peek below 768 (Deviation 3)
- **Related:** M-004 · TKT-16 AC 4 (TSK-13) · **EVAL:** EVAL-008
- **Component:** `FilterTabs`
- **Objective:** The only intentional horizontal scroller shows a hint and never leaks to the page.
- **Preconditions:** 390 viewport.
- **Steps:** 1. Assert the tab row `overflow-x: auto` and `scrollWidth > clientWidth`. 2. Assert the last visible pill is clipped by 16–24px (peek). 3. `document.documentElement.scrollWidth <= clientWidth` (no page overflow). 4. Swipe/scroll the row; last tab reachable and activatable. 5. Every pill label ≥14px font-size.
- **Test data:** —
- **Expected:** as above at 390 (and 375 spot check).
- **Type:** responsive · **Priority:** P1 · **Automation:** Y — Playwright (w390) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-067 · Per-filter empty state (injected empty dataset)
- **Related:** M-004 · TKT-16 AC 5 (TSK-14) · **EVAL:** EVAL-015-style state coverage, EVAL-011
- **Component:** `EmptyState`, `EditorialGrid`
- **Objective:** The empty screen state exists and is honest even though real data never triggers it.
- **Preconditions:** a test seam (env `NEXT_PUBLIC_TEST_DATASET=empty` or component unit render) — dependency noted for `technical-plan.md`.
- **Steps:** 1. Render the grid with 0 matching projects. 2. Assert honest copy (no "coming soon" invention) + "Show all" control that resets the filter to All and updates the URL. 3. axe on the state.
- **Test data:** empty dataset.
- **Expected:** empty state renders; "Show all" works; axe clean.
- **Type:** edge / boundary · **Priority:** P2 · **Automation:** Y — Vitest (jsdom render) + Playwright (seam) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-068 · Filter transitions (`AnimatePresence`) and card `ViewTransition` wrappers
- **Related:** M-004 · TKT-16 AC 6 (TSK-14) · **EVAL:** EVAL-010, EVAL-015
- **Component:** `EditorialGrid`, `ProjectCard`
- **Objective:** Motion row "Filter change" and shared-element readiness from the grid.
- **Preconditions:** —
- **Steps:** 1. Switch All → AI; sample leaving cards' opacity (fade-out ≈150ms) and entering cards' (fade-in ≈200ms); layout spring 260/28. 2. `reducedMotion`: opacity-only, no transform on any card during the switch. 3. Every grid card has `view-transition-name: project-{slug}`; click one → TC-015 behaviour to `/work/{slug}`. 4. Hover/press/focus per TC-014 in grid mode.
- **Test data:** —
- **Expected:** as above; no layout shift outside the grid.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-069 · `/work` accessibility and Lighthouse
- **Related:** M-004 · TKT-16 AC 7 (TSK-15); TKT-18 DoD · **EVAL:** EVAL-004, EVAL-006
- **Component:** `/work`
- **Objective:** Route-level gates with the grid, strip and `DemoVideo` posters present.
- **Preconditions:** `pnpm build`.
- **Steps:** 1. axe at 390 and 1440 on `/work` and `/work?filter=experiments`. 2. LHCI mobile + desktop, 3-run median. 3. Confirm no `<video>` element exists in the initial DOM (TC-072) so video weight cannot affect the score.
- **Test data:** —
- **Expected:** axe 0 critical/serious; ≥90/95/95/95 both presets; work OG image validated by TC-030/031.
- **Type:** performance / accessibility · **Priority:** P0 · **Automation:** Y — axe + LHCI · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-070 · `ExperienceStrip`: flat, labelled, no product affordance, one-open expand
- **Related:** M-004 · TKT-17 AC 1–3, AC 5 · **EVAL:** EVAL-007, EVAL-011, EVAL-013
- **Component:** `ExperienceStrip`
- **Objective:** Corporate work is visibly separated and never implies a public product (Solution-PRD §5; milestone DoD).
- **Preconditions:** `/work`.
- **Steps:** 1. Assert label "Professional experience — corporate work, not a public product." is visible text and inside the strip's accessible name/heading. 2. Three rows (mars-ar-modernization, cloud-modernization-programs, godrej-smartnet) with title/company/dates/tags verbatim from §2.3; Godrej tag "Platform". 3. Assert no `<a>` to an external URL, no `DemoVideo`, no arrow icon, no `view-transition-name`, no `img` inside rows. 4. Expand row 1 (button `aria-expanded`) → summary paragraph; expand row 2 → row 1 collapses. 5. `reducedMotion`: instant. 6. Computed styles: no clay shadow tokens; border present; at 4 widths visibly distinct from the grid (screenshot). 7. "See my experience →" links to `/about#experience` (resolved by TC-097).
- **Test data:** §2.3.
- **Expected:** all assertions hold; axe clean.
- **Type:** functional / content-integrity · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-071 · `DemoVideo` four states with fixtures (EVAL-014)
- **Related:** M-004 · TKT-18 AC 1, AC 6 · **EVAL:** EVAL-014
- **Component:** `DemoVideo`
- **Objective:** no-video / loading / playing / error each render as designed.
- **Preconditions:** fixture page `/dev/artifacts` (or a `DemoVideo` fixture route) with four instances: missing `src`; valid `src` under `page.route` throttling; `src` returning 404; valid `src`.
- **Steps:** 1. Missing src: poster (or placeholder) + "Demo coming" badge; no play button that would do nothing (button either absent or disabled+described). 2. Valid + throttled: click play → spinner overlay (`loading`) visible; then native controls when `canplay`. 3. 404 src: click play → error overlay "View live →" linking to the project's live URL; for a project with no live URL, overlay says "Demo coming". 4. Valid: plays muted with controls; duration caption from data. 5. Screenshot each state at 390 and 1440.
- **Test data:** fixture video ≤1 MB under `tests/fixtures/`.
- **Expected:** 4/4 states; error overlay link resolves (crawler) and is announced (`role="alert"` or live region).
- **Type:** functional / error-handling · **Priority:** P1 · **Automation:** Y — Playwright (`pnpm eval --only EVAL-014`) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-072 · `<video>` mounts only on intent; attributes; desktop 50%-in-view rule
- **Related:** M-004 · TKT-18 AC 2, AC 4 · **EVAL:** EVAL-004, EVAL-005, EVAL-014
- **Component:** `DemoVideo`
- **Objective:** Video never costs Lighthouse points.
- **Preconditions:** `/work` with ≥1 real or fixture video.
- **Steps:** 1. Initial DOM: `document.querySelector('video') === null`; network log has no `.mp4` request. 2. 1440 with pointer: scroll a card to 50% in view → `<video preload="none" muted playsinline controls>` mounted, still no media bytes fetched until play. 3. 390 / `touch` fixture: scroll to 100% in view → no `<video>` until tap. 4. Click play → media request starts. 5. Lighthouse on `/work`: LCP element is a poster image, not a video; every poster ≤120 kB WebP (file assertion over `public/video/*-poster.webp`).
- **Test data:** —
- **Expected:** as above.
- **Type:** functional / performance · **Priority:** P1 · **Automation:** Y — Playwright + Vitest (poster sizes) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-073 · `DemoVideo` play control accessibility
- **Related:** M-004 · TKT-18 AC 3, AC 5 · **EVAL:** EVAL-006, EVAL-007, EVAL-008
- **Component:** `DemoVideo` play `ClayButton`
- **Objective:** Keyboard-operable, labelled, sized control; reduced-motion safe.
- **Preconditions:** —
- **Steps:** 1. Play button box ≥44×44 (spec 56×56); accessible name "Play demo: {project name}". 2. Tab to it; Enter mounts/plays; focus moves to the `<video>` controls. 3. `reducedMotion`: poster→play transition changes only opacity/scale of the icon. 4. axe on a card with the video mounted.
- **Test data:** —
- **Expected:** all hold.
- **Type:** accessibility · **Priority:** P1 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-074 · All 11 case-study routes build; thin slugs render the honest short page
- **Related:** M-004 · TKT-19 AC 1 (TSK-16, TSK-18) · **EVAL:** EVAL-006, EVAL-011, EVAL-015
- **Component:** `app/work/[slug]/page.tsx`
- **Objective:** One template renders any conforming record without invention.
- **Preconditions:** TKT-15 data; TKT-19 merged.
- **Steps:** For each of the 11 slugs at 390 and 1440: 1. `GET` 200. 2. Header present (name, one-line problem, meta chips). 3. If `chapters` bodies are empty: 30-sec overview + the note "Deep dive coming — this project is documented as {status}" + `NextProject`; no `OverviewToggle`, no `ChapterNav`, no `ShowTheThinking`. 4. axe. 5. `GET /work/not-a-slug` → 404 page (TC-103).
- **Test data:** 11 slugs.
- **Expected:** 11/11 render; thin pages contain no empty chapter headings or empty artifact slots; axe 0 critical/serious.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright (`tests/e2e/case-study.spec.ts`) · **Status:** Planned · **Defect:** —
- **Notes:** Re-run after every M-005 content ticket (regression).

### TC-075 · `CaseStudyHeader` metrics: five fields, kind badge, "as of" date, media slot
- **Related:** M-004 · TKT-19 AC 2 (TSK-16); TKT-20 AC 2 · **EVAL:** EVAL-013
- **Component:** `CaseStudyHeader`, inline `MetricCard`
- **Objective:** Numbers never appear naked in the header.
- **Preconditions:** a record with metrics (TeachSpark after TKT-28; a fixture before).
- **Steps:** 1. For each rendered header metric assert value, label, context sentence, "as of {date}" caption, and kind badge text ∈ {measured, structural, self-reported} with an icon. 2. Assert count 2–3. 3. Right column: `ClayFrame` media = image, `DemoVideo`, or a visibly labelled placeholder (never an empty frame). 4. <768: media above text; metrics 1 column. 5. Vitest: rendering the header with a metric missing `context` is a type error / throws.
- **Test data:** TeachSpark metrics (asOf 2026-08-24) or fixture.
- **Expected:** all hold.
- **Type:** functional / content-integrity · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-076 · `OverviewToggle`: default 30-sec, radiogroup keyboard, crossfade, hidden when `deepDive:false`
- **Related:** M-004 · TKT-19 AC 4 (TSK-17) · **EVAL:** EVAL-007, EVAL-010
- **Component:** `OverviewToggle`
- **Objective:** Progressive disclosure that is keyboard-native.
- **Preconditions:** a deep-dive record and a thin record.
- **Steps:** 1. Deep-dive page: "30-sec" selected by default; chapters hidden. 2. `role="radiogroup"`; ArrowRight selects "Deep dive": chapters appear via 200ms crossfade + layout animation; ArrowLeft returns. 3. `reducedMotion`: instant swap. 4. Thin page: toggle absent.
- **Test data:** —
- **Expected:** as above; the URL does not change on toggle.
- **Type:** accessibility · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-077 · `ChapterNav` rail / pill row, active tracking, anchor scheme, prose measure
- **Related:** M-004 · TKT-19 AC 5 (TSK-17); TKT-13 AC 4; TKT-10 AC 4 · **EVAL:** EVAL-007, EVAL-008, EVAL-011
- **Component:** `ChapterNav`, `Chapter`, `Prose`, `docs/anchors.md`
- **Objective:** The anchor scheme is load-bearing for How I Think and Ask evidence — prove it resolves.
- **Preconditions:** a deep-dive page in Deep dive mode.
- **Steps:** 1. ≥1024: sticky left rail numbered 01–08; scroll to chapter 4 → item 04 bold with `accent` underline (IO). 2. <1024: sticky horizontal pill row under the header; page-level `expectNoOverflow`; prose `max-width ≤600px` at 768 and 1023. 3. Assert element ids `#01-context`, `#02-problem`, `#03-discovery`, `#04-product-bet`, `#05-what-i-built`, `#06-evaluation`, `#07-outcome`, `#08-what-i-learned` exist and equal `docs/anchors.md`. 4. Follow every How I Think link (TC-056) and every Ask evidence href with a hash: target id exists on the target page (crawler hash rule in TC-037). 5. Rail links keyboard-activatable; `aria-current` on the active item.
- **Test data:** anchor list.
- **Expected:** all hold on TeachSpark/RailCite/Velora once M-005 lands; before that, hash targets are `BLOCKED` with reason.
- **Type:** functional / responsive · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-078 · `NextProject` cycle and `ProgressBar`
- **Related:** M-004 · TKT-19 AC 6 (TSK-18) · **EVAL:** EVAL-011
- **Component:** `NextProject`, `ProgressBar`
- **Objective:** Every case study leads to the next in `/work` order; reading progress is visible.
- **Preconditions:** —
- **Steps:** 1. For each slug assert the band "Next: {name} →" points to the next personal project in `/work` order; last wraps to first. 2. Hover → thumbnail slides in (200ms); `reducedMotion` → appears without translate. 3. Scroll page → `ProgressBar` width increases monotonically 0→100%; `aria-hidden` or `role="progressbar"` with value.
- **Test data:** —
- **Expected:** 11/11 correct targets; no dead band.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-079 · `/work/teachspark` Lighthouse and per-slug OG (card fidelity, re-run with full content)
- **Related:** M-004/M-005 · TKT-19 AC 7; TKT-28 (re-check); TKT-22 · **EVAL:** EVAL-004, EVAL-017
- **Component:** `/work/teachspark`
- **Objective:** The deepest page stays within budget before and after real media/content.
- **Preconditions:** run 1 after TKT-19; run 2 after TKT-22 + TKT-28.
- **Steps:** 1. LHCI mobile + desktop 3-run median. 2. Confirm `og:image` for the slug is distinct and shows name + one-liner + status (TC-031).
- **Test data:** —
- **Expected:** ≥90/95/95/95 both runs; both persisted; run 2 shows no regression >2 points on perf vs run 1 without a recorded reason.
- **Type:** performance · **Priority:** P0 · **Automation:** Y — LHCI · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-080 · `ArtifactRenderer` maps all eight types; each renders its shape; captions never leak paths
- **Related:** M-004 · TKT-20 AC 1, AC 4, AC 5 (TSK-19–21) · **EVAL:** EVAL-003, EVAL-006, EVAL-013, EVAL-016
- **Component:** `ArtifactRenderer`, `InsightCard`, `HypothesisCard`, `MetricCard`, `DecisionCard`, `EvaluationCard`, `ExperimentCard`, `PrototypeFrame`, `ArtifactCard`
- **Objective:** Typed evidence blocks render correctly and safely.
- **Preconditions:** `/dev/artifacts` with realistic TeachSpark/RailCite pack data.
- **Steps:** 1. Vitest: renderer returns the right component for each `Artifact.type` incl. `generic`; unknown type throws at build/test. 2. Playwright on `/dev/artifacts` at 390/1440: Insight has quote + butter left bar + source caption; Hypothesis shows "We believe…" / "We'll know when…"; Metric shows tabular-nums value + label + context + asOf + kind badge; Decision shows Chosen (mint check) vs Rejected (muted); Evaluation shows method → result → limitation rows; Experiment shows setup → result → learning connector; PrototypeFrame shows bezel + caption; Generic shows type icon + link. 3. Every artifact has a source caption: `<a>` when the source is a URL, a human label otherwise. 4. Grep rendered HTML for `/Volumes/`, `/Users/`, `E Drive` → 0. 5. axe on the board.
- **Test data:** fixture artifacts ×8.
- **Expected:** 8/8 shapes; 0 path leaks; axe clean; screenshots saved.
- **Type:** functional / security-functional · **Priority:** P1 · **Automation:** Y — Vitest + Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-081 · `MetricCard` guards: refuses to render without context / asOf / kind; badge = icon + text
- **Related:** M-004 · TKT-20 AC 2 (TSK-19) · **EVAL:** EVAL-013, EVAL-006
- **Component:** `MetricCard`
- **Objective:** The "no naked numbers" rule is enforced in the component, not by review.
- **Preconditions:** —
- **Steps:** 1. Type test: `<MetricCard value="5" label="x" />` without `context`/`asOf`/`kind` fails `tsc`. 2. Runtime: rendering with an empty `context` string throws (dev) / renders nothing with a console error (prod) — assert the chosen behaviour. 3. Badge element contains an `<svg>` icon and visible text; `StatusBadge` likewise (Design.md "never colour alone").
- **Test data:** —
- **Expected:** compile error + runtime guard + redundant coding on badges.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — Vitest + tsc type test · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-082 · Artifact layout stays within the chapter column; tier locks (D1)
- **Related:** M-004 · TKT-20 AC 1, AC 3; milestone DoD · **EVAL:** EVAL-008, EVAL-009
- **Component:** `Chapter` artifact grid
- **Objective:** Evidence anchored to its paragraph; card tier outside, flat inside.
- **Preconditions:** a chapter with 3 artifacts (fixture or TeachSpark).
- **Steps:** 1. 390: 1-up; 768: 2-up; 1024/1440: 3-up; each artifact's right edge ≤ the prose column's right edge (never full-bleed). 2. Computed styles: artifact container carries card-tier radius/shadow; inner text zones carry no clay tokens. 3. Chapter body `Prose` has no clay tokens at all.
- **Test data:** —
- **Expected:** all hold at 4 widths.
- **Type:** responsive · **Priority:** P1 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-083 · `ShowTheThinking` renders from an 8-node chain; hidden when the chain is empty or short
- **Related:** M-004 · TKT-21 AC 1; TKT-54 · **EVAL:** EVAL-003
- **Component:** `ShowTheThinking`, `ThinkingNode`
- **Objective:** The signature interaction appears only where evidence supports it.
- **Preconditions:** `/dev/thinking` (TeachSpark chain) and a thin slug.
- **Steps:** 1. Fixture: toggle "Show the thinking ↓" present; on open 8 nodes in order Observation → User problem → Insight → Hypothesis → Product decision → Prototype → Evaluation → Outcome, each with stage label, text and source link. 2. Thin record (`thinking: []` or <8 nodes): no toggle rendered at all. 3. Vitest: schema rejects 7 nodes (TC-019) — so <8 can only occur as empty.
- **Test data:** —
- **Expected:** as above.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-084 · `ShowTheThinking` accessibility: ARIA, DOM presence when collapsed, keyboard, no auto-play
- **Related:** M-004 · TKT-21 AC 2, AC 4 · **EVAL:** EVAL-006, EVAL-007
- **Component:** `ShowTheThinking`
- **Objective:** Screen-reader discoverable before open; keyboard complete; never auto-plays.
- **Preconditions:** `/dev/thinking`.
- **Steps:** 1. Before any interaction: assert 8 node elements exist in the DOM and are exposed to AT per the documented pattern (`aria-expanded="false"` region or visually-hidden summary — assert whichever `docs/anchors.md`/component doc names). 2. Scroll the toggle into view and wait 2s: nodes remain collapsed (no auto-play). 3. Tab to toggle; Enter → `aria-expanded="true"`, focus remains on the toggle; subsequent Tabs visit each node's source link in order. 4. axe with nodes open and closed.
- **Test data:** —
- **Expected:** all hold.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-085 · `ShowTheThinking` reveal timing, animated properties, reduced motion, single column (D4)
- **Related:** M-004 · TKT-21 AC 3, AC 5 · **EVAL:** EVAL-008, EVAL-010
- **Component:** `ShowTheThinking`, connector
- **Objective:** Motion row "node reveal" and Deviation 6.
- **Preconditions:** —
- **Steps:** 1. Open; sample node opacities over time: node n becomes visible at ≈ n×120ms, each transition 220ms `cubic-bezier(.2,.7,.2,1)`; connector uses `clip-path`. 2. Observe animated CSS properties via `getAnimations()`: only `transform`, `opacity`, `clip-path`. 3. `reducedMotion`: all 8 visible immediately, opacity only. 4. At 4 widths: nodes form one column (each node's left edge equal); `expectNoOverflow`.
- **Test data:** —
- **Expected:** all hold.
- **Type:** functional / responsive · **Priority:** P1 · **Automation:** Y — Playwright (4 widths + reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** —

---

## M-005 · Case-study content (11) & media

### TC-086 · Video and poster budgets for every media file
- **Related:** M-005 · TKT-22 AC 1, TKT-23 AC 1, TKT-24 AC 1, TKT-25 AC 1, TKT-26 AC 1, TKT-27 (1a); TKT-50 pre-deploy check · **EVAL:** EVAL-004, EVAL-014
- **Component:** `public/video/<slug>.mp4`, `public/video/<slug>-poster.webp`
- **Objective:** Media never breaks the weight budget (DESIGN_DIRECTION §9, S6).
- **Preconditions:** ffprobe available; run for whichever files exist, listing missing ones as `NOT APPLICABLE` (soft per PB4) except the featured three, which are `FAIL` at TKT-50 time if missing.
- **Steps:** For each mp4: 1. size ≤4 MB. 2. duration 20–40 s (Pratyasa device footage and cinematic 20–30 s allowed). 3. width ≤1280. 4. codec h264, `yuv420p`, `moov` atom before `mdat` (faststart). 5. Poster exists, WebP, ≤120 kB, same aspect. 6. `data/projects.ts` `links.demoVideo.{src,poster,duration}` points at existing files and `duration` matches ffprobe ±1 s. 7. Chromium plays the file (Playwright `canplaythrough`); Safari check is manual (TC-107).
- **Test data:** all `public/video/*`.
- **Expected:** every present file passes all rules; data references never dangle.
- **Type:** validation · **Priority:** P1 · **Automation:** Y — script (ffprobe in Vitest) · **Status:** Planned · **Defect:** —
- **Notes:** Also the check that the 42.85 MB TeachSpark original is not in the repo (`git ls-files | grep -i teachspark.*mp4` size).

### TC-087 · Media provenance and dated live-status facts
- **Related:** M-005 · TKT-22 AC 2–3, TKT-23 AC 2, TKT-24 AC 2–3, TKT-25 AC 2, TKT-26 AC 2–3 · **EVAL:** EVAL-013
- **Component:** `content/media/<slug>/SOURCES.md`, `data/projects.ts` status copy
- **Objective:** Every capture is traceable; status copy reflects a dated check, not an assumption.
- **Preconditions:** media tickets closed.
- **Steps:** 1. For each slug with media: `SOURCES.md` exists with URL, date, viewport, and (TeachSpark) `origin/main` commit sha per screenshot, (RailCite) `/api/stats` numbers at capture. 2. TeachSpark: live-status line with date; `data/projects.ts` status string cites that date; TC-054's "uptime unverified" caveat removed. 3. Nuptis/Velora captions state mock data. 4. Screenshot counts: TeachSpark ≥3, RailCite ≥4, Bhakti-Vilas 4–6, dino-arcade ≥1.
- **Test data:** —
- **Expected:** all present; a reviewer can reproduce each capture from its SOURCES line.
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — script (file/structure checks) / N — manual (fact reading) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-088 · Frame privacy review of every recording and screenshot
- **Related:** M-005 · TKT-22 AC 4, TKT-23 AC 3, TKT-25 AC 3, TKT-26 AC 4, TKT-27 (2) · **EVAL:** EVAL-016
- **Component:** all files under `public/video/`, `public/media/`, `content/media/`
- **Objective:** Pixels can leak what grep cannot see.
- **Preconditions:** media captured.
- **Steps:** 1. Scrub every video at ≤1 s intervals and view every screenshot. 2. Check for: TeachSpark sandbox join code; JWT/session tokens, emails, account names (RailCite); real phone numbers (Bhakti-Vilas OTP flow); personal Google account, checkout/payment step (Tegaki); any ROM/BIOS content or `Game/neogeo/` reference (dino-arcade); a local `/dev/office` harness presented as Cubicle. 3. Record the pass per file in `SOURCES.md` ("frame check: <date>, <reviewer>").
- **Test data:** —
- **Expected:** 0 findings; every file carries a frame-check line.
- **Type:** security-functional · **Priority:** P0 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** A finding here is a hard block on the file, not a note.

### TC-089 · Cubicle conditional outcome recorded (media or explicit N/A)
- **Related:** M-005 · TKT-27 AC 1a/1b; TKT-32 AC 3; decision S3 · **EVAL:** EVAL-013, EVAL-014
- **Component:** `data/projects.ts` cubicle record, `decisions.md`
- **Objective:** Either path is honest and consistent across data, card and featured slot.
- **Preconditions:** 2026-09-16 deadline passed or Cubicle deployed.
- **Steps:** 1a. If deployed: media files pass TC-086/087/088; `decisions.md` EXE-n records the featured swap; TC-054 expected order updated in the same commit; status changes from "Built, not launched". 1b. Else: ticket closed "Not applicable — not deployed" with date; status "Built, not launched"; `DemoVideo` renders `no-video`; `featured` unset; no `links.live`.
- **Test data:** —
- **Expected:** exactly one branch fully satisfied; no mixed state (e.g. featured but no video).
- **Type:** validation · **Priority:** P2 · **Automation:** Y — Vitest (data consistency rule: `featured` ⇒ `demoVideo` present for cubicle) / N — manual (closure record) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-090 · Truth-trace review of the featured three (TeachSpark · RailCite · Velora)
- **Related:** M-005 · TKT-28, TKT-29, TKT-30 shared AC (a)–(e) + specific ACs; milestone DoD "Truth review" · **EVAL:** EVAL-003, EVAL-013
- **Component:** `/work/teachspark`, `/work/railcite`, `/work/velora` rendered pages
- **Objective:** Every sentence, artifact, metric, node and learning traces to a pack line; MISSING items are placeholders or omitted.
- **Preconditions:** content tickets' PR trace tables attached.
- **Steps:** Per page: 1. Walk the rendered text top to bottom; for each claim find the pack line (§8.1/§8.2/§8.5, §1.5) in the trace table; mark any untraceable sentence. 2. For each MISSING item in the pack, confirm it is absent or rendered as "Not recorded" / "Demo coming" / labelled placeholder — never paraphrased into existence. 3. Check the specific rules: TeachSpark — one snapshot date everywhere (08-24), "625 tests" absent, tests "335 passed / 2 skipped (phase-6, 2026-08-21)", role "solo MVP build, group discovery Sat–Mon", live status = TKT-22 dated check; RailCite — citation validity "by construction" (never a % over N), "148 tests"/"5,687 docs" never as current, failing test disclosed as "1 stale expectation", impeccable critique stated as found with fix record MISSING; Velora — team baseline table framed as secondary research, "Trust Scores are authored, not verified" disclosed, no users/pilot claimed, Insight quotes attributed to the team. 4. Authorship phrasing "built with Claude Code" only where the pack says so; product-model facts separate. 5. Hero media alt text present.
- **Test data:** CONTENT_INVENTORY §8.1, §8.2, §8.5 + trace tables.
- **Expected:** 0 untraceable claims; 0 paraphrased MISSING items; all specific rules hold.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** N — manual (reviewer trace); the string rules are additionally automated in TC-091 · **Status:** Planned · **Defect:** —
- **Notes:** Reviewer ≠ author of the content ticket.

### TC-091 · Mechanical content rules per project (string-level assertions over `data/projects.ts`)
- **Related:** M-005 · TKT-28 (1–3), TKT-29 (1–3), TKT-30 (1–3), TKT-31 (1–3), TKT-32 (1–3), TKT-33 (1–3), TSK-25 (1–3), TSK-26 (1–2), TSK-27 (1–3), TSK-28 (1–3), TSK-29 (1–2) · **EVAL:** EVAL-013
- **Component:** `tests/unit/content-rules.test.ts`
- **Objective:** The specific acceptance criteria that can be expressed as string presence/absence are enforced forever.
- **Preconditions:** all content tickets merged (each rule is `SKIP`-with-reason until its record has chapters).
- **Steps / Test data / Expected (one `it()` each):**
  - teachspark: all `metrics[].asOf` identical; no "625"; contains "335 passed"; no "08-26" date string.
  - railcite: "by construction" present; no regex `\d+ ?% .*citation`; no "148 tests"; "5,687" appears only with "7 Sep"/OCR context, never as the current corpus; "stale expectation" present.
  - velora: "secondary research" or "team baseline" present near "15–30 days"; "authored, not verified" present; no "users"/"pilot" claim words in outcome (allowlist "no pilot").
  - nuptis: "No AI" / "keyword" present; "no automated tests" present; status "Live (mock data)"; `metrics` empty.
  - cubicle: role text contains "team of 6" and not "solo"; `metrics` only build-quality kinds (no cost/latency numbers); status "Built, not launched" unless EXE-n swap.
  - bhakti-vilas: "5" and "3" commits with "Shivali"; "directional estimates" present; status "Live prototype (mock data, team build)"; team survey numbers carry "team" attribution in `context`.
  - token-toli: status "Discovery only"; no `links.live`/`demoVideo`; "44 interviews" only with "team" attribution; "11 named respondents" present and no other respondent total.
  - pratyasa: "IN 429867"; rights line "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic"; no product-metric kinds.
  - tegaki: "No AI in product"; "confirms without charging"; Master Prompt described only as "internal"; no pilot/order counts.
  - dino-arcade: "BYO-ROM"; no "Game/" or "neogeo"; no test-result numbers; `repoPublic:true`.
  - cinematic-portfolio: if "7+"/"40+"/"180+"/"30 %" present then `kind:'self-reported'` with resume source; a link to `/playground` exists; `repoPublic:true`; film cost metric `197` `kind:'measured'` asOf `2026-08-26`.
  - all thin five: no `MetricCard` (metric) not present in its pack (checked against a per-slug allowlist file `tests/fixtures/metric-allowlist.json` that mirrors the packs).
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** Complements, never replaces, TC-090.

### TC-092 · All 11 case-study pages after content: gate, axe, anchors, ShowTheThinking presence
- **Related:** M-005 · shared AC (f) for TKT-28…33, TKT-54 AC (g)(h) · **EVAL:** EVAL-006, EVAL-011, EVAL-013
- **Component:** `/work/[slug]` ×11
- **Objective:** Regression of TC-074/077/083 with real content.
- **Preconditions:** M-005 content merged.
- **Steps:** 1. Schema gate over final data. 2. TC-074 assertions at 390/1440 for all 11. 3. TC-077 anchor resolution for TeachSpark/RailCite/Velora (+ any slug with chapters). 4. `ShowTheThinking` present exactly on slugs with 8-node chains; absent elsewhere. 5. Every `MetricCard` on the page shows all five fields (TC-075 rule).
- **Test data:** —
- **Expected:** all pass; `pnpm eval` green with no Critical regression.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Playwright + axe + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-093 · Product-leader question traceability (EVAL-003)
- **Related:** M-005 · TKT-39 AC 1–3; TKT-28/29/30 "EVAL-003 rows filled" · **EVAL:** EVAL-003
- **Component:** rendered TeachSpark / RailCite / Velora pages
- **Objective:** Solution-PRD §8 criterion 3 proven with URL#anchor evidence, not assertion.
- **Preconditions:** TC-090 passed.
- **Steps:** 1. For each of the 8 questions in §D (below), open the planned artifact anchors and confirm the artifact actually answers the question. 2. Fill the "Verified anchor" column; persist to `evals/results/eval-003-<sha>.md`. 3. Any gap → `QA-###` with a proposed sourced artifact (never invented) or an explicit documented gap.
- **Test data:** §D table.
- **Expected:** 8/8 mapped to ≥1 rendered artifact; Tushar confirms.
- **Type:** visual-review (product acceptance) · **Priority:** P1 · **Automation:** N — manual (anchor existence automated via TC-077) · **Status:** Passed · **Defect:** QA-001 (Low; Q3 whitespace/blue-ocean `PrototypeFrame` missing for TeachSpark — content answered independently via `HypothesisCard`, not blocking)
- **Notes:** 8/8 mapped, `evals/results/eval-003-bda8555.md`; 6/8 rows required an anchor correction against the original plan (real content one chapter away from the guess — see Appendix D + the report for detail); Tushar confirmation still pending (human-in-the-loop, per Expected).

---

## M-006 · About · Thinking · Playground · Contact · 404

### TC-094 · `experience.ts` / `skills.ts` data and About copy rules
- **Related:** M-006 · TKT-40 AC 1–5 (TSK-22) · **EVAL:** EVAL-013
- **Component:** `data/experience.ts`, `data/skills.ts`, `AboutHero`, `Impact`, `ProductJourney`
- **Objective:** Resume-sourced, PII-free, correctly labelled.
- **Preconditions:** TKT-40 merged.
- **Steps:** 1. Schema green; 4 roles (Godrej, Quantiphi, Shellkode, AmEx) each with context/responsibility/scale/whatChanged/outcomes; `scale` = "not recorded" marker where §4.5 says MISSING. 2. Every string traces to CONTENT_INVENTORY §4.1–4.5 (table-driven equality on key fields). 3. "SAFe" appears only in methodology context; "PMP" absent; no DOB/phone/address (TC-022 patterns). 4. Impact rows equal §4.4 with kinds: AmEx/Godrej/Devin `self-reported`; TeachSpark `measured` (+ self-reported note on time saved); RailCite corpus `measured` asOf 2026-09-15; "0 invented citations" `structural`. 5. AboutHero headline "Senior Product Manager. Product Thinker · AI Builder · Problem Solver."; bio omits "AI Product Manager". 6. "American Express (via IntraEdge)" wording (default) and "7+ years"; the 2019–2022 gap note absent unless `decisions.md` records Tushar's framing.
- **Test data:** §4.1–4.5.
- **Expected:** all hold.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-095 · About layout: hero, journey, clusters, Impact at four widths; numbers never naked
- **Related:** M-006 · TKT-40 AC 6 (TSK-23, TSK-24) · **EVAL:** EVAL-006, EVAL-008, EVAL-009
- **Component:** `/about` upper half
- **Objective:** Design.md §3 Timeline-section layout and the MetricCard shape for Impact.
- **Preconditions:** —
- **Steps:** 1. `AboutHero`: flat variant, avatar + headline, no floating tiles. 2. `ProductJourney`: 4 stages on the connector line; reveal-only (no click handlers); reduced-motion opacity-only. 3. Clusters: 4 `ClayTile`s, 2×2 at 390/768, 4×1 at 1024/1440, utility tier. 4. Impact: every number rendered inside a `MetricCard` with label + context (+ kind badge). 5. `expectNoOverflow`; axe at 390/1440. 6. Screenshot review: flat text ≤600px measure; not a wall of resume text.
- **Test data:** —
- **Expected:** all hold; review note persisted.
- **Type:** responsive / visual-review · **Priority:** P1 · **Automation:** Y — Playwright + axe / N — manual (wall-of-text judgement) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-096 · `ExperienceTimeline` orientation and overflow at four widths
- **Related:** M-006 · TKT-41 AC 4 · **EVAL:** EVAL-006, EVAL-008
- **Component:** `ExperienceTimeline`, `TimelineNode`
- **Objective:** Horizontal ≥1024, vertical below, never overflowing.
- **Preconditions:** `/about#experience`.
- **Steps:** 1. 1024/1440: 4 nodes on one horizontal line, labels above, dates below, evenly spaced. 2. 390/768: vertical line at a 24px left inset, nodes stacked, story cards accordion inline. 3. `expectNoOverflow`; axe with one card open at each width.
- **Test data:** —
- **Expected:** as above.
- **Type:** responsive · **Priority:** P1 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-097 · `ExperienceTimeline` keyboard, one-open rule, hash deep links, focus return, MISSING labels
- **Related:** M-006 · TKT-41 AC 1–3, AC 5 · **EVAL:** EVAL-007, EVAL-011
- **Component:** `ExperienceTimeline`, `StoryCard`
- **Objective:** The second "most novel interaction" is keyboard-complete and URL-addressable.
- **Preconditions:** —
- **Steps:** 1. Tab reaches node 1; ArrowRight/Left move between nodes; Enter/Space opens `StoryCard` (`aria-expanded="true"`, `aria-controls` → card id) showing Context / Role / Scale / What changed / Outcomes as a 2-col grid ≥768, 1-col <768; 44×44 close. 2. Open node 3 while node 1 is open → node 1 closes; exactly one `[aria-expanded="true"]`. 3. URL hash becomes `#experience-{role}`; load `/about#experience-amex` cold → AmEx card open and scrolled into view. 4. `Esc` closes and returns focus to the node. 5. "Scale: not recorded" rendered where MISSING; outcomes carry "self-reported". 6. `#experience` anchor exists (target of `/work` strip and Ask evidence).
- **Test data:** roles godrej, quantiphi, shellkode, amex.
- **Expected:** all hold at 390 and 1440.
- **Type:** accessibility / functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-098 · `ExperienceTimeline` motion: hover, StoryCard spring, reduced motion
- **Related:** M-006 · TKT-41 AC 3, AC 6 · **EVAL:** EVAL-010
- **Component:** `TimelineNode`, `StoryCard`
- **Objective:** Motion table rows "Timeline StoryCard expand" and hover.
- **Preconditions:** 1440.
- **Steps:** 1. Hover node → scale 1.1, adjoining segment colour brightens to `ink-2`. 2. Open card: layout animation spring 240/30 (~300ms); switching cards animates height. 3. `reducedMotion`: card height snaps; hover scale removed; no `transform` animations reported by `getAnimations()`.
- **Test data:** —
- **Expected:** as above.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright (default + reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-099 · Awards · Research · Education content, page order, About Lighthouse
- **Related:** M-006 · TKT-42 AC 1–5 · **EVAL:** EVAL-002 (hop 4), EVAL-004, EVAL-013, EVAL-017
- **Component:** `/about` lower half, about OG
- **Objective:** Verbatim research/education facts; the patent number is right everywhere; page performs.
- **Preconditions:** TKT-42 merged.
- **Steps:** 1. Awards (3, text only, no certificate images); Research: patent "IN 429867" with inventors + rights line; Langmuir 2025 with DOI link (HEAD 200–399); Soft Matter 2023 by title with "DOI pending" placeholder and no `doi.org` link; Education: M.Tech NIT Calicut 2022, B.E. BIT Durg 2016 — all verbatim §4.6–4.8. 2. Grep site-wide for "044152784" → 0 and "429867" present on `/about` and `/work/pratyasa`. 3. Section order = SITEMAP.md `/about` row. 4. "Let's talk" → `/contact`; resume control per TC-013. 5. LHCI mobile + desktop ≥90/95/95/95; axe 390/1440. 6. about `og:image` per TC-030/031.
- **Test data:** §4.6–4.8.
- **Expected:** all hold.
- **Type:** content-integrity / performance · **Priority:** P1 · **Automation:** Y — Vitest + Playwright + LHCI · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-100 · `/thinking` list and `/thinking/[slug]` essays: DRAFT labelling, sourced bodies, sitemap
- **Related:** M-006 · TKT-43 AC 1–5 · **EVAL:** EVAL-006, EVAL-011, EVAL-013, EVAL-017
- **Component:** `data/writing.ts`, `ThinkingList`, `EssayBody`
- **Objective:** The editorial voice exists honestly — drafts labelled, never faked.
- **Preconditions:** TKT-43 merged.
- **Steps:** 1. 5 entries verbatim from CONTENT_INVENTORY §5 (title, dek, backing passage, source, related project); all `draft:true`. 2. List: numbered rows 01–05 (large `ink-3` numerals), each with a visible "Draft — pending sign-off" `Tag`; no publish dates anywhere; empty-state banner "Essays in progress — five drafts, none published yet." rendered above the list while zero non-draft essays exist (Vitest: banner disappears when one entry is `draft:false`). 3. Hover: numeral turns `accent`, row tint lavender 4%. 4. Essay page: title, reading-time caption, DRAFT tag, body = quoted passage(s) + one clearly-marked framing paragraph only (no other prose), `Prose` ≤600px, related-project `ExternalLink` card. 5. All 5 slugs in `sitemap.xml` (TC-032) and 200. 6. axe 390/1440; crawler passes.
- **Test data:** §5.
- **Expected:** all hold.
- **Type:** functional / content-integrity · **Priority:** P2 · **Automation:** Y — Vitest + Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-101 · `/playground` four tiles: copy, external-link semantics, targets, stronger clay
- **Related:** M-006 · TKT-44 AC 1–4 · **EVAL:** EVAL-008, EVAL-009, EVAL-011
- **Component:** `PlaygroundHero`, `ClayTile` ×4
- **Objective:** Exactly the four sanctioned experiments, safely linked.
- **Preconditions:** TKT-44 merged.
- **Steps:** 1. Hero "Small experiments. Big questions."; exactly 4 tiles — Pratyasa (butter), Tegaki (peach), dino-arcade (blush), cinematic-portfolio (mint) — one-line copy from §6; no Slag City / Mock Interview / Game tile. 2. Each tile is one `<a target="_blank" rel="noopener">` to the project's live URL from data; accessible name includes "opens in new tab". 3. ≥44×44; focus ring; 2×2 at ≥768, 1-col at 390; `expectNoOverflow`. 4. Crawler: external HEAD 200–399 for all four. 5. Hover: deeper shadow permitted (assert shadow changes; still card/hero tokens, not a new tier). 6. axe 390/1440.
- **Test data:** §6.
- **Expected:** all hold.
- **Type:** functional / accessibility · **Priority:** P2 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-102 · `/contact` card: copy, four controls, geometry, `#resume` anchor, states, no form
- **Related:** M-006 · TKT-45 AC 1–5; decision S10 · **EVAL:** EVAL-002 (final hop), EVAL-007, EVAL-011, EVAL-013
- **Component:** `ContactCard`, `CopyButton`
- **Objective:** The conversion endpoint is honest, PII-minimal and complete.
- **Preconditions:** TKT-45 merged.
- **Steps:** 1. Single hero-tier lavender `ClayCard` ≤640px: "Still curious?"; email `Tushar_Pathak@outlook.com`, LinkedIn URL, city "Bengaluru, India" verbatim §7; no phone; no `<form>`/`<input>` on the page. 2. Four controls (copy, mailto `href="mailto:…"`, LinkedIn external, resume) each ≥44×44 with 12px gaps; 2×2 ≥768, stacked <768. 3. `CopyButton` per TC-059 on this page. 4. `id="resume"` anchor exists; resume control per TC-013 (both flag states; placeholder links here from every other page's placeholder). 5. axe 390/1440; crawler passes.
- **Test data:** §7.
- **Expected:** all hold.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-103 · 404 page
- **Related:** M-006 · TKT-46 AC 1–3 · **EVAL:** EVAL-011, EVAL-015
- **Component:** `app/not-found.tsx`
- **Objective:** Graceful, navigable dead end with a true 404 status.
- **Preconditions:** `pnpm build` served.
- **Steps:** 1. `GET /nope` and `GET /work/not-a-slug` → HTTP 404 with the custom page (not Next default). 2. Page has header, footer, one clay tile, headline, links to `/`, `/work`, `/contact` (each 200). 3. axe 390/1440; `reducedMotion` renders without animation errors. 4. `/nope` absent from sitemap.
- **Test data:** —
- **Expected:** all hold.
- **Type:** error-handling · **Priority:** P2 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

---

## M-007 · Quality sweeps, deployment & production verification

### TC-104 · Responsive sweep: every route × four widths (EVAL-008)
- **Related:** M-007 · TKT-47 AC 1, AC 2, AC 4 · **EVAL:** EVAL-008
- **Component:** all routes (static + 11 slugs + 5 essays + 404)
- **Objective:** Solution-PRD §8 criterion 4 (no horizontal scroll) plus target and text floors, mechanically.
- **Preconditions:** every page ticket merged; production build served.
- **Steps:** For each route × {390, 768, 1024, 1440}: 1. `expectNoOverflow`. 2. Enumerate visible interactive elements; assert each box ≥44×44 (allowlist: inline text links inside `Prose`, which must still have ≥44px line-box spacing). 3. Enumerate visible text nodes; computed `font-size` ≥14px. 4. Every `<img>` has intrinsic `width`/`height` or `aspect-ratio` (CLS). 5. Full-page screenshot → `docs/screenshots/<route>/<width>.png`.
- **Test data:** route list from sitemap + `/nope`.
- **Expected:** 0 overflow, 0 sub-44 controls, 0 sub-14px text, 0 unsized images; pack committed; `pnpm eval --only EVAL-008` green.
- **Type:** responsive · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** The `FilterTabs` row is the only allowed inner horizontal scroller (TC-066).

### TC-105 · Accessibility sweep: axe on every route at 390 & 1440, including open states (EVAL-006)
- **Related:** M-007 · TKT-48 AC 1 · **EVAL:** EVAL-006
- **Component:** all routes
- **Objective:** Zero critical/serious anywhere, not only on default states.
- **Preconditions:** as TC-104.
- **Steps:** For each route at 390 and 1440: 1. axe on load. 2. axe with `AskPanel` open. 3. On `/`: MobileMenu open (390), How-I-Think card open; `/work`: filter active + strip row expanded; `/work/teachspark`: Deep dive on, ShowTheThinking open, video mounted; `/about`: StoryCard open; `/contact`: CopyButton copied + error states.
- **Test data:** —
- **Expected:** 0 critical/serious in every state; moderate/minor findings logged as `QA-###` with a decision.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-106 · Keyboard-only sweep of every named flow with visible focus (EVAL-007)
- **Related:** M-007 · TKT-48 AC 2 · **EVAL:** EVAL-007
- **Component:** nav, MobileMenu, FilterTabs, ExperienceTimeline, AskPanel, AskPortfolio, ShowTheThinking, OverviewToggle, CopyButton, How I Think, DemoVideo, ChapterNav
- **Objective:** Consolidated run of the per-component keyboard cases with a focus-visibility assertion at every stop.
- **Preconditions:** mouse disabled in the Playwright context.
- **Steps:** 1. Execute TC-004, 005, 012, 047, 049, 052, 057, 064, 073, 076, 077, 084, 097, 102 keyboard paths in one session at 390 and 1440. 2. At every focus stop, assert the focused element has a computed outline/box-shadow ring (3px `accent`) and is within the viewport (`scrollIntoView` happened).
- **Test data:** —
- **Expected:** 100 % of flows completable; 0 stops without a visible ring; no focus lost to `<body>`.
- **Type:** accessibility / e2e · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-107 · Manual responsive and cross-browser review of the screenshot pack
- **Related:** M-007 · TKT-47 AC 3; TKT-16 AC 4 (peek); TKT-19 AC 3 (Safari fallback); TKT-22 AC 1 (Safari playback) · **EVAL:** EVAL-008, EVAL-015
- **Component:** `docs/screenshots/**`, Safari, Firefox
- **Objective:** Catch clipping, awkward wraps, and non-Chromium behaviour that assertions cannot see.
- **Preconditions:** TC-104 pack; Safari and Firefox on the Mac.
- **Steps:** 1. Review every screenshot for clipping, orphaned words in headlines, broken wraps, the FilterTabs peek at 390, card equal-heights. 2. Safari + Firefox smoke at 1440 and 390 (responsive mode): `/` card → case study (plain navigation end state identical), `AskPanel` open/close, TeachSpark video plays, no layout breakage. 3. Log defects as `QA-###`.
- **Test data:** —
- **Expected:** 0 unlogged visual defects; Safari/Firefox reach the same end states as Chromium.
- **Type:** visual-review · **Priority:** P1 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-108 · Reduced-motion sweep on every route (EVAL-010)
- **Related:** M-007 · TKT-48 AC 3 · **EVAL:** EVAL-010
- **Component:** all routes
- **Objective:** Every row of Design.md §4 collapses to opacity/instant under `prefers-reduced-motion: reduce`.
- **Preconditions:** `reducedMotion` fixture.
- **Steps:** For each route at 390 and 1440: 1. Load; scroll top to bottom; trigger every interactive state (header compaction, hover cards, open panel/menu/cards/toggles, filter switch, ShowTheThinking, video poster→play). 2. Continuously collect `document.getAnimations()` and CSS transitions; assert none animates `transform`, `translate`, `clip-path` (draw-in), or layout properties; only `opacity`/colour with duration ≤150ms (allowlisted: button press `scale(.98)`, CopyButton icon morph, DemoVideo icon scale — per §4 "unaffected/kept" rows). 3. Assert page fully usable (all TC-106 flows complete).
- **Test data:** —
- **Expected:** 0 disallowed animations; all flows complete.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright (reducedMotion) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-109 · VoiceOver pass on `/`, `/work/teachspark`, `/about`
- **Related:** M-007 · TKT-48 AC 4 · **EVAL:** EVAL-006, EVAL-007
- **Component:** three routes
- **Objective:** Screen-reader coherence that axe cannot judge (reading order, announcements, collapsed content discoverability).
- **Preconditions:** macOS VoiceOver; Safari.
- **Steps:** 1. Navigate each page by headings, landmarks and links. 2. `/`: Ask field → submit → hear the answer heading and evidence; MobileMenu (iPhone-size window) announced as dialog. 3. `/work/teachspark`: metric cards read value + label + context + kind; ShowTheThinking nodes discoverable before opening; OverviewToggle announced as radio group. 4. `/about`: timeline nodes announce expanded/collapsed; StoryCard definition list reads label → value. 5. Persist notes to `docs/a11y-pass.md`.
- **Test data:** —
- **Expected:** no unlabeled controls, no orphaned live regions, reading order matches visual order; findings → `QA-###`.
- **Type:** accessibility · **Priority:** P1 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-110 · Graceful degradation: JavaScript disabled, missing image, VT unsupported (EVAL-015)
- **Related:** M-007 · TKT-07 (VT-off fixture); TKT-46; evaluation-plan EVAL-015 · **EVAL:** EVAL-015
- **Component:** all routes
- **Objective:** Content and navigation survive without JS or with a missing asset.
- **Preconditions:** production build.
- **Steps:** 1. Playwright context `javaScriptEnabled: false`: load `/`, `/work`, `/work/teachspark`, `/about`, `/contact`; assert headline, project names, chapter text and nav links render (server components); links navigate; `Reveal`ed sections are visible (no opacity-0 trap); Ask/filters show a usable static fallback or are simply absent without broken UI. 2. Route-abort `public/avatar/avatar.webp` and a poster: page renders, alt text shown, no layout collapse (CLS check), no console uncaught errors. 3. `noViewTransitions` run of TC-055 (already covered) referenced here for completeness.
- **Test data:** —
- **Expected:** content readable and navigable with JS off; missing images degrade to alt text.
- **Type:** edge / boundary (reliability) · **Priority:** P2 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-111 · Pre-deploy check script: one unit test per failure mode (PB4/PB5)
- **Related:** M-007 · TKT-50 AC 8; decisions PB4, PB5 · **EVAL:** EVAL-013, EVAL-014, EVAL-016
- **Component:** `scripts/predeploy-check.ts`
- **Objective:** The deploy guard fails for every reason it exists, and passes a clean tree.
- **Preconditions:** script has injectable paths/flags.
- **Steps (table-driven):** 1. Clean tree, flag `false`, three featured videos present ≤4 MB → exit 0. 2. `public/resume.pdf` present and PII test fails → exit ≠0 naming "resume PII". 3. `resumeAvailable: true` with no PDF → exit ≠0. 4. `resumeAvailable: true` with a passing PDF → exit 0. 5. PII pattern injected in `.next` output → exit ≠0. 6. `public/video/railcite.mp4` missing → exit ≠0 naming the file. 7. `public/video/velora.mp4` 4.1 MB → exit ≠0. 8. Non-featured video missing → exit 0 (soft, PB4).
- **Test data:** temp fixtures.
- **Expected:** 8/8 outcomes as listed; the script is wired into the Vercel build command.
- **Type:** negative · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-112 · Contrast check of every token pairing actually used
- **Related:** M-007 · TKT-48 (contrast); Design.md §2 contrast rule, §5 row 1 · **EVAL:** EVAL-006, EVAL-009
- **Component:** tokens in use
- **Objective:** Body ≥7:1 on `bg`, secondary ≥4.5:1, `ink` only on clay tones, primary-button text ≥4.5:1 on `accent`.
- **Preconditions:** production build.
- **Steps:** 1. Script: crawl every route, collect (color, background-color) pairs of visible text nodes (resolving tinted card backgrounds), compute WCAG ratios. 2. Assert body text pairs ≥7:1, caption/secondary ≥4.5:1, no white/`bg` text on tints; report the full pair table. 3. Manual spot-check of 5 pairs with a picker (gradients/volume overlays).
- **Test data:** —
- **Expected:** 0 pairs below threshold; table persisted in `evals/results/`.
- **Type:** accessibility · **Priority:** P1 · **Automation:** Y — Playwright script / N — manual spot-check · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-113 · Lighthouse record run: four routes × mobile + desktop, budgets, before/after (EVAL-004/005)
- **Related:** M-007 · TKT-49 AC 1–4; TKT-52; TKT-53 · **EVAL:** EVAL-004, EVAL-005
- **Component:** `/`, `/work`, `/work/teachspark`, `/about`
- **Objective:** The release-gate numbers, measured on a real HTTPS deployment.
- **Preconditions:** preview URL (TC-116); later production URL.
- **Steps:** 1. `pnpm eval --only EVAL-004,EVAL-005 --base-url <preview>` (3-run median). 2. Persist "before" (first run) and "after" (post-fix) JSON in `evals/results/`. 3. Assert `lighthouserc.json` thresholds unchanged since Stage 3 (git diff of the assertions block = empty) — EV2. 4. Repeat on production (TC-120).
- **Test data:** —
- **Expected:** ≥90/95/95/95 on all 8 route×preset combinations; `/` JS ≤180 kB gz, LCP ≤2.5 s, CLS <0.05; no threshold lowered.
- **Type:** performance · **Priority:** P0 · **Automation:** Y — LHCI + script · **Status:** Planned · **Defect:** —
- **Notes:** Local runs (TC-061/069/079/099) are development gates; this is the record.

### TC-114 · Security headers on the deployment
- **Related:** M-007 · TKT-50 AC 2; TKT-53 · **EVAL:** EVAL-016
- **Component:** `next.config` headers, Vercel edge
- **Objective:** Static-site hardening is present and does not break the page.
- **Preconditions:** preview URL.
- **Steps:** 1. `curl -sI` each route and `/resume.pdf`, `/sitemap.xml`; persist output to `evals/results/headers-<sha>.txt`. 2. Assert `Content-Security-Policy` (default-src 'self'; no third-party script hosts; `img-src 'self' data:`; frame-ancestors 'none'), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/microphone/geolocation off), `Strict-Transport-Security` with max-age ≥15552000. 3. Load every route in Playwright with the CSP active: 0 CSP violation reports in console; fonts, images, videos, Vercel Analytics/Speed Insights still load.
- **Test data:** —
- **Expected:** all headers present on every response; 0 CSP violations.
- **Type:** security-functional · **Priority:** P1 · **Automation:** Y — script + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Vercel Analytics requires a `connect-src`/`script-src` allowance for `vercel-insights`/`va.vercel-scripts.com` — the only sanctioned exception; document it.

### TC-115 · Dependency audit and secret/PII grep on the deployed bundle
- **Related:** M-007 · TKT-50 AC 3, AC 4; TKT-53 · **EVAL:** EVAL-016, EVAL-013
- **Component:** `pnpm audit`, deployed `_next/static` + HTML
- **Objective:** Nothing sensitive ships; no known high/critical vulnerabilities.
- **Preconditions:** preview URL.
- **Steps:** 1. `pnpm audit --prod --audit-level=high`; persist JSON. 2. Download the deployed HTML for every route and every referenced `_next/static/**` asset; run the TC-022 pattern set plus secret patterns (`sk-`, `AKIA`, `eyJ` JWT prefix, `SUPABASE`, `RAG_ENDPOINT` values) over the bytes. 3. Assert `.env*`, `tests/forbidden.local.json`, `content/media/**/SOURCES.md` are not publicly fetchable (404).
- **Test data:** —
- **Expected:** 0 high/critical; 0 hits; private files 404.
- **Type:** security-functional · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-116 · Preview deployment smoke
- **Related:** M-007 · TKT-50 AC 1, AC 5, AC 6, AC 7 · **EVAL:** EVAL-002, EVAL-014
- **Component:** Vercel project `portfolio-clay` (preview)
- **Objective:** A real HTTPS deployment serves everything the local build did.
- **Preconditions:** TKT-22/23/24 closed (PB4); Vercel project created under the confirmed team (never the cinematic project).
- **Steps:** 1. `GET` every sitemap route + `/sitemap.xml` + `/robots.txt` + `/nope` (404) on the preview URL; record status codes. 2. Resume: `/resume.pdf` 200 if flag true, else placeholder on every control (TC-013). 3. Play `teachspark`, `railcite`, `velora` videos from the preview: posters load ≤120 kB, `canplaythrough` fires, files ≤4 MB by `content-length`. 4. Vercel Analytics + Speed Insights scripts present and a page view registers in the dashboard. 5. Full `pnpm eval --base-url <preview>` persisted as `eval-run-preview-<sha>.json`. 6. `docs/deploy.md` describes rollback (promote previous deployment) and the pre-deploy check.
- **Test data:** —
- **Expected:** all 200/404 as expected; videos play; eval file persisted; rollback documented.
- **Type:** deployment-smoke · **Priority:** P0 · **Automation:** Y — script + Playwright / N — manual (Analytics dashboard, Vercel team confirmation) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-117 · Recruiter path in ≤6 clicks (EVAL-002)
- **Related:** M-007 · TKT-50, TKT-53; hops owned by TKT-12/16/19/40/42/45/08 · **EVAL:** EVAL-002
- **Component:** cross-route journey
- **Objective:** Solution-PRD §8 criterion 2 on a real deployment.
- **Preconditions:** preview URL (informational if flag false); production URL with `resumeAvailable: true` (gating).
- **Steps:** 1. Load `/`. 2. Click "View My Work →" (1) → `/work` 200. 3. Click the TeachSpark card (2) → `/work/teachspark` 200. 4. Click "See my experience →" or nav About (3) → `/about` 200. 5. Click resume control (4) → `/resume.pdf` 200 `application/pdf` (or, flag false: `/contact#resume` 200 — recorded as `BLOCKED` for the gate). 6. Click "Let's talk" (5) → `/contact` 200. 7. Count clicks; assert every hop status and that no hop needed scrolling past a full viewport to find the control at 1440 (secondary check).
- **Test data:** —
- **Expected:** ≤6 clicks; every hop 200; resume 200 on production.
- **Type:** e2e · **Priority:** P0 · **Automation:** Y — Playwright (`eval-002.spec.ts`) · **Status:** Planned · **Defect:** —
- **Notes:** Also run at 390 via MobileMenu (clicks to open the menu count).

### TC-118 · Link previews on LinkedIn Post Inspector and opengraph.xyz (EVAL-017 human part)
- **Related:** M-007 · TKT-51 AC 1–4; TKT-53 AC 3 · **EVAL:** EVAL-017
- **Component:** 7 page families on the preview, then production
- **Objective:** Solution-PRD §8 criterion 9.
- **Preconditions:** TC-030/031 green on the deployment.
- **Steps:** For `/`, `/work`, `/work/teachspark`, `/about`, `/thinking`, `/playground`, `/contact`: 1. Paste into opengraph.xyz; screenshot. 2. Paste into LinkedIn Post Inspector (Tushar's login if required); screenshot. 3. Save to `docs/og/<family>-<inspector>.png`. 4. Re-run all 14 after the production domain is live (absolute URLs change).
- **Test data:** —
- **Expected:** title, description and the 1200×630 image render on both inspectors for all 7 families, on preview and again on production.
- **Type:** visual-review · **Priority:** P1 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-119 · Hand-off record run and evidence pack (TKT-52)
- **Related:** M-007 · TKT-52 AC 1–4 · **EVAL:** all 17
- **Component:** `evals/results/eval-run-v1.0.0-rc.json`, `HANDOFF.md`
- **Objective:** Stages 8–10 start from evidence, not chat memory.
- **Preconditions:** TC-104…118 executed on the preview.
- **Steps:** 1. Run the complete `pnpm eval` against the preview; assert file name `eval-run-v1.0.0-rc.json`, full provenance, every Critical EVAL `PASS`, no High `FAIL` without a parked `QA-###` reason. 2. Manual EVAL rows (001, 003, 009, 017) reference their persisted evidence files. 3. `git diff main..HEAD --stat` reviewed; unexpected files → stop. 4. `HANDOFF.md` names the Stage-8 inputs (screenshot pack, `/dev/primitives`, `/dev/artifacts`), Stage-9 inputs (results, open QA), Stage-10 inputs (headers, audit, PII grep); `tickets.md` statuses updated; Obsidian + auto-memory mirrored.
- **Test data:** —
- **Expected:** gate conditions of evaluation-plan §6 met or explicitly parked; hand-off complete.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — script (run + gate assertions) / N — manual (diff review, HANDOFF) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-120 · Production verification, monitoring and release provenance (TKT-53)
- **Related:** M-007 · TKT-53 AC 1–7; decision S1 · **EVAL:** EVAL-002, EVAL-004, EVAL-016, EVAL-017
- **Component:** production domain
- **Objective:** Evidence-first release: the deployed product works, is observable, and the old sites are untouched.
- **Preconditions:** Stage 8–10 approved; `QA-report.md` = READY; TKT-08 done; domain attached; `NEXT_PUBLIC_SITE_URL` set.
- **Steps:** 1. Full `pnpm eval --base-url https://<domain>` → `eval-run-v1.0.0.json`. 2. TC-117 on production (resume 200 required). 3. TC-114/115 on production. 4. TC-118 re-validation. 5. TC-113 on production. 6. Vercel Analytics shows the verification traffic. 7. Rollback: redeploy the previous build once (or document the one-click path with a screenshot). 8. `HANDOFF.md` + `decisions.md` EXE-n record commit, build id, domain, date. 9. Monitoring note: Vercel error/latency dashboards + weekly `pnpm eval` cron (enabled or explicitly deferred). 10. `curl` `https://tushar-pathak.vercel.app` and open `portfolio/index.html`: unchanged (hash of the cinematic project's latest deployment id unchanged; `git status` clean in `portfolio/`).
- **Test data:** —
- **Expected:** all pass; provenance recorded; cinematic site and `portfolio/index.html` untouched.
- **Type:** deployment-smoke · **Priority:** P0 · **Automation:** Y — script (1–5) / N — manual (6–10) · **Status:** Planned · **Defect:** —
- **Notes:** Externally visible — Tushar confirms promotion first.

### TC-121 · Premium rubric per major page (EVAL-009, Stage 8 input)
- **Related:** M-007 (feeds Stage 8) · TKT-02 (hero), TKT-04, TKT-14, TKT-16, TKT-19, TKT-40, TKT-44 · **EVAL:** EVAL-009
- **Component:** `/`, `/work`, `/work/teachspark`, `/about`, `/playground`
- **Objective:** Premium-not-toy, scored against the running site.
- **Preconditions:** TC-104 screenshot pack; running preview.
- **Steps:** For each page score 0–2: not cluttered · whitespace ≥50 % · typography dominant · ≤1 accent colour per section · reads Senior PM not student · avatar resembles Tushar (where present). Persist to `evals/results/eval-009-<sha>.md`; findings become `DES-###` in Stage 8.
- **Test data:** rubric.
- **Expected:** ≥10/12 per page, no item at 0.
- **Type:** visual-review · **Priority:** P1 · **Automation:** N — manual (`impeccable` critique) · **Status:** Planned · **Defect:** —
- **Notes:** "Whitespace ≥50 %" has no mechanical definition here; a pixel-luminance heuristic may be added as an informational script but the score is human.

---

## M-009 · Illustrated editorial (paper) redesign — Stage 6.4, 2026-09-24

Consumes `tickets.md` M-009 (TKT-69…91, TSK-30…47), `technical-plan.md` §F, `Design.md` (paper spec) §3–§10, `evaluation-plan.md` §8 (EVAL-018…022), `decisions.md` S11–S21 · EV3–EV6 · D6–D12. Conventions as §0; additions: **"both widths"** for EVAL-018 means the Playwright projects `w390` and `w1440`; **"unit count"** = the number of `[data-decor]` descendants owned by a `<section>`/`<header>`/`<footer>` under the nearest-ancestor rule (`Design.md` §3.2). The four S18 regression tests are **TC-135, TC-157, TC-164, TC-167** (bold in Appendix A). Every gate-type case (EVAL-018 spec, EVAL-020 greps, EVAL-021 manifest, contrast pairs) carries a positive control.

### TC-122 · Paper token gate: 13/13 round-trip, exactly 13 `--color-*`, `--write` idempotent (EVAL-020 part 1)
- **Related:** M-009 · TKT-69 AC 1 (TSK-30, TSK-32) · **EVAL:** EVAL-020
- **Component:** `scripts/tokens-check.ts`, `app/globals.css` `@theme`, `tests/unit/eval-020.test.ts`
- **Objective:** The palette swap is mechanical from the first commit (S12): the check reads the paper names, the CSS declares only them, and regeneration is a no-op.
- **Preconditions:** TKT-69 S69.01–S69.02 applied.
- **Steps:** 1. Run `pnpm tokens:check`; capture stdout. 2. Parse `@theme` and collect every `--color-<name>:` definition. 3. Run `pnpm tokens:check --write` then `git diff --stat app/globals.css`. 4. Negative control: temporarily change one hex in `AUTHORITATIVE` and re-run step 1.
- **Test data:** `Design.md` §2.1 table (13 hex values).
- **Expected:** 1 → `13/13 tokens round-trip OK`; 2 → exactly `{paper, ivory, paper-2, navy, navy-2, ink-soft, rust, terracotta, forest, green-2, steel, note, kraft}`; 3 → empty diff; 4 → `12/13` and exit 1.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Vitest (steps 1–2) / script (3–4) · **Status:** Planned · **Defect:** —
- **Notes:** Supersedes TC-002's clay expectations for M-009 (TC-002 stays as history).

### TC-123 · Retired-name and colour-literal greps with positive control (EVAL-020 parts 2–3)
- **Related:** M-009 · TKT-69 AC 2, AC 5 (TSK-30, TSK-32); TKT-78 AC (allow-list); TKT-89 AC 3 · **EVAL:** EVAL-020
- **Component:** `tests/unit/eval-020.test.ts`, `tests/fixtures/retired-tokens.fixture.txt`
- **Objective:** No consumer keeps a clay name (`bg…butter`, incl. Tailwind utility forms with prefixes/variants/opacity) and no colour literal exists outside `app/globals.css` + `lib/og.tsx`.
- **Preconditions:** codemod (S69.04) committed.
- **Steps:** 1. Scan `app/**`, `components/**`, `lib/**` (`.ts/.tsx/.css`) with the utility regex `(?<![\w-])(bg|text|border|fill|stroke|outline|ring|from|via|to|decoration|placeholder|shadow|accent)-(bg|surface|lavender|ink|ink-2|ink-3|accent|accent-deep|mint|sky|blush|peach|butter)(?=[\s"'\`/:\]]|$)` and `var(--color-<retired>)`. 2. Scan `app/**` + `components/**` for `#[0-9a-f]{3,8}\b|\b(rgb|hsl|oklch|oklab)\(` excluding the two allow-listed files. 3. Run both scanners over the fixture file. 4. Assert `lib/og.tsx` is the only file under `lib/` with a hex literal.
- **Test data:** fixture containing `text-ink-3`, `hover:bg-lavender/30`, `#FAF9FF`, `oklch(0.5 0.1 200)`, `var(--color-accent)`, plus the non-token decoys `bg-white`, `tone="mint"`.
- **Expected:** 1–2 → 0 hits on the real tree; 3 → 5 hits, decoys not matched; 4 → true.
- **Type:** negative · **Priority:** P0 · **Automation:** Y — Vitest (in `pnpm eval`) · **Status:** Planned · **Defect:** —
- **Notes:** Tone prop names (`tone="mint"`) are enum values, not tokens (technical-plan F1-11); the regex must not match them.

### TC-124 · Fonts self-hosted: three families via `next/font`, zero Google Fonts requests, Fraunces axes (or the recorded fallback)
- **Related:** M-009 · TKT-69 AC 3, AC 4 (TSK-31) · **EVAL:** EVAL-004 (best-practices), EVAL-005 (transfer), EVAL-016 (CSP)
- **Component:** `app/layout.tsx`, `app/globals.css`, `tests/e2e/smoke.spec.ts`
- **Objective:** S13 — self-hosted Fraunces + Inter + Caveat with the TP9 CSP untouched; Manrope gone.
- **Preconditions:** `pnpm build && pnpm start`.
- **Steps:** 1. Fetch `/` HTML; list `/_next/static/media/*.woff2` references. 2. Playwright `w1440`: `page.on("request")` over `/`; collect hosts. 3. `getComputedStyle(h1)`: `fontFamily`, `fontVariationSettings`; `getComputedStyle(body).fontFamily`; a `.font-hand` element's family. 4. `grep -rni manrope app components lib tests --include=*.ts*` and `assets/fonts/`. 5. Positive control: add a `<link href="https://fonts.googleapis.com/…">` in a throwaway page, load it, assert the request appears (then remove).
- **Test data:** —
- **Expected:** 1 → ≥ 3 distinct woff2 files (one per family); 2 → 0 requests to `fonts.googleapis.com`/`fonts.gstatic.com`; 3 → h1 Fraunces with `"opsz"`/`"SOFT"` set **or** (Dev-18 fallback) static Fraunces 500 with a `Design.md` §11 row present; body Inter; hand Caveat; 4 → only `lib/og.tsx` until TKT-78, then 0; 5 → detected.
- **Type:** integration · **Priority:** P0 · **Automation:** Y — Playwright + script · **Status:** Planned · **Defect:** —
- **Notes:** A runtime font request would also be blocked by `font-src 'self'` and appear in EVAL-004 best-practices — two independent signals.

### TC-125 · Codemod completeness: tree builds and every existing suite is green with no spec deleted
- **Related:** M-009 · TKT-69 AC 5, AC 6 (TSK-30) · **EVAL:** EVAL-005 (recorded)
- **Component:** `scripts/codemod-tokens.ts`, whole tree
- **Objective:** The one-commit rename (S12) leaves nothing broken and hides nothing — assertions are renamed, never removed.
- **Preconditions:** S69.03 dry-run output saved to the ticket report.
- **Steps:** 1. `pnpm exec tsx scripts/codemod-tokens.ts --dry | wc -l` and the self-test fixture line. 2. After the run: `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`. 3. `pnpm test:e2e` (all projects). 4. `git diff --stat main..HEAD -- tests` — count deleted test files. 5. `bundle-budget --route / --json` before/after.
- **Test data:** self-test string `"bg-bg text-ink-3 hover:bg-lavender/30 bg-white tone-mint"`.
- **Expected:** 1 → ≈ 428 ± 30 rewrites; self-test → `"bg-paper text-ink-soft hover:bg-paper-2/30 bg-white tone-mint"`; 2–3 → exit 0; 4 → 0 deleted spec files; 5 → `firstLoadJsGzipKb` unchanged ± 1.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** The orchestrator reads the dry-run list for false positives before the commit is accepted (technical-plan S69.04).

### TC-126 · Paper primitive attribute contract and limit enforcement (Design.md §3.1/§3.4)
- **Related:** M-009 · TKT-70 AC 1, AC 2 (TSK-33, TSK-34) · **EVAL:** EVAL-018 (contract), EVAL-006
- **Component:** `components/paper/*`, `tests/unit/paper.test.tsx`
- **Objective:** Every counted object, fastener, content paper, flat zone and hand exemption renders exactly the attribute §3.1 specifies, with the limits enforced at render.
- **Preconditions:** TKT-70 TSK-33/34 built.
- **Steps:** 1. Render each primitive with defaults; collect `data-decor`/`data-fastener`/`data-paper`/`data-flat`/`data-hand`/`aria-hidden`. 2. `Sticky rotate={30}` → read `--rot`. 3. `Sheet` with three `Tape` children in test env. 4. `Hand kind="label"` with 4 words; `kind="cta"` with 7 words; `kind="quote"` with 241 chars; `kind="quote"` without `cite`. 5. Attempt `<Sticky aria-hidden={false}>` (type-level). 6. `Prose` output; `DraftTag` default text; `Tag` no longer imports `ClayPill`.
- **Test data:** fixture strings per limit.
- **Expected:** 1 → `data-decor ∈ {torn,sticky,annotation,sketch,note,tape}`, `data-fastener ∈ {tape,pin}`, `data-paper ∈ {card,index,postcard,notebook,photo,tag}`, text-bearing decorations always `aria-hidden="true"`; 2 → `5deg` (clamped); 3 → throws; 4 → each throws in dev/test; 5 → TypeScript error (`@ts-expect-error` line compiles); 6 → `data-flat` present, "Draft — pending sign-off", `ClayPill` absent.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** These are the guarantees `eval-018.spec.ts` relies on; a primitive that can be rendered without its attribute makes EVAL-018 meaningless.

### TC-127 · EVAL-018 spec: counting algorithm proven with the violating fixture and a clean board
- **Related:** M-009 · TKT-70 AC 3, AC 6 (TSK-35); decisions EV5, D6, TP12 · **EVAL:** EVAL-018
- **Component:** `tests/e2e/eval-018.spec.ts`, `tests/e2e/eval-018-lib.ts`, `app/dev/primitives/page.tsx`
- **Objective:** The four rules (≤ 4 per unit · Caveat only via `data-decor`/`aria-hidden`/valid `data-hand` · 0 decorations in `[data-flat]` · text decorations hidden) are measured exactly as §3.2 defines, including nearest-ancestor ownership for nested sections.
- **Preconditions:** `pnpm build && pnpm start`; `/dev/primitives` reachable.
- **Steps:** 1. Run the collector on `/dev/primitives?violate=1` at both widths. 2. Run it on `/dev/primitives` (clean board). 3. Nested-section fixture on the board: a decoration inside a chapter-style nested `<section>` must be counted for the inner section only. 4. A `data-hand="quote"` blockquote inside a `[data-flat]` zone. 5. Inspect the Playwright annotation table for one route.
- **Test data:** fixture section = 5 decorations + a Caveat `<p>` without `data-decor` + a `Sticky` inside a `FlatZone` + an unhidden `Sticky`.
- **Expected:** 1 → each of the four rules reports ≥ 1 violation; 2 → 0 violations, every unit ≤ 4; 3 → outer count excludes the inner decoration; 4 → allowed (0 violations); 5 → a per-unit table with `unit`, `count`, `caveatViolations`, `flatViolations`, `hiddenViolations`.
- **Type:** negative · **Priority:** P0 · **Automation:** Y — Playwright (the fixture test is untagged so it never counts as an EVAL-018 case failure) · **Status:** Planned · **Defect:** —
- **Notes:** Positive control for the whole EVAL-018 gate; "0 violations" on the site is only meaningful while this test passes.

### TC-128 · Draw-ins and `Reveal` under motion and reduced motion (Design.md §8)
- **Related:** M-009 · TKT-70 AC 5 (TSK-33); TKT-79 (Reveal on home) · **EVAL:** EVAL-010
- **Component:** `components/paper/Sketch.tsx`, `components/interactions/Reveal.tsx`, `app/globals.css`
- **Objective:** Draw-ins run once (400 → 0 over 1.1 s after 0.5 s) and render complete under reduced motion; `Reveal` is opacity + 12 px, never scale.
- **Preconditions:** `/dev/primitives` with every `Sketch` variant.
- **Steps:** 1. `w1440` default: read `strokeDashoffset` at t=0 and t=2 s. 2. `test.use({ reducedMotion: "reduce" })`: read `strokeDashoffset` and `animationName` at t=0. 3. `Reveal` element before/after intersection: computed `transform` and `opacity`. 4. Grep `globals.css` for `scale(0` inside `.reveal` rules.
- **Test data:** —
- **Expected:** 1 → 400 px then 0 px; 2 → 0 px and `none` immediately; 3 → `translateY(12px)`/`0` → `none`/`1`; 4 → 0 matches.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright (`withReducedMotion`) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-129 · EVAL-018 wired into `pnpm eval`: not deferred, real counts, parked-list semantics with stale-park guard
- **Related:** M-009 · TKT-70 AC 4, DoD (TSK-35); TKT-74 AC 4; TKT-90 AC 4 · **EVAL:** EVAL-018
- **Component:** `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `scripts/eval.ts`, `tests/e2e/eval-018-parked.json`, `docs/eval.md`
- **Objective:** The runner executes the spec and reports honestly; legacy hits are parked with a reason and a ticket, never hidden, and stale parks fail.
- **Preconditions:** TKT-70 done; `.next` built.
- **Steps:** 1. `pnpm exec tsx scripts/eval-cases.ts --check-specs`. 2. `pnpm eval --only EVAL-018 --skip-build`; read `cases[EVAL-018]`. 3. Negative control: remove the `@EVAL-018` tag from the spec and re-run step 1. 4. Add a parked entry that matches nothing; run the spec. 5. Add a parked entry matching a real legacy hit; run the spec. 6. At TKT-90: assert the file is `[]`.
- **Test data:** parked entry `{ route:"/about", unit:"section#impact", rule:"budget", reason:"legacy clay section — rebuilt in TKT-86", ticket:"TKT-86" }`.
- **Expected:** 1 → `22 cases OK`; 2 → status `PASS`/`FAIL` with non-empty `details` (never `SKIP … not built yet`); 3 → check-specs fails naming EVAL-018; 4 → spec fails (stale park); 5 → the hit is reported `PARKED` and the test passes; 6 → `[]`.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** Decision TP12.

### TC-130 · Header keeps one height; `data-scrolled` toggles the hairline only (D12)
- **Related:** M-009 · TKT-71 AC 1 · **EVAL:** EVAL-008, EVAL-010
- **Component:** `components/navigation/Header.tsx`, `tests/e2e/layout.spec.ts`
- **Objective:** The F6-scar compaction is gone: no rest→compact height change at any width.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. On `/` at each of the 4 projects: `header.boundingBox().height` at scrollY 0. 2. Scroll to 400 px; re-measure; read `[data-scrolled]` and `border-bottom-color`. 3. Scroll back to 0; read `[data-scrolled]`. 4. `grep -rn "useScrollY\|NavPill\|data-compact" app components lib hooks tests`.
- **Test data:** —
- **Expected:** 1–2 → heights equal ± 1 px; `data-scrolled` present only after scroll with the `--line` border; 3 → attribute removed; 4 → 0 matches.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright + script · **Status:** Planned · **Defect:** —
- **Notes:** Replaces TC-003's compaction assertions for M-009.

### TC-131 · Nav D8 variant: five items, `aria-current` underline, subline annotation gated by width, header unit count 1
- **Related:** M-009 · TKT-71 AC 3, AC 4, AC 5; decision D8 · **EVAL:** EVAL-007, EVAL-011, EVAL-018
- **Component:** `lib/nav.ts`, `components/navigation/Header.tsx`, `components/paper/MediaGate.tsx`, `tests/unit/routes.test.ts`, `tests/e2e/crawler-allowlist.json`
- **Objective:** Playground is reachable from the header (D8 default) and the one header decoration is present only ≥ 640 and always `aria-hidden`.
- **Preconditions:** TKT-71 done.
- **Steps:** 1. Unit: `navItems.length` and hrefs. 2. Playwright `w1440` on `/work`: the `Work` link has `aria-current="page"` and the underline pseudo-element is rendered (`::after` `opacity` = 1). 3. `w390`: `header [data-decor="annotation"]` count; `w1440`: count + `aria-hidden`. 4. EVAL-011 crawler reaches `/playground` via the header. 5. Every header control `boundingBox` ≥ 44×44.
- **Test data:** —
- **Expected:** 1 → 5, includes `/playground`; 2 → true; 3 → 0 at 390, 1 + `aria-hidden="true"` at 1440 (header unit count = 1); 4 → PASS; 5 → all ≥ 44.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** If Tushar reverts D8 the expected value in step 1 becomes 4 and the band gains a Playground link (technical-plan E-20) — one documented edit each.

### TC-132 · `MobileMenu` paper sheet: keyboard path, rows, focus return, axe with the sheet open
- **Related:** M-009 · TKT-71 AC 2, AC 8 · **EVAL:** EVAL-007, EVAL-006
- **Component:** `components/navigation/MobileMenu.tsx`, `tests/e2e/eval-007.spec.ts`
- **Objective:** The restyled sheet keeps the native `<dialog>` guarantees (TC-004) and carries the pill + résumé + Ask rows.
- **Preconditions:** `w390`.
- **Steps:** 1. Tab from load → skip link → menu button; `Enter`. 2. `document.activeElement` inside `dialog[aria-label="Site navigation"]`; Tab through: 5 nav rows (56 px tall), pill "Let's connect →", résumé row text = `resumeAction().label`, Ask row. 3. `Escape` → focus on the menu button; `html` overflow restored. 4. Backdrop click closes. 5. axe with the sheet open.
- **Test data:** —
- **Expected:** all pass; 0 critical/serious.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-133 · Reading-progress bar only on case studies; compaction/NavPill code removed with their tests
- **Related:** M-009 · TKT-71 AC 6, AC 7 · **EVAL:** EVAL-010
- **Component:** `components/interactions/ProgressBar.tsx`, `app/work/[slug]/page.tsx`
- **Objective:** The 3 px rust bar is a position indicator, `aria-hidden`, present only where the page is long-form.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `/work/teachspark`: `[data-progress]` present, `aria-hidden="true"`, computed `transform` at top vs after scrolling 50 %. 2. `/`, `/about`: absent. 3. `reducedMotion:"reduce"`: still updates (position, not motion). 4. `git diff --stat main..HEAD -- tests/unit/motion.test.tsx` shows edits, not deletion; `NavPill` test file gone with the component.
- **Test data:** —
- **Expected:** 1 → `scaleX(0)` → `scaleX(≈0.5)`; 2 → 0; 3 → updates; 4 → true.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright + script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-134 · Band footer on every route: exactly one `<footer>`, landmark, links resolve, `FinalCTA` gone, safe-area padding
- **Related:** M-009 · TKT-72 AC 1, AC 4 · **EVAL:** EVAL-011, EVAL-006, EVAL-008
- **Component:** `components/layout/BandFooter.tsx`, `app/layout.tsx`, `tests/e2e/layout.spec.ts`
- **Objective:** S16 — one closing CTA on every page, no second footer, no dead link.
- **Preconditions:** `pnpm start`; sitemap routes + 11 slugs + 5 essays + `/definitely-missing`.
- **Steps:** 1. For each route: `footer` count; `footer[aria-labelledby]` resolves to `h2#band-h`; band unit count under EVAL-018. 2. Every `footer a[href]` → crawler 200/anchor/mailto/allow-listed external. 3. `grep -rn "FinalCTA\|layout/Footer" app components tests`. 4. The © bar's declared `padding-bottom` includes `env(safe-area-inset-bottom)` (assert on the stylesheet rule). 5. `w390`: no horizontal overflow with the band in view.
- **Test data:** —
- **Expected:** 1 → 1 per route, unit count 1 (`torn`); 2 → all resolve; 3 → 0; 4 → present; 5 → none.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright + crawler + script · **Status:** Planned · **Defect:** —
- **Notes:** Supersedes TC-029 for M-009.

### TC-135 · **S18 regression** — `hero.tagline` rendered exactly once site-wide, in the band © bar, as a sourced hand quote
- **Related:** M-009 · TKT-72 AC 5; decision S18; technical-plan F1-3 · **EVAL:** EVAL-013, EVAL-018
- **Component:** `components/layout/BandFooter.tsx`, `data/hero.ts`, `tests/unit/band-footer.test.tsx`, `tests/e2e/layout.spec.ts`
- **Objective:** The VERIFIED tagline "Observing what others overlook." — defined in data but never rendered before M-009 — appears once, where the mockup places it, and satisfies the §3.4 quote rule.
- **Preconditions:** TKT-72 done.
- **Steps:** 1. Unit: render `BandFooter`; `getAllByText(hero.tagline.text).length`; the match is inside `[data-hand="quote"]` with a sibling `.sr-only` starting "Source:". 2. Playwright: on every route, `page.getByText(hero.tagline.text).count()`. 3. Negative control: temporarily blank the tagline in a mocked `data/hero` → the unit test fails on the count.
- **Test data:** `hero.tagline.text` from `data/hero.ts` (never typed into the test).
- **Expected:** 1 → 1, inside the © bar; 2 → exactly 1 per route (not 0, not 2); 3 → fails as expected.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Kept permanently (production-defect-to-regression rule).

### TC-136 · Band contrast, social circles, résumé/GitHub conditionals, location flag
- **Related:** M-009 · TKT-72 AC 2, AC 3, AC 6; decisions S5, PB5, Dev-13 · **EVAL:** EVAL-006, EVAL-008, EVAL-002
- **Component:** `components/layout/BandFooter.tsx`, `lib/site.ts`, `tests/unit/{band-footer,contrast-pairs}.test.ts(x)`
- **Objective:** Every band pair passes WCAG at its size, controls are ≥ 44 px with names, and the conditional parts follow their single sources of truth.
- **Preconditions:** TKT-72 done.
- **Steps:** 1. Unit: culori contrast for ivory/terracotta, kraft/terracotta, note/terracotta, `--on-band-muted`/terracotta computed from `AUTHORITATIVE` + the `color-mix` percentages. 2. Playwright: axe on `/` at both widths; each social circle `boundingBox` ≥ 56 and has an `aria-label`. 3. Unit with `site.github` unset **or** no `links.repoPublic` project → no GitHub circle; with both → present. 4. `resumeAvailable:false` → the résumé circle's label is `resumeAction().label` and href `/contact#resume`. 5. `site.showLocation` false → "Bengaluru, India" absent; mocked true → present in the © bar.
- **Test data:** mocked `site` module variants.
- **Expected:** 1 → ≥ 4.5 (text) and ≥ 4 (h2 line 2 kraft); 2 → 0 critical/serious; 3–5 → as stated.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Vitest + Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** Flip of `showLocation` is Tushar's call (HANDOFF §6); the test covers both states so the flip needs no test change.

### TC-137 · Band forbidden-strings / PII regression over markup and bundle
- **Related:** M-009 · TKT-72 AC 8, DoD Sec · **EVAL:** EVAL-013, EVAL-016
- **Component:** `scripts/forbidden-strings.ts`, `tests/unit/forbidden-strings.test.ts`
- **Objective:** The band adds the approved public contact (email, EXE-8) and nothing else.
- **Preconditions:** `pnpm build`.
- **Steps:** 1. `forbidden-strings --bundle` after TKT-72. 2. Assert the band's rendered text contains no phone/DOB/address pattern (unit over `BandFooter` output through `PII_PATTERNS`). 3. Positive control from TC-022 still detects the fixture.
- **Test data:** TC-022 pattern table.
- **Expected:** 0 hits; control detected.
- **Type:** security-functional · **Priority:** P0 · **Automation:** Y — Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-138 · Illustration manifest ↔ files ↔ README provenance both ways, alt prefixes, forbidden strings, poster identity (EVAL-021 automated part)
- **Related:** M-009 · TKT-73 AC 1 (TSK-36); decisions S20, E-18 · **EVAL:** EVAL-021, EVAL-013
- **Component:** `content/media/illustrations/{manifest.ts,README.md,**}`, `public/media/illustrations/*`, `tests/unit/eval-021.test.ts`, `tests/fixtures/illustrations-onesided/`
- **Objective:** Every generated asset is accounted for with provenance and a decorative alt; no orphan file, no orphan entry.
- **Preconditions:** TSK-36 done.
- **Steps:** 1. Walk `content/media/illustrations/**` (excluding `README.md`, `manifest.ts`; including `reference/`): each file ↔ exactly one entry. 2. Each entry `id` has a README table row with all §6.2 columns non-empty. 3. Each `alt` starts with "Illustration of " / "Animated illustration of " (or "Illustration reference sheet" for `kind:"reference"`); `character-sheet-b.usedOn` is `[]`. 4. Filenames + alts through `contentForbiddenHits` + `PII_PATTERNS`. 5. `publicSrc` files exist; `content/media/illustrations/hero-desk.webp` and `public/media/illustrations/hero-poster.webp` have equal sha256. 6. Run the checker over the two one-sided fixtures.
- **Test data:** fixtures: extra file without entry; entry without file.
- **Expected:** 1–5 → 0 findings; 6 → ≥ 1 finding each.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Vitest (in `pnpm eval`) · **Status:** Planned · **Defect:** —
- **Notes:** The manual "depicts no metric/logo/product UI/claim" checklist is TC-175 (Stage 8 confirms).

### TC-139 · Hero SSR markup: poster in static HTML with `fetchpriority="high"`, exact alt, no `<video>`, CTAs, unit count 3, no tiles
- **Related:** M-009 · TKT-73 AC 2 (SSR part), AC 5 (TSK-37); decision D10 · **EVAL:** EVAL-019, EVAL-001, EVAL-013, EVAL-018
- **Component:** `components/hero/Hero.tsx`, `app/page.tsx`
- **Objective:** The LCP candidate exists before JavaScript and the copy carries the 5-second test.
- **Preconditions:** `pnpm build && pnpm start`.
- **Steps:** 1. `curl -s /` (no JS): count `<video`; find the `img` with `fetchpriority="high"` and `hero-poster`; read its `alt`, `width`, `height`, `loading`. 2. Count `[data-decor]` inside `section.hero` → 3 (`annotation` hand-sub, `sketch` underline, `annotation` figcaption). 3. CTAs: `a[href="/work"]` text "View my work →", `a[href="#ask"]` text "Ask my portfolio". 4. `grep -c FloatingTiles` over `components app` → 0. 5. `w390` + `w1440`: eyebrow, h1 containing "AI-native products", both CTAs and the poster all intersect the first viewport (EVAL-001 structural precondition).
- **Test data:** `illustration("hero-desk").alt` from the manifest.
- **Expected:** 1 → 0 videos; one poster `img` with `fetchpriority="high"`, `loading="eager"`, 1280×684, alt byte-equal; 2 → 3; 3 → present; 4 → 0; 5 → true at both widths.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — script + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-140 · EVAL-019 four-mode matrix at 390 and 1440: default mounts the exact `<video>`, fallbacks never do
- **Related:** M-009 · TKT-73 AC 2 (TSK-37); decisions S14, D10, TP13 · **EVAL:** EVAL-019, EVAL-010
- **Component:** `components/hero/HeroClip.tsx`, `tests/e2e/eval-019.spec.ts`, `tests/e2e/fixtures.ts` (`saveData`)
- **Objective:** Reduced motion, touch/coarse pointer and Save-Data get the poster only; the default mode gets the once-and-hold clip with no `loop`.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `w1440` default: wait for `video[data-hero-clip]`; assert attributes `autoplay`, `muted`, `playsinline`, `preload="metadata"`, `poster` = the poster path, `aria-hidden="true"`, `tabindex="-1"`; `loop` and `controls` absent; `source` order webm → mp4. 2. `w1440` + `test.use({ reducedMotion:"reduce" })`: `video` count after 2 s. 3. `w390` (project has `hasTouch`): `video` count. 4. `w1440` + `saveData` fixture: `video` count. 5. Unit (`hero-clip.test.tsx`): `matchMedia` mocked per mode → same expectations; `play()` rejecting → `video` unmounted.
- **Test data:** —
- **Expected:** 1 → all true; 2–4 → 0; 5 → as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** A `<video>` under reduced motion fails EVAL-010 and EVAL-019 together (evaluation-plan §8.3).

### TC-141 · Once-and-hold: `ended` ≤ 4 s, `currentTime` never decreases, stays paused on the last frame, rejection → poster
- **Related:** M-009 · TKT-73 AC 3 · **EVAL:** EVAL-019
- **Component:** `components/hero/HeroClip.tsx`, `tests/e2e/eval-019.spec.ts`
- **Objective:** The clip plays exactly once and holds; nothing restarts it.
- **Preconditions:** `w1440` default mode.
- **Steps:** 1. `page.goto("/")`; `waitForFunction(v => v.ended, video, { timeout: 4000 })`; record elapsed. 2. For 3 s sample `currentTime` every 250 ms while: `mouse.wheel(0, 600)`, `document.dispatchEvent(new Event("visibilitychange"))`, `window.dispatchEvent(new Event("resize"))`. 3. Read `paused`, `ended`, `loop`. 4. Screenshot the frame → `docs/screenshots/m-009/tracer/hero-end-1440.png`; orchestrator compares with `animation/export/hero-end.webp`. 5. `addInitScript` overriding `HTMLMediaElement.prototype.play` to reject → after hydration `video` count. 6. Static analysis: the file contains no `.currentTime =`, `.load(`, `loop`, `visibilitychange`, `addEventListener("change"` (ESLint rule or grep).
- **Test data:** —
- **Expected:** 1 → ≤ 4000 ms; 2 → monotonic non-decreasing; 3 → `paused=true`, `ended=true`, `loop=false`; 4 → visually the last frame; 5 → 0; 6 → 0 matches.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright + script (step 4 manual compare) · **Status:** Planned · **Defect:** —
- **Notes:** Critical failure condition (evaluation-plan §8.4: "the hero clip loops or restarts").

### TC-142 · Asset caps and byte-exactness of the shipped hero renditions
- **Related:** M-009 · TKT-73 AC 4 (TSK-36) · **EVAL:** EVAL-019, EVAL-005
- **Component:** `public/media/illustrations/*`, `content/media/illustrations/scene-*.jpg`
- **Objective:** Transfer cost stays inside the measured caps (webm 176 / mp4 312 / poster 87 kB) and the shipped files are the approved cuts.
- **Preconditions:** TSK-36 done.
- **Steps:** 1. `fs.statSync` sizes. 2. sha256 of the three public files vs the on-disk sources in `Portfolio-illustration/animation/export/` (recorded in the README provenance row as `sha256`). 3. `sharp().metadata()` on the poster. 4. Scenes ≤ 600 kB each.
- **Test data:** —
- **Expected:** webm ≤ 204 800 B, mp4 ≤ 358 400 B, poster ≤ 122 880 B; shas equal; 1280×684; scenes within cap.
- **Type:** performance · **Priority:** P0 · **Automation:** Y — Vitest (sizes, metadata) / script (sha compare, run once at TSK-36) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-143 · Hero motion system removed: files, imports, `site.avatarAlt`, tests; first-load JS recorded
- **Related:** M-009 · TKT-73 AC 6 (TSK-38); TKT-74 AC 2 · **EVAL:** EVAL-005
- **Component:** deletions per technical-plan S73.09, `scripts/bundle-budget.ts`
- **Objective:** EVAL-005 is re-measurable on real code, not on tree-shaking luck (EV6).
- **Preconditions:** TSK-38 done.
- **Steps:** 1. `grep -rn "AvatarScene\|AvatarStage\|FloatingTiles\|HeroActivation\|usePointerParallax\|heroMotion\|ProductScene\|avatarAlt" app components lib hooks tests`. 2. `ls` the deleted paths. 3. `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. 4. `bundle-budget --route / --json` → `firstLoadJsGzipKb`.
- **Test data:** —
- **Expected:** 1 → 0; 2 → absent; 3 → exit 0; 4 → number recorded in the report (target ≤ 180; gated at TC-145).
- **Type:** regression · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-144 · Tracer baseline run `baseline-m009-tracer.json` with real paper-gate values and parked legacy hits
- **Related:** M-009 · TKT-74 AC 1, AC 4; decision EV6 · **EVAL:** EVAL-018, EVAL-019, EVAL-020, EVAL-021, EVAL-005
- **Component:** `scripts/eval.ts`, `evals/results/baseline-m009-tracer.json`, `tests/e2e/eval-018-parked.json`
- **Objective:** The M-009 baseline exists with provenance and the first real values for EVAL-018…021.
- **Preconditions:** TKT-71/72/73 merged; S74.02 parked list populated.
- **Steps:** 1. `pnpm eval --label baseline-m009-tracer`. 2. `node -e` read: `provenance.commit` (40 chars), `branch === "m-009-redesign"`, `dirty === false`, `cases[EVAL-018..021].status ∈ {PASS,FAIL}` (never SKIP), `EVAL-005.measured.jsKbGzip`. 3. `criticalFailures` empty. 4. `pnpm eval --baseline baseline-v1.json --reuse` diff → no Critical regression vs the pre-redesign baseline.
- **Test data:** —
- **Expected:** file committed; all reads as stated.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — script · **Status:** Planned · **Defect:** —
- **Notes:** Every later M-009 run diffs against this file (evaluation-plan §8.6).

### TC-145 · Preview performance gate: JS ≤ 180 kB gz, LCP element = hero poster, LCP ≤ 2.5 s mobile, perf ≥ 90, tracer pack
- **Related:** M-009 · TKT-74 AC 2, AC 3, AC 5; decision EV6; technical-plan F5 · **EVAL:** EVAL-004, EVAL-005
- **Component:** Vercel preview, `.lighthouseci/`, `evals/results/lighthouse-m009-tracer/`, `docs/screenshots/m-009/tracer/`
- **Objective:** The riskiest assumption (fonts + illustration + clip within budget) is measured on a real deployment.
- **Preconditions:** branch pushed with Tushar's OK; preview 200.
- **Steps:** 1. `bundle-budget --route / --json` locally on the same commit. 2. `lhci autorun --config lighthouserc.mobile.json --collect.url=<preview>/` (3 runs) then desktop. 3. From the median JSON: `audits["largest-contentful-paint-element"]` (must name the `img` whose `src` contains `hero-poster`), `audits["largest-contentful-paint"].numericValue`, performance category score. 4. `pnpm eval --base-url <preview> --label eval-run-preview-m009-tracer-<sha>` (headers/axe/Playwright on the deployed origin). 5. 8 tracer PNGs present.
- **Test data:** —
- **Expected:** 1 → ≤ 180 (else `TKT-92 perf` opened; the budget is never edited); 3 → poster element, ≤ 2500 ms, ≥ 90; 4 → headers PASS; 5 → 8.
- **Type:** performance · **Priority:** P0 · **Automation:** Y — script / N — manual (push approval, dashboard) · **Status:** Planned · **Defect:** —
- **Notes:** Never measured on `next dev` (image-cache scar).

### TC-146 · Hero gate with Tushar on the preview (EVAL-022 sub-gate)
- **Related:** M-009 · TKT-74 AC 6, AC 7; Solution-PRD §12.6.7 · **EVAL:** EVAL-022, EVAL-001, EVAL-009 (item 6)
- **Component:** `evals/results/gate-m009-hero.md`, `decisions.md` EXE-n, `Design.md` §11, `HANDOFF.md`
- **Objective:** Written approval of the hero before any other page is built.
- **Preconditions:** TC-144/145 done; preview URL shared.
- **Steps:** 1. Present the preview at 390 and 1440 plus the numbers. 2. Score EVAL-001 (6 items × 2 widths) and EVAL-009 item 6 (character matches the locked sheet, no drift) in `gate-m009-hero.md`. 3. Record Tushar's words in `decisions.md` as `EXE-n · M-009 hero gate — approved | approved with changes: …`. 4. Each change request → a `Design.md` §11 row before TKT-75 starts. 5. `HANDOFF.md` updated.
- **Test data:** —
- **Expected:** EXE entry exists quoting Tushar; silence is not approval; TKT-75/76/77 remain blocked until then.
- **Type:** visual-review · **Priority:** P0 · **Automation:** N — manual · **Status:** Planned · **Defect:** —
- **Notes:** Human-in-the-loop gate by design.

### TC-147 · Featured Work: three taped cards from data, whole-card links, layout, unit count 4, fasteners ≤ 2, reduced-motion hover
- **Related:** M-009 · TKT-75 AC 1–6 · **EVAL:** EVAL-001, EVAL-002, EVAL-011, EVAL-013, EVAL-015, EVAL-018
- **Component:** `components/projects/{FeaturedWork,ProjectCard}.tsx`
- **Objective:** The VERIFIED proof numbers that left the hero tiles live on the cards, byte-equal to data, in the approved paper form.
- **Preconditions:** TKT-75 done.
- **Steps:** 1. Unit: rendered name/tagline/kicker/metrics/status/`asOf` equal the `data/projects.ts` records for the three featured slugs; Velora card shows metrics only if `measured` rows exist. 2. Playwright: 3 cards, each one `a` with `aria-label` = name, `href="/work/<slug>"`; clicking navigates (EVAL-002 hop, EVAL-015 fallback). 3. Layout at 1024 (2 cols, large spans) and 390 (1 col, no overflow). 4. Unit count of `section#work-featured` = 4 at both widths; `[data-fastener]` per card ≤ 2. 5. Hover on `w1440`: `transform` changes; under reduced motion only `box-shadow` changes.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Supersedes TC-054/055 for M-009.

### TC-148 · How I think: six stages verbatim, quotes sourced and ≤ 240 chars, anchors resolve, path sketch gated, only pills focusable
- **Related:** M-009 · TKT-76 AC 1–5 · **EVAL:** EVAL-003, EVAL-007, EVAL-011, EVAL-013, EVAL-018
- **Component:** `components/home/HowIThink.tsx`, `lib/stages.ts`
- **Objective:** The framework section in journey form with every quote visible and sourced, no interactive expand.
- **Preconditions:** TKT-76 done.
- **Steps:** 1. Unit: six cards, label/principle/quote/attribution equal `data/thinking-framework.ts`; each quote length ≤ 240; each `blockquote[data-hand="quote"]` has a `cite`. 2. Crawler: the six pill links resolve to `lib/anchors.ts` anchors. 3. Unit count: 2 at `w1440`, 1 at `w390` (path sketch absent from the DOM). 4. Tab through the section: focus lands only on the six pills. 5. `grep -rn "roving\|tabIndex={-1}" components/home/HowIThink.tsx` → 0.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest + Playwright + crawler · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-149 · Ask notebook: five states, panel keyboard path, no navigation, Inter input, unit count 2, Ask logic untouched
- **Related:** M-009 · TKT-77 AC 1–7; decisions S21, TP3 · **EVAL:** EVAL-012, EVAL-007, EVAL-014, EVAL-015, EVAL-018
- **Component:** `components/ai/*`, `app/dev/ask/page.tsx`
- **Objective:** Only the surface changed; the deterministic Ask feature and its Critical evals are intact.
- **Preconditions:** TKT-77 done.
- **Steps:** 1. `git diff --stat main..HEAD -- lib/ask tests/unit/eval-012.test.ts tests/unit/ask-*.test.ts tests/unit/use-ask.test.tsx components/ai/AskProvider.tsx` → empty. 2. `pnpm test -- eval-012` → 11/11 · 5/5 · 0 fabricated. 3. Playwright `/dev/ask` + `/`: idle · loading (shimmer + sr-only status) · answer (h3 "Answer", `DraftTag`, evidence pills, "Ask another") · empty (FALLBACK + 3 chips) · error (rust border + "Try again"). 4. Submit → URL unchanged; `document.activeElement` = the "Answer" heading. 5. Panel: open via the ghost button → type → answer → close → focus returns (EVAL-007). 6. Input computed `fontFamily` contains "Inter"; `section#ask` unit count = 2. 7. Reduced motion: expand height instant.
- **Test data:** mocked provider routes from TC-046.
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — script + Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** If Tushar drops the panel (variant), step 5 is replaced by "panel components absent + `EXE-n` retiring the EVAL-007 clause".

### TC-150 · OG paper re-skin: 7 families 1200×630 ≤ 300 kB, tags absolute HTTPS, snapshots, no Manrope, no avatar read, hex allow-list only
- **Related:** M-009 · TKT-78 AC 1–6; decision D11 · **EVAL:** EVAL-017 (automated), EVAL-020
- **Component:** `lib/og.tsx`, `assets/fonts/*`, `app/**/opengraph-image.tsx`, `docs/og/m-009/`
- **Objective:** No og:image carries the superseded identity (evaluation-plan §8.3).
- **Preconditions:** `pnpm build`.
- **Steps:** 1. `tests/unit/seo.test.ts`: each family's PNG dimensions and size. 2. `tests/e2e/eval-017.spec.ts`: `og:url`/`og:image` absolute HTTPS, `twitter:card`, `og:image:alt`. 3. `ls assets/fonts` and `grep -rni manrope lib app assets tests`. 4. `grep -n "avatar\|components/clay" lib/og.tsx`. 5. TC-123 step 4 (hex only in `lib/og.tsx`). 6. 7 snapshots in `docs/og/m-009/` visually show the paper canvas (orchestrator eyeball).
- **Test data:** —
- **Expected:** 1 → 1200×630, ≤ 300 kB × 7; 2 → green; 3 → 4 TTF + OFL, 0 Manrope refs; 4 → 0; 5 → true; 6 → paper skin.
- **Type:** integration · **Priority:** P1 · **Automation:** Y — Vitest + Playwright + script / N — manual (step 6; inspectors are TC-177) · **Status:** Planned · **Defect:** —
- **Notes:** Satori: static TTFs, PNG/JPEG only, hex only — the allow-list reason.

### TC-151 · Home assembly + Phase A gate: order, fills, per-section counts, JS ≤ 180, EVAL-001 elements, no regression, approval
- **Related:** M-009 · TKT-79 AC 1–5 · **EVAL:** EVAL-001, EVAL-004, EVAL-005, EVAL-018, EVAL-022
- **Component:** `app/page.tsx`, `docs/screenshots/m-009/{home,pairs}/`, `evals/results/eval-001-m009-home.md`
- **Objective:** Home complete in paper with evidence for Stage 8 and a recorded checkpoint.
- **Preconditions:** TKT-75–78 merged.
- **Steps:** 1. Playwright: DOM order hero → `#work-featured` → `#how-i-think` → `#ask` → `footer`; section backgrounds alternate `paper`/`paper-2` (computed `background-color` round-trips to the token hex); each section's first child is `[data-decor="torn"]` except the hero. 2. EVAL-018 counts: hero 3 · featured 4 · how-I-think 2 · ask 2 · header 1 · band 1 at both widths. 3. `bundle-budget --json` ≤ 180. 4. EVAL-001 structural: the six elements in the first viewport at 390/1440; checklist scored in the md. 5. `pnpm eval --baseline baseline-m009-tracer.json --label eval-run-m009-phase-a-<sha>` → no Critical FAIL/regression. 6. Mockup pair `home-{1440,390}.png` committed. 7. Approval line quoted in `HANDOFF.md` (or `EXE-n`).
- **Test data:** —
- **Expected:** all as stated.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Playwright + script / N — manual (4 scoring, 7) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-152 · `/work` filter tabs: keyboard, `aria-selected`, URL sync, deep link, numbering re-sequence, rows are links
- **Related:** M-009 · TKT-80 AC 1, AC 2 (TSK-40); decision TP7 · **EVAL:** EVAL-007, EVAL-002
- **Component:** `components/projects/{FilterTabs,WorkIndex,WorkGrid}.tsx`, `lib/filters.ts`
- **Objective:** The serif tabs keep TC-064's contract and the numbered index re-sequences per filter.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `role="tablist"`; ArrowRight moves `aria-selected` and focus; `?filter=` updates without reload. 2. Deep link `/work?filter=enterprise` → after hydration only matching rows; numerals restart at 01. 3. All: 11 personal builds numbered 01–11 in data order. 4. Every `ol > li` contains exactly one `a[href^="/work/"]`. 5. Unit: `filters.test.tsx` + `work-grid.test.tsx` green.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** One-frame flash on deep links accepted (TP7).

### TC-153 · `/work` empty state only when a filter yields 0 rows (Dev-05); experience strip `<details name="job">` one-open, hidden under Experiments, no live affordance
- **Related:** M-009 · TKT-80 AC 3, AC 4 (TSK-40, TSK-41) · **EVAL:** EVAL-007, EVAL-011, EVAL-013
- **Component:** `components/projects/{EmptyState,ExperienceStrip}.tsx`
- **Objective:** The empty card is a screen state, not a decoration; corporate work reads as employment.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. Default filter: `[data-paper="index"]` empty-state card absent. 2. An empty filter (Experiments if empty, else a `WORK_FILTERS` fixture) → card present, "Show all →" `data-hand="cta"` resets. 3. Strip: three `details[name="job"]`; opening the second closes the first; keyboard (`Enter`/`Space` on `summary`). 4. Under Experiments the strip is absent. 5. Inside `details`: no `a[href^="http"]` and no arrow affordance; the only link is "See my experience →" → `/about#experience`.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-154 · `/work` scene bleed = one `<img>` with manifest alt and `sizes`, no CLS, unit counts 2/3/1, no overflow at 390
- **Related:** M-009 · TKT-80 AC 5, AC 6, AC 7 (TSK-39); Dev-06 · **EVAL:** EVAL-008, EVAL-013, EVAL-018, EVAL-021
- **Component:** `components/projects/WorkHero.tsx`, `components/paper/Illustration.tsx`
- **Objective:** One download, one announcement, counts per §3.3, mobile intact.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `section.work-hero img` count = 1; `alt` = `illustration("scene-work").alt`; `sizes` present; `width`/`height` attributes set. 2. Unit counts opener 2 · index 3 · strip 1 at both widths (the "start here" arrow hides < 900 inside the same object — count unchanged). 3. `noOverflow` at `w390`; rows collapse to `40px 1fr`. 4. LCP/CLS from the phase eval run on `/work` (informational).
- **Test data:** —
- **Expected:** all as stated; CLS < 0.05.
- **Type:** responsive · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-155 · Case-study 11-slug sweep: builds, no invented content, rich vs thin degradation, media tag contrast
- **Related:** M-009 · TKT-81 AC 1, AC 2, AC 6; decisions S18 (honest placeholder), PB4 · **EVAL:** EVAL-013, EVAL-006, EVAL-021
- **Component:** `components/case-study/{CaseStudyHeader,MetricStrip,OverviewToggle}.tsx`, `app/work/[slug]/page.tsx`
- **Objective:** The template renders every project honestly in paper.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. For each of `ALL_PROJECT_SLUGS` at both widths: 200, no console errors, `noOverflow`. 2. `teachspark`: `section[aria-label="Headline metrics"]` with 3 `[data-paper="index"]` cards + the "smaller, honest number" annotation. 3. A thin slug (`token-toli`): no metric section; "Deep dive coming" kraft tag containing its `statusLabel`; no `OverviewToggle`. 4. Header photo frame shows `scene-casestudy` with the "Hero media coming" tag; the tag's computed text colour round-trips to `navy` on `kraft` (≥ 4.5:1, axe). 5. TC-091-style rule: no string on the page absent from the record (data snapshot per slug).
- **Test data:** —
- **Expected:** all as stated.
- **Type:** content-integrity · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-156 · Case-study header/overview/next interactions: folder tabs radiogroup, anchors unchanged (TP8), `DemoVideo` states in the frame, next band link, unit counts 2/2/2/2
- **Related:** M-009 · TKT-81 AC 3, AC 4, AC 5, AC 7 · **EVAL:** EVAL-007, EVAL-014, EVAL-002, EVAL-018
- **Component:** `components/case-study/{OverviewToggle,NextProject,CaseStudyHeader}.tsx`, `components/projects/DemoVideo.tsx`
- **Objective:** Behaviour contracts from M-004 survive the re-skin.
- **Preconditions:** `pnpm start`; `eval-014` fixture project.
- **Steps:** 1. Folder tabs: `role="radiogroup"`, arrow keys move selection, deep-dive reveals `#deep`. 2. `#deep`, `#01-context` … `#08-what-i-learned` resolve (anchors test unchanged and green). 3. `eval-014.spec.ts` four `DemoVideo` states rendered inside the photo frame; with media present the "Hero media coming" tag is absent. 4. Next band: the whole `section.next` is inside one `a`; kraft focus ring visible on keyboard focus; arrow translates on hover (not under reduced motion). 5. Unit counts header 2 · strip 2 · overview 2 · next 2. 6. EVAL-002 hop `/work` → `/work/[slug]` green.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-157 · **S18 regression** — "What I learned" renders every `learnings[]` string once; section absent for `[]`
- **Related:** M-009 · TKT-82 AC 1, AC 5; decision S18; technical-plan F1 · **EVAL:** EVAL-003, EVAL-013, EVAL-018
- **Component:** `components/case-study/Learnings.tsx`, `tests/unit/case-study-learnings.test.tsx`, `tests/e2e/case-study.spec.ts`
- **Objective:** Data that was defined but never rendered before M-009 is now shown verbatim, and an empty array renders nothing (no invented section).
- **Preconditions:** TKT-82 done.
- **Steps:** 1. Unit: fixture with 3 learnings → `getAllByText(s).length === 1` for each; the `<ol>` has 3 items in data order. 2. Fixture with `[]` → no `region` named "What I learned"; no `section.learned`. 3. Playwright `/work/teachspark`: each `teachspark.learnings[i]` present exactly once on the page. 4. Negative control: a fixture learning string typed differently by one character is not found.
- **Test data:** fixture project records (synthetic).
- **Expected:** all as stated; unit count learned = 1.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Kept permanently.

### TC-158 · Sources section derived, de-duplicated, byte-equal labels, links only for public URLs, crawler-clean, unit count 0
- **Related:** M-009 · TKT-82 AC 2, AC 3, AC 4 · **EVAL:** EVAL-011, EVAL-013, EVAL-018
- **Component:** `lib/sources.ts`, `components/case-study/Sources.tsx`, `tests/unit/case-study-sources.test.ts`
- **Objective:** A page-level provenance index with zero new content.
- **Preconditions:** TKT-82 done.
- **Steps:** 1. Unit: `projectSources(fixture)` returns unique ids in first-appearance order; every label equals a `sources[].label`; `href` present only when the SourceRef has a `url`. 2. A fixture where two artifacts cite the same source → one row. 3. Playwright: `section.sources ol li` count equals the unit result for `teachspark`; every `a` resolves (crawler/allow-list). 4. `[data-decor]` inside `section.sources` = 0; the `<ol>` contains no decoration.
- **Test data:** synthetic project fixtures.
- **Expected:** all as stated.
- **Type:** content-integrity · **Priority:** P1 · **Automation:** Y — Vitest + Playwright + crawler · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-159 · Flat zones: every chapter `Prose` is `[data-flat]` with 0 decorations at both widths; hand quotes allowed
- **Related:** M-009 · TKT-83 AC 1 (TSK-42); Design.md §3.2 rule 4 · **EVAL:** EVAL-018
- **Component:** `components/case-study/Chapter.tsx`, `components/common/Prose.tsx`
- **Objective:** Reading zones stay clean — the anti-scrapbook guard where it matters most.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. For every slug at both widths: `section.chapter [data-flat]` count ≥ 1 per chapter with body; `[data-flat] [data-decor]` count. 2. A chapter containing an `insight` artifact: `blockquote[data-hand="quote"]` inside the flat zone is not flagged. 3. `Prose` computed `max-width` ≈ 68ch.
- **Test data:** —
- **Expected:** 1 → 0; 2 → allowed; 3 → 68ch.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-160 · The eight artifact paper forms from fixtures; Inter for hypothesis text, kind badges and status (Dev-04)
- **Related:** M-009 · TKT-83 AC 2 (TSK-43) · **EVAL:** EVAL-003, EVAL-006, EVAL-013, EVAL-018
- **Component:** `components/case-study/artifacts/*`, `app/dev/artifacts/page.tsx`, `tests/unit/artifacts.test.tsx`
- **Objective:** One `Sheet` DNA per artifact type, Caveat only on labels/quotes.
- **Preconditions:** TSK-43 done.
- **Steps:** 1. Unit: render each of the 8 types from fixtures; assert `data-paper` present, the §7.3 form (insight → `blockquote[data-hand="quote"]` + cite; hypothesis → labels `data-hand="label"` and body text without `font-hand`; decision → Chosen/Rejected labels; evaluation → `dl` with `dt[data-hand="label"]`; experiment → three steps; prototype → taped frame with image/video/alt caption; generic → kraft tag; metric → index card with kind badge in Inter). 2. Playwright `/dev/artifacts`: EVAL-018 collector → 0 violations; axe 0. 3. `EVAL-003` mapping unchanged (TC-093 table still resolves 8/8).
- **Test data:** existing `artifacts.test.tsx` fixtures + 1 per type.
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-161 · `ChapterNav` absent < 1024, `aria-current` tracks the visible chapter ≥ 1024, anchors resolve
- **Related:** M-009 · TKT-83 AC 3 (TSK-42); Dev-09 · **EVAL:** EVAL-007, EVAL-011
- **Component:** `components/case-study/ChapterNav.tsx`, `components/paper/MediaGate.tsx`
- **Objective:** Chapter navigation exists only where the mockup has it and stays keyboard-usable there.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `w390`, `w768`: `nav[aria-label*="Chapters"]` count. 2. `w1024`, `w1440`: present; scroll to chapter 04 → the matching link has `aria-current`; Tab reaches every link; clicking scrolls to the anchor. 3. Anchors `#01-context` … resolve (anchors test).
- **Test data:** —
- **Expected:** 1 → 0; 2 → as stated; 3 → green.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-162 · Show the thinking on paper: click-only reveal, keyboard path, reduced motion all-at-once, unit count 2, axe on the rich page
- **Related:** M-009 · TKT-83 AC 4, AC 5, AC 6 (TSK-44) · **EVAL:** EVAL-007, EVAL-010, EVAL-006, EVAL-018
- **Component:** `components/interactions/{ShowTheThinking,ThinkingNode}.tsx`
- **Objective:** TC-083/084/085 behaviour survives the re-skin.
- **Preconditions:** `/work/teachspark`.
- **Steps:** 1. On load and after scrolling the section into view: `[aria-expanded]` = false, 8 nodes hidden. 2. Click → `aria-expanded=true`, 8 nodes visible in order (stagger 120 ms observed as increasing `opacity` timestamps). 3. Keyboard: Tab → button → `Enter` → Tab reaches each source link. 4. `reducedMotion:"reduce"`: all 8 visible immediately after click. 5. `section.thinking` unit count = 2 (annotation + chain sketch); deep-dive outer 0; each chapter 0. 6. axe on `/work/teachspark` at both widths.
- **Test data:** —
- **Expected:** all as stated; 0 critical/serious.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-163 · `/thinking` list: five entries in order, empty-state line by published count, margin annotation gated ≥ 1320, counts 3 / 4|3, underline complete under reduced motion
- **Related:** M-009 · TKT-84 AC 1, AC 3, AC 6; Dev-02 · **EVAL:** EVAL-011, EVAL-013, EVAL-018, EVAL-010
- **Component:** `components/thinking/{ThinkingHero,ThinkingList}.tsx`
- **Objective:** The essays sheet in paper with the honest empty state.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. 5 entries in `data/writing.ts` order, each `h3 a` → `/thinking/<slug>` (crawler). 2. Empty-state line present (0 `publishedOn` in data); unit fixture with one `publishedOn` → absent. 3. `w1440`: margin annotation present + `aria-hidden`; `w390`: absent from the DOM. 4. Unit counts opener 3 · essays 4 (1440) / 3 (390). 5. `reducedMotion`: the h2 underline `strokeDashoffset` = 0.
- **Test data:** writing fixture.
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-164 · **S18 regression** — "Draft — pending sign-off:" appears exactly once per essay page and the `DraftTag` once in the meta row
- **Related:** M-009 · TKT-84 AC 2; decision S18; technical-plan F1-1 · **EVAL:** EVAL-013
- **Component:** `components/thinking/EssayBody.tsx`, `tests/unit/writing.test.ts`, `tests/e2e/thinking-page.spec.ts`
- **Objective:** The component no longer prefixes the string the data already carries; the previous substring tests could not catch the duplicate, so this one counts.
- **Preconditions:** TKT-84 done.
- **Steps:** 1. Unit: for every essay render `EssayBody`; `textContent.split("Draft — pending sign-off:").length - 1`. 2. Playwright: for all 5 slugs, `main` inner text split count; `[data-paper="tag"]` `DraftTag` count in the meta row. 3. Negative control: re-add the span in a test double → count 2 → test fails. 4. `.prose[data-flat] [data-decor]` = 0; pull quotes ≤ 240 chars with cites; pager links resolve.
- **Test data:** `data/writing.ts` (the prefix is in the data, never typed into the test — the test reads `essay.framing`).
- **Expected:** 1–2 → exactly 1 and 1; 3 → fails; 4 → as stated.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Kept permanently; replaces the `toContainText` assertion at `thinking-page.spec.ts:113`.

### TC-165 · Phase B gate sweep: `/work` + 11 slugs + `/thinking` + 5 essays × 4 widths; EVAL-018 green on every Phase 0–B route; pairs; approval
- **Related:** M-009 · TKT-85 AC 1–5 · **EVAL:** EVAL-006, EVAL-008, EVAL-018, EVAL-022
- **Component:** `tests/e2e/sweep.spec.ts`, `docs/screenshots/m-009/{phase-b,pairs}/`, `tests/e2e/eval-018-parked.json`
- **Objective:** Evidence that Phase B is complete before Phase C starts.
- **Preconditions:** TKT-80/82/83/84 merged.
- **Steps:** 1. Sweep: `noOverflow`, `minTargets`, axe (390/1440) on the 18 routes × 4 widths; screenshots saved. 2. `pnpm eval --baseline baseline-m009-tracer.json --label eval-run-m009-phase-b-<sha>`; parked list names only `/about`, `/playground`, `/contact`, 404. 3. EVAL-005 on `/work/teachspark` recorded. 4. Pairs `work`, `case-study-teachspark`, `case-study-token-toli`, `thinking`, `essay` at 1440/390. 5. Approval quoted in `HANDOFF.md`.
- **Test data:** —
- **Expected:** 0 overflow/sub-44/axe; no Critical regression; pairs committed; approval recorded.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — Playwright + script / N — manual (5) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-166 · `/about` part 1: data snapshots, DRAFT subline out of the a11y tree (Dev-10), counts 2/3(1)/1/2, impact-card anatomy, one scene `<img>`, mobile stacking
- **Related:** M-009 · TKT-86 AC 1–6; decision DC2 · **EVAL:** EVAL-006, EVAL-008, EVAL-013, EVAL-018, EVAL-021
- **Component:** `components/about/{AboutHero,CapabilityClusters,Impact}.tsx`, `components/timeline/ProductJourney.tsx`
- **Objective:** The person and the proof of level in paper, every number still dated and labelled.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. Unit snapshots: hero copy, journey cards, clusters, impact tier 1/2 equal `data/{experience,skills,impact}.ts`. 2. Playwright: the subline "Same curiosity → bigger problems." is `aria-hidden` (not in `page.accessibility` snapshot); the `h1` carries the narrative. 3. Unit counts hero 2 · journey 3 (1 at 390) · capabilities 1 · impact 2. 4. Every tier-1 card: value, label, context, kind badge (Inter), `asOf`, `Source` link. 5. `section.ahero img` count = 1 with the manifest alt; `w390`: copy above a 4:3 masked photo; stats 2-up ≤ 640; no overflow.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-167 · **S18 regression** — experience timeline lead reads "oldest to newest" and the rendered order equals the data order; four cards open on load; anchors preserved
- **Related:** M-009 · TKT-87 AC 1, AC 2; decision S18; technical-plan F1-2; Dev-11 · **EVAL:** EVAL-007, EVAL-013
- **Component:** `components/timeline/{ExperienceTimeline,StoryCard,timeline-logic}.ts(x)`, `tests/unit/experience-skills.test.ts`, `tests/e2e/timeline.spec.ts`
- **Objective:** The lead no longer contradicts the order on the page ("newest to oldest" vs oldest-first data), and the always-open cards keep their deep links.
- **Preconditions:** TKT-87 done.
- **Steps:** 1. Unit: the rendered lead equals `"Four roles, oldest to newest — open any node for the context, scale, and what changed."` exactly. 2. Unit: the sequence of company `h3`s equals `experience.map(e => e.company)` and the first role's `dates.start` is the earliest. 3. Unit: every `StoryCard` is visible (no `hidden`/collapsed state) on render. 4. Playwright: `/about#experience-<id>` for each role scrolls the matching card into view; Tab reaches each Source link. 5. `grep -rn "toggleOpen\|roleIdFromHash\|nextNodeIndex" components tests` → 0 (logic deleted). 6. Negative control: reverse the fixture order → step 2 fails.
- **Test data:** `data/experience.ts` (order read from data, never hard-coded).
- **Expected:** all as stated.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — Vitest + Playwright · **Status:** Planned · **Defect:** —
- **Notes:** Kept permanently.

### TC-168 · `/about` part 2: story `dl` flat with 0 decorations, counts 1/2/1, résumé placeholder path, patent/DOI links, axe
- **Related:** M-009 · TKT-87 AC 3–6 · **EVAL:** EVAL-002, EVAL-011, EVAL-018, EVAL-006
- **Component:** `components/timeline/StoryCard.tsx`, `components/about/{Awards,Research,Education,AboutCta}.tsx`, `app/about/page.tsx`
- **Objective:** Close the About page in paper with its reading zones and funnel endpoints intact.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. Every `[data-paper="card"] dl` is `[data-flat]` with 0 `[data-decor]` descendants at both widths. 2. Unit counts experience 1 · proof 2 · CTA 1. 3. `#about-cta` résumé control = `resumeAction()` (placeholder → `/contact#resume`, EVAL-002 path from `/about`). 4. Patent link + DOI pill resolve (crawler); "DOI pending" element is Inter (`font-hand` absent). 5. axe 0 critical/serious at both widths; page order hero → journey → capabilities → impact → experience → proof → CTA → band.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + crawler · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-169 · Playground bench: four experiments from data, new-tab links with `rel="noopener"` + sr-only note, no tone/status line, board layout, counts 3/3
- **Related:** M-009 · TKT-88 AC 1, AC 4 (TSK-45); Dev-07 · **EVAL:** EVAL-011, EVAL-008, EVAL-018
- **Component:** `components/playground/{PlaygroundHero,PlaygroundGrid}.tsx`
- **Objective:** The playful corner in paper without retired clay tones or Caveat body text.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. 4 cards, titles/taglines from `data/projects.ts` playground entries. 2. Each live link: `target="_blank"`, `rel` contains `noopener`, an sr-only "(opens in new tab)"; crawler treats external 200s as resolved. 3. `grep -rn "tone:" components/playground` → 0; no `p/h3` in Caveat (EVAL-018 rule). 4. Unit counts opener 3 · bench 3. 5. Layout 6-col ≤ 1024, 1-col ≤ 640; no overflow at 390.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + crawler + script · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-170 · Contact: `CopyButton` idle/copied/error with selectable fallback, mailto/LinkedIn/résumé, PII grep, postcard labels valid, counts 3/3, portrait ≤ 420 px < 900
- **Related:** M-009 · TKT-88 AC 2, AC 4, AC 5 (TSK-46); decisions S10, EXE-8 · **EVAL:** EVAL-002, EVAL-007, EVAL-013, EVAL-016, EVAL-018
- **Component:** `components/contact/{ContactCard,ContactDetails}.tsx`, `components/common/CopyButton.tsx`
- **Objective:** The conversion endpoint keeps TC-102's states and PII rules in paper form.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. Clipboard stub resolves → "Copied" for 2 s (forest border) then idle; live region announces. 2. Stub rejects → "Copy failed" (rust border) + `output` with the selectable address. 3. `a[href^="mailto:"]`, LinkedIn external, `#resume` row = `resumeAction()`; the location line "Bengaluru, India" present (already public on this route). 4. `forbidden-strings` over the route markup: 0 phone/DOB/address. 5. Postcard: every `[data-hand="label"]` ≤ 3 words; values Inter. 6. Unit counts opener 3 · details 3; `w768`: portrait `boundingBox().width` ≤ 420; no overflow at 390.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P1 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-171 · 404 in the paper system: renders for an unknown route with three CTAs, the tools sketch (count 1) and the band; axe clean
- **Related:** M-009 · TKT-88 AC 3 (TSK-47); Design.md §4.3 · **EVAL:** EVAL-011, EVAL-006, EVAL-018
- **Component:** `app/not-found.tsx`
- **Objective:** A graceful, on-system dead end with no new illustration spend.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. `/definitely-missing` → HTTP 404; `h1` "This page wandered off."; links `/`, `/work`, `/contact`. 2. Unit count of the section = 1 (`sketch`); exactly one `footer`. 3. axe at both widths. 4. No `img` (no illustration), no overflow at 390.
- **Test data:** —
- **Expected:** all as stated.
- **Type:** functional · **Priority:** P2 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-172 · Dead-code removal proof: clay/aurora/avatar/Manrope gone from the tree and the build; gates green; deleted-test ledger; diff shape
- **Related:** M-009 · TKT-89 AC 1–6; decision S11 · **EVAL:** EVAL-005, EVAL-016, EVAL-020
- **Component:** whole tree, `docs/reports/TKT-89.md`
- **Objective:** EVAL-020's "0 retired names" and EVAL-005 hold on real code.
- **Preconditions:** TKT-78/87/88 merged.
- **Steps:** 1. `grep -rniE "clay|aurora|avatar|manrope" app components lib hooks public content scripts package.json` → list; each hit must be the `lib/og.tsx` allow-list comment or a documented history mention. 2. `pnpm build`; `ls .next/static/media | grep -ci avatar`. 3. `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `pnpm eval --only EVAL-016,EVAL-020 --skip-build`. 4. `bundle-budget --json` ≤ 180. 5. `git diff --stat` for the ticket = deletions + `package.json` + `globals.css` + the three doc files. 6. The report's ledger maps every deleted test file to a replacement or "behaviour removed".
- **Test data:** —
- **Expected:** all as stated.
- **Type:** regression · **Priority:** P0 · **Automation:** Y — script / N — manual (5–6 review) · **Status:** Planned · **Defect:** —
- **Notes:** Delete-only commit so `git revert` restores the clay tree if a consumer was missed.

### TC-173 · Redesign responsive + a11y sweep: every route × 4 widths — overflow, ≥ 44 px targets, ≥ 12 px text, intrinsic image sizes, axe
- **Related:** M-009 · TKT-90 AC 1, AC 2 · **EVAL:** EVAL-006, EVAL-008
- **Component:** `tests/e2e/sweep.spec.ts`, `docs/screenshots/m-009/<route>/<width>.png`
- **Objective:** The whole paper site holds at 390/768/1024/1440 with no micro-text or sub-44 control.
- **Preconditions:** TKT-89 merged; `pnpm start`.
- **Steps:** 1. Routes = sitemap + 11 slugs + 5 essays + `/definitely-missing`; per width: `noOverflow`, `minTargets` (allow-list reviewed), every visible text node's computed `font-size` ≥ 12 px unless inside `[aria-hidden="true"]` (11 px allowed there), every `img` has `width`/`height`. 2. axe at 390 and 1440 on every route. 3. Screenshots saved.
- **Test data:** —
- **Expected:** 0 findings or `QA-###` rows; 0 critical/serious.
- **Type:** responsive · **Priority:** P0 · **Automation:** Y — Playwright + axe · **Status:** Planned · **Defect:** —
- **Notes:** Supersedes TC-104/105 for M-009 routes.

### TC-174 · Keyboard flows, reduced-motion collapse of every §8 row, and the used-pair contrast table
- **Related:** M-009 · TKT-90 AC 3 · **EVAL:** EVAL-007, EVAL-010, EVAL-006
- **Component:** `tests/e2e/{eval-007,eval-010}.spec.ts`, `tests/unit/contrast-pairs.test.ts`
- **Objective:** Every interaction is reachable with a visible 2 px rust ring, every motion row collapses, every colour pair in use passes.
- **Preconditions:** `pnpm start`.
- **Steps:** 1. Flows: nav + mobile sheet · filter tabs · `details` strip · folder tabs · Ask inline + panel · Show the thinking · `CopyButton` · band links — each completable by keyboard with `outline` = 2 px rust / 3 px offset on the focused element (kraft on the navy next band). 2. `reducedMotion:"reduce"`: hero poster only; draw-ins complete; reveals opacity-only; card hovers shadow-only; Ask expand instant; thinking nodes all-at-once; strip chevron instant. 3. Unit: every pair enumerated from Design.md §2.1 computed with culori ≥ 4.5 (text) / ≥ 3 (large) / ≥ 4 (band h2 line 2).
- **Test data:** pair table.
- **Expected:** 100 % flows; all rows collapse; all pairs pass.
- **Type:** accessibility · **Priority:** P0 · **Automation:** Y — Playwright + Vitest · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-175 · Paper gates in one run (EVAL-018 0/0/0/0 with an empty parked list · EVAL-019 4/4 · EVAL-020 · EVAL-021) + manual eval-021 checklist drafted + Stage-8 packs
- **Related:** M-009 · TKT-90 AC 4–7 · **EVAL:** EVAL-018, EVAL-019, EVAL-020, EVAL-021, EVAL-022
- **Component:** `scripts/eval.ts`, `evals/results/eval-run-m009-phase-d-<sha>.json`, `evals/results/eval-021-<sha>.md`, `docs/screenshots/m-009/pairs/*`, `docs/a11y-pass.md`
- **Objective:** All four automated paper gates green together on the final tree, with the manual evidence Stage 8 needs prepared.
- **Preconditions:** TC-173/174 done.
- **Steps:** 1. Assert `tests/e2e/eval-018-parked.json` is `[]`. 2. `pnpm eval --baseline baseline-m009-tracer.json --label eval-run-m009-phase-d-<sha>`; read the four statuses and details. 3. Draft `eval-021-<sha>.md`: one row per manifest asset with the four checks (metric / logo / product UI / claim) marked for Stage 8 confirmation. 4. Pairs for all 9 route families at 1440/390 committed. 5. VoiceOver notes appended for `/`, `/work/teachspark`, `/about`.
- **Test data:** —
- **Expected:** 1 → `[]`; 2 → EVAL-018 PASS with 0/0/0/0, EVAL-019 PASS 4/4, EVAL-020 PASS 13/13·0·0, EVAL-021 PASS 100 %; 3–5 → files exist.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — script / N — manual (3, 5) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-176 · Preview record run `eval-run-m009-rc-<sha>.json` with provenance; Critical PASS; EVAL-005 number + LCP element; diff review; PWA sync; HANDOFF
- **Related:** M-009 · TKT-91 AC 1, AC 2, AC 5, AC 6, AC 7 · **EVAL:** all 22 (record run)
- **Component:** Vercel preview, `evals/results/eval-run-m009-rc-<sha>.json`, Campfire, `HANDOFF.md`
- **Objective:** Stages 8–10 start from evidence produced on a real deployment.
- **Preconditions:** TC-175 green; final Phase-D commit pushed; preview 200.
- **Steps:** 1. `pnpm eval --base-url <preview> --label eval-run-m009-rc-<sha>`; assert provenance (commit, branch, `baseUrl` = preview, dataset sha), every Critical `PASS`, no High `FAIL` without a `QA-###` park. 2. `bundle-budget --json` on the same commit ≤ 180; preview Lighthouse `largest-contentful-paint-element` = hero poster — both written into the results `details`. 3. `git diff main..HEAD --stat` reviewed: only intended files. 4. Campfire: every M-009 task status/`sp:`/deps match `tickets.md` (`backlog task list -m m-8 --plain`). 5. `HANDOFF.md` names the Stage-8 inputs (packs, `QA-###`, `eval-021-<sha>.md`, parked hits = none).
- **Test data:** —
- **Expected:** all as stated.
- **Type:** validation · **Priority:** P0 · **Automation:** Y — script (1, 2, 4) / N — manual (3, 5) · **Status:** Planned · **Defect:** —
- **Notes:** —

### TC-177 · OG inspector pass on the M-009 preview (7 families × LinkedIn Post Inspector + opengraph.xyz) and `Design.md` §11 reconciled
- **Related:** M-009 · TKT-91 AC 3, AC 4 · **EVAL:** EVAL-017 (manual), EVAL-022
- **Component:** `docs/og/m-009/inspectors/`, `Design.md` §11
- **Objective:** Real link previews show the paper identity; every deviation the packs revealed has a row with a disposition.
- **Preconditions:** preview live; TC-150 green.
- **Steps:** 1. For each family URL: LinkedIn Post Inspector → screenshot; opengraph.xyz → screenshot (14 files). 2. WhatsApp re-scrape note (`?v=N`) recorded. 3. Walk the pairs pack; for each visible difference from the mockup confirm a `Design.md` §11 row exists with reason + disposition (pending rows list Tushar's open calls).
- **Test data:** —
- **Expected:** 7/7 families render the paper skin on both inspectors; 0 unrecorded deviations.
- **Type:** visual-review · **Priority:** P1 · **Automation:** N — manual (screenshots are the evidence) · **Status:** Planned · **Defect:** —
- **Notes:** Inspector logins may need Tushar (TKT-91 blocker).

---

## Appendix A · Coverage matrix — ticket → test cases

Every live ticket's acceptance criteria are covered by at least one case; task-level coverage is listed where a task has its own criteria. "Shared AC" for content tickets = TKT-28…33/54 common contract (a)–(f).

| Ticket | Cases covering its acceptance criteria | Notes |
|---|---|---|
| TKT-01 | TC-001 (AC1), TC-002 (AC2), TC-003/004/005/006 (AC3), TC-007/008/011/012 (AC4), TC-009/010 (AC5), TC-014/015 (AC6), TC-016 (AC7, AC9), TC-017 (AC8), TC-013 (AC10) | TSK-01 → TC-001/002/013 · TSK-02 → TC-009/010 · TSK-03 → TC-025 (early subset) · TSK-04 → TC-003/004/005 · TSK-05 → TC-007/008/011 · TSK-06 → TC-012/014/015 · TSK-07 → TC-016/017 |
| TKT-02 | TC-018, TC-010, TC-060 (informational at gate) | manual gate |
| TKT-03 | TC-019 (AC1, AC5), TC-020 (AC2), TC-021 (AC3), TC-022 (AC4), TC-034 (AC6 regression) | |
| TKT-04 | TC-023 (AC1, AC2), TC-024 (AC3), TC-025 (AC4), TC-026 (AC5, AC6), TC-023 unit part (AC7) | |
| TKT-05 | TC-027 (AC1), TC-028 (AC2), TC-029 (AC3, AC4), TC-013 (resume action), TC-034 (AC5) | |
| TKT-06 | TC-030 (AC1, AC4), TC-031 (AC2), TC-032 (AC3), TC-033 (AC5) | inspector part → TC-118 |
| TKT-07 | TC-034 (AC1, AC6), TC-035 (AC2), TC-036 (AC3), TC-037 (AC4), TC-038 (AC5), TC-039 (AC6 CI, AC7) | TSK-08 → TC-035 · TSK-09 → TC-036 · TSK-10 → TC-037 · TSK-11 → TC-038 · TSK-12 → TC-034/039 |
| TKT-08 | TC-040 (AC1, AC2, AC3 via decisions grep), TC-041 + TC-013 (AC4) | BLOCKED on Tushar's PDF |
| TKT-09 | TC-042 (AC1–3), TC-044 (AC4), TC-043 (AC5, AC7), TC-045 (AC6) | |
| TKT-10 | TC-046 (AC1), TC-047 (AC2, AC4), TC-048 (AC3), TC-049 (AC5, AC6) | |
| TKT-11 | TC-050 (AC1, AC5), TC-051 (AC2), TC-052 (AC3), TC-053 (AC4), TC-034 (AC6) | |
| TKT-12 | TC-054 (AC1, AC2, AC5), TC-055 (AC3, AC4) | |
| TKT-13 | TC-056 (AC1, AC2), TC-057 (AC3, AC5), TC-077 (AC4 anchors) | |
| TKT-14 | TC-058 (AC1), TC-059 (AC2), TC-060 (AC3), TC-061 (AC4), TC-034/119 (AC5) | |
| TKT-15 | TC-062 (AC1–6) | |
| TKT-16 | TC-063 (AC1), TC-064 (AC2), TC-065 (AC3), TC-066 (AC4), TC-067 (AC5), TC-068 (AC6), TC-069 (AC7) | TSK-13 → TC-064/066 · TSK-14 → TC-063/065/067/068 · TSK-15 → TC-069/030 |
| TKT-17 | TC-070 (AC1–3, AC5), TC-065 (AC4) | |
| TKT-18 | TC-071 (AC1, AC5, AC6), TC-072 (AC2, AC4), TC-073 (AC3, AC5) | |
| TKT-19 | TC-074 (AC1), TC-075 (AC2), TC-015/055 (AC3), TC-076 (AC4), TC-077 (AC5), TC-078 (AC6), TC-079 (AC7) | TSK-16 → TC-074/075/079 · TSK-17 → TC-076/077 · TSK-18 → TC-078/074 |
| TKT-20 | TC-080 (AC1, AC4, AC5), TC-081 (AC2), TC-082 (AC3) | TSK-19 → TC-080/081 · TSK-20 → TC-080 · TSK-21 → TC-080/026 |
| TKT-21 | TC-083 (AC1), TC-084 (AC2, AC4), TC-085 (AC3, AC5), TC-026 (AC6 fixture route) | |
| TKT-22 | TC-086 (AC1), TC-087 (AC2, AC3), TC-088 (AC4), TC-079 (weight re-check) | |
| TKT-23 | TC-086 (AC1), TC-087 (AC2), TC-088 (AC3), TC-071 no-video state (AC4 fallback) | AC4 poster-only does not satisfy PB4 for TKT-50 — TC-111 step 6 enforces |
| TKT-24 | TC-086 (AC1), TC-087 (AC2, AC3) | |
| TKT-25 | TC-086 (AC1), TC-087 (AC2), TC-088 (AC3) | |
| TKT-26 | TC-086 (AC1), TC-087 (AC2, AC3), TC-088 (AC4) | |
| TKT-27 | TC-089 (AC1a/1b), TC-088 (AC2) | conditional |
| TKT-28 | TC-090, TC-091, TC-092 (shared AC), TC-093 (EVAL-003 rows), TC-079 (Lighthouse re-check) | |
| TKT-29 | TC-090, TC-091, TC-092, TC-093 | |
| TKT-30 | TC-090, TC-091, TC-092, TC-093 | |
| TKT-31 | TC-091, TC-092 (+ TC-090 method applied by the reviewer to the remaining pages, lighter depth) | |
| TKT-32 | TC-091, TC-092, TC-089 (status/featured consistency) | |
| TKT-33 | TC-091, TC-092 | |
| TKT-54 | TC-091 (per task TSK-25…29 rules + AC g), TC-092 (AC f, h), TC-083 (ShowTheThinking hidden) | |
| TKT-39 | TC-093 (+ Appendix D table) | |
| TKT-40 | TC-094 (AC1–5), TC-095 + TC-099 (AC6) | TSK-22 → TC-094 · TSK-23/24 → TC-095 |
| TKT-41 | TC-097 (AC1, AC2, AC3 one-open, AC5), TC-096 (AC4), TC-098 (AC3 motion, AC6) | |
| TKT-42 | TC-099 (AC1–5) | |
| TKT-43 | TC-100 (AC1–5), TC-032 (AC4) | |
| TKT-44 | TC-101 (AC1–4) | |
| TKT-45 | TC-102 (AC1, AC2, AC4, AC5), TC-059 (AC3), TC-013 (AC4 states) | |
| TKT-46 | TC-103 (AC1–3) | |
| TKT-47 | TC-104 (AC1, AC2, AC4), TC-107 (AC3) | |
| TKT-48 | TC-105 (AC1), TC-106 (AC2), TC-108 (AC3), TC-109 (AC4), TC-112 (contrast), AC5 via QA-### logging | |
| TKT-49 | TC-113 (AC1–4) | |
| TKT-50 | TC-116 (AC1, AC5, AC6, AC7), TC-114 (AC2), TC-115 (AC3, AC4), TC-111 (AC8) | |
| TKT-51 | TC-118 (AC1, AC2, AC4), TC-030 (AC3) | |
| TKT-52 | TC-119 (AC1–4) | |
| TKT-53 | TC-120 (AC1–7), TC-117 (AC2), TC-118 (AC3), TC-113 (Lighthouse on prod) | |
| TKT-34…38 | — | retired into TKT-54 (PB2); no cases by design |
| **M-009 (2026-09-24)** | | native ids `TASK-64…86`; S18 regression cases in bold |
| TKT-69 | TC-122 (AC1), TC-123 (AC2, AC5), TC-124 (AC3, AC4), TC-125 (AC5, AC6) | TSK-30 → TC-122/123/125 · TSK-31 → TC-124 · TSK-32 → TC-123 |
| TKT-70 | TC-126 (AC1, AC2), TC-127 (AC3, AC6), TC-128 (AC5), TC-129 (AC4, DoD) | TSK-33/34 → TC-126/128 · TSK-35 → TC-127/129 |
| TKT-71 | TC-130 (AC1), TC-131 (AC3, AC4, AC5), TC-132 (AC2, AC8), TC-133 (AC6, AC7) | |
| TKT-72 | TC-134 (AC1, AC4), **TC-135** (AC5 — S18 tagline), TC-136 (AC2, AC3, AC6, AC7), TC-137 (AC8) | |
| TKT-73 | TC-138 (AC1), TC-139 (AC2 SSR, AC5), TC-140 (AC2 modes), TC-141 (AC3), TC-142 (AC4), TC-143 (AC6), TC-129 (AC7 wiring) | TSK-36 → TC-138/142 · TSK-37 → TC-139/140/141 · TSK-38 → TC-143 |
| TKT-74 | TC-144 (AC1, AC4), TC-145 (AC2, AC3, AC5), TC-146 (AC6, AC7) | manual gate |
| TKT-75 | TC-147 (AC1–6) | |
| TKT-76 | TC-148 (AC1–5) | |
| TKT-77 | TC-149 (AC1–7) | variant if the panel is dropped |
| TKT-78 | TC-150 (AC1–6), TC-123 (allow-list) | inspectors → TC-177 |
| TKT-79 | TC-151 (AC1–5), TC-128 (Reveal) | |
| TKT-80 | TC-152 (AC1, AC2), TC-153 (AC3, AC4), TC-154 (AC5, AC6, AC7) | TSK-39 → TC-154 · TSK-40 → TC-152/153 · TSK-41 → TC-153 |
| TKT-81 | TC-155 (AC1, AC2, AC6), TC-156 (AC3, AC4, AC5, AC7) | |
| TKT-82 | **TC-157** (AC1, AC5 — S18 learnings), TC-158 (AC2, AC3, AC4) | |
| TKT-83 | TC-159 (AC1), TC-160 (AC2, AC7), TC-161 (AC3), TC-162 (AC4, AC5, AC6) | TSK-42 → TC-159/161 · TSK-43 → TC-160 · TSK-44 → TC-162 |
| TKT-84 | TC-163 (AC1, AC3, AC4, AC5, AC6), **TC-164** (AC2 — S18 double prefix) | |
| TKT-85 | TC-165 (AC1–5) | manual approval |
| TKT-86 | TC-166 (AC1–6) | |
| TKT-87 | **TC-167** (AC1, AC2 — S18 timeline lead), TC-168 (AC3–6) | |
| TKT-88 | TC-169 (AC1, AC4), TC-170 (AC2, AC4, AC5), TC-171 (AC3) | TSK-45 → TC-169 · TSK-46 → TC-170 · TSK-47 → TC-171 |
| TKT-89 | TC-172 (AC1–6) | |
| TKT-90 | TC-173 (AC1, AC2), TC-174 (AC3), TC-175 (AC4–7) | |
| TKT-91 | TC-176 (AC1, AC2, AC5, AC6, AC7), TC-177 (AC3, AC4) | |

## Appendix B · EVAL → test cases

| EVAL | Cases | Gate type |
|---|---|---|
| EVAL-001 | TC-007 (structural precondition), TC-008, TC-018 (informational), TC-060 (gating) | manual |
| EVAL-002 | TC-012, TC-013, TC-041, TC-055, TC-099, TC-102, TC-116, **TC-117** (the journey), TC-120 | automated |
| EVAL-003 | TC-056, TC-080, TC-083, TC-090, **TC-093** + Appendix D | manual |
| EVAL-004 | TC-017 (baseline), TC-038, TC-061, TC-069, TC-079, TC-099, **TC-113**, TC-120 | automated |
| EVAL-005 | TC-001, TC-017, TC-038, TC-053, TC-061, TC-072, **TC-113** | automated |
| EVAL-006 | TC-005, TC-009, TC-024, TC-025, TC-026, TC-049, TC-050, TC-057, TC-069, TC-073, TC-074, TC-080, TC-081, TC-084, TC-092, TC-095, TC-096, TC-099–103, **TC-105**, TC-109, TC-112 | automated |
| EVAL-007 | TC-004, TC-005, TC-012, TC-025, TC-047, TC-049, TC-050, **TC-052**, TC-057, TC-064, TC-070, TC-073, TC-076, TC-077, TC-084, TC-097, TC-102, **TC-106**, TC-109 | automated + manual |
| EVAL-008 | TC-004, TC-007, TC-014, TC-025, TC-027, TC-049, TC-051, TC-057, TC-058, TC-063, TC-066, TC-073, TC-077, TC-082, TC-085, TC-095, TC-096, TC-101, **TC-104**, TC-107 | automated |
| EVAL-009 | TC-002, TC-010, TC-018, TC-023, TC-024, TC-058, TC-082, TC-095, TC-101, TC-112, **TC-121** | manual (Stage 8) |
| EVAL-010 | TC-003, TC-011, TC-014, TC-015, TC-025, TC-028, TC-049, TC-051, TC-055, TC-057, TC-064, TC-068, TC-076, TC-085, TC-098, **TC-108** | automated |
| EVAL-011 | TC-006, TC-012, TC-013, TC-029, **TC-037**, TC-041, TC-047, TC-055, TC-057, TC-059, TC-064, TC-065, TC-070, TC-071, TC-074, TC-077, TC-078, TC-092, TC-097, TC-100–103 | automated |
| EVAL-012 | TC-042, **TC-043**, TC-044, TC-045 | automated |
| EVAL-013 | TC-008, TC-009, TC-013, TC-019, TC-020, **TC-021**, TC-022, TC-029, TC-040, TC-042, TC-045, TC-048, TC-054, TC-056, TC-062, TC-070, TC-075, TC-080, TC-081, TC-087, TC-089, TC-090, TC-091, TC-092, TC-094, TC-099, TC-100, TC-102, TC-111, TC-115 | automated (+ manual truth review TC-090) |
| EVAL-014 | **TC-071**, TC-072, TC-073, TC-086, TC-089, TC-111, TC-116 | automated |
| EVAL-015 | TC-015, TC-055, TC-067, TC-068, TC-074, TC-103, TC-107, **TC-110** | automated + manual browser smoke |
| EVAL-016 | TC-022, TC-026, TC-040, TC-080, TC-088, TC-111, **TC-114**, **TC-115**, TC-120 | automated + manual frame review |
| EVAL-017 | **TC-030**, TC-031, TC-032, TC-033, TC-079, TC-099, TC-100, **TC-118**, TC-120; M-009: TC-150, **TC-177** | automated tags + manual inspectors |
| EVAL-018 | TC-126, **TC-127** (positive control), TC-129, TC-131, TC-134, TC-135, TC-139, TC-147, TC-148, TC-149, TC-151, TC-154, TC-156, TC-157, TC-158, **TC-159**, TC-160, TC-162, TC-163, TC-166, TC-168, TC-169, TC-170, TC-171, **TC-175** | automated (Playwright selector contract) |
| EVAL-019 | TC-139, **TC-140**, **TC-141**, TC-142, TC-144, TC-175 | automated (Playwright modes + file caps) |
| EVAL-020 | **TC-122**, **TC-123**, TC-144, TC-150, TC-172, TC-175 | automated (Vitest) |
| EVAL-021 | **TC-138**, TC-142, TC-154, TC-166, TC-175 (manual checklist drafted) | automated + manual per-asset checklist (Stage 8) |
| EVAL-022 | TC-146 (hero sub-gate), TC-151, TC-165, TC-175 (pairs), TC-176, **TC-177** | manual (Stage 8 critique against the mockups) |
| M-009 additions to existing rows | 001 → TC-139, TC-146, TC-151 · 002 → TC-147, TC-152, TC-156, TC-168, TC-170 · 003 → TC-148, TC-157, TC-160 · 004/005 → TC-124, TC-125, TC-143, TC-144, **TC-145**, TC-151, TC-172, TC-176 · 006 → TC-132, TC-136, TC-155, TC-162, TC-168, TC-171, TC-173, TC-174 · 007 → TC-131, TC-132, TC-148, TC-149, TC-152, TC-153, TC-156, TC-161, TC-162, TC-167, TC-174 · 008 → TC-130, TC-134, TC-136, TC-154, TC-169, TC-173 · 010 → TC-128, TC-130, TC-133, TC-140, TC-162, TC-163, TC-174 · 011 → TC-131, TC-134, TC-148, TC-153, TC-158, TC-163, TC-168, TC-169 · 012 → TC-149 · 013 → TC-135, TC-137, TC-138, TC-139, TC-155, TC-157, TC-164, TC-167 · 014 → TC-156 · 015 → TC-147 · 016 → TC-124, TC-137, TC-170, TC-172 | |

## Appendix C · Manual-only cases and why

| Case | Reason it cannot be automated (or must not be trusted to automation alone) |
|---|---|
| TC-010 | Likeness and cutout-edge quality are perceptual judgements; Tushar is the only oracle for "resembles me" (critical failure in evaluation-plan §4). |
| TC-018 | Human-in-the-loop gate: written approval of visual direction is the deliverable. |
| TC-031 (contrast step) | OG images render text over gradients; automated contrast on rasterised text is unreliable — automated size/dimension/hash checks still run. |
| TC-039 | CI trigger is observed once on a real PR; thereafter CI is its own evidence. |
| TC-058 (accent count) | "One accent colour visible per section" has no mechanical definition; the order/gap assertions are automated. |
| TC-060 | The 5-second test is a comprehension judgement; TC-007 automates the structural precondition (elements in the first viewport). |
| TC-087 (fact reading) | Whether a SOURCES line truly supports a status string requires reading; file/structure presence is scripted. |
| TC-088 | Sensitive content in video frames/screenshots is invisible to text scanners. |
| TC-089 (closure) | N/A closure and the featured-swap decision are records, not behaviour; the data-consistency rule is scripted. |
| TC-090 | Sentence-to-pack traceability is a reviewer's task; TC-091 mechanises every rule that reduces to string presence/absence. |
| TC-093 | Whether an artifact "answers" a product-leader question is judgement; anchor existence is automated in TC-077. |
| TC-095 (wall-of-text) | Editorial density judgement; layout measurements are automated. |
| TC-107 | Clipping/wrap aesthetics and Safari/Firefox behaviour (outside the Chromium-only automated matrix, COMPONENT_ARCHITECTURE §5). |
| TC-109 | VoiceOver reading order and announcement quality cannot be asserted by axe. |
| TC-112 (spot-check) | Volume-gradient overlays make computed background colour approximate; the pair table itself is scripted. |
| TC-116 (Analytics, team) | Vercel dashboard confirmation and "correct team/project" are outside the page; the route/video/eval steps are scripted. |
| TC-118 | LinkedIn Post Inspector and opengraph.xyz have no stable API; screenshots are the evidence. |
| TC-119 (diff review, HANDOFF) | Judging "only intended files" and hand-off completeness is a human review; the gate assertions on the results JSON are scripted. |
| TC-120 (steps 6–10) | Analytics traffic, rollback drill, provenance write-up, monitoring decision, and the "cinematic site untouched" confirmation are operational checks. |
| TC-121 | Premium rubric (EVAL-009) is the Stage-8 `impeccable` critique by design (evaluation-plan §5). |
| TC-141 (step 4) | Last-frame hold is compared visually against `hero-end.webp`; a pixel diff would flake on codec differences, so the `paused`/`ended`/monotonic assertions are automated and the frame is eyeballed. |
| TC-145 (push, dashboard) | The first branch push is externally visible (public repo) and needs Tushar's OK; Lighthouse numbers are read from the LHCI JSON but the Vercel build/dashboard state is confirmed by a human. |
| TC-146 | Human-in-the-loop hero gate: written approval on the preview is the deliverable (Solution-PRD §12.6.7). |
| TC-150 (step 6), TC-177 | OG snapshots and inspector renders are judged by eye; LinkedIn Post Inspector and opengraph.xyz have no stable API. |
| TC-151 (scoring, approval), TC-165 (approval) | EVAL-001 5-second scoring and phase approvals are comprehension/judgement calls; the structural preconditions are automated. |
| TC-172 (diff review, ledger) | "Only intended files" and the deleted-test ledger are review judgements. |
| TC-175 (eval-021 checklist, VoiceOver) | Whether an illustration depicts a metric/logo/UI/claim and how VoiceOver reads a page are human checks; the manifest/provenance rules are automated (TC-138). |
| TC-176 (diff review, HANDOFF) | Hand-off completeness is a human review; the results-JSON gate assertions are scripted. |

## Appendix D · Product-leader question traceability (EVAL-003 — verified TC-093 / TKT-39)

Anchors follow the TKT-19 scheme (`#01-context` … `#08-what-i-learned`, `lib/anchors.ts` `CHAPTER_ANCHORS`). "Planned artifact" comes from the TKT-28/29/30 descriptions and CONTENT_INVENTORY §8 packs; the "Verified anchor" column was filled by TKT-39 from the actual `data/projects.ts` chapter placement (cross-checked against `docs/trace/{teachspark,railcite,velora,nuptis,bhakti-vilas}.md`) and persisted to `evals/results/eval-003-bda8555.md`. A question may only be marked answered by an artifact that exists in a pack — gaps are logged, never filled by invention. Full inspection detail, quotes and the anchor-correction rationale for every row: `evals/results/eval-003-bda8555.md`.

| # | Question (brief §43) | Planned artifact(s) | Planned anchor(s) | Verified anchor | Status |
|---|---|---|---|---|---|
| Q1 | How I identify problems | TeachSpark `InsightCard` "Meera" persona + Observation node "my mother, who teaches Sanskrit"; RailCite `InsightCard` "Ravi" (composite CCI) + Master-Circular caveat; Velora Discovery "Weddings were blue — but a shallow pool" | `/work/teachspark#02-problem`, `/work/railcite#02-problem`, `/work/velora#03-discovery` | `/work/teachspark#02-problem` (Meera/JTBD) + `/work/teachspark#01-context` (mother observation) · `/work/railcite#02-problem` (Ravi) + `/work/railcite#03-discovery` (Master-Circular caveat) · `/work/velora#02-problem` (PRD problem line + team interview quote — the "Weddings were blue" quote is Q2 content, corrected below) | Answered — 3 anchors corrected/added |
| Q2 | How I make product bets | TeachSpark `DecisionCard` "Capability, not dependency" vs task-execution; RailCite `DecisionCard` "Refuse is a first-class success state" vs answer-always; Velora `DecisionCard` Nuptis killed → Velora | `/work/teachspark#04-product-bet`, `/work/railcite#04-product-bet`, `/work/velora#04-product-bet` | `/work/teachspark#04-product-bet`, `/work/railcite#04-product-bet`, `/work/velora#04-product-bet` (incl. "Weddings were blue — but a shallow pool") | Answered — matches plan exactly |
| Q3 | How I prioritize | TeachSpark `HypothesisCard` central hypothesis + A1–A8 summary and whitespace/blue-ocean `PrototypeFrame`s (MVP scoping); Velora `HypothesisCard` H1 coordination-not-speed; supplementary: Nuptis `DecisionCard` explicit cut list | `/work/teachspark#04-product-bet`, `/work/velora#04-product-bet`, (`/work/nuptis#04-product-bet`) | `/work/teachspark#03-discovery` (central hypothesis + A1–A8; chapter is "discovery" not "bet") · `/work/velora#03-discovery` (H1, as planned) · `/work/nuptis#04-product-bet` (cut list, as planned) | Answered — 1 anchor corrected; **QA-001** (below): no whitespace/blue-ocean `PrototypeFrame` artifact exists for TeachSpark (prose-only) |
| Q4 | How I collaborate | TeachSpark role text "solo MVP build, group discovery Sat–Mon" + mentor-challenge Outcome node + mentor quotes in Learned; Velora team-pooled interview `InsightCard` (attributed to team); Bhakti-Vilas team build with commit split (supplementary) | `/work/teachspark#07-outcome`, `/work/teachspark#08-what-i-learned`, `/work/velora#03-discovery`, (`/work/bhakti-vilas#05-what-i-built`) | `/work/teachspark#01-context` (role text — not in original plan) + `/work/teachspark#07-outcome` (mentor-challenge node, as planned) + `/work/teachspark#08-what-i-learned` (mentor quotes, as planned) · `/work/velora#02-problem` (team-pooled interview `InsightCard`; chapter is "problem" not "discovery") · `/work/bhakti-vilas#01-context` (commit split; chapter is "context" not "built") | Answered — 3 anchors corrected/added |
| Q5 | How technically deep I am | RailCite architecture `PrototypeFrame` (nightly crawl, pgvector, OCR 68 %, 193 lineage links) + `MetricCard`s 5,760 docs / 14,406 chunks; TeachSpark `EvaluationCard` 32 event types + Mixpanel funnel; Velora `EvaluationCard` 10/10 vitest, bundle 156 kB gz | `/work/railcite#05-what-i-built`, `/work/teachspark#06-evaluation`, `/work/velora#06-evaluation` | `/work/railcite#05-what-i-built`, `/work/teachspark#06-evaluation`, `/work/velora#06-evaluation` | Answered — matches plan exactly |
| Q6 | How I work with AI | RailCite "0 invented citations — by construction" `MetricCard` (structural) + `ExperimentCard` threshold 0.45→0.32; TeachSpark `DecisionCard` capability-not-dependency (LLM as capability); authorship phrasing "built with Claude Code" where packs say so | `/work/railcite#05-what-i-built`, `/work/railcite#06-evaluation`, `/work/teachspark#04-product-bet` | `/work/railcite#05-what-i-built` (validator/structural claim), `/work/railcite#06-evaluation` (0.45→0.32 calibration), `/work/teachspark#04-product-bet` (capability-not-dependency) + `/work/railcite#01-context` (authorship phrase — rendered as "directed with Claude Code", not verbatim "built with"; anchor not in original plan) | Answered — 1 anchor added, 1 wording note |
| Q7 | How I evaluate products | TeachSpark `EvaluationCard` QA gates + funnel `MetricCard`s 72→17→17→12→8→5 + `ExperimentCard` `is_test` exclusion (10→8 / 37.5→30); RailCite `EvaluationCard` impeccable critique 22/40 (stated as found) + threshold calibration experiment | `/work/teachspark#06-evaluation`, `/work/railcite#06-evaluation` | `/work/teachspark#06-evaluation` (QA gates + is_test experiment, as planned) + `/work/teachspark#07-outcome` (the 72→17→17→12→8→5 funnel prose; chapter is "outcome" not "evaluation") · `/work/railcite#06-evaluation` (impeccable 22/40 + calibration, as planned) | Answered — 1 anchor corrected |
| Q8 | What I learned when assumptions failed | TeachSpark drop-off retro + "Bangalore four different ways"; RailCite "staleness is a correctness bug", temperature rejection found by live smoke; Velora "Nothing below presents a hypothesis as a validated fact" + the kill decision | `/work/teachspark#08-what-i-learned`, `/work/railcite#08-what-i-learned`, `/work/velora#08-what-i-learned` | `/work/teachspark#08-what-i-learned`, `/work/railcite#08-what-i-learned`, `/work/velora#08-what-i-learned` | Answered — matches plan exactly |

**Threshold: 8/8 rows with ≥1 verified anchor (evaluation-plan EVAL-003) — MET.** Every question resolves to real, sourced, rendered content on the correct project page. 6 of 8 rows required an anchor correction against the original plan (the plan was drafted from the CONTENT_INVENTORY packs before the chapters were authored, and several artifacts landed one chapter away from where the plan guessed — all corrections cross-checked against `docs/trace/*.md`, the authoritative per-project trace tables). One genuine content gap was found and logged rather than invented-around: **QA-001** — Q3's claimed TeachSpark whitespace/blue-ocean `PrototypeFrame` does not exist as a distinct artifact (`data/projects.ts` TeachSpark record has zero `type: "prototype"` artifacts; the 2×2 whitespace map is one sentence of prose in the discovery chapter, sourced to `TS-DISCOVERY-PRD` / `AUDIT §4 disc-whitespace-quadrant.jpg`, but that image was never turned into a rendered artifact). This does not fail Q3 — the `HypothesisCard` content independently answers "how I prioritize" — but is recorded as a real, low-severity finding for a future ticket (optionally render `disc-whitespace-quadrant.jpg` as a `PrototypeFrame` in TeachSpark's discovery chapter) rather than silently corrected away. Full detail: `evals/results/eval-003-bda8555.md`.

---

*M-009 addendum (2026-09-24): TC-122…TC-177 = 56 cases · P0 40 · P1 13 · P2 3 · P3 0; four permanent S18 regression cases (TC-135, TC-157, TC-164, TC-167); five gate-type positive controls (TC-122, TC-123, TC-127, TC-129, TC-138); 47 automated or partly automated, 9 with a manual component, 2 manual-only (TC-146, TC-177). Grand total TC-001…TC-177 = 177 cases.*

*v1 totals (counted from the case fields): 121 cases · P0 60 · P1 49 · P2 12 · P3 0. By primary type: functional 38 · validation 16 · accessibility 15 · content-integrity 11 · responsive 10 · visual-review 7 · security-functional 5 · performance 5 · deployment-smoke 3 · regression 3 · negative 3 · error-handling 2 · edge/boundary 2 · e2e 1. Automation: 110 cases have an automated component (Playwright 73 · Vitest 38 · script 19 · axe 17 · LHCI 5; many cases use more than one tool), of which 9 also carry a manual step; 11 are manual-only (Appendix C lists all 20 with a manual component). Authored before implementation; statuses are `Planned` until Stage 7 QA gates and Stage 9B fill them from real runs.*
