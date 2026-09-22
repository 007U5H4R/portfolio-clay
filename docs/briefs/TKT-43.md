# Brief — TKT-43 · `/thinking` list + `/thinking/[slug]` essay route (DRAFT entries)

**Ticket:** TKT-43 (Backlog `TASK-39`) · Milestone **M-006** · Type Feature · P2 · sp:3
**Branch:** `m-006-pages` (or your assigned worktree off it — verify `git branch --show-current`; commit ONLY on the m-006 line, never `main`).
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-03 (schema), TKT-05 (layout/Section/Footer), TKT-06 (SEO/OG) — all done. Independent of the About chain (disjoint route).

## Objective
Build the honest editorial section: `/thinking` (a numbered list of 5 DRAFT essays) and `/thinking/[slug]` (one essay each). **Nothing is published** — every essay is a labelled DRAFT backed by a real quoted passage. Never fake a finished article.

## Read first (in order)
1. `tickets.md` → **TKT-43** (~892–900) — the authoritative AC list.
2. `Design.md` → **§3 Thinking** (ThinkingHero h1-only; numbered list, large type, hover) and the a11y/motion tables.
3. `SITEMAP.md` lines 13–14 (`/thinking`, `/thinking/[slug]` layout).
4. `CONTENT_INVENTORY.md` → **§5** (~247–257) — the 5 candidate titles + backing passages (quoted) + sources + `related project` + the empty-state copy. Every string traces here.
5. `data/schema.ts` — the `Essay` type (there is already an `Essay` schema export; check its exact fields: title/dek/slug/draft/readingTime/relatedProject/passage etc. — match it, extend with evidence only if a field is missing).
6. Pattern references: `app/work/page.tsx` + `app/work/[slug]/page.tsx` (route discipline: `buildMetadata`, `Container`, `generateStaticParams` for the dynamic route, `assert-static`), `components/common/{Prose,Tag,ExternalLink}.tsx`, and the existing OG route `app/work/opengraph-image.tsx` (copy its Satori/ImageResponse pattern for the new thinking OG — TKT-06 fixed WebP→PNG and Buffer→ArrayBuffer bugs there; reuse the corrected pattern).

## Scope — files
- **Create** `data/writing.ts` — export `writing: Essay[]` with the **5 candidate essays** from §5: each `{ title, dek, slug, draft:true, readingTime, relatedProject (slug), passage(s) quoted verbatim with its source }`. Import schema as a **type only** (no zod value import — client-bundle discipline, per `experience.ts`). Header comment `// source: CONTENT_INVENTORY §5`. **No essay is `draft:false`.** Titles are DRAFT pending Tushar's sign-off — ship faithful, flag in report.
- **Create** `components/thinking/ThinkingHero.tsx` — h1 only ("Thinking" / per Design §3).
- **Create** `components/thinking/ThinkingList.tsx` — numbered rows (large type, hover per Design §3), each row a `ViewTransitionLink`/link to `/thinking/[slug]`, each showing the "Draft — pending sign-off" `Tag`. Above the list, the empty-state line **"Essays in progress — five drafts, none published yet."** (rendered because zero non-draft essays exist; the list still shows the drafts).
- **Create** `components/thinking/EssayBody.tsx` — `Prose` (≤600px measure); title; a "Draft — pending sign-off" `Tag` **instead of a date** (NO publish date anywhere); body = the sourced quoted passage(s) + a **clearly-marked** one-paragraph DRAFT framing; a related-project `ExternalLink`/card to `/work/[relatedProject]`.
- **Create** `app/thinking/page.tsx` — `buildMetadata({ title, description, path:'/thinking', ogFamily:'Product Thinking' })`; mount `ThinkingHero` + `ThinkingList` in `Container`; static.
- **Create** `app/thinking/[slug]/page.tsx` — `generateStaticParams()` over the 5 slugs; per-essay `buildMetadata`; mount `EssayBody`; static (all 5 slugs prerendered). `notFound()` for an unknown slug.
- **Create** `app/thinking/opengraph-image.tsx` — thinking OG (1200×630), copying the corrected `app/work/opengraph-image.tsx` pattern.

## Acceptance criteria (TKT-43, verbatim)
1. 5 entries verbatim from §5 with sources. 2. DRAFT tag visible on list rows AND essay pages; **no publish dates**. 3. Essay body = only quoted passages + clearly-marked framing, ≤600px measure. 4. Essay slugs in the sitemap. 5. axe clean; crawler passes (`related project` internal links resolve; any external source links are fine); `pnpm eval` no regression.

## TDD / gates (ALL pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. `tests/e2e/thinking.spec.ts` (Playwright, **workers:1**, retry once on OOM): list shows 5 rows + empty-state line + DRAFT tags; a row navigates to its essay; essay shows DRAFT tag, no date, ≤600px body, related-project link resolves; no-overflow @390/768/1024/1440; axe @390/1440. Red→green where feasible.
3. `pnpm exec vitest run` green (extend the data-enumeration/schema test for `data/writing.ts`).
4. `pnpm prebuild` `content OK` (now includes `writing:5`).
5. `pnpm build` — `/thinking` + all 5 `/thinking/[slug]` static; `assert-static` green; thinking route(s) in sitemap.
6. `pnpm eval` (EVAL-006/011/013/017) no regression — leave the eval-run json untracked.
7. Screenshots `/thinking` + one essay at 390/768/1024/1440 → `docs/screenshots/thinking/`.

## Constraints
- Everything on `/Volumes/E Drive`. Stage EXPLICIT paths only — never `git add -A` (eval-run churn stays out).
- One commit: `feat(m006): TKT-43 /thinking list + essay route (DRAFT entries)`. Co-Authored-By = your model.
- Do NOT publish or imply any essay is finished; DRAFT everywhere. Do NOT invent passages beyond §5.

## Output — `docs/reports/TKT-43.md`
Files; the 5 essays shipped (title/slug/relatedProject/passage-source); how DRAFT is surfaced on list + essay; sitemap proof; ALL gate results with counts + OOM retries; eval-run path + regression summary; screenshot paths; commit SHA; flags (title sign-off) — flag, don't block.
