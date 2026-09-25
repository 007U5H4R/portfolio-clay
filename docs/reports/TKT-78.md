# TKT-78 (TASK-73) · OG images re-skinned in the paper style — implementer report

Branch `m009/tkt-78` · model Opus 5.5 (standard) · plan: technical-plan §F3 S78.01–03, Design.md §9, D11, TC-150.

## AC checklist
| # | AC | Evidence |
|---|---|---|
| 1 | 7 families build, 1200×630 PNG ≤ 300 kB (test asserts) | `pnpm build` lists all 7 `opengraph-image` routes (+3 case-study slugs). New `tests/unit/seo.test.ts` "OG cards (TC-150)" renders each family's route through `lib/og.tsx` and asserts png/1200/630/≤300 kB. Built sizes: home 150 085 · work 56 129 · case-teachspark 159 718 · about 62 029 · thinking 48 657 · playground 55 801 · contact 45 647 B |
| 2 | Tag test green | `tests/e2e/eval-017.spec.ts` now covers all 7 routes (added `/thinking`, `/playground`): 10 passed (w1440), 10 skipped (w390 by design) |
| 3 | Snapshot per family in `docs/og/m-009/` | 7 PNGs fetched from the local `pnpm start` build; eyeballed home, case study, about and playground |
| 4 | No Manrope file/reference | TTFs deleted; `grep -rni manrope lib app assets tests` → 0; unit guard (name assembled at runtime so the grep stays at 0) |
| 5 | `pnpm eval --only EVAL-017` automated part green | `evals/results/tkt78-gate.json`: EVAL-017 PASS, EVAL-020 PASS (2 pass / 0 fail) |
| 6 | Avatar poster no longer read by any OG route | `grep -n "avatar\|components/clay" lib/og.tsx` → 0; unit test asserts it and pins `OG_POSTER_PATH` to the hero poster |

## Design choices
- **Image: `hero-poster.webp`, not `hero-banner.webp`.** The poster is a tighter crop of the same scene. At 520 px, and again at a 300 px feed thumbnail, the figure, the desk and the dog still read. The 3168×1344 banner shrinks him to a speck and adds the corkboard and plants as competing focal points. This matches Design §9.
- **Frame and −1.5° tilt are baked in with sharp, then the image is quantised to 64 colours with no dither.** When Satori did the rotation, every pixel was resampled and the home/case cards came out at 325–337 kB, over the 300 kB budget. Baking the tilt in gets them to 150–160 kB. The flat offset shadow is a rotated Satori div, which costs almost nothing.
- **Fonts.** Upstream ships no static Fraunces 144pt Medium (the 1.000 release only has Regular and SemiBold). `Fraunces_144pt-Medium.ttf` is a fontTools `varLib.instancer` static instance (opsz 144, wght 500, SOFT 0, WONK 0) of the google/fonts variable font, with a fixed name table. Inter Regular and SemiBold come from rsms/inter v4.1 `extras/ttf`; Caveat Regular from googlefonts/caveat. `OFL.txt` names all three families and says where each file came from. No licence declares a Reserved Font Name.
- **Deviation:** the badge uses Inter 600, not 500, because only Regular and SemiBold TTFs are specified. Title letter-spacing is 0: at −0.02em the 144pt cut collided.
- `HEX` holds exactly the 13 paper hexes. Tints come from `withAlpha`. A new unit test pins the set, which keeps the EVAL-020 allow-list honest.

## Files changed
`lib/og.tsx`, `assets/fonts/{Fraunces_144pt-Medium,Inter-Regular,Inter-SemiBold,Caveat-Regular}.ttf` (+), `assets/fonts/Manrope-{Bold,ExtraBold}.ttf` (−), `assets/fonts/OFL.txt`, `app/{,work,work/[slug],about,thinking,playground,contact}/opengraph-image.tsx` (the `caption` prop is added; `tone` and `avatar` are replaced by `poster`; the case-study `STATUS_TONE` and its clay `Tone` import are removed), `tests/unit/seo.test.ts`, `tests/e2e/eval-017.spec.ts`, `docs/og/m-009/*.png`, `evals/results/tkt78-gate.json`, this report.
Shared-file edits: none.

## Gate (one locked run)
typecheck ✓ · lint ✓ (0) · tokens 13/13 ✓ · unit 50 files / 480 passed, 2 skipped · build ✓ · e2e eval-017 10 passed · eval EVAL-017 PASS, EVAL-020 PASS.

## Merge notes
- None: every file touched is TKT-78-owned. `components/clay/tiers` no longer has an importer in the OG path, which unblocks its removal (TKT-89).
- The manual inspector pass (LinkedIn and opengraph.xyz) is still TKT-91 / TC-177.
