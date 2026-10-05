# TASK-136 — About rebuilt as "who Tushar is"

Cloud session, branch `cloud/task-136` (from `m-009-redesign` @ `7631448` + the brief commit `a1828ba`).
Spec: `docs/redesign-mockups/m-009/tushar-2026-09-29/about-redesign-spec.md`; reference
`about-redesign-reference.jpg` (followed for composition, not for its placeholder facts); brief
`docs/briefs/TASK-136.md`. Design record: Design.md §3.3, §7.2, §7.4 and **§11 Dev-129** (numbered Dev-128 until the merge with `m-009-redesign`, where TASK-133 had already taken Dev-128).

About now has five areas under the site's `scene-about` opener: **hero → Three Chapters → Career Across
Contexts → Research + What Drives Me → Recognition**, closed by a **dark strip to Experience and
Certifications**. Everything that was résumé (roles, dates, bullets, scope, outcomes, metrics, skills,
education, languages) now lives only on `/work` (Experience). About links to it and repeats none of it.

## Two environment notes (please read)

1. **The upstream sync did not happen.** The brief asks for `git fetch origin && git merge
   origin/m-009-redesign` before the final push. The fetch worked and showed 7 new commits on
   `m-009-redesign` (PR #4, the TASK-133 Featured Work fidelity pass: `b6dec15`). The merge itself was
   **blocked by this session's permission policy**, so I did not merge and did not try another way.
   `cloud/task-136` is therefore based on `7631448` + the brief commit. Every gate below ran on that base.
   The overlap looks small: PR #4 touches the home Featured Work (`FeaturedWork.tsx`, its art, `home.spec.ts`,
   `FeaturedWork.test.tsx`) and `app/globals.css`. Both branches edit globals.css but in different
   blocks: this task edits the About/TKT-86/87/100/110/TASK-117 blocks and appends a TASK-136 block at the
   end. **Action for you:** merge `origin/m-009-redesign` into `cloud/task-136` (or merge the PR the other
   way), then re-run `pnpm test` and `pnpm test:e2e`.
2. **Playwright's browser download is blocked here.** `pnpm exec playwright install --with-deps chromium`
   returned 403 for `cdn.playwright.dev`. So I pointed Playwright 1.63's expected browser path
   (`$HOME/.cache/ms-playwright/chromium{,_headless_shell}-1243`) at the machine's pre-installed Chromium
   141 (`/opt/pw-browsers`) with symlinks. No repo file changed for this: `.env.tooling` and
   `playwright.config.ts` are untouched, and the brief's `TMPDIR` / `PLAYWRIGHT_BROWSERS_PATH` exports were
   used in every shell. Several existing e2e specs write their screenshots into tracked
   `docs/screenshots/**` files as a side effect; I restored those after each run, so only
   `docs/screenshots/m-009/task-136/` is committed.

## Spec §70 — final report

1. **About blocks removed**
   - The TASK-117 hero: "I started with machines…", the stats card (10+ / 3 / ∞), the philosophy note, the Venn notebook and the personal note.
   - The product journey.
   - The Impact section: eight product index cards plus the "From my résumé" figures.
   - The always-open experience timeline.
   - The awards · research · education band.
   - The "Let's build what's next." CTA, with its résumé control and its colophon line.
   - The component and CSS for all of these: `components/about/{Impact,Awards,Research,Education}.tsx`, `components/about/hero/*` and `components/timeline/*` are gone, along with their globals.css blocks.
2. **Blocks moved to Experience (`/work`)**
   - The role record from the timeline goes into a closed **"Scope & outcomes"** disclosure on each role card. It holds context, role, scale (when recorded), what changed and every self-reported outcome, verbatim from `data/experience.ts`.
   - **Skills** ("What I Bring", the four `data/skills.ts` clusters) becomes `section#skills` after Education, together with the **languages line**.
   - Education was already on `/work` with more detail (degree, institution, year, city, bullets), so About simply drops it.
   - The Impact figures: the résumé ones (35+ capabilities, 180+ stories, 4 teams, 40+ services, −30 % / −30 % / +25 %, 12 in 11, +25 %, +30 %, −20 %) are all in the `/work` disclosures. The product figures (TeachSpark, RailCite) are in their case studies' metric strips under Portfolio.
