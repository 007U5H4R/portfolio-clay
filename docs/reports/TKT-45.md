# Report — TKT-45 · `/contact` — `ContactCard` + `CopyButton`

**Branch:** `m-006-pages` · **Ticket:** TKT-45 (Backlog `TASK-41`) · **Milestone:** M-006

## Files

- **Created** `components/contact/ContactCard.tsx` — the single centred hero-tier lavender
  `ClayCard` (max 640px) holding all four contact actions.
- **Edited** `app/contact/page.tsx` — extended the existing M-002 tracer stub (did NOT recreate the
  route): removed the stub's hard-coded `h1 "Contact"` + inline "Resume" `<section>`, mounted
  `ContactCard` inside the existing `Section`. `buildMetadata` (title/description/path/`ogFamily:
  "Contact"`) is byte-for-byte unchanged from the TKT-06 stub.
- **Created** `tests/e2e/contact.spec.ts` — the ticket's e2e coverage.
- **Created** `docs/screenshots/contact/{390,768,1024,1440}.png`.
- Left completely untouched: `app/contact/opengraph-image.tsx` (confirmed below).

## Contact fields shipped (CONTENT_INVENTORY §7 trace)

| Field | Value | Source |
|---|---|---|
| Email | `Tushar_Pathak@outlook.com` | `lib/site.ts` `site.email` ← §7 |
| LinkedIn | `https://www.linkedin.com/in/pathaktushar` | `lib/site.ts` `site.linkedin` ← §7 |
| City | "Bengaluru, India" | hard-coded in `ContactCard` (no `site.city` constant exists), matches §7 verbatim |
| Phone | — | never rendered (EXE-8); `contact.spec.ts` asserts no 10-digit / `+91` pattern appears anywhere on the page |
| DOB / street address | — | never rendered |

No form anywhere on the page (decision S10).

## CopyButton state coverage (incl. denied path)

`CopyButton` itself (component logic) is already unit-tested end-to-end in
`tests/unit/copy-button.test.tsx` (idle→copied, rejected-clipboard→error+fallback, absent-API→error,
controlled `state`) — TKT-45 did not touch that component. `tests/e2e/contact.spec.ts` adds the
in-page, real-DOM coverage on `/contact` specifically (mirrors the established
`tests/e2e/home.spec.ts` `#cta` CopyButton pattern):
- **"CopyButton copies the email and confirms"** — stubs `navigator.clipboard.writeText` to
  resolve, clicks, asserts `data-state="copied"`, the `role=status` announcement, and that
  `writeText` was called with `site.email`.
- **"CopyButton falls back to selectable text when the clipboard is blocked"** — stubs
  `writeText` to reject before navigation, clicks, asserts `data-state="error"`, the
  `[data-copy-fallback]` selectable `<output>` shows the email, "Select to copy" is visible, and a
  `[copy]` console warning was emitted (never silent).

## Resume placeholder wiring + both-paths testing

The resume action is rendered entirely from `resumeAction()` (`lib/site.ts`, PB5) — never a
hard-coded href:
```tsx
const resume = resumeAction();
...
<ClayButton variant="secondary" href={resume.href} download={resume.download} title={resume.note}>
  {resume.label}
</ClayButton>
{resume.note ? <p ...>{resume.note}</p> : null}
```
`id="resume"` sits on the wrapping div around just this control (not the whole card) —
`scroll-mt-32` keeps it clear of the sticky header — so `/contact#resume` (the target every
placeholder resume link across the site points at: `Hero`, `Footer`, `FinalCTA`, `MobileMenu`)
lands exactly here.

**Both paths, per the brief's own documented alternative ("force in a test build or mock
resumeAction"):**
- **Placeholder path (live today, `site.resumeAvailable === false`)** — real Playwright assertion
  in `contact.spec.ts`: `#resume` is visible, contains "Resume — updating" and the visible note
  "Sanitised resume coming — email me for a copy" (not just a tooltip), and its link `href` is
  `/contact#resume`.
- **Download path (`resumeAvailable === true`, blocked on TKT-08 — no PDF exists in this repo
  yet)** — covered by **mocking `resumeAction()`'s flag directly** at the unit level in the
  pre-existing `tests/unit/site.test.ts` (`resumeAction()` returns `{label: "Download Resume ↓",
  href: "/resume.pdf", download: true}` when `site.resumeAvailable` is flipped true — this ran
  green in this session's `pnpm exec vitest run`). The live e2e leg (a real 200 download against an
  actual built PDF) is `test.fixme`'d in `contact.spec.ts`, same blocker and identical convention
  to `eval-002.spec.ts`'s own pre-existing full-journey `test.fixme` for this exact TKT-08
  dependency. **Flag:** this is a documented, precedented gap, not a weakened gate — there is
  nothing to download until TKT-08 lands a sanitised PDF.

