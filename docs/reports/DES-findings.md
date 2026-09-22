# Stage 8 · Design Critique — DES findings

**Branch:** `m-007-quality` · **Date:** 2026-09-22 · **Spec:** `Design.md` (incl. §5's 6 approved deviations) · **Skill:** `bw-design-critique` → `impeccable`
**Method:** an `impeccable` design-review subagent drove the running build (Chrome) route-by-route at 1440; the orchestrator then **independently verified every finding** against both the dev server (`:3000`) and a **production build** (`next start :3100`) using DOM measurement (`getBoundingClientRect`, `scrollWidth`, computed grid tracks) and the deterministic Ask provider, before fixing or parking. Verifying each finding rather than trusting the review changed the disposition of several (three "bugs" were dev-only/false-positive/working-as-designed).

**Reviewer environment caveat (carried):** the Chrome extension's `resize_window` reported success but the content viewport stayed pinned at 1440×748 (the display can't render a taller/narrower content area), so the reviewer's live inspection was 1440-only and mobile was source-read. The orchestrator closed this gap via the **automated EVAL-008 sweep** (real headless Chromium at 390/768/1024/1440) — see the gate below.

## Outcome summary

| Disposition | Findings |
|---|---|
| **Fixed** (committed on `m-007-quality`) | DES-001 (P0), DES-002 (P1), DES-004 (P1), DES-005 (P1) |
| **Parked** (real, but routed to a pending human/stage gate) | DES-003 (hero fold → manual EVAL-001), DES-009 (P3 → Stage-9 truth pass), DES-011 (P3, spec-satisfied) |
| **Dismissed** (verified false-positive / working-as-designed) | DES-006, DES-007, DES-008, DES-010 |

Post-fix gate: **typecheck 0 · lint 0 · build all-static(13) · vitest 298 pass/2 skip · e2e `about`+`eval-006`+`eval-008` 349 pass/0 fail** (all 4 viewport projects). No threshold weakened; no content truth value changed.

## Findings