3. **Blocks retained**
   - The `scene-about` opener (every tab has one, Dev-103).
   - The three awards, now as Recognition.
   - The granted patent, both papers, the Pratyasa record link and the rights line, now as the Research artifacts.
   - The `polaroid-sunrise` print, now beside the principles.
4. **New sections**
   - Hero (`section.abh`).
   - Three Chapters (`#chapters`).
   - Career Across Contexts (`#career`).
   - Research + What Drives Me (`#research-values`, holding `#research` and `#values`).
   - Recognition (`#recognition`).
   - The Experience strip (`#about-cta`).
5. **About vs Experience** — About answers why the journey makes sense: its chapters, eras, research roots, principles and milestones. Experience answers who, where, when and what result: companies, titles, dates, cities, bullets, scope, outcomes, education and skills. Certifications keeps the badges. About links out through "See full experience →" (`/work`) and "View certifications →" (`/certifications`). No new route was added.
6. **Content sources**
   - `data/credentials.ts`: awards, patent (number, title, granted date, record link), papers (journal, year, title, DOI or missing), the rights line, languages.
   - `data/experience.ts`: the four employer names for the era references, and the full record now on `/work`.
   - `data/skills.ts`.
   - The illustration manifest, for `polaroid-sunrise`.
   - The copy for the hero, chapters, eras, principles and notes is the spec's approved wording (§2, §5, §7–§10, §17, §24, §27, §29, §34), kept in `components/about/about-content.ts`.
7. **Custom assets** — eleven hand-authored cut-paper SVGs in `public/about/`, built by `scripts/about-art/` on the TASK-127/133 kit. They are deterministic, 5.9–18.8 kB each (budget 40 kB), transparent and text-free except the four book spines.
   - Hero pieces: `research-sketches`, `systems-collage` (the terracotta sun, a generic city, a mountain horizon), `books-stack` (AI · Systems · Products · Impact, with a sage sprig and a pencil), `product-desk` (notebook, laptop, mug).
   - Chapter prints: `chapter-builder` (industrial skyline, cut-paper gear, blueprint), `chapter-operator` (truss bridge, mountains, water, architecture-diagram scrap), `chapter-researcher` (research notebook, microscope, pen, sticky).
   - Research artifacts: `research-nano` (a nanoparticle monolayer under the microscope, two domains meeting at a grain boundary — the Soft Matter subject), `patent-sheet` (a handheld reader with an electrode strip and blank callouts, plus a sealed sheet), `research-papers` (three fanned article pages with a response-curve figure).
   - `mountains`, for the Experience strip.
   - Every piece is decorative (`alt=""`) because the HTML next to it carries the words.
   - The chapter cards reuse the TASK-127 tear masks and `paper-fibers.svg`.
   - Guarded by `tests/unit/about-art.test.ts`: each file equals its source's render, stays under budget, is self-contained, matches the registry size, and has only the four spine words as lettering.
8. **Animations** — all use the shared one-shot `Reveal` (IntersectionObserver, fires once) plus CSS:
   - The hero copy and collage settle in.
   - Chapter cards arrive 90 ms apart.
   - The career thread draws left → right (stroke-dashoffset, 1.1 s), with its milestone dots arriving 240 ms apart.
   - The research artifacts settle 90 ms apart (8 px and −0.6°).
   - Recognition fades in.
   - Hover: chapter cards lift 2 px; CTA buttons lift 1 px and their arrows step 3 px.
   - Under `prefers-reduced-motion: reduce` there is no movement: Reveals show at once and the thread is fully drawn (e2e-asserted).
9. **Responsive**
   - Hero: ≥ 1024 is 46/54 (copy | collage); below that, copy then collage; < 640 the collage keeps the city and the books plus one note.
   - Chapters: 3 columns ≥ 1024, 2 + 1 at 640–1023, stacked below.
   - Career: horizontal on the thread ≥ 900; a vertical rail with icons at the left below.
   - Research | values: 55/45 ≥ 1024, stacked below. Artifacts go to single-row cards (art left, text right) < 640.
   - Recognition: 3-up ≥ 900.
   - Experience strip: row ≥ 900, stacked below; the horizon is hidden < 640.
   - No horizontal overflow at 390 / 768 / 1024 / 1440, and every control is ≥ 44 × 44 (EVAL-008).
