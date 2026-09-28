# Brief: TASK-116 · Rebuild Projects into Portfolio

**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-task-116/`. **Branch:** `m009/task-116`, cut from `m-009-redesign` @ `a9cb3c4`; verify both before you start. Never push. Never touch `main` or `m-009-redesign`. **Model:** Opus 5.5; the Co-Authored-By trailer names your actual model. **Campfire:** `TASK-116`; put the ID in every commit message.

## The spec
`docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-spec.md` holds Tushar's 55-section spec, verbatim. It is the reference of record; his two reference images were not available as files. Where it conflicts with Design.md, **the spec wins**. Record each conflict as a Design §11 row: take the next free `Dev-` number on the base at merge time (other agents are taking numbers in parallel, so renumber at the end), with disposition "Tushar, 2026-09-28 (TASK-116)". Follow spec §54 (inspect, then plan) and §55 (verify and summarize).

## Sources for the content
- **Independent products:** `data/projects.ts` (personal builds) and the existing media in `content/media/<product>/`. The spec's example list includes "Vendor Passport". Check whether it exists in the data or in the PDFs below. If there is no source-backed entry, leave it out and say so in the report. Never invent a product.
- **Enterprise work:** Tushar named two documents. Read them with the Read tool; they are PDFs:
  - `/Users/tushar/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Portfolio - Tushar Pathak - Project Manager V2.0.pdf` (2 pages)
  - `/Users/tushar/Desktop/Resume/Tushar-Resume.pdf` (4 pages)

  Build a typed `data/enterprise.ts`, validated the same way `data/schema.ts` validates the other data. It holds the six grouped cards from spec §27–33. Every field must trace to one of those documents: record a `source` per card, meaning the document title and page, **never the local file path** (EVAL-013/016: `.ref`-style local paths never reach HTML). Use only what the documents support.
  - **Never** render budgets or commercial figures. Keep them out of the data file entirely.
  - **Never** copy anything confidential or personal into the repo: no phone numbers, addresses, or personal email beyond `site.email`.
  - **Never** commit the PDFs or any text extracted from them.
  - Where a spec theme is not supported by the documents, drop it and list it in the report.
- **Existing enterprise data:** `data/experience.ts` and `data/credentials.ts` may already carry some of this. Reuse it and don't duplicate facts. If a fact appears in two places, make one of them the source and derive the other.

## Decisions already made
- **Route:** keep `/projects` (stable, spec §1). Rename the nav label to "Portfolio" in `lib/nav.ts`, and update the heading, metadata, OG title and aria labels. The `/work/<slug>` case-study pages stay, and so do their `NextProject` links.
- **The `/projects` scene opener (`scene-work`) stays** at the top. Every page opens with its scene (EXE-18/Dev-24/TASK-114), and no page may repeat another page's scene. The spec's "carousel is the hero" means no big text hero *after* the opener.
- **Videos:** no pitch or demo videos exist yet; TKT-22…26, the demo-media tickets, are on hold until Tushar records them. Build the full media system anyway: the `ProductVideo` abstraction for local MP4, YouTube and Vimeo, the explicit `mediaMode` state, and one player mounted at a time.
  - With no media, the stage shows the product's **poster**, i.e. its existing scene or illustration crop, or the 90s cover art at stage size.
  - With no media, the Pitch and Demo actions are **hidden** (spec §22: no dead buttons).
  - When a product later gets `pitchVideo`/`demoVideo` data, everything must light up without code changes. Prove this with a unit or e2e fixture test that uses a small local MP4 fixture (reuse the existing eval-014 fixture approach).
- **90s cover thumbnails:** render them **deterministically in HTML/CSS/SVG**: product name, code (e.g. TS-01), tagline, a symbolic hero glyph built from inline SVG or lucide icons, halftone/print texture via CSS, and faux packaging chrome. No generated raster art, and no text inside images. Use the existing product logos in `content/media/<product>/` where they exist. Do not copy any real game's artwork or branding.
- **Analytics:** Mixpanel is only used if it is already configured in the repo (`git grep -i mixpanel`). If it isn't, add no analytics and say so.
- **Deep link:** `/projects?product=<id>` (or a hash). Keep it simple and use `router.replace`, not push-spam.
- **Old structures to delete:** the old `/projects` index, `WorkIndex`, filter tabs and cards. Remove them only where nothing else uses them; `git grep` first. `/work` (Experience) and the home Featured section must keep working.
- **Parallax:** the page takes part in the TKT-96/106 slide-overs. `tests/e2e/parallax-stacking.spec.ts` must stay green (TASK-110/115). No text may overlap during scroll at 390 or 1440; attach mid-scroll screenshots as evidence.

## Rules
- Use paper tokens and `color-mix()` only (EVAL-020). The spec's accent colours must map to existing tokens or `color-mix` of them; in particular, "muted lavender" becomes a `color-mix` of existing tokens.
- Type floors (EVAL-008): 14 px for content; 12 px is allowed only with `data-micro-label` plus 4.5:1 contrast. Targets must be ≥ 44 px.
- EVAL-018: update Design §3.3 for `/projects`, and keep `tests/e2e/eval-018-parked.json` as `[]`.
- Axe must stay clean (EVAL-006). The keyboard path must work (EVAL-007): a real carousel with arrow buttons, the roving `aria-selected` pattern and a visible focus ring. Respect reduced motion (EVAL-010). No dead controls (EVAL-011).
- First-load JS on `/projects` must stay ≤ 180 kB (`pnpm exec tsx scripts/bundle-budget.ts --route /projects --json`). Avoid adding a carousel library unless it is tiny; prefer native scroll-snap plus buttons. Lazy-load the video players.
- Update or replace the `/projects` tests (`git grep -ln "/projects" tests`) to match the new page. Don't weaken anything unrelated. Add the spec §55 checks as tests wherever they are automatable.
- Other agents are working in parallel on the `/about` hero (TASK-117) and the band footer (TASK-118). Don't touch either. Put your `app/globals.css` changes in one block, `/* TASK-116 … */ … /* end TASK-116 */`.
- Run every heavy command through `"/Volumes/E Drive/Dev/.scratch/m009/heavy.sh" <cmd>`. Logs go to `/Volumes/E Drive/Dev/.scratch/m009/task-116/`. Everything stays on `/Volumes/E Drive`, except that you *read* the two PDFs where they are.
- Stage explicit paths only. Restore any `docs/screenshots/**` churn you didn't intend (`git restore` those paths).

## Gate
1. Before the final gate, merge the latest `m-009-redesign` into your branch.
2. Run `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`.
3. Run the **full** `pnpm test:e2e` through the lock. The nav label and the home Featured links touch many pages.
4. Run `pnpm eval --only EVAL-006,EVAL-008,EVAL-011,EVAL-013,EVAL-018,EVAL-021 --skip-build`.
5. Check the bundle budget for `/projects`.
6. Save screenshots of `/projects` at 390, 768, 1024 and 1440, plus one showing a selected non-default product, to `docs/screenshots/m-009/task-116/`.

## Output
Commit the work and `docs/reports/TASK-116.md` (spec §55 summary list, gate numbers, Design rows, and the list of spec themes the sources did not support). Final reply: at most 10 lines, covering SHAs, gate results and open questions for Tushar.