| ID | Screen / component | Finding (verified) | Cat. | Sev. | Disposition & evidence |
|---|---|---|---|---|---|
| DES-001 | Case-study chapters · `ExperimentCard` | The horizontal Setup/Result/Learning `ol` (`md:flex-row`) was 362–399px inside a **184px** card — the 3rd step's text overflowed the card's right edge by **+193 to +239px**, spilling illegibly into the neighbouring card. Reproduced identically on dev **and prod**, 3 cards. | layout | **P0** | **FIXED** `557b85e`. Connector is now vertical at every width (card is always ≤288px in this grid); `min-w-0` belt-and-braces. Re-measured: `flex-direction:column`, `olScrollW 240 = clientW 288`, overflow **false**. |
| DES-002 | `ArtifactGrid` (chapters, Impact, dev board) | Fixed `md:grid-cols-2 lg:grid-cols-3` in the ≤60ch column forced 184px cards, and a single-artifact chapter left **2 empty tracks**. | layout | **P1** | **FIXED** `557b85e`. `auto-fit minmax(min(100%,15rem),1fr)`: lone artifact now fills the column (`childW 601 = containerW 601`), multi-artifact 2-up at 288px. `min(100%,…)` prevents narrow-mobile overflow. **Note:** effective max is 2-up in the prose column (not the literal "3-up" in Design.md §3) — a deliberate legibility deviation (3-up = illegible 184px). |
| DES-004 | `/about` · `Impact` | Confirmed **19** near-identical MetricCards; 11 self-reported résumé figures (AmEx ×7, Godrej ×4) with repeated context drowned the measured/structural product numbers — signal-over-noise (DESIGN_DIRECTION §1 rule 1). | hierarchy | **P1** | **FIXED** `8175391`. Two tiers: 8 measured/structural product cards (prominent) + 11 self-reported résumé figures in a quieter flat `inline` block under an h3 "From my résumé". No numbers changed; MetricCard/EVAL-013 guard + badges preserved; heading order clean. |
| DES-005 | Home + panel · `AskPortfolio` | "tell me about railcite / teachspark / velora" (and the bare names) returned the **empty** state — a visitor asking about a flagship product by name got "I don't have that." Confirmed via the deterministic provider (all → `empty`). | state | **P1** | **FIXED** `7ec03a1`. Data-only aliases route those phrasings to the entry that already describes them (railcite/teachspark→`ai-products`, velora→`built`). Re-probed: all → `answer` with the correct matched id; off-topic still `empty`. No scoring change; EVAL-012 + no-fabrication intact. |
| DES-003 | `/` Hero | At the reviewer's 1440×**748** content viewport, the CTA row (bottom **819px**) sat below the fold — Design.md §1's 5-second-test requirement. Viewport-height-dependent (would clear a ≥820px viewport). | fidelity | P1→**P2** | **PARKED.** Hero fold was tuned under **EXE-9** with Tushar's manual EVAL-001 sign-off ("6/6 all widths"); the 748px height here is a local-display artifact, not Tushar's target device. Re-tuning would re-open a human-gated decision without authoritative evidence → routed to the **pending manual EVAL-001 spot-check** with the measurement (CTA bottom 819px @1440w) + a recommended conservative `lg:pt-32→pt-24` trim if the target device confirms it's below the fold. |
| DES-006 | Ask `AnswerView` | The "Draft" tag beside the answer heading. | copy | P2 | **DISMISSED — working as designed.** `AnswerView` intentionally flags answers drawn from knowledge entries still `draft:true` (the DRAFT-until-signed-off honesty rule). Removing it would violate a binding guardrail; it disappears once Tushar signs off the DRAFT Ask copy (already a pending-Tushar item). |
| DES-007 | `/about` `ExperienceTimeline` deep link | Fresh load of `/about#experience-amex` reset the hash to `#experience` and opened no card (dev). | state | P2 | **DISMISSED — dev-only.** Root cause: React StrictMode (`reactStrictMode:true`) double-invokes the `didMount`-guarded hash-sync effect in `next dev`, clobbering the incoming role hash before the store reads it. **Verified in a production build** (`:3100`): hash stays `#experience-amex`, AmEx `aria-expanded=true`, StoryCard open + scrolled. No prod defect; the timeline is written to support deep links. |
| DES-008 | `/work` `EditorialGrid` | Reviewer thought it read as uniform masonry, not asymmetric. | fidelity | P2 | **DISMISSED — false positive.** Measured: card[0] = **779px (8 cols) × 782px (2 rows)**, mediums 365px (4 cols) stacked in the right rail, rest 3-up small — exactly the Legora/Koto pattern in Design.md §3. Correctly implemented. |
| DES-009 | `/about` Impact vs `/work/railcite` | "0 invented citations" context wording differs in depth (terse on About, full on RailCite). Not contradictory. | copy/consistency | P3 | **PARKED** → Stage-9 truth-consistency pass (as the M-006 carry-forward routed it). Content-sensitive; both truthful. |
| DES-010 | Date ranges | Lowercase "present" in "Jun 2026 – present". | copy | P3 | **DISMISSED — intentional** (matches the site's own casing convention; a product-judgment flag already logged for Tushar). |
| DES-011 | `/contact` `CopyButton` | Email address isn't shown as plain visible text (only via Copy + `mailto:`). | copy | P3 | **PARKED — spec-satisfied.** Design.md only requires visible selectable email as the clipboard-*error* fallback, which `CopyButton` already provides. Making it always-visible is optional polish; left out to keep scope on the real defects. |

## Web-deliverables done-gates (verified on the real thing)

- **Mobile responsiveness — PASS.** EVAL-008 e2e (real headless Chromium at **390 / 768** / 1024 / 1440, all 22 routes) = 0 horizontal overflow, 0 sub-44px targets, 0 sub-14px content text, re-run green on the build carrying the DES-001/002 grid change (349 pass). Desktop unchanged. (Interactive extension-resize was unavailable — this automated sweep is the authoritative "real 390px browser" check.)
- **Four screen states — PASS.** Ask idle/loading/answer/empty/error (DES-005 improved answer-state coverage; the "Draft" tag is intentional, not a state bug); DemoVideo no-video/loading/playing/error; FilterTabs+grid incl. empty; Timeline working/collapsed. All present.
- **Link preview — PASS (live-inspector deferred).** OG/Twitter tags + 1200×630 PNGs verified in the built HTML (M007-qa §4). LinkedIn Post Inspector / opengraph.xyz render remains deferred to the preview URL (TKT-51, blocked on Tushar's Vercel).

## Exit criteria

Re-run clean: every DES- finding resolved or parked with a written reason; web-deliverables done-gates verified. **Stage 8 complete.** Do NOT merge to `main` or deploy before the Stage-10 `QA-report.md` gate.

## Carry-forwards into later stages

- Stage 9: DES-009 (harmonise the two "0 invented citations" context sentences) in the truth-consistency pass; regenerate `docs/screenshots/about/*` (they predate the DES-004 Impact retier).
- Pending-Tushar: manual EVAL-001 hero-fold spot-check (DES-003); sign-off of DRAFT Ask copy (clears DES-006's Draft badges) and the DRAFT `/about` copy.
