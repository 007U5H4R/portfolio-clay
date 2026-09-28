# TASK-116 · Rebuild Projects into the Portfolio tab

Tushar's spec, 2026-09-28 (`docs/redesign-mockups/m-009/tushar-2026-09-28/portfolio-spec.md`): "completely rebuild the existing Project tab … into a new Portfolio tab … a structural and interaction redesign." The route stays `/projects`.

## Spec §54: inspection before coding
| # | Finding |
|---|---|
| 1–2 | `/projects` had five parts: `SceneOpener` (`scene-work`), `WorkHero` (h1 "Projects"), the `FilterTabs` + `WorkGrid`/`WorkIndex` numbered index of the 11 personal builds (with `EmptyState`), and the `ExperienceStrip` of the 3 professional records |
| 3 | Scenes: only `scene-work` belongs to this page. No product logos or screenshots exist in `content/media/<product>/` (SOURCES.md only) |
| 4 | Product data: `data/projects.ts` has 11 personal builds, each with name, tagline, `links.live`, `links.github` + `repoPublic`, an optional `links.demoVideo` (none set) and a lucide `icon` name. It has no PRD URLs and no "Vendor Passport" |
| 5 | Video: `components/projects/DemoVideo.tsx` (local MP4 only, used by the case-study header). No YouTube/Vimeo support, and the CSP had no `frame-src` |
| 6 | No carousel dependency |
| 7 | `motion` 13 is installed. It is not used here: the old `WorkIndex` AnimatePresence cost ~51 kB gz, and CSS covers the spec's motion |
| 8 | Paper primitives reused: `Sheet`, `Tape`, `TornEdge`, `Annotation`, `Sketch`, `Container`, `SceneOpener` |
| 9 | Nav: `lib/nav.ts` has the label "Projects" → `/projects`. Case studies are at `/work/<slug>`, and their crumb pointed at `/projects` |
| 10 | Mixpanel: **not configured** (`git grep -i mixpanel` finds only a comment saying the project has none), so **no analytics were added** (spec §43) |
| 11 | Enterprise data in code: only employer-level text in `data/experience.ts` and the three professional project records. None of the six engagements were present |

