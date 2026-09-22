# Report — TKT-46 · 404 page (`app/not-found.tsx`)

**Ticket:** TKT-46 (Backlog `TASK-42`) · Milestone **M-006** · Branch `m-006-pages`

## Files created / edited
- **Created** `app/not-found.tsx` — the site-wide 404: one centred hero-tier `ClayCard` (`tone="peach"`, matching `ContactCard`'s "flat page, one clay tile" shape), a real `h1`, a supporting line, and three `ClayButton` links (`/`, `/work`, `/contact`). No client data-fetching, no new data module.
- **Created** `tests/e2e/not-found.spec.ts` — 6 test declarations (24 executions across the 4 viewport projects; 12 skipped as viewport-independent, same convention as `contact.spec.ts`).
- **Created** `docs/screenshots/not-found/{390,1440}.png`.

No other files touched — `app/layout.tsx`, `components/clay/*`, `tests/e2e/routes.json` are all unchanged and unstaged.

## How the 404 status is produced + verified
`app/not-found.tsx` is a Next.js App Router special file: the framework itself renders it (inside the root layout) and emits a real HTTP 404 status for any unmatched path in production, and it is the same file Next uses for an explicit `notFound()` call (e.g. `app/work/[slug]/page.tsx` on an unknown slug). No manual status-code handling was written or is needed. Verified two ways:
1. `pnpm build` emits `/_not-found` as a static route (`○ /_not-found` in the route table) and `assert-static` (which already treats `/_not-found` as a known internal route) still printed `all routes static (13)`.
2. `tests/e2e/not-found.spec.ts`'s first test navigates to `/nope` and asserts `response.status() === 404` **and** that the page's own `h1` ("This page wandered off.") rendered — i.e. a real 404 with real content, not a blank/framework error page. Green in all 4 viewport projects.

## How chrome is inherited
`not-found.tsx` renders nothing but its own `<Section>`/`<ClayCard>` content — `Header`/`Footer`/`SkipLink`/`AskProvider` all come from `app/layout.tsx` unmodified, because Next mounts `not-found.tsx` as `{children}` inside the root layout for both the catch-all 404 and any `notFound()` call. Verified by a dedicated test (`header and footer chrome are present on the 404 page`) asserting `header`, the primary nav, and `footer` are all visible on `/nope`.

## Copy shipped
- Headline (h1): **"This page wandered off."**
- Supporting line: **"Whatever you were looking for isn't at this address. Here are a few places that are still there."**
- Links: **Back home** (`/`), **See the work** (`/work`), **Get in touch** (`/contact`).

No invented facts — copy is generic wayfinding, not tied to any content claim.

## ALL gate results

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass, 0 errors |
| `pnpm lint` | pass, 0 errors/warnings |
| `pnpm exec vitest run` | pass — **40 test files, 226 tests passed, 1 pre-existing skip** (unrelated `resume-pii.test.ts`); no new unit tests needed (no new data/logic module) |
| `pnpm prebuild` | pass: `content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)` — unchanged |
| `pnpm build` | pass. `/_not-found` emitted (`○ /_not-found`, static); `assert-static` printed `all routes static (13)` |
| `tests/e2e/not-found.spec.ts` (Playwright, `workers:1`, against the production build via `dotenv -e .env.tooling -- playwright test tests/e2e/not-found.spec.ts`) | **12 passed, 0 failed, 12 skipped** (skips are the established viewport-independent pattern). **1 red→green cycle, no OOM/retry**: the first run failed `header and footer chrome are present on the 404 page` — `nav[aria-label='Primary']` resolved to 2 elements (desktop nav + the off-canvas `MobileMenu` dialog nav, both rendered in the DOM), a Playwright strict-mode violation. Fixed by scoping to `.first()`, the same pattern `eval-015.spec.ts` already uses for the identical selector; re-ran green. |
| `pnpm eval --only EVAL-011,EVAL-015 --skip-build` | **0 fail, 0 critical failures, 0 regressions** — `totals: 2 pass · 0 fail · 15 skip · 0 manual (of 17)`. EVAL-011 (dead-control crawler): 219 controls · 209 ok · 10 warn (pre-existing LinkedIn HTTP-429 bot-block, unrelated to this ticket) · **0 dead**. EVAL-015 (VT-off / JS-off graceful degradation): all executed cases green. |

An earlier, unscoped `pnpm test:e2e` invocation (before I corrected the CLI invocation) ran the **entire** e2e suite rather than being filtered to `not-found.spec.ts`; it surfaced the same nav strict-mode failure and, as a side effect, regenerated `docs/screenshots/about/*` and `docs/screenshots/tracer/*` (unrelated routes). Those regenerated screenshots are **left unstaged/uncommitted** per the brief.

## Eval-run artifact
`evals/results/eval-run-0.2.0-11bcc56.json` (left untracked, per the brief). `criticalFailures: []`, `regressions: []`, `failed: 0`.

## Screenshots
`docs/screenshots/not-found/390.png`, `docs/screenshots/not-found/1440.png` — full-page captures of `/nope`, animations disabled.

## Commit
`feat(m006): TKT-46 404 not-found page` — SHA recorded after commit (see `git log` on `m-006-pages`).

## Flags for Tushar's eye (not blocking)
1. **Tone choice (`peach`)** is my own call — distinct from `/contact`'s `lavender` so the 404 doesn't visually read as another content page. Easy one-line change if you'd prefer a different tone.
2. **Copy** ("This page wandered off." / supporting line / button labels) is entirely my own wording per the brief's "your call, on-brand, no invented facts" — flag if you want different phrasing.
3. Several `evals/results/eval-run-*.json` and `m005-qa.json` files are present as untracked in the working tree from other sessions' `pnpm eval` runs; none were touched or staged by this ticket.
