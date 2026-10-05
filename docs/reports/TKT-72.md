# TKT-72 report: `BandFooter` on every route (S16) + `hero.tagline` rendered (S18, TC-135) + `FinalCTA` removed

**Ticket:** TKT-72 (`TASK-67`) · M-009 · Feature · P0 · sp:3 · depends on TKT-69, TKT-70 (done); header/hero files untouched
**Branch:** `m-009-redesign` (never `main`, not pushed) · **Implementer:** Opus 5.5 (standard tier)
**Commits:** `23ff780` feat(band) · this report (SHA in the chat reply)

## What changed
- `components/layout/BandFooter.tsx` (new, server). Uses the Design.md §4.2 markup: `<footer class="band" aria-labelledby="band-h">` → `<TornEdge fill="terracotta">` → terracotta + `--band-hatch` body. Inside the body: eyebrow, `h2#band-h` ("Let's *build* / something people can use."), the hiring line with `<DraftTag tone="onBand"/>`, and an Email row (`site.email` → `/contact`). The Social `<ul>` holds LinkedIn, GitHub (only while `site.github` is set **and** some project has `links.repoPublic`, per S5, computed from `data/projects.ts` by the exported `showGithub()`) and the résumé link from `resumeAction()`. The © bar holds the credit line, `<Hand kind="quote" as="span" cite={<span class="sr-only">Source: {hero.tagline.source}</span>}>` and `{site.showLocation && "Bengaluru, India"}`. The D8-fallback Playground link is **not** added (E-20).
- `lib/site.ts`: `showLocation: false as boolean` + doc comment ("flip to true once Tushar confirms — HANDOFF §6").
- `components/paper/DraftTag.tsx`: new `tone?: "paper" | "onBand"`. `onBand` gives ivory text plus an `--on-band` 55 % hairline (`.draft-tag-on-band`). This is the "band contrast trap" fix, because terracotta text on the terracotta band is 1:1.
- `app/globals.css`: new `/* TKT-72 · band */` block (tokens and derived values only, so the EVAL-020 13/13 check is green). `.dim` is kraft (Dev-13). The eyebrow, hiring line, labels and © bar all use `--on-band-muted` (ivory 80 %). The mockup's rgba .65/.70 alphas would fail 4.5:1, and a positive control proves it. Padding-bottom on `.band-bar` is `calc(30px + env(safe-area-inset-bottom, 0px))`. The band has a kraft focus ring and hover −2 px on the circles (off under reduced motion).
- `app/layout.tsx`: `<Footer/>` → `<BandFooter/>`. `app/page.tsx`: `FinalCTA` section removed. `git rm`'d `components/home/FinalCTA.tsx` and `components/layout/Footer.tsx`. A stale comment in `components/contact/ContactCard.tsx` was reworded.
- Tests: new `tests/unit/band-footer.test.tsx` (10) and `tests/unit/contrast-pairs.test.ts` (8); `tests/unit/site.test.ts` (+1). In `tests/e2e/layout.spec.ts` the two S05.04 Footer tests are replaced by 2 band tests. In `tests/e2e/home.spec.ts` the FinalCTA/CopyButton/lavender tests are replaced by band assertions (CopyButton copy/fallback stays covered on `/contact` in `contact.spec.ts`). In `tests/e2e/tracer.spec.ts` the E-13 résumé test is re-scoped to the band's résumé circle; it had depended on FinalCTA being the only `/contact#resume` link in `<main>` since the TKT-73 hero dropped its résumé CTA. No spec file was deleted.

## AC 1: every route has exactly one `<footer>` = the band; `FinalCTA` gone. **PASS**
`layout.spec.ts` "band footer: one `<footer>` per route…" sweeps `app/sitemap` `STATIC_ROUTES` (a superset of `routes.json` static), all 11 personal `/work/<slug>`, all 5 `/thinking/<slug>` and `/definitely-missing` (404). On every route: `footer` count 1, `aria-labelledby="band-h"`, `h2#band-h` matches `/^Let.s /`. `home.spec.ts`: `#main > section` = 4, `#cta` = 0, `footer.band` = 1. `grep -rn "FinalCTA\|layout/Footer" app components tests` → **0**.

## AC 2: contrast (h2 line 2 kraft ≥ 4:1; hiring line and labels ≥ 4.5:1). **PASS**
`tests/unit/contrast-pairs.test.ts` computes culori WCAG from the `AUTHORITATIVE` hexes (parsed from `scripts/tokens-check.ts`) and the `color-mix` % parsed from `globals.css`, composited over terracotta in sRGB:

| Pair (on terracotta `#92381F`) | Ratio | Threshold |
|---|---|---|
| ivory (h2 line 1, email, on-band DraftTag 12 px) | **7.00** | 4.5 |
| kraft (h2 line 2 `.dim`) | **4.16** | 4 |
| note (h2 `em`, tagline) | **5.50** | 4.5 |
| `--on-band-muted` = ivory 80 % (eyebrow, hiring, labels, © bar) | **5.09** | 4.5 |

Worst case on a 1.5 px `--band-hatch` stripe (ivory 5.5 % over terracotta = `#98432A`): muted 4.59, note 4.87, ivory 6.20, kraft 3.68 (still ≥ 3, AA for large text; asserted as such). Positive control: ivory at 65 % gives < 4.5. axe 0 critical/serious on `/` at all 4 widths, including a second axe pass scoped to `footer.band` after scrolling it into view (`home.spec.ts` @EVAL-006). EVAL-008 micro-label contrast on the on-band DraftTag: PASS.

