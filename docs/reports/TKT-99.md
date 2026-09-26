# TKT-99 — Home "How I think" restyled as a torn-paper collage (Campfire TASK-94)

**Direction:** Tushar, 2026-09-26: "change the UI to this image". Reference: `docs/redesign-mockups/m-009/tushar-2026-09-26/how-i-think-target.png`, with `how-i-think-current.png` as the before. Branch `m009/tkt-99`, based on `ddc545b`. No spend: no image generation and no raster crops. Everything is built in CSS and inline SVG from the 13 paper tokens.

## What changed
| Target item | Build |
|---|---|
| 1 Deckled / torn card edges | Each card is now a transparent `Sheet`. Three `aria-hidden` layers behind the content (shade, ivory rim, cream face) each take a seeded `clip-path: polygon()` from `components/home/deckle.ts`, so every card gets a different edge. The face has a subtle dot-grain texture. The alternating −0.8° / +0.6° tilt and the 28 px offset on odd cards are unchanged. |
| 2 Collage backdrop | `components/home/HowIThinkCollage.tsx` is **one** `<div data-decor="collage" aria-hidden="true">` with pointer-events none. It holds 12 torn scraps (sage, dark sage, rust with fibres, kraft, grid paper, ledger paper, a hole-punched notebook strip), 4 leaf sprigs, a perforated postage stamp with wavy cancellation lines, and a postmark. None of the pieces carry `data-decor` or text. Below 1024 px the `data-wide` pieces are hidden and the rest get fixed heights, so the backdrop has fewer scraps and nothing stretches. |
| 3 Taped, tinted quote slip | The blockquote itself is the slip. `::before` draws the torn tinted paper (outline passed as the `--slip-edge` variable set on the `li`) and `::after` draws the washi-tape strip. Tints rotate beige, blue-grey, beige, blue-grey, peach, sage. Rotation stays within ±1.8°. Text is still Caveat under `data-hand="quote"`, and the `cite` stays plain below the slip as its next sibling. |
| 4 Compact DraftTag | Two lines, "DRAFT —" / "PENDING SIGN-OFF", in a slim terracotta-outlined box with 0.06em tracking. It is still `DraftTag`, so `data-paper="tag"` and `data-micro-label` are kept, and it stays 12 px / 600 terracotta, which passes the contrast pairs in `tests/unit/contrast-pairs.test.ts`. The textContent is unchanged: "Draft — pending sign-off". |
| 5 Numerals | Fraunces italic 20 px in terracotta. The element still carries `data-hand="label"`. |
| 6 CTA | A rounded ivory button (radius 16 px, min-height 44 px, 15 px / 600 text) with a lucide `ArrowRight` marked `aria-hidden`. It keeps the existing `focus-ring`, and the link text is unchanged. |
| 7 Pins + dashed path | Kept. Pins grew to 22 px and the path now uses navy-2 at 2.2 px with 7/7 dashes. |

## Rules
- **EVAL-018 / Design.md §11 Dev-41.** The collage counts as ONE decoration through a new `data-decor="collage"` kind (§3.1 row, §3.2 rule 2). The section count goes from 2 to **3 at 1440** and from 1 to **2 at 390**, still within the ≤ 4 budget. `eval-018-parked.json` is still `[]`. The §3.3 row and the §7.1 note are updated. Two per-card details are recorded in Dev-41:
  - The deckled layers are the card's own material, not decorations.
  - The slip's tape is CSS on the blockquote, not a `Tape` fastener. The slip is deliberately not a `data-paper` host, so the cite can sit below it as it does in the target.
- **EVAL-020:** tokens and `color-mix` only. `pnpm tokens:check` round-trips 13/13, and there are no colour literals in the TSX.
- **Motion:** no new animation. Reveal behaviour is unchanged (A11Y-1).
- **Text floors:** body text is 14–15 px, and the micro-label is 12 px.

## Finding fixed during the build
In an earlier version, a CSS `filter: drop-shadow()` on the clip-pathed card layers made the 1920 px home load hang in headless Chromium (over 30 s). That failed `eval-019.spec.ts:164`, the hero clip-registration test, twice in a row. TKT-96 and TKT-97 passed that test on the same base.
- **Bisection:** at 1920, a normal load took 5.3 s. Load took 0.30 s with the filter off and 0.29 s with the clip-path off.
- **Fix:** I replaced the filter with a filter-free "shade" layer, which is the rim outline offset by 2 px / 5 px. There is a code comment in the TKT-99 CSS block.
- **Result:** after the fix, EVAL-019, how-i-think and home all pass.

## Gates (all run through `heavy.sh`)
| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass |
| `pnpm tokens:check` | pass (13/13) |
| `pnpm test` | 581 passed, 2 skipped |
| `pnpm build` | pass |
| full `pnpm test:e2e --workers=1` | **1060 passed**, 0 failed, 1292 skipped (26.8 min) |
| bundle `/` | **158.5 kB gz** (budget 180) |
| horizontal overflow | 0 at 390, 768, 1024 and 1440 |

Test updates:
- `tests/unit/how-i-think.test.tsx`: new counts, plus collage and torn-edge / DraftTag / arrow assertions.
- `tests/e2e/how-i-think.spec.ts`: counts 3 / 2, and the collage is checked for `aria-hidden` and pointer-events none.
- `tests/e2e/home.spec.ts`: per-section counts.

## Screenshots
`docs/screenshots/m-009/tkt-99/`:
- `how-i-think-1440.png`, `-1024`, `-768`, `-390`
- `pair-1440.png` (target left, build right)

The site header is hidden in these shots so it doesn't cover the section.

## Remaining differences from the target (for Tushar's review)
- The reference is a painted raster. The build's scraps are flat CSS and SVG shapes with light grain, so they have less fibre and depth.
- The target's cards are proportionally wider, and its title type is larger relative to the card. The build keeps the six-column grid inside the site container, extended by 48 px on each side at ≥ 1280.
- The target has a dried-flower sprig and a stamp with an engraved figure. The build uses simple leaf sprigs and a line-art sprig stamp instead.
