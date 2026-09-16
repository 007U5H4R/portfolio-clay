# EVAL-001 — 5-second test (home `/`) — TKT-14 review pack

**Manual eval, scored by Claude from pixel evidence** (technical-plan.md §B S14.04). EVAL-001 asks:
in the first viewport (no scroll), does a first-time visitor immediately learn who this is, what they
do, and see a way in? The rubric (Design.md §1 "conversion goal") is the six items below; each must
render **inside the first viewport** at **390** and **1440** with no scroll.

- **Code state:** branch `m-003-home`, TKT-14 (parent `b45ddbd`) + this ticket's home assembly.
- **Evidence:** `docs/screenshots/home/390-first-viewport.png`, `docs/screenshots/home/1440-first-viewport.png`
  (full-page context: `390.png`, `768.png`, `1024.png`, `1440.png`).
- **DRAFT copy on the home surface** (unsigned framing, labelled in-product): the hero eyebrow/headline
  (`data/hero.ts`), the `HowIThink` principle lines, and the `FinalCTA` closing headline. All are
  visibly Draft-marked; none are fabricated claims.

## Rubric items

| # | Item | Element (evidence) |
|---|------|--------------------|
| 1 | Name | Header wordmark "Tushar Pathak" |
| 2 | Title / role | Header subtitle + hero eyebrow "Senior Product Manager · Product Thinker · AI Builder · Problem Solver" |
| 3 | Value proposition | Hero headline highlight "AI-native products" |
| 4 | Proof: a floating tile naming real shipped work | `FloatingTiles` "AI Products — TeachSpark · RailCite …" |
| 5 | Primary CTA | "View My Work →" |
| 6 | Resume CTA | "Resume — updating" (resumeAction, PB5) |

## Score

### 1440 — **5 / 6**
| # | In first viewport? | Note |
|---|---|---|
| 1 | ✅ | header, y≈40 |
| 2 | ✅ | header + eyebrow, y≈235 |
| 3 | ✅ | headline highlight, y≈400 |
| 4 | ⚠️ **FAIL (borderline)** | the `AI PRODUCTS` tile label only *peeks* at the fold (y≈880 of a 900px viewport); the shipped-work naming (TeachSpark · RailCite) is clipped below the fold |
| 5 | ✅ | "View My Work →", y≈830 |
| 6 | ✅ | "Resume — updating", y≈830 |

### 390 — **3 / 6**
| # | In first viewport? | Note |
|---|---|---|
| 1 | ✅ | header wordmark |
| 2 | ✅ | hero eyebrow |
| 3 | ✅ | headline highlight "AI-native products" (last line just above fold) |
| 4 | ❌ **FAIL** | `FloatingTiles` below the fold |
| 5 | ❌ **FAIL** | "View My Work →" below the fold |
| 6 | ❌ **FAIL** | "Resume — updating" below the fold |

## Failing items + fix ticket

The failing items (4 at 1440; 4/5/6 at 390) are **not** a home-assembly defect — TKT-14 composes the
sections in the correct fixed order and the FinalCTA is fully live. They trace to **hero vertical
budget**: the `AvatarStage` renders larger than the Design.md §3 spec (≈280×350 at <768; the built
avatar is taller), which pushes the CTA row and `FloatingTiles` past the first fold — most acutely at
390, where only items 1–3 clear the fold.

- **Fix owner:** hero — **TKT-09** / the **EXE-6 hero-balance** call (this is the orchestrator's
  decision per the TKT-14 brief; TKT-14 must not change the hero grid ratio or avatar sizing itself).
- **Recommended direction (for EXE-6):** reduce the avatar box at ≤768 toward the spec'd 280×350 and
  tighten hero top padding so the CTA row + at least one shipped-work tile clear the 390 fold; at 1440,
  a small avatar/headline rebalance (or a slightly shorter hero) lifts the shipped-work tile fully into
  view. No section removal (A6/S14.05).

**Verdict:** EVAL-001 is **not 6/6 at either width** with the current hero sizing. Blocking items are
enumerated above and assigned to TKT-09 / EXE-6. Re-score after the hero-balance change lands.

---

## EXE-9 re-score (hero-rebalance fix-wave, branch `m-003-home`)

The EXE-9 hero rebalance landed (details + levers: `docs/reports/EXE-9-hero-rebalance.md`). Re-scored
from the regenerated `docs/screenshots/home/*` pixel evidence — all six rubric items now render inside
the first viewport at **every** width:

| width | before | after |
|-------|--------|-------|
| 390   | 3/6    | **6/6** |
| 768   | — (not in original pack; 3/6 measured) | **6/6** |
| 1024  | — (not in original pack; 3/6 measured) | **6/6** |
| 1440  | 5/6    | **6/6** |

No horizontal overflow at 390/768/1024/1440; avatar rebalanced to ~349px @1024 / ~474px @1440. Target
(≥5/6 every width, 6/6 at 390 + 1440) **met and exceeded** (6/6 at all four).