10. **Accessibility**
    - All meaningful text is HTML. There is one h1; each section has an h2 and the cards have h3s. The headings alone tell the story (spec §60, unit-asserted).
    - Decorations are `aria-hidden`, and their text restates visible copy.
    - The "Scope & outcomes" disclosure is a native `<details>` with a ≥ 44 px summary; its "+ / −" marker has empty alt text in CSS (A11Y-2 moved there).
    - Axe (EVAL-006) is clean on `/about` at 390 and 1440, and on `/work` with the disclosure.
    - The research links are terracotta, because rust on paper-2 failed 4.5:1 at 14 px.
    - New contrast pairs were added to `tests/unit/contrast-pairs.test.ts`.
11. **Unresolved content conflicts** — see "Open content questions" below.

## Spec §69 — acceptance checklist

| Check | Result | Evidence |
|---|---|---|
| Explains who Tushar is | done | five areas; the six headings read as a story (unit test) |
| Doesn't duplicate Experience | done | unit + e2e: no role title, highlight, outcome, "self-reported", skills or languages on `/about` |
| Detailed education absent | done | no B.E. / M.Tech. / institution / year on `/about` (unit + e2e) |
| Detailed jobs absent | done | no titles, dates, responsibilities; the career strip names only employers, with no years (unit) |
| Research visible as the intellectual foundation | done | the Research artifacts + papers + patent record |
| Journey understandable in < 60 s | judgement | 5 areas; about 4 viewports of content at 1440 (e2e asserts ≤ 5.5 excluding the opener) |
| Three Chapters is the central device | done | the first section after the hero; three torn tinted cards |
| Career evolution compact | done | one 4-era strip, no dates |
| Awards and company names accurate | done | the awards are `data/credentials.ts` verbatim; the four employers are from `data/experience.ts` (unit) |
| No placeholder content survives | done | unit test rejects IIT, Google (as employer), AIG, HSBC, Nvidia, Star of the Month, Spot Award, "patent filed", 2009/2010/2013 |
| Mobile works | done | 390 screenshots; EVAL-008/006/010 at w390 |
| Materiality matches the portfolio | judgement | same cut-paper kit, tear masks, fibres, tape, halftone as TASK-127/133 |
| Experience and Certifications links work | done | e2e clicks through to `/work`; both hrefs asserted |

## KEEP / SHORTEN / MOVE / REMOVE (every block that was on `/about`)

| Block (before) | Decision | Where it is now |
|---|---|---|
| `scene-about` opener | KEEP | `/about` top (site-wide Dev-103) |
| TASK-117 hero: eyebrow "About · Senior Product Manager", h1 "I started with machines…", hand subline | REMOVE | replaced by the approved hero (spec §2) |
| Hero stats card 10+ / 3 / ∞ | REMOVE | — (numbers belong to Experience; spec §2 "no biography") |
| Philosophy note "I build at the intersection…", Venn notebook + checklist, personal note "coffee first…" | REMOVE | — (spec §29: no trivia; Three Chapters carries the idea) |
| Polaroid `polaroid-sunrise` | KEEP (moved within About) | beside the What Drives Me card |
| Product journey (2016 / 2022 / 2026 / Now cards) | REMOVE → re-expressed | Career Across Contexts (eras, not dated employers) |
| "What I Bring" skills (4 clusters) | MOVE | `/work#skills` |
| Impact — 8 product metric cards | MOVE | the TeachSpark / RailCite case-study metric strips (Portfolio) — already there |
| Impact — "From my résumé" figures | MOVE | `/work` role cards → "Scope & outcomes" |
| Experience timeline (4 roles: context, role, scale, what changed, outcomes, source) | MOVE | `/work` role cards → "Scope & outcomes" (the source line is not repeated there; `/work` never showed it) |
| Awards band (3 kraft tags) | SHORTEN | Recognition (icon, name, year) |
| Research band: patent card (number, application, filed, granted, patentee, inventors) | SHORTEN | Research artifact: "IN 429867 · co-inventor · granted 2023" + the full title; the full record is behind "View Pratyasa — the patent record" |
| Research band: papers (authors, journal, year, volume, DOI) | SHORTEN | journal + year + title + DOI link / "DOI pending" (authors and volume dropped) |
| Research disclaimer | KEEP | verbatim under the papers |
| Education band (2 degrees) | REMOVE (already on Experience) | `/work#education` (fuller there) |
| Languages line | MOVE | `/work#skills` |
| CTA "Let's build what's next." + Let's talk + résumé control + TP10 colophon | REMOVE | replaced by the dark Experience/Certifications strip (spec §34–§35: no generic contact); contact is in the header and band, the résumé row on `/contact` |

