# Brief — TKT-45 · `/contact` — `ContactCard` + `CopyButton`

**Ticket:** TKT-45 (Backlog `TASK-41`) · Milestone **M-006** · Type Feature · P1 · sp:2
**Branch:** `m-006-pages` (or your assigned worktree off it — verify `git branch --show-current`; commit ONLY on the m-006 line, never `main`).
**Model tier:** standard (sonnet). **Co-Authored-By trailer:** YOUR session's actual model.
**Depends on:** TKT-04, TKT-05, TKT-06 (all done). TKT-08 is SOFT — the resume control renders the PB5 placeholder until a sanitised PDF lands. Disjoint route.

## Objective
Build `/contact`: a single centred card with copy-email / mailto / LinkedIn / resume actions. **No form** (decision S10). Email + LinkedIn + city only — **no phone, no DOB, no address** (EXE-8).

## ⚠️ Critical — do NOT duplicate existing infra
- **`app/contact/opengraph-image.tsx` ALREADY EXISTS** (added in TKT-06). Do NOT create or re-add a contact OG. (HANDOFF carry-forward: "TKT-45 must NOT re-add contact OG.")
- A `/contact` **stub already exists** (M-002 added a `/contact` ClayButton for eval-008). **Check `app/contact/page.tsx` first and BUILD IT OUT** — don't create a second route; extend the stub into the full ContactCard.
- The resume affordance MUST derive from `lib/site.ts` `resumeAction()` (single source of truth, PB5) — do NOT hard-code a resume link.

## Read first (in order)
1. `tickets.md` → **TKT-45** (~912–920) — authoritative ACs.
2. `Design.md` → **§3 Contact** (single centred hero-tier lavender `ClayCard`, max 640px; 2×2 grid ≥768 / stacked <768) and a11y/motion tables.
3. `SITEMAP.md` line 16 (ContactCard: copy email · mailto · LinkedIn · resume — no form, S10) + the resume-reachability line (38).
4. `CONTENT_INVENTORY.md` → **§7** (~273+) — email `Tushar_Pathak@outlook.com`, LinkedIn URL, city "Bengaluru, India". Every string traces here. NO phone.
5. `lib/site.ts` — `site.email`, `site.linkedin`, `resumeAction()` (returns `{label, href, download}` when available, else the placeholder `{label, href:"/contact#resume", note:"Sanitised resume coming — email me for a copy"}`), and whether a `city` constant exists (if not, take "Bengaluru, India" from §7).
6. Pattern references: `components/common/CopyButton.tsx` (reuse — it already handles idle→copied→error states; "never-silent" per TKT-14), `components/clay/{ClayCard,ClayButton}`, `components/common/ExternalLink.tsx`.

## Scope — files
- **Create** `components/contact/ContactCard.tsx` — single centred hero-tier **lavender** `ClayCard` (max 640px): heading **"Still curious?"**; then, in a 2×2 grid (≥768) / stacked (<768) with 12px gaps:
  - `CopyButton` for the email (idle → "Copied" 2s → error fallback showing selectable text if clipboard denied),
  - a `mailto:` `ClayButton`,
  - a LinkedIn `ClayButton` (external, `rel="noopener noreferrer"`, "opens in new tab" aria),
  - the **resume action** rendered from `resumeAction()` — while `resumeAvailable` is false it shows the placeholder label + the "email me for a copy" note and points at `#resume`.
  - a "Bengaluru, India" city line.
  - An `id="resume"` anchor (the target every placeholder resume link across the site points at).
- **Edit** `app/contact/page.tsx` — build out the stub: `buildMetadata` already set by TKT-06 (verify; do NOT change the OG family that OG image expects); mount `ContactCard` in `Container`; static.

## Acceptance criteria (TKT-45, verbatim)
1. email/LinkedIn/city verbatim from §7; **no phone**. 2. All four controls ≥44×44 with 12px gaps. 3. `CopyButton` states tested incl. **clipboard-denied** fallback. 4. `#resume` anchor exists; resume control renders the placeholder while `resumeAvailable` is false AND a 200 download once TKT-08 flips it (Playwright covers BOTH paths — you can force `resumeAvailable` in a test build or mock `resumeAction`). 5. axe clean; crawler passes.

## TDD / gates (ALL pass before commit)
1. `pnpm typecheck` · `pnpm lint` — clean.
2. `tests/e2e/contact.spec.ts` (Playwright, **workers:1**, retry once on OOM): the 4 controls present, ≥44×44, 12px gaps; CopyButton idle→copied→(denied→selectable fallback); LinkedIn external + aria; `#resume` anchor exists; resume placeholder shown while unavailable; no phone number present anywhere; no-overflow @390/768/1024/1440; axe @390/1440. Red→green where feasible. (Extend the existing eval-008 44px expectations if present rather than duplicating.)
3. `pnpm exec vitest run` green.
4. `pnpm prebuild` `content OK` unchanged.
5. `pnpm build` — `/contact` static; `assert-static` green; the existing contact OG still builds.
6. `pnpm eval` (EVAL-002 final hop, 007, 011, 013) no regression — leave eval-run json untracked.
7. Screenshots `/contact` at 390/768/1024/1440 → `docs/screenshots/contact/`.

## Constraints
- Everything on `/Volumes/E Drive`. Stage EXPLICIT paths only — never `git add -A`.
- One commit: `feat(m006): TKT-45 /contact ContactCard + CopyButton`. Co-Authored-By = your model.
- No form (S10). No PII beyond email + LinkedIn + city. Do NOT touch/duplicate `app/contact/opengraph-image.tsx`.

## Output — `docs/reports/TKT-45.md`
Files (note you extended the stub, didn't recreate); the contact fields shipped + §7 trace; CopyButton state coverage incl. denied path; how the resume placeholder is wired from `resumeAction()` and how both resume paths are tested; confirmation the contact OG was left untouched; ALL gate results with counts + OOM retries; eval-run path + regression; screenshot paths; commit SHA; flags — flag, don't block.