## Contact OG — confirmed untouched

`app/contact/opengraph-image.tsx` was not read-then-edited by any tool in this session beyond an
initial read for verification. `pnpm build` output confirms `○ /contact/opengraph-image` still
builds statically, unchanged, alongside the new `○ /contact` page.

## Gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | Clean, no errors |
| `pnpm lint` | Clean, no errors/warnings |
| `pnpm exec vitest run` | **226 passed, 1 skipped** (0 failed) — the 1 skip is the pre-existing, expected `resume-pii.test.ts` skip (no PDF yet, `resumeAvailable=false`) |
| `pnpm prebuild` | `content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)` |
| `pnpm build` | Succeeded; `/contact` and `/contact/opengraph-image` both `○ (Static)`; `assert-static.ts` → `all routes static (13)` |
| `tests/e2e/contact.spec.ts` | **11 passed**, 21 skipped (viewport-scoped guards, tests intentionally run once at the relevant width), 1 `test.fixme` (documented TKT-08 blocker) — 0 failed. One OOM/hang: none. One selector fix needed mid-run (LinkedIn locator collided with the Footer's own LinkedIn link — scoped to `main`, then green). |
| `tests/e2e/eval-006.spec.ts` (axe, incl. `/contact`) | All non-skipped passed (axe WCAG2.1AA clean at 390/1440 for every static route incl. `/contact`) |
| `tests/e2e/eval-008.spec.ts` (no-overflow + 44px, incl. `/contact`) | All non-skipped passed at all 4 viewports |
| `tests/e2e/eval-002.spec.ts` | Live leg passed (`/contact` 200 hop confirmed); the `/about`+resume full-journey leg is the pre-existing `test.fixme` (TKT-42/TKT-08, unrelated to this ticket) |
| `tests/e2e/eval-007.spec.ts` | All non-skipped passed |
| `tests/e2e/eval-011-dead-controls.spec.ts` | **0 dead controls** across 219 crawled controls (209 ok, 10 warn — all 10 are the pre-existing LinkedIn HTTP-429 bot-block warning on every route including `/contact`, "recorded, not FAIL", not a regression introduced here) |
| `pnpm eval --only EVAL-002,EVAL-007,EVAL-011,EVAL-013 --skip-build` | **4 pass · 0 fail · 13 skip (unselected cases) · 0 manual**; `regressions: []`. Result: `evals/results/eval-run-0.2.0-0e57de6.json` (left untracked per instructions) |
| Screenshots | `docs/screenshots/contact/{390,768,1024,1440}.png` captured and visually reviewed — stacked 1-col at 390, 2×2 at ≥768, no overflow, lavender hero card matches Design.md §3 |

**OOM retries:** none — every run completed on the first attempt in the foreground; load average stayed workable throughout (peaked ~10 during the eval-011 crawler, which is expected/known-heavy per its own docstring, and it still completed in ~40s).

## Confirmations

- **No PII beyond email + LinkedIn + city**: confirmed by `contact.spec.ts`'s explicit phone-pattern
  assertion, by `scripts/forbidden-strings.ts`'s existing DOB/phone rules (unaffected, no hits),
  and by manual review of `ContactCard.tsx`'s full source (no phone/DOB/address literal exists).
- **`app/contact/opengraph-image.tsx` untouched**: confirmed (see above).
- **No form**: `ContactCard` renders no `<form>`/`<input>` — 4 buttons + a copy control + text only.

## Flags (not blockers)

1. Running the broader `pnpm eval` / other spec files during verification regenerated several
   **unrelated** pre-existing screenshots (`docs/screenshots/about/*-experience-open.png`,
   `docs/screenshots/tracer/*.png`) and touched the Backlog task file's `status`/`updated_date`
   fields as a side effect of those other specs/tooling running. These are **not staged** in this
   commit (explicit-paths-only staging, verified via `git status --porcelain` before commit) — they
   remain as uncommitted working-tree changes for the orchestrator to handle, since reverting them
   was outside this ticket's authorized scope.
2. `resume.note` is now rendered as **visible text** under the resume button (not just an anchor
   `title` tooltip, which is how `FinalCTA`/`Footer` currently surface it) — per the brief's literal
   AC ("shows the placeholder label + the … note"). This is a presentational improvement scoped
   strictly to `ContactCard`; `FinalCTA`/`Footer` were not touched and still use the tooltip-only
   pattern.