**Before/after diff of what each page shows**, from the screenshots in `docs/screenshots/m-009/task-136/`
(`before-*` / `after-*`, 390 / 768 / 1440):
- `/about` at 1440 went from 9,253 px to 4,595 px tall (at 390, from 15,504 to 7,030).
- `/work` at 1440 went from 4,256 to 5,469 px. It gains the Skills section, and each role card gains the closed disclosure.
- Everything listed as MOVE above can be found on `/work`. `tests/unit/experience-page.test.tsx` asserts every role's context, responsibility, recorded scale, what changed and each outcome in the disclosure, plus the four skill clusters and the languages line.
- `/work` loses nothing.

**Links that pointed into the old About.** Tushky's evidence links to `/about#experience`, `#impact` and `#capabilities` now go to `/work#work-experience` and `/work#skills` (in `data/knowledge.ts` and `data/tushky/faq.json`; `lib/anchors.ts` gained `PAGE_ANCHORS.work`). This changed the knowledge hash of eight FAQ answers: ai-experience, strongest-skills, product-thinking, velora, research-background, why-pm, assumption-failed and evaluate-ai. None of their answer texts cite `/about`, so I checked that and re-stamped them with `scripts/tushky-faq-refresh.ts --stamp`.

## Comparison with the reference (1440)

`docs/screenshots/m-009/task-136/compare-reference-1440.png` shows the reference on the left and `/about` on the right. There were two refinement passes:
1. A tighter hero title (three lines, as in the reference), with larger and more overlapping collage pieces.
2. A shorter hero foot, and a wider principles card so each principle fits on one line.

What matches: the hero composition (44–46 / 54–56, with the headline underline), the three torn tinted chapter cards, the compact era strip on a hand-drawn thread, the 55/45 research | values split with taped artifacts and a polaroid, the concise recognition row, and the navy torn strip with a terracotta primary button, a cream secondary button and a mountain horizon.

Where it knowingly differs:
- **The opener.** The page keeps the site-wide `scene-about` opener above the hero; the reference starts at the hero.
- **Section spacing.** It is roomier than the flattened mock, because every torn section keeps the site's TKT-106 slide-over zone (about 100–120 px) at its foot.
- **The career strip** uses type, not logos. Only two of the four employers have official logo files (Dev-92), and the reference's logos were placeholders anyway.
- **Handwritten notes.** There are five (hero × 2, chapters, values, recognition), not the reference's eight, to respect spec §5 and §29.

## Gates

