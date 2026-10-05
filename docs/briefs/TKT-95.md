# Brief — TKT-95 · Page scene openers pulled forward (EXE-18, Dev-24)

**Ticket:** TKT-95 (Backlog `TASK-90`) · M-009 · Feature · P1 · sp:3 · **Depends on:** TKT-93 (done — the reusable banner component + `TornEdge`).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, **never push**).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Tushar wants the mockups' per-page illustrations visible now. Every page opens with its scene as a **full-bleed banner + torn paper edge in the same style as the new home banner**; the page title sits below it; the rest of each page is left exactly as it is (its Phase B/C ticket rebuilds it later under this opener).

## Read first
1. `decisions.md` **EXE-18**, **EXE-15**; `Design.md` **§11 Dev-24, Dev-21**, **§6.1/§6.3** (manifest + exact alts), **§3.1–3.3** (decoration counting).
2. `docs/reports/TKT-93.md` and the banner component it created (e.g. `components/paper/SceneBanner.tsx`) — reuse it; don't fork it. Static scenes have no clip.
3. `content/media/illustrations/manifest.ts`, `lib/illustrations.ts`, `tests/unit/eval-021.test.ts`.
4. Each page's current top section: `app/work/page.tsx` (+ `WorkHero`), `app/work/[slug]/page.tsx` (+ `CaseStudyHeader`), `app/thinking/page.tsx` (+ `ThinkingHero`), `app/thinking/[slug]/page.tsx`, `app/about/page.tsx` (+ `AboutHero`, which currently renders a temporary `Illustration id="scene-about" placement="photo"` from TSK-38 — replace it with the opener), `app/playground/page.tsx` (+ `PlaygroundHero`), `app/contact/page.tsx`.

## Mapping
| Route | Scene id | Notes |
|---|---|---|
| `/work` | `scene-work` | |
| `/work/[slug]` (all 11) | `scene-casestudy` | same scene for every case study |
| `/thinking` and `/thinking/[slug]` | `scene-thinking` | |
| `/about` | `scene-about` | remove the TSK-38 temporary photo |
| `/playground` | `scene-playground` | |
| `/contact` | `scene-contact` | portrait source (1638×2048) — choose the focal point so the face + wave survive a wide crop; report the crop |

## Scope
- Mount the banner as the first element of each page's `<main>` content (below the header, above the existing page title), with the scene's manifest `alt` (content image — **not** `aria-hidden`), a per-scene focal point, and `priority` only where it is the route's LCP candidate. Banner height a little shorter than home (e.g. `clamp(220px, 32vw, 460px)`; taller crop < 768) — report what you chose. Torn edge fill must match the section below it.
- Don't restyle anything else on those pages. If an existing page hero already renders a big title block, keep it directly under the banner; remove only duplicated imagery (e.g. the About temporary photo).
- Manifest `usedOn` updated to the real routes for each scene; EVAL-021 green both ways.
- EVAL-018: the opener counts only its `torn` edge (1); if a page's opener unit exceeds 4 or the parked `/about` entry goes stale, update `tests/e2e/eval-018-parked.json` honestly (stale entries fail by design — remove one only if the hit is genuinely gone, and say so).

## Gates
`pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; **FULL** `pnpm test:e2e` on a freshly restarted prod server (baseline 0 failures — update only selectors/strings of specs whose asserted top-of-page markup legitimately changed, never delete a spec); `pnpm eval --only EVAL-006,EVAL-008,EVAL-013,EVAL-018,EVAL-021 --skip-build` all PASS; bundle on `/` unchanged ± 1 kB. Screenshots from a prod build: `docs/screenshots/m-009/openers/<route>-{390,1440}.png` for work, one case study (teachspark), thinking, one essay, about, playground, contact — **Read every one**; note crop quality per scene (face/character visible, no awkward cut).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`; restore churned `docs/screenshots/**` you didn't produce. No Higgsfield spend. Restart `pnpm start` after every build. Commit(s) + trailer, e.g. `feat(pages): scene openers on every page in the home-banner style (TKT-95)`.

## Output — `docs/reports/TKT-95.md` (commit it)
Per route: scene · focal point · banner height · LCP/priority choice · what you saw in the screenshot; EVAL statuses; e2e counts; spec changes; anything needing Tushar's eye (e.g. the contact portrait crop). Final chat reply ≤ 10 lines.