## AC 3: 56 px circles with `aria-label`s, hover −2 px, kraft focus ring; GitHub conditional; résumé placeholder. **PASS**
e2e "band footer geometry" (390 + 1440): 3 circles, each ≥ 56×56 with a non-empty `aria-label`, and the email link ≥ 44 px tall. Unit: GitHub is present with `site.github` + a public repo, absent with `repoPublic:false` mocked on every project, and absent with `site.github: ""` (module mocks). The résumé circle is labelled "Resume — updating", `href="/contact#resume"`, no `download`. The kraft ring comes from `.band .focus-ring:focus-visible` (CSS; there is no e2e keyboard sweep that reaches the footer).

## AC 4: EVAL-011 crawler, every band link resolves. **PASS**
EVAL-011 PASS in the eval run. `home.spec.ts` "@EVAL-011 band footer…": email → `/contact` (200), LinkedIn/GitHub hrefs = `site.*` with `target=_blank rel~=noopener`, résumé `href` = `resumeAction().href` (`/contact` 200).

## AC 5 (TC-135, S18 regression, kept permanently): tagline once site-wide, `data-hand="quote"` + sr-only `Source:`. **PASS**
Unit: `getAllByText(hero.tagline.text)` = 1, it sits inside `.band-bar`, `data-hand="quote"`, and the next sibling is `.sr-only` with text `Source: ${hero.tagline.source}`. The negative control (tagline blanked through a mocked `data/hero`) gives a count of 0. e2e: on every route in the AC 1 sweep, `getByText(hero.tagline.text, { exact: true })` = 1 with `data-hand="quote"`. EVAL-018's quote rule reports no band hits on any route.

## AC 6: "Bengaluru, India" hidden by default, flag test. **PASS**
`site.test.ts`: `site.showLocation === false`. `band-footer.test.tsx`: absent by default, and present in `.band-bar` with `showLocation: true` mocked. e2e asserts it is absent on every route.

## AC 7: band unit count = 1 (`torn`) under EVAL-018. **PASS**
Unit: `footer [data-decor]` = 1, `torn`. e2e sweep: 1 on every route. The EVAL-018 per-unit table shows `footer 1 torn` on all 23 routes × 2 widths. EVAL-018 fails **only** on `/about` (see below).

## AC 8: forbidden-strings / PII. **PASS**
`tests/unit/forbidden-strings.test.ts` is unchanged and green (6/6). `band-footer.test.tsx` runs the band's rendered text (location flag on, the worst case) through `PII_PATTERNS` (DOB/PHONE/STREET_ADDRESS) → 0 hits, and a positive control catches a planted `+91` phone. EVAL-013 and EVAL-016 PASS. The only contact shown is email + LinkedIn (EXE-8).

## Gates
- `pnpm typecheck` ✓ · `pnpm lint` ✓ · `pnpm tokens:check` 13/13 ✓ · `pnpm test` 49 files / 461 passed, 2 skipped ✓ · `pnpm build` ✓ (all routes static).
- **Full `pnpm test:e2e`** (4 projects, freshly restarted prod server): **779 passed · 2 failed · 883 skipped**. The two failures are exactly the baseline: `eval-018 /about` @ w390 + w1440 (Caveat `<p>` "Same curiosity → bigger problems." in `about-hero`, parked at TKT-74). There are no new failures. (The first run also failed `tracer.spec` E-13, which was caused by this ticket and fixed as described above.)
- `pnpm eval --only EVAL-006,EVAL-008,EVAL-011,EVAL-013,EVAL-016,EVAL-018 --skip-build`: EVAL-006 **PASS** · EVAL-008 **PASS** (improvement FAIL → PASS vs the previous record) · EVAL-011 **PASS** · EVAL-013 **PASS** · EVAL-016 **PASS** · EVAL-018 **FAIL**, only on `/about` (the same 2 baseline hits; 168 units, max 3/4 per unit, band = 1). Record: `evals/results/eval-run-0.2.0-d9cb600.json` (gitignored run file, not committed).
- Screenshots (prod build): `docs/screenshots/m-009/band-390.png`, `docs/screenshots/m-009/band-1440.png`. e2e-churned PNGs elsewhere under `docs/screenshots/**` were restored.

## Deviations and items for the orchestrator
1. **Type size:** the eyebrow, labels and © bar use `--text-caption` (14 px), not the mockup's 12–13 px. At 12–13 px they would break the EVAL-008 14 px content floor, and EXE-7 reserves `data-micro-label` for brand micro-labels. This is the same call the TKT-73 hero eyebrow made. Stage 8 may prefer the micro-label exemption for the © bar; that is a one-attribute change.
2. **Tagline source repeats the tagline:** `hero.tagline.source` is `PORT "Tagline: Observing what others overlook."`, so the sr-only `Source:` span repeats the quote for screen readers ("Observing… Source: PORT Tagline: Observing…"). Exact-match counts are still 1 (unit and e2e), and data values were not changed (S18). Consider a cleaner source label in `data/hero.ts`, or rendering the sr-only cite as "Source: portfolio tagline".
3. **Kraft on hatch stripe** measures 3.68:1. That is above AA large-text (3:1) but below the §2.1 "≥ 4" target, and only on the 1.5 px texture lines; it is 4.16 on the solid ground.
4. **Footer credit** is now "Built with curiosity, chai & Claude Code." per S16, which supersedes TP10. The old `layout.spec` assertion "no 'Built with Claude Code'" was removed along with the S05.04 footer tests.