(Counts from this branch's final build; the upstream merge could not be done — see note 1.)

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass (0 errors, 0 warnings) |
| `pnpm tokens:check` | 13/13 tokens round-trip OK (globals.css still has exactly 13 `--color-*`) |
| `pnpm test` | 66 files passed, 1 skipped · 716 tests passed, 4 skipped |
| `pnpm build` | pass — all routes static (17), prebuild content + FAQ gates clean |
| `pnpm test:e2e` (w390 · w768 · w1024 · w1440, `PW_WORKERS=2`) | see below |
| Bundle budget `/about` | 154.9 kB gz first-load JS (budget 180) |
| Bundle budget `/` | 161.3 kB gz (budget 180) |
| Screenshots | `docs/screenshots/m-009/task-136/` — before/after `/about` and `/work` at 390, 768, 1440 + the reference comparison |

**Full e2e:** **1,325 passed · 11 failed · 1,552 skipped** (2,888; width-gated skips are by design). After the fix below, **0 failures are this task's**:
- 4 × `eval-008` "no visible content text below 14px · /about" (w390/768/1024/1440) — **real, fixed** in `03a2652` (the era refs, patent line, captions and rights line were 12.5–13.5 px; the `/work` disclosure labels 11.5 px). Re-run alone after the fix: `eval-008` + `about*` + `eval-018` for /about at all four widths → 94 passed, 0 failed.
- 7 × **environment, not this branch** (re-run alone, same result; each is external network or a missing tool in this container, and none touches About):
  - `eval-011-dead-controls` (w1440): every "dead" control is an external link returning **HTTP 403 from the sandbox proxy** (Credly, pratyasa.vercel.app, tegaki, github.io, the live products); no internal control was flagged.
  - `playground.spec` "4 live experiment URLs resolve": HEAD → 403 (same egress block).
  - `portfolio-video.spec` Campfire Board + Slag City (w390, w1440): the youtube-nocookie player reaches `data-player-state="error"` — YouTube is unreachable here (`curl` → 000).
  - `eval-014` "valid src: loading then playing" (w390): `spawnSync ffmpeg ENOENT` — the test builds its fixture MP4 with ffmpeg, which this container does not have.

## Open content questions for Tushar

1. **The scene opener.** I kept `scene-about` above the new hero because every tab has one (Dev-103), but the reference starts at the hero. Should About drop its opener so the collage hero is the first thing on the page?
2. **"Started with machines and research."** (Chapter 01, the spec's approved line.) The data says the order was: B.E. Mechanical (2016), then Godrej product work (2016–18), then M.Tech. research (–2022). The line reads as if research came before enterprise work. It is the approved wording, so I kept it. Confirm, or reword to something like "Started with machines, then research."
3. **Era grouping.** I grouped Godrej Infotech with American Express under Enterprise Platforms, and Quantiphi with Shellkode under Cloud & Data. The AI Products refs read "Independent builds · enterprise GenAI". OK?
4. **Recognition.** It shows exactly the three recorded awards. No "Best AI Operator" or buildathon award is in the data, so neither appears. Add them to `data/credentials.ts` if they are real, and they will show automatically (2–4 items).
5. **Patent display.** About shows "IN 429867 · co-inventor · granted 2023" and the full title. The application number, filing date and inventor list are now only on the linked Pratyasa record, and the papers no longer list authors. Is that shortening OK?
6. **The Soft Matter paper** still has no DOI or author list. It shows "DOI pending", as before. Please send them when you have them.
7. **Principles.** I chose "Ask better questions. / Build useful products. / Keep learning and sharing." because "build useful products" matches the site's voice. The alternative set is one edit in `about-content.ts`.
8. **The old About CTA** ("Let's build what's next.", the résumé control, "Designed and built with Claude Code.") is removed, as spec §35 asks. The band footer still carries "Built with curiosity, chai & Claude Code." Is TP10's exact wording still needed anywhere?
9. **The `/work` disclosure.** The role details sit in a closed "Scope & outcomes" disclosure so the approved cards stay compact. Should they be open by default, or folded into the bullets instead?

## Commits

- `a1828ba` docs: add Tushar's About redesign spec, reference and cloud brief (TASK-136) — the base (brief) commit, not this session’s
- `7163d89` feat(about): hand-draw the About cut-paper art as static SVGs (TASK-136)
- `61a9e59` feat(about): rebuild About as who Tushar is; move the résumé record to Experience (TASK-136)
- `a1d57b6` fix(ask): point evidence links at Experience now that About drops them (TASK-136)
- `69df95a` test(e2e): assert the new About contract and the Experience disclosure (TASK-136)
- `b1882cb` docs(design): record the About rebuild and the Skills move as Dev-128 (TASK-136)
- `3ff2203` style(about): tighten the hero foot and widen the principles card after the reference check (TASK-136)
- `6b8467e` docs(about): before/after screenshots of /about and /work at 390, 768, 1440 (TASK-136)
- `03a2652` fix(about): lift About's small text to the 14 px content floor (TASK-136)
- `c910af3` docs(about): refresh the /about after screenshots and reference comparison (TASK-136)
- (this report) `docs(reports): TASK-136 report — About rebuild, the Experience split, gates, open questions`
