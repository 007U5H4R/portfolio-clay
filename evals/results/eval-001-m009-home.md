# EVAL-001 — 5-second test (home `/`) — M-009 Phase A (TKT-79)

**Manual eval, scored by Claude from pixel evidence** (TKT-79 S79.02, TC-151 step 4). Informational
until Stage 8; Tushar confirms. Question: in the first viewport (no scroll), does a recruiter read
*name · Senior PM · builds AI products · cares about user problems · actually builds · projects to
explore*? Structural precondition automated in `tests/e2e/home.spec.ts` ("@EVAL-001 the six
5-second-test elements sit in the first viewport").

- **Code state:** branch `m009/tkt-79` from integration head `86054cc` (no product-code change in TKT-79).
- **Evidence:** `docs/screenshots/m-009/home/390-first-viewport.png` (390×844),
  `docs/screenshots/m-009/home/1440-first-viewport.png` (1440×900); full pages `home/{390,768,1024,1440}.png`.

## Rubric → element

| # | Item | Element |
|---|------|---------|
| 1 | Name | header wordmark "Tushar Pathak" |
| 2 | Senior PM | eyebrow "Senior Product Manager · Product Thinker · AI Builder · Problem Solver" |
| 3 | Builds AI products | h1 "I turn ambiguity into AI-native products people can use." |
| 4 | Cares about user problems | h1 "…people can use." + hand line "Same curiosity. Bigger problems." |
| 5 | Actually builds | the illustrated desk banner (laptop, notebook, pinned Problem → … → Impact) |
| 6 | Projects to explore | "View my work →" (+ "Ask my portfolio") |

## Score

### 390 — **6 / 6 · PASS**
| # | In first viewport? | Note |
|---|---|---|
| 1 | ✅ | header, y≈36 |
| 2 | ✅ | eyebrow, y≈420–480 |
| 3 | ✅ | h1 fully visible, y≈505–625 |
| 4 | ✅ | h1 + hand line y≈655 |
| 5 | ✅ | banner y≈72–350 |
| 6 | ✅ | "View my work →" y≈698–744, "Ask my portfolio" y≈757–799 |

### 1440 — **3 / 6 · FAIL (critical threshold is 6/6)**
| # | In first viewport? | Note |
|---|---|---|
| 1 | ✅ | header wordmark |
| 2 | ✅ | eyebrow y≈780–810 |
| 3 | ❌ | h1 starts at y≈836 and ends at y≈983 — only the top half of the first line is on screen at 900 px ("AI-native" is clipped) |
| 4 | ❌ | h1 remainder + hand line below the fold |
| 5 | ✅ | banner fills y≈72–660 (reads as "builds": laptop, notes, product flow) |
| 6 | ❌ | both CTAs below the fold |

## Cause and owner

Not a home-assembly defect. Since EXE-15 / Dev-21 the hero is a full-bleed 21:9 banner under the
header at every width; at 1440 the banner is ~590 px tall, so the copy block (eyebrow → h1 → CTAs)
starts at y≈780 of a 900 px viewport. Design.md line 32 claims the eyebrow, h1, both CTAs and the desk
are in the first viewport at 1440 — the post-EXE-15 layout no longer meets that. Hero files are owned
by TKT-92r2 in this fan-out, so TKT-79 does not change them.

**Options for the orchestrator / Tushar (Stage-8 input, EXE-n needed):** (a) cap the banner height on
wide viewports (e.g. `max-height: min(56vh, …)` with `object-fit: cover` on the existing focal point)
so the h1 + CTAs clear 900 px; (b) overlay the eyebrow/h1/CTAs on the banner's lower band at ≥ 1024;
(c) accept 1440×900 as a failing case and re-baseline EVAL-001 to "banner + eyebrow + name" — **not
recommended** (lowers a critical threshold). Recommend (a): smallest change, keeps the Dev-21 look.