## 1. Files changed
- **New:** `components/portfolio/{PortfolioIntro,IndependentProductsShowcase,MainMediaStage,ProductInfoPanel,ProductCarousel,ProductCover,ProductVideo,EnterpriseClientWork}.tsx`, `lib/portfolio.ts`, `data/portfolio.ts`, `data/enterprise.ts`, `tests/unit/portfolio.test.tsx`, and this report.
- **Changed:**
  - `app/projects/page.tsx` + `opengraph-image.tsx`
  - `lib/nav.ts` ("Portfolio")
  - `components/case-study/CaseStudyHeader.tsx` (crumb "Portfolio")
  - `data/schema.ts` (`VideoSource`, `PortfolioEntry`, `EnterpriseCase`) and `data/index.ts` (both collections are validated, plus the cross-checks)
  - `lib/anchors.ts` (`?filter=` retired; `?product=<slug>` and `#products` / `#enterprise` are valid)
  - `data/knowledge.ts` (the Ask "enterprise" evidence link now points to `/projects#enterprise`)
  - `next.config.ts` (CSP `frame-src`)
  - `app/globals.css` (one `/* TASK-116 */` block)
  - `Design.md` (§3.3, §4.1, §7.2, §11 Dev-109…114)
  - `scripts/validate-content.ts` + `tests/unit/content-gate.test.ts` (the planted fixture stays scoped to its three project issues)
  - Tests: `projects.spec.ts` (rewritten), `eval-010` (the carousel's reduced-motion test replaces the filter/strip tests), `eval-015`, `tracer`, `anchors.test`, `routes.test`
- **Deleted:** `components/projects/{FilterTabs,WorkGrid,WorkIndex,WorkHero,EmptyState,ExperienceStrip}.tsx`, `lib/filters.ts`, `tests/unit/{filters,work-grid}.test.tsx`. Before deleting, `git grep` confirmed nothing else imports them. `ProjectCard`, `FeaturedWork` (home), `DemoVideo` and `StatusBadge` stay.

## 2. New page architecture
`SceneOpener(scene-work)` → `section#products` [`PortfolioIntro` · "choose your build ↓" · `IndependentProductsShowcase` [`tabpanel`: `MainMediaStage` + `ProductInfoPanel`] · `ProductCarousel`] → `section#enterprise` [`EnterpriseClientWork`: torn seam, intro, 6 case files] → band.
- The page is still fully static: `assert-static` passes, and `?product=` is read on the client after mount.
- The scene opener stays at the top, and there is no text hero after it (the brief's decision).

## 3. Product schema
`lib/portfolio.ts` `PortfolioProduct` = the spec §21 shape: `id, name, tagline, description, statusLabel, glyph, code, accent, position, pitchVideo?, demoVideo?, productUrl?, githubUrl?, prdUrl?, caseStudyHref`.

It is built by `buildPortfolioProducts(projects, portfolioEntries)`:
- **Facts come from `data/projects.ts`:** name, the `tagline` used as the description, the live URL, GitHub (only when `repoPublic`), and the local demo MP4.
- **Presentation extras come from `data/portfolio.ts`:** code, cover line, accent token, and pitch/demo/PRD when they exist.
- **The content gate enforces:**
  - one entry per personal build, in data order;
  - distinct codes;
  - a demo is never set in two places.
- **Cover lines:** TeachSpark, RailCite and Cubicle use Tushar's §15 examples. The others shorten each project's own tagline.
- There are no per-product JSX branches.

## 4. Carousel implementation
- A native `overflow-x:auto` + `scroll-snap` track. This gives touch swipe and trackpad scroll with no library.
- Each cover is a `role="tab"` button in a `tablist` labelled "Select a product". Tabs use a roving `tabIndex` and `aria-selected`.
- ←/→ move and select, and wrap (the carousel loops). Home/End jump.
- Prev/next buttons also wrap, so they are never dead. A "n / N" counter shows the position.
- The selected cover is scrolled into view inside the track only: the page never scrolls sideways.
- Visible covers: about 6 at ≥ 1024, 3.6 at 768, 2.8 at 640 and 1.8 at 390.
- Selection shows as a sketch outline, a tape strip and a 4 px lift. These are shape cues, not colour.
- Hover lifts the cover 3 px, strengthens its shadow and underlines the title.
- The deep link `/projects?product=<id>` is read on mount. Each selection calls `history.replaceState` (replace, not push, and no RSC refetch per click). An unknown id falls back to the first product.

## 5. Media-switching logic
- Explicit state in `IndependentProductsShowcase`: `activeProductId` and `mediaMode: 'pitch' | 'demo'`. Selecting a product always runs `setMediaMode('pitch')`.
- The stage is keyed by `product:mode`, so every switch unmounts the old player and the new stage starts at its poster. Nothing autoplays, and two videos can never play at once.
- The player is `ProductVideo`, loaded via `next/dynamic` only after a press:
  - a local MP4 gets `<video controls playsInline preload="metadata">`;
  - YouTube uses the `youtube-nocookie` embed and Vimeo uses `player.vimeo.com`. These are the only two hosts in the new CSP `frame-src`.
- Failure handling: a local file that fails to load shows the poster, "This video didn't load." and a link to open it directly. `console.warn` fires; errors are never silent.
- **No pitch or demo recordings exist** (TKT-22…26 are on hold). So today:
  - every stage shows the product's cover at stage size with a "Pitch video coming" tag;
  - the Pitch and Demo actions are hidden;
  - no player, iframe or video byte loads.
- **Proof that it lights up with data:** `tests/unit/portfolio.test.tsx` runs fixture products with a local MP4 (`/video/fixture-tiny.mp4`), a YouTube id and a Vimeo id through the same components. It checks:
  - Pitch/Demo actions appear;
  - a press mounts exactly one player;
  - Demo swaps it and Pitch restores the poster;
  - a product change drops the player and resets to pitch;
  - the error state;
  - the URL is replaced, not pushed.

## 6. 90s thumbnail system
`ProductCover` is pure HTML/CSS/SVG, with no raster art and no text inside images. It has:
- the product code plus "No. NN" on a navy band (monospace micro-labels);
- the product's lucide glyph in a conic sunburst over a halftone dot field;
- the name as a Fraunces wordmark with a hard offset shadow;
- the cover line on an ivory strip;
- a striped spine and a print-registration mark as faux packaging.

It does not reference any real game's artwork or branding. The same component is the stage poster (`size="stage"`, laid out wide). No product logos exist in `content/media/`, so the name is set in type.

## 7. Enterprise data structure
`data/enterprise.ts` → `EnterpriseCase { id, client, program, role, period, summary, workstreams[≤4], tags[4–6], sources[{document, page}] }`, validated by zod in the content gate.
- The schema rejects currency symbols and the word "budget". Budgets and team sizes never entered the file.
- Each `source` is a document title and page ("Project Manager portfolio V2.0", "Résumé"), never a file path.
- Neither PDF and no extracted text is committed. No phone numbers, addresses or personal email.
- The six cards follow spec §27:
  - **Pear Health Labs:** 3 programs.
  - **Mojix**
  - **Google Cloud (HMLE):** kept separate from IU Health.
  - **Telus Health / LifeWorks**
  - **LifePoint Health:** 3 engagements.
  - **Indiana University Health**
- There is no "Open case file →" CTA and there are no links, because no detail pages exist.
- None of the six engagements existed in `experience.ts` / `credentials.ts`, so nothing is duplicated.

## 8. Responsive behaviour
- **≥ 1024:** stage and panel sit side by side at 62/38 (measured 0.55–0.66 in e2e). The carousel runs full width below.
- **< 1024:** DOM order gives media → details → actions → carousel.
- **Enterprise grid:** 3 columns ≥ 1100, 2 columns ≥ 768, 1 column below. Tags wrap.
- **Text:** content is ≥ 14 px. Only the cover code/"No." chips and the panel code chip are 12 px, marked `data-micro-label`, ivory on navy.
- **Targets:** all controls are ≥ 44 px.
- **Overflow:** no horizontal page overflow at 390, 768, 1024 or 1440. The track is the only horizontal scroller.

## 9. Accessibility
- The tabs pattern: `tablist` / `tab` / `tabpanel`, `aria-selected`, `aria-controls`, the roving tabindex and the rust focus ring.
- Pitch/Demo buttons carry `aria-pressed` + `aria-controls`.
- External links use `target="_blank" rel="noopener noreferrer"`. Their names include the visible label and "(opens in new tab)".
- Players get a title or `aria-label`, e.g. "TeachSpark — pitch video".
- The cover art is `aria-hidden`, and each tab has an sr-only "Name: cover line".
- Selection never depends on colour.
- Under reduced motion there are no enter animations, lifts, transitions or smooth scroll (eval-010).

## 10. Analytics
None: Mixpanel is not configured in the repo, and the spec says not to add it.

## 11. Compromises
- The spec's §20 exit half (old opacity 1→0) is not run. Unmounting the old player immediately stops playback, and keeping it mounted to fade would briefly run two players. Only the enter animation runs: 300 ms for a product change, 220 ms for a mode change.
- GitHub uses the lucide `GitBranch` icon. lucide 1.x has no brand icons.
- GitHub shows only for public repos (Dino Arcade, Cinematic Portfolio). The other repos are private, and linking them would give visitors a dead link.
- No product has a PRD URL, so PRD is hidden everywhere.
- The carousel lists all 11 personal builds, including team or discovery work (Bhakti Vilas, Token Toli) and Pratyasa. The spec said to source the list from the data.
- The dead TKT-80 CSS block (`.work-hero`, `.work-index`, `.job…`) is **left in `globals.css`**. Its later `.work-kicker` / `.work-metric*` rules also override the home Featured `ProjectCard`: deleting the block changes the home metrics layout, and `.work-metric span` would drop to 12 px, failing EVAL-008. This needs a separate cleanup that moves those overrides into the TKT-75 block first.
- The three `professional` records in `data/projects.ts` are no longer rendered anywhere (Dev-110).

## Spec themes the sources did not support (dropped)
- **Vendor Passport** (spec §5): it is not in `data/projects.ts` and not in either document, so it is left out.
- **LifePoint "APIs" tag:** no API work is described for LifePoint. It was replaced by "Python", which the SFTP → GCS pipeline supports.
- **IU Health "BigQuery" tag:** the documents name Looker, Kronos, Teletracking, Oracle and Cerner, but not BigQuery. It was replaced by "Data Pipelines".
- **"Open case file →"** (spec §34): no detail pages exist, so it is omitted.
- **Client logos** (spec §36): no source-backed files, so none are used.

## Design rows
Dev-109 (the Portfolio rebuild, `?filter=` retired), Dev-110 (the professional records are no longer rendered), Dev-111 (the monospace label family), Dev-112 (the louder 90s cover language, with "muted lavender" = `color-mix(steel 62 %, rust)`), Dev-113 (CSP `frame-src`), Dev-114 (GitHub icon / public-only / no PRD). All are dispositioned "Tushar, 2026-09-28 (TASK-116)". **Renumber at merge** if other agents took these numbers.

## Spec §55 verification
| §55 item | Result | Evidence |
|---|---|---|
| Nav says Portfolio; `/projects` works | ✅ | projects.spec (tab text, `aria-current`, 200, title), eval-015/tracer, routes.test |
| Old project grid removed | ✅ | projects.spec (no filter tablist / cards / rows / strip in the DOM); components deleted |
| Selected product updates media; pitch is the default | ✅ | projects.spec (click → panel + `data-media-mode="pitch"`), portfolio.test |
| Demo plays in the same left frame; Pitch restores pitch | ✅ fixture | portfolio.test (MP4 → YouTube → poster; one player). No real recordings exist yet |
| Product / GitHub / PRD open a new tab | ✅ | projects.spec (every panel link: `_blank` + `noopener noreferrer`); PRD via the fixture only |
| Carousel loops and navigates; keyboard works | ✅ | projects.spec (arrows wrap, ←/→/Home/End, roving tabindex, 2 px focus ring), portfolio.test |
| Mobile swipe works | ✅ structural | a native `overflow-x:auto` scroll-snap track (projects.spec: the track scrolls, 1.5–2.2 covers at 390). No gesture was simulated |
| Only the active video loads; the video stops on product switch | ✅ | projects.spec (0 `video`/`iframe` on the page); portfolio.test (lazy mount, unmount on switch, re-choose resets) |
| Selected product visually obvious, not by colour alone | ✅ | projects.spec (`::after` sketch outline only on the selected tab); screenshots |
| 90s product-art direction | ✅ visual | the screenshots; the covers are HTML/CSS/SVG only |
| Enterprise below the showcase; Pear / LifePoint grouped; Mojix, Google HMLE, Telus, IU Health separate | ✅ | projects.spec, portfolio.test |
| No invented budget or outcome data; no fake links | ✅ | the schema rejects currency and "budget"; projects.spec (no `$`/budget text, 0 links in the section) |
| Responsive; no horizontal overflow | ✅ | EVAL-008 at all four widths; the 62/38 split and the stacked order asserted |
| Reduced motion works | ✅ | eval-010 (no transform/opacity animation on a product swap; hover sweep) |
| Accessibility maintained | ✅ | EVAL-006 axe at 390 + 1440, default and non-default product; EVAL-007 keyboard |
| Performance acceptable | ✅ | first-load JS on `/projects` 164.5 kB gz (budget 180); player chunk lazy; no motion import (unit guard) |

## Gate
Latest `m-009-redesign` (a2fe3ad, TASK-118) was merged in first. The two conflicts (Design §11 numbering, the tail of `globals.css`) were resolved by keeping both sides; my rows were renumbered to Dev-109…114.

| Step | Result |
|---|---|
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm lint` | ✅ 0 problems |
| `pnpm tokens:check` | ✅ 13/13 |
| `pnpm test` | ✅ 632 passed, 2 skipped |
| `pnpm build` | ✅ all routes static |
| **full** `pnpm test:e2e` (one run, before the fixes below, on the TASK-119 base) | 1275 passed, 7 failed, 1458 skipped. All 7 were stale `/projects` tests plus the crawler (details below) |
| targeted re-run on the final merge (projects, case-study, regressions-m009, eval-011 crawler, eval-010, parallax-stacking, torn-parallax, scene-opener, eval-015, tracer) | ✅ 325 passed, 0 failed |
| `pnpm eval --only EVAL-006,008,011,013,018,021 --skip-build` | ✅ 6 pass · 0 fail |
| bundle budget `/projects` | ✅ 164.5 kB gz ≤ 180 |
| `tests/e2e/eval-018-parked.json` | still `[]` |

The 7 failures in the full run, and their fixes:
- **`case-study` VT-off test (×2):** it clicked a `/projects` grid card. It now deep-links `?product=railcite` and clicks the panel's case-study link.
- **`regressions-m009` TKT-85 filter-tab test (×4):** the filter tabs no longer exist. It now guards the same bug class on the carousel: visible scrollbar, ≥ 44 px arrows, a count, no page overflow.
- **`eval-011` crawler (×1):** it treated the carousel's `?product=` `replaceState` as a navigation and called `goBack()`. It now skips that only for a same-document, same-path replace.
  - The fix exposed one real finding: re-clicking the already-selected cover did nothing. It now resets that product to its pitch poster, per spec §18 (unit-tested).
  - The crawl timeout went from 180 s to 300 s to cover the 13 new live controls.

The full suite was not re-run end to end after these fixes. The targeted re-run covers every spec that touches `/projects`.

## Screenshots (`docs/screenshots/m-009/task-116/`)
`projects-{390,768,1024,1440}.png` (full page), `projects-1440-selected-dino-arcade.png` and `projects-390-selected-tegaki.png` (a non-default product selected via the deep link), and `midscroll-{390,1440}-{1..6}.png` (viewport frames across the products → enterprise and enterprise → band slide-overs). Overlap check: 0 hits in all 12 frames (a scripted check that no text of the lagging section is drawn below the sliding sheet's torn top); `parallax-stacking.spec` is green.

## Review round 1: cover titles clipped at stage size (orchestrator, 2026-09-28)
- **Defect:** the stage-size cover title ran off the cover ("TEACHSPARK" rendered as "TEACHSPAR" at 1440).
- **Fix** (`/* TASK-116 */` block only):
  - `.pf-cover` is now an inline-size query container.
  - The name sizes against the cover itself: thumbnails use `clamp(14px, 10.5cqi, 19px)`; the stage uses `clamp(14px, 5cqi, 52px)`.
  - `text-wrap: balance`. There is no ellipsis and no mid-word breaking.
- **Scar:** `projects.spec` "@EVAL-008 every cover title fits its cover" runs at w390 and w1440. It covers every product's stage cover plus all the thumbnails, and checks each title:
  - the text's glyph box stays inside the cover;
  - the title never scrolls (`scrollWidth ≤ clientWidth`);
  - no word is split across lines;
  - it takes ≤ 2 lines;
  - its font is ≥ 14 px.
- **Proof the test catches the defect:** run against the pre-fix build, it **failed at w1440** (`stage · TeachSpark: inside:false, fontPx 51.84`). On the fixed build it passes at both widths.
- **Full `pnpm test:e2e`, end to end on the final tree** (through heavy.sh, after a fresh build): **1300 passed, 0 failed, 1476 skipped** (27.7 min).
- **Other gates on the final tree:**
  - lint and build ✅;
  - unit tests ✅ (632 passed, 2 skipped);
  - `/projects` first-load JS 164.5 kB gz;
  - mid-scroll overlap check: 0 hits in all 12 frames.
- Screenshots in `docs/screenshots/m-009/task-116/` were re-captured.
