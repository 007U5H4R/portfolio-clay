# TKT-87 report: `/about` part 2 (experience, proof, CTA, assembly)

**Ticket:** TKT-87 (Backlog `TASK-82`) · M-009 · Feature · P1 · sp:5 · **Branch:** `m009/tkt-87` (not pushed) · **Model:** Opus 5.5

## AC checklist
| AC | Status | Evidence |
|---|---|---|
| 1. Four story cards open on load; `#experience-<id>` scrolls to the card; open/close logic deleted | ✓ | `ExperienceTimeline` is now a server component with no toggles. `timeline.spec.ts` was rewritten: 4 cards visible, 0 `button`/`[aria-expanded]` in the section, each `/about#experience-<id>` puts its card in the viewport (w390 + w1440), and the bare `#experience` still resolves. `TimelineNode.tsx` is deleted. `toggleOpen` / `roleIdFromHash` / `nextNodeIndex` were removed and grep finds 0 hits in components and tests. `timeline-logic.test.ts` asserts the exports are exactly `SECTION_ANCHOR, TIMELINE_LEAD, storyCardId, textStatesKind` |
| 2. S18 lead regression (TC-167) | ✓ | `tests/unit/experience-skills.test.ts`: the rendered lead equals the S18 string exactly, and "newest to oldest" appears nowhere. The company `h3` order equals `experience.map(e => e.company)` and the first start date is the earliest. A reversed-fixture negative control fails the check. Every card is rendered with its flat `dl` and no collapse state |
| 3. EVAL-018: experience 1 · proof 2 · CTA 1; story `dl` `[data-flat]` with 0 decorations | ✓ | `about-part2.spec.ts` at w390 + w1440: `["torn"]`, `["torn","note"]`, `["torn"]`. There are 4 flat `dl`s, each with 0 `[data-decor]`. Whole-site EVAL-018 PASS: 23 routes × 2 widths, 206 units, max 4/4, 0 unparked hits, 0 stale |
| 4. Résumé control = `resumeAction()` (EVAL-002 path) | ✓ | `about-part2.spec.ts` checks the label and href from `resumeAction()`, that there is no `download` attribute in the placeholder state, and that clicking it lands on `/contact#resume` |
| 5. Patent link + DOI pill resolve; "DOI pending" is Inter | ✓ | Hrefs come from `data/credentials.ts`. Computed font of "DOI pending" and of "Languages" is not Caveat. The TP stamp is `aria-hidden`. EVAL-011 (crawler) PASS |
| 6. axe 0 critical/serious at 390 & 1440 | ✓ | `about-part2.spec.ts` covers the whole page; `timeline.spec.ts` covers the section |

## Files
- `components/timeline/ExperienceTimeline.tsx`: rewritten as a server component. It has the dashed rail (`220px 1fr`, single column below 900), sticky node (Fraunces 24 company, Inter 14 tabular dates) and data-order map.
- `components/timeline/StoryCard.tsx`: an always-open `Sheet card`. The `dl` is a `FlatZone`. Kind badges are Inter, "not recorded" is Inter italic ink-soft, and the Source line is linked only when a `SourceRef.url` exists (none do today).
- `components/timeline/timeline-logic.ts`: trimmed; adds `TIMELINE_LEAD`. `components/timeline/TimelineNode.tsx`: deleted.
- `components/about/{Awards,Research,Education}.tsx`: each is now a labelled band row (`div role=region`; the `#awards/#research/#education` anchors are kept). Awards are 3 kraft eyelet `Sheet tag`s. The patent is a taped `Sheet card` with a `Note stamp` "TP". Papers use a DOI pill or an Inter `Tag` "DOI pending". Education sits on a kraft rule with an Inter languages line.
- `components/about/AboutCta.tsx` (new): `section#about-cta` with the h2, "Let's talk" (Caveat `Hand cta`, reusing `.hero-btn-primary`), `resumeAction()` secondary, and the TP10 colophon.
- `app/about/page.tsx`: assembled in §7.4 order with commented **TKT-86 slots** (hero, journey, capabilities, impact). The proof section is one `<section class="proof-s">`, so it is one counting unit.
- Tests: `tests/unit/{timeline-logic,experience-skills}.test.ts`, `tests/e2e/timeline.spec.ts` (rewritten), and `tests/e2e/about-part2.spec.ts` (new). Evidence: `evals/results/eval-run-tkt87.json`.

## Shared-file edits
- `app/globals.css`: one appended block, `/* TKT-87 · about part 2 … */ @layer components { … } /* end TKT-87 */`. Classes are `xp-*`, `story-*`, `proof-*`, `acta-*`. It reuses the TKT-93 `.hero-btn*` classes without editing them. Each of my sections' torn edge gets `margin-top: -44px` so it bites into the previous section's fill.

## Gates (locked runs)
- typecheck 0 · lint 0 · `tokens:check` 13/13 · unit **468 passed / 2 skipped** · build OK.
- e2e w390+w1440 (`timeline`, `about-part2`, `about`, `eval-018`): **78 passed / 18 skipped (viewport skips) / 0 failed**. This passed twice: once on the first build and again after the torn-edge CSS fix (with lint and build rerun).
- `pnpm eval --skip-build --only EVAL-002,EVAL-007,EVAL-011,EVAL-013,EVAL-018`: **5/5 PASS**, 0 failed, exit 0. The eval ran on the pre-torn-fix build; the fix is CSS-only.

## Screenshots (Read)
`docs/screenshots/about/{1440,390}.png` were produced by about.spec (not committed; restored). At 1440, all four cards are open with rust/steel/forest/rust dots on the dashed rail and the lead reads "oldest to newest". The paper-2 proof band shows three kraft award tags, the taped patent card with its TP stamp, the DOI pill, the Inter "DOI PENDING" tag, and education on a kraft rule. The CTA shows the rust "Let's talk →" pill and the "Resume — updating" secondary, and the band follows.

## Merge notes / judgement calls
- **TKT-86 overlap:** `about.spec.ts` (TKT-86) passes on this branch because the proof ids, headings, CTA link names and colophon are unchanged. Its order test lists `product-journey` / `capability-clusters`; if TKT-86 renames them (Design says `#journey`), that test is theirs. `page.tsx` only mounts TKT-86's components, so at merge keep this file's structure and TKT-86's component internals.
- EVAL-018 parked list: I did not touch it. The `/about` hero entry belongs to TKT-86.
- The patent stamp reads "TP" per Design §7.4 and the plan S87.02; the mockup showed "Patent IN 429867".
- Award years are in terracotta, not the mockup's rust, because rust on kraft measures ≈2.9:1 and fails even for large text; terracotta measures ≈4.2:1.
- There are no Source *links* in the story cards because no experience `SourceRef` has a `url`. TC-167's "Tab reaches each Source link" is therefore covered as "Tab passes straight through the timeline with no traps"; links render automatically if URLs are added.
