# TKT-81 (TASK-76) — Case-study template part 1

Branch `m009/tkt-81` · implementer Claude Opus 5.5 (standard tier) · 2026-09-25

## Scope note — header photo superseded (Dev-24 / EXE-18)
The §7.3 taped `scene-casestudy` photo (and its caption annotation "evenings, mostly reading") is **not built**: the page already opens with the TKT-95 `SceneOpener` showing the same scene. The **"Hero media coming"** kraft tag (`data-paper="tag"`, navy text, Dev-13) now sits in the header **meta row** after the `StatusBadge`, with its sub-line annotation "the illustration stands in, for now". A taped photo frame renders on the right (`56fr 44fr` grid) **only** when a project gains `hero.image` / `links.demoVideo`; then the tag disappears and `DemoVideo` renders inside the frame. No project has hero media today. As a result the header's decoration count is **1**, not the planned 2 (§3.3). Stage 8 should record this in §3.3.

## Acceptance criteria
| AC | Evidence |
|---|---|
| 1 · all 11 slugs build + render at 390/1440, no invented content | `pnpm build` → all routes static (13). Per-slug test in `case-study.spec.ts` (h1, 200, noOverflow, minTargets, **no console errors**) passes for all 11 slugs × 2 widths. The only copy added is UI chrome from Design §7.3. |
| 2 · teachspark 3 cards + annotation; thin slug has no strip + "Deep dive coming" | New tests "TKT-81 rich project (teachspark)" and "TKT-81 thin project (token-toli)" pass. The strip returns `null` below 2 metrics. |
| 3 · `DemoVideo` states in the frame | The header renders `DemoVideo` inside the `Sheet variant="photo"` when `links.demoVideo` exists. `eval-014.spec.ts` itself is unchanged and still runs against the `/dev/video` board. No case-study fixture project exists, so no in-page media assertion was added. **Not verified in-page.** |
| 4 · tabs keyboard-operable; anchors unchanged | The `radiogroup` keeps its roving tabindex and arrow-key selection. The existing @EVAL-007 test passes. New test: Space selects Deep dive, which mounts `section#deep`; ArrowLeft unmounts it. `#01-context` and `#deep` hashes open the deep dive on load and scroll to the target through the Lenis `scrollToTarget`. `lib/anchors.ts` is untouched. |
| 5 · EVAL-018 counts; kind badges Inter | Header **1** (see scope note) · strip 2 · overview 2 · next 2, asserted per unit. Kind-badge `font-family` is not Caveat on all 3 cards. `eval-018.spec.ts` is green on every route. |
| 6 · tag navy on kraft | Test: computed text colour = `--color-navy`, background = `--color-kraft`. axe on `section.cs-head` is clean. Every case-study axe test passes at 390/1440. |
| 7 · spec updated, EVAL-002 hop | `case-study.spec.ts` extended (5 new tests). `eval-002` passes. |

## Files changed
- `components/case-study/CaseStudyHeader.tsx` — rewritten on paper. The `icon` prop and `ClayFrame` are removed; the `project-{slug}` VT name moved to the h1.
- `components/case-study/MetricStrip.tsx` (new) — torn `paper-2` strip, 3 pinned index cards, annotation, fail-loud source guard.
- `components/case-study/OverviewToggle.tsx` — now renders the whole overview section: folder tabs + notebook slot. `deep` mounts as the next sibling, and a URL hash opens it. With no `deep` prop, no tabs render (thin projects).
- `components/case-study/NextProject.tsx` — navy torn band with the whole band as one link, a kraft focus ring and the "next up" annotation. The `icon` prop is removed.
- `app/work/[slug]/page.tsx` — section order per §7.3, the deep-dive slot, and commented slots for "What I learned" and "Sources".
- `tests/e2e/case-study.spec.ts` — console-error check in the per-slug sweep, plus the TKT-81 tests.
- `docs/screenshots/m-009/case-study/{teachspark,token-toli}-{390,1440}.png`

## Shared-file edits
`app/globals.css`: one appended block `/* TKT-81 · case-study template part 1 … */ … /* end TKT-81 */` holding the `.cs-*` classes only (inside `@layer components`, tokens only). No other block was touched.

## Deviations (for Stage 8 / Design §11)
- The header photo, its caption and the 56/44 grid appear only when media exists (Dev-24, see the scope note).
- Tag / kind-badge text is 12 px `data-micro-label`, not the 11 px in the design: the EVAL-008 micro floor is 12 px. Mockup labels at 12–13 px became 14 px (the EVAL-008 content floor).
- The notebook label "30-sec" is an Inter eyebrow, not `Hand kind="label"`: the §3.4 label rule rejects digits other than a 2-digit numeral, so `Hand` would throw.
- The overview help line is derived from the data: "Deep dive adds the {n} chapters and the evidence behind each one."
- The next-band annotation is "next up" per §7.3; the mockup used the project tagline there.

## Gates (under heavy.sh)
- typecheck 0 · lint 0 (after one fix: setState in an effect became a ref + tick) · tokens 13/13 · unit 469 passed / 2 skipped (50 files) · build OK (all routes static).
- e2e w1440+w390, run 1 (case-study, tracer, eval-018/002/006/008, scene-opener): 362 passed, 2 failed. Both failures came from my own test's locator hitting the StatusBadge as well (strict mode). The locator was fixed.
- e2e run 2 (case-study, eval-018/007/010, lenis): 171 passed, 0 failed. Final run after the CSS padding tweak (case-study + eval-018): 114 passed, 0 failed.
- `pnpm eval --only EVAL-002,007,013,014,018,021`: 6 pass · 0 fail (the 16 others excluded by `--only`). The results json it wrote is not committed.

## Merge notes
- **TKT-83**: owns everything inside `<section id="deep" aria-label="Deep dive" className="cs-deep">` in `page.tsx`. Keep the outer element: the tabs mount it, and `deepIds` (`deep` + chapter anchors) makes hashes open it. The inner grid, `ChapterNav`, `Chapter` and `ShowTheThinking` code there is the legacy code, carried over unchanged.
- **TKT-82**: mount `Learnings` and `Sources` at the two commented slots after the overview/deep block and before `</article>`.
- The metric kind labels are duplicated locally in `MetricStrip`. `artifacts/MetricCard.tsx` (TKT-83) keeps its own map; I did not touch it.
