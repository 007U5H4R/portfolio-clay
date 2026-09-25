# TKT-77 · Ask notebook (inline) + AskPanel notebook sheet — report

Branch `m009/tkt-77` · Backlog TASK-72 · model Opus 5.5 · S21 default (panel **kept**).

## AC checklist
| AC | Status | Evidence |
|---|---|---|
| 1 Ask logic + its unit suites untouched & green | PASS | `git diff --stat HEAD -- lib/ask tests/unit/{eval-012,ask-*,use-ask}* components/ai/{AskProvider,AskPanelLazy}.tsx` → empty. Full unit run 469 passed / 2 skipped (50 files). `pnpm eval --only EVAL-012,EVAL-020` → 2 pass · 0 fail (`evals/results/tkt-77.json`, gitignored). |
| 2 Five states on the notebook | PASS | `ask-inline.spec.ts`: idle/answer/empty on `/`, loading (2 `.ask-shimmer` + sr-only status) and error (solid rust border = glyph colour, glyph, "Try again") on `/dev/ask` (ALLOW_DEV_ROUTES=1 build). Empty = FALLBACK + exactly 3 chips. |
| 3 Panel keyboard path | PASS | `eval-007.spec.ts` (open → trap → type → answer → Esc → focus returns, desktop + 390), `ask-panel.spec.ts` all green incl. geometry (400/480 drawer, full-width 90 vh sheet). |
| 4 Never navigates; focus → "Answer" | PASS | ask-inline answer + keyboard tests (URL unchanged, heading focused). |
| 5 EVAL-018 count 2; Inter input + answer text | PASS | new TC-149 test: `section#ask` decor = `["torn","annotation"]`; input + `.ask-answer-text` fontFamily /Inter/; "Ask →" is `data-hand="cta"` Caveat. `eval-018.spec.ts` all routes green. |
| 6 Reduced motion: instant height, 150 ms opacity | PASS | notebook `transition-duration` 0; `.ask-reveal` = `{animation:none, transition: opacity 0.15s}` (via `@starting-style`, so the EVAL-010 sweep stays green). |
| 7 Trigger = TKT-71 ghost; panel kept | PASS | unchanged trigger; tracer/eval-007 open it. No drop decision needed. |

## Files changed
- `components/ai/AskSection.tsx` (new): `section#ask` → `TornEdge fill="paper-2"` (first child) → paper-2 body → `1fr 1.2fr` grid ≥ 900 px (copy left, notebook right). Copy is verbatim from the previous section (Dev-01).
- `components/ai/AskPortfolio.tsx`: `Sheet variant="notebook" rotate={0.5}`, `<Annotation>What would you like to know?</Annotation>`, sr-only label, underline Inter 18 px input, navy pill `<Hand kind="cta">Ask →</Hand>`. Logic unchanged.
- `components/ai/AnswerView.tsx`: paper states; `DraftBadge` → `DraftTag`; ClayButton → `.ask-btn`. Exports, copy and state logic unchanged.
- `components/ai/{SuggestedPrompts,EvidenceLinks}.tsx`: Inter 13 px ivory pills (44 px floor); evidence arrow is `aria-hidden`.
- `components/ai/AskPanel.tsx`: body is one unrotated notebook `Sheet` filling the drawer/sheet; same paper form/controls. Geometry, the 20 % navy `::backdrop`, the 320 ms slide, `lockBackground` (Lenis pause, TKT-94) and `data-lenis-prevent` are unchanged.
- `app/dev/ask/AskDevBoard.tsx`: board on paper-2 using the section type styles.
- `tests/e2e/ask-inline.spec.ts`: new selectors (`[data-paper="notebook"]`, `[data-paper="tag"]`), empty = 3 chips, plus TC-149 tests (paper contract, reduced motion, error/loading paper, screenshot pack).
- `tests/e2e/ask-panel.spec.ts`: TC-149 notebook-panel test + screenshot pack.

## Shared-file edits
- `app/globals.css`: one appended block `/* TKT-77 · ask … */ … /* end TKT-77 */` (`@layer components` ask-* classes + `@keyframes ask-shimmer`). No other block and no tokens were touched.
- `app/page.tsx` (**not in the ownership table**): I replaced the old `<Section id="ask">…</Section>` block with `<AskSection prompts={HOME_PROMPTS} />`. I also swapped the `AskPortfolio`/`Section`/`SectionHeading` imports for the one `AskSection` import. Plan S77.01 lists this file for this step.

## Gate outputs
- typecheck ✓ · lint ✓ · tokens:check 13/13 ✓ · unit 469 pass / 2 skip ✓ · build ✓ (all routes static, 13) with ALLOW_DEV_ROUTES=1.
- First e2e run (ask-inline, ask-panel, eval-007, eval-018, home, tracer, eval-014/015/010 × w390/w768/w1440): 198 passed, 2 failed.
  1. My error-border assertion expected 1.5 px, but Chromium snaps the border to device pixels. I fixed the assertion to check a solid border whose colour matches the rust glyph.
  2. EVAL-010 found my reduced-motion `ask-fade` keyframe. I changed it to an opacity transition from `@starting-style`.
- Fix re-run (ask-inline, ask-panel, eval-010, eval-018 × 3 widths): **145 passed, 0 failed**.
- eval `--only EVAL-012,EVAL-020`: 2 pass · 0 fail.

## Screenshots (read and checked)
`docs/screenshots/m-009/home/ask-{390,1440}.png`, `docs/screenshots/m-009/ask-panel-{390,1440}.png`: all show the answer state on the ruled notebook with the DraftTag, evidence pills and "Ask another". The 390 element shot has the sticky header over its bottom edge. That comes from the screenshot, not the layout. I restored the tracer screenshots my run regenerated.

## Merge notes
- `app/page.tsx`: TKT-75 or TKT-76 may also edit the imports or mounts here. My hunk only touches the Ask block and three import lines.
- `home.spec.ts` checks `#ask` padding-top against 72/96/128. The ladder is kept on `.ask-section`, which is transparent above the tear, so it still passes.
