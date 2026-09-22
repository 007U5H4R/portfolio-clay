# TKT-48 — Accessibility sweep (QA-tester report)

Branch `m-007-quality`. Environment: memory-tight host (~100 MB–1.3 GB free, fluctuating),
Playwright run foreground, `workers:1` pinned, one run at a time on `:3000`, everything on E Drive.
No stalls/OOM encountered — every run completed on the first attempt.

## 1. Coverage gap check (TKT-47 precedent) — found and fixed

TKT-47 found `eval-008.spec.ts` silently under-covering (7 of 22 routes). Checked `eval-006`
(axe) and `eval-010` (reduced motion) for the same class of gap:

- **EVAL-006 (axe):** imported `STATIC_ROUTES`/`DEV_ROUTES` from the stale `tests/e2e/routes.json`
  (7 routes: `/`, `/work`, `/about`, `/thinking`, `/playground`, `/contact`, plus `ALLOW_DEV_ROUTES`
  boards) — **same gap as EVAL-008 had**, silently skipping axe on 15 of 22 public routes (10 case
  studies, 5 essays).
- **EVAL-010 (reduced motion):** its header-transition-collapse check ran against `/` only — the
  most obviously route-generic assertion (a header exists on every page) was never actually swept.

**Fix:** both now derive `PUBLIC_ROUTES` the same way the TKT-47-fixed `eval-008.spec.ts` does —
`STATIC_ROUTES` from `@/app/sitemap` + `projects.filter(category:"personal")` + `writing` — never
the stale `routes.json`, never hard-coded. `eval-006` iterates all 22 routes at 390/1440 (unchanged
threshold: 0 critical/serious). `eval-010` gained: (a) the header-collapse check run per-route
across all 22, and (b) a new generic DOM sweep per-route asserting no element still carries a
transform/`all`/`top`/`left` transition or a named animation above the global 1ms reduced-motion
floor — same invariant the `app/globals.css` blanket rule already enforces, now actually verified
route-by-route instead of assumed. The existing home-only card-hover-lift check stays scoped to `/`
(the only route with that component) — not a route-coverage gap, a component-specific check.
No threshold weakened (EV2 respected) — iteration only. Commit `ce83792`.

## 2. axe result per route @390/1440

**0 critical/serious on every route, both viewports — PASS.** `EVAL-006` case: 188 specs, 93
actual runs across w390/w768/w1024/w1440 (390/1440 are the axe-gated widths; w768/w1024 tests
`test.skip`). Full 22-route list: `/`, `/work`, `/about`, `/thinking`, `/playground`, `/contact`,
the 11 `/work/<slug>` case studies, the 5 `/thinking/<slug>` essays — plus route-specific axe checks
already covering open-dialog/open-panel states (MobileMenu, AskPanel, AskPortfolio, StoryCard, the
404 page). Zero failures across all of it.

## 3. Keyboard-flow matrix (AC2)

| Flow | Result | How verified |
|---|---|---|
| Header nav (desktop) | PASS | `eval-007.spec.ts` — 7 Tab stops, every one wears the 3px accent focus ring |
| MobileMenu | PASS | `eval-007.spec.ts` — opens, native `<dialog>` traps focus, Esc closes, focus restores to the toggle |
| FilterTabs (/work) | PASS | `work.spec.ts` — arrow keys move + activate (roving tabindex), Home/End, focus ring |
| ExperienceTimeline (/about) | PASS | `timeline.spec.ts` — Enter/Space open (one card at a time), Esc closes + returns focus, arrow keys move (wrapping) |
| AskPanel (open/answer/close, focus-trap) | PASS | `eval-007.spec.ts` — Enter opens, 20-Tab trap sweep never reaches a page control, full type→submit→answer→evidence-link path, Esc closes + restores focus (desktop trigger and MobileMenu-row trigger both covered) |
| ShowTheThinking (case study) | PASS (new) | `case-study.spec.ts` (added this ticket) — Enter opens the toggle on a real `/work/teachspark` route, focus deliberately stays on the toggle (disclosure, not modal) |
| OverviewToggle (case study) | PASS (new) | `case-study.spec.ts` (added this ticket) — WAI-ARIA radiogroup: arrow keys move AND select (roving tabindex), focus ring, only the checked radio is tabbable |
| CopyButton (/contact) | PASS (new) | `contact.spec.ts` (added this ticket) — Tab focuses with visible ring, Enter and Space both trigger the copy |

The last three close real gaps: `OverviewToggle`/`ShowTheThinking` had solid component-level
keyboard handling already (WAI-ARIA radiogroup pattern; native `<button>`) but only `.click()`
e2e coverage; `CopyButton`'s keyboard path was the explicit M-006 follow-up. All three now have a
real keyboard-driven Playwright assertion, not just a manual read of the code. `FilterTabs` /
`ExperienceTimeline` were already fully covered in `work.spec.ts` / `timeline.spec.ts` (the
`eval-007.spec.ts` `test.fixme` naming them is stale — their real coverage landed in those other
specs at TKT-16/17, just never removed from the fixme). Left the fixme alone (removing a
`test.fixme` line is a real edit but not in this ticket's fix-or-log scope; noting it here instead
of silently deleting it).

## 4. Reduced-motion result

