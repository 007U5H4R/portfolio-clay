# Brief — TKT-42 · About page part 2: Awards · Research · Education + assembly + OG

**Ticket:** TKT-42 (Backlog `TASK-38`) · Milestone **M-006** · Type Feature · P2 · sp:2
**Branch:** `m-006-pages` (already checked out; commit ONLY here, never `main` — verify `git branch --show-current`).
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-40 (done: AboutHero/ProductJourney/clusters/Impact) + TKT-41 (ExperienceTimeline mounted at `#experience`). This is the LAST About ticket — it finalizes `/about`.

## Objective
Add the final three `/about` sections — **Awards · Research · Education** — after the ExperienceTimeline, then finish page assembly (SITEMAP order, "Let's talk" → `/contact` CTA, Download Resume via `resumeAction()`) and add the **About OG image** (this ticket OWNS the About OG — no earlier ticket added it). Truth is the whole point: patent number exact, no fabricated DOI, PMP/SAFe absent.

## Read first (in order)
1. `tickets.md` → **TKT-42** (~884–890) — authoritative ACs.
2. `SITEMAP.md` line 12 — full `/about` order: AboutHero · My Product Journey · What I Bring · Impact · **Experience timeline · Awards · Research · Education**. Also line 38 (resume reachable from `/about`) and line 41 (per-page OG family).
3. `CONTENT_INVENTORY.md` → **§4.6 Awards** (~219–226), **§4.7 Research** (~228–235), **§4.8 Education** (~237–243). Every string traces here.
   - Awards: 3 (Google Cloud Partner All-Star: Delivery Excellence 2024; Annual Unsung Hero, Quantiphi 2024; 12-in-11 Award, Godrej 2018) — text only, certificates MISSING. **Exclude PMP / SAFe Agilist** (banner-only, not in résumé).
   - Research: Patent **IN 429867** (App 202241053140, filed 16 Sep 2022, granted 24 Apr 2023, patentee NIT-Calicut; inventors Dr. N. Sandhyarani, **Tushar Pathak**, Haritha K, Dr. Arun R, Dr. M. K. Ravi Varma) → link `https://pratyasa.vercel.app`. **The résumé prints an SL-no. as the patent no. — the certificate wins: use 429867 everywhere.** Paper 1: Kuttoth, H.; Pathak, T.; Sandhyarani, N. *Langmuir* 2025, 41(26), **DOI 10.1021/acs.langmuir.5c00784** (link the DOI; do NOT redistribute the local PDF). Paper 2: "Topological Phases in Nanoparticle Monolayers…" *Soft Matter*, RSC (2023) — title only, **DOI + author list MISSING → render "DOI pending", never a fabricated DOI**. Rights/safety line: "Patent owned by NIT-Calicut; research prototype, not an approved diagnostic."
   - Education: M.Tech Nanotechnology, NIT Calicut 2022; B.E. Mechanical, BIT Durg 2016; languages (English/Hindi/Bengali) optional.
4. `Design.md` → §3 About (these sections follow the same primitives) + the OG spec.
5. Pattern references: the current `app/about/page.tsx` (see how AboutHero/ProductJourney/CapabilityClusters/Impact/ExperienceTimeline are already mounted — append after the timeline), `components/common/{Prose,ExternalLink,Tag}.tsx`, `components/clay/{ClayCard,ClayButton}`, `lib/site.ts` `resumeAction()` (resume CTA — placeholder while `resumeAvailable:false`), and `app/work/opengraph-image.tsx` (the corrected Satori/ImageResponse pattern to copy for the About OG).

## Scope — files
- **Create** `components/about/Awards.tsx`, `components/about/Research.tsx`, `components/about/Education.tsx` — server components rendering §4.6/§4.7/§4.8 verbatim. If it keeps the truth pattern cleaner, put the content in a small `data/credentials.ts` (awards/research/education arrays with `// source: CONTENT_INVENTORY §4.6–4.8` comments and per-item source) and have the components consume it; otherwise inline with source comments. Either way: patent **429867** exact; Soft Matter shows **"DOI pending"**; Langmuir DOI links out; rights/safety disclaimer present; NO PMP/SAFe certification.
- **Edit** `app/about/page.tsx` — mount `<Awards/> <Research/> <Education/>` after the ExperienceTimeline, in SITEMAP order; add the page-foot CTAs: **"Let's talk"** → `/contact` and **Download Resume** (from `resumeAction()` — placeholder now). The colophon "Designed and built with Claude Code" (TP10 authorship) belongs on `/about` — add it if not already present. Route stays statically prerendered.
- **Create** `app/about/opengraph-image.tsx` — About OG (1200×630), copying the corrected `app/work/opengraph-image.tsx` pattern; wire `ogFamily:'About'` (or the family the page's `buildMetadata` already declares — keep them consistent).

## Acceptance criteria (TKT-42, verbatim)
1. Copy verbatim from §4.6–4.8; **PMP/SAFe absent**. 2. Patent number **429867** everywhere. 3. Soft Matter row has **no fabricated DOI** — "DOI pending". 4. Page order per SITEMAP.md. 5. **Lighthouse `/about` ≥ 90/95/95/95**; axe clean; `pnpm eval` no regression.

## TDD / gates (ALL pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. Extend `tests/e2e/about.spec.ts` (Playwright, **workers:1**, retry once on OOM): Awards/Research/Education render with §4.6–4.8 copy; patent "429867" present and no SL-no. variant; "DOI pending" present for Soft Matter; Langmuir DOI link resolves; PMP/SAFe absent (grep); "Let's talk"→/contact and resume CTA present; colophon present; full-page no-overflow @390/768/1024/1440; axe @390/1440.
3. `pnpm exec vitest run` — green (extend data/forbidden tests if you add `data/credentials.ts`).
4. `pnpm prebuild` — `content OK`.
5. `pnpm build` — `/about` static; `assert-static` green; About OG route builds; `/about` in sitemap.
6. **Lighthouse `/about`** ≥ 90/95/95/95 — run the project's Lighthouse step if wired (note if the host OOMs LHCI, as prior phases did — capture what you can and flag). `pnpm eval` (EVAL-002 hop-4, 004, 013, 017) no regression — leave eval-run json untracked.
7. Regenerate full `/about` screenshots at 390/768/1024/1440 → `docs/screenshots/about/`.

## Constraints
- Everything on `/Volumes/E Drive`. Stage EXPLICIT paths only — never `git add -A`.
- One commit: `feat(m006): TKT-42 About Awards/Research/Education + assembly + OG`. Co-Authored-By = your model.
- NEVER fabricate a DOI, certificate, or the patent SL-no.-as-patent-no. error. Patent owned by NIT-Calicut; keep the rights/safety line. No PII beyond the public professional record.
- Note the M-006 carry-forward: the Impact section's 19-card density is a KNOWN Stage-8 should-fix — do NOT try to fix it here (out of scope); just don't make the page worse.

## Output — `docs/reports/TKT-42.md`
Files; the Awards/Research/Education content shipped + §4.6–4.8 trace (esp. patent 429867 + Soft Matter "DOI pending"); assembly order proof; OG wiring; Lighthouse `/about` numbers (or the OOM note); ALL gate results with counts + OOM retries; eval-run path + regression; screenshot paths; commit SHA; flags (Soft Matter DOI still pending Tushar) — flag, don't block.