**PASS on all 22 routes.** `EVAL-010` case: 212 specs, 51 runs. Header-transition-collapse check
now runs per-route (previously `/` only); the new generic no-transform-animation DOM sweep runs
per-route and found zero offenders; the home-only card-hover-lift check still passes; the
component-specific fixed suites (`about.spec.ts` ProductJourney, `ask-inline.spec.ts` /
`ask-panel.spec.ts` Ask states, `thinking.spec.ts` node reveal, `timeline.spec.ts` StoryCard,
`work.spec.ts` filter switch, `tracer.spec.ts`, `how-i-think.spec.ts`) all pass unchanged.

## 5. Contrast spot-check result

**PASS — via axe's `color-contrast` rule (part of the `wcag2aa`/`wcag21aa` tag set), which ran
against the real rendered text/background pairing of every element on all 22 routes at both
viewports** — a stronger check than a hand-picked token-pair spot-check, since it exercises actual
computed styles rather than assumed pairings. Zero contrast violations. `eval-008.spec.ts`'s
dedicated `data-micro-label` check (header wordmark subtitle, "TP" monogram — the two documented
sub-14px exceptions, ≥4.5:1 AA floor) still passes unchanged, confirming the M-005/M-006 Footer-bg
and eyebrow-ink contrast fixes have not regressed. No separate contrast script was written — it
would duplicate what axe already verifies more rigorously.

## 6. docs/a11y-pass.md

Created — accessibility-tree evidence (heading outline, landmarks, `aria-current`,
`aria-expanded`/`aria-controls`, live regions, alt text) for `/`, `/work/teachspark` (both the
default and "Deep dive"-expanded states), and `/about`, dumped from the real production DOM. Also
documents the QA-003 finding (below) and explicitly flags the human VoiceOver spot-check as a
turnkey item for Tushar — programmatic tree structure was verified; what VoiceOver actually
announces was not, and can't be by automation.

## 7. Defects found

**QA-003 (fixed) — heading-outline skip on every deep-dive case study.** The accessibility-tree
read surfaced `h1 → h3` (no `h2`) on all 11 case studies' Chapter headings, with `DecisionCard`
titles at `h4` directly under that `h3`. Axe's default WCAG 2.1 AA tag set doesn't include the
`heading-order` rule (best-practice/moderate, not a wcag2aa conformance criterion), so this was
invisible to the axe gate before and after — only a real tree read caught it. Fixed by promoting
`Chapter` to `h2` and `DecisionCard` to `h3` (CSS-class-driven sizing, so no visual change); outline
now reads `h1 → h2 → h3` with no skip in either direction. Commit `8092086`.

No other real defects found. Nothing was deferred as QA-### — the one finding was cheap to fix in
scope, so it's fixed rather than logged-and-parked.

## 8. Final gate

```
pnpm eval --only EVAL-006,EVAL-007,EVAL-010
```
Ran three times across this ticket (after the route-coverage broadening, after the QA-003 fix, and
after the three new keyboard tests) — green every time, count climbing as coverage grew:
- Run 1 (broadened routes): 163 passed, 0 failed. `EVAL-006`/`007`/`010` → **PASS**.
- Run 2 (+ CopyButton/OverviewToggle keyboard tests): 165 passed, 0 failed. **PASS**.
- Run 3 (final, + QA-003 fix + ShowTheThinking keyboard test): **166 passed, 0 failed, 314 skipped
  (viewport-gated / `ALLOW_DEV_ROUTES` boards / unrelated-eval-id specs — expected).**

`[eval] totals: 3 pass · 0 fail · 14 skip · 0 manual (of 17)` on the final run —
`evals/results/eval-run-0.2.0-1ddee2a-4.json`.

`pnpm typecheck` and `pnpm lint` both clean throughout; `pnpm build` clean (confirms all 11 case
studies + 5 essays statically generate).

## 9. Gate status

**PASS.** All five acceptance criteria met: axe 0 critical/serious on every route at both
viewports; all 8 listed keyboard flows completable with visible focus (3 closed this ticket);
reduced-motion green on all 22 routes (broadened from 1); `docs/a11y-pass.md` created with real
accessibility-tree evidence + the VoiceOver-human turnkey flag; the one real defect found (QA-003)
fixed in scope rather than deferred. No thresholds weakened.

## 10. Files changed

- `tests/e2e/eval-006.spec.ts` — axe route derivation broadened to the full 22-route public set (`ce83792`)
- `tests/e2e/eval-010.spec.ts` — header-collapse check broadened to all 22 routes + new generic no-transform-animation sweep (`ce83792`)
- `components/case-study/Chapter.tsx` — chapter heading `h3` → `h2` (QA-003) (`8092086`)
- `components/case-study/artifacts/DecisionCard.tsx` — artifact title `h4` → `h3` (QA-003) (`8092086`)
- `tests/e2e/contact.spec.ts` — CopyButton keyboard e2e (`1934c24`)
- `tests/e2e/case-study.spec.ts` — OverviewToggle + ShowTheThinking keyboard e2e (`1934c24`)
- `docs/a11y-pass.md` — new, accessibility-tree evidence + VoiceOver turnkey flag
- `docs/reports/TKT-48.md` — this report

## Turnkey item for Tushar (human required)

Run a real VoiceOver pass (Cmd+F5, macOS) on `/`, `/work/teachspark` (both the 30-sec and
Deep-dive states), and `/about`: walk the rotor by heading and by landmark, and Tab through the
header nav → MobileMenu → AskPanel → ExperienceTimeline → OverviewToggle → ShowTheThinking →
CopyButton (`/contact`) flows above, confirming the announcements sound right. The automated
substitute (§6, `docs/a11y-pass.md`) confirms the underlying tree is structurally clean, but only a
human ear can confirm the actual VoiceOver experience.
