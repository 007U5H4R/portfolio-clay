# TKT-50 report — Security headers + Analytics + pre-deploy guard (code-only slice)

**Status:** All 5 scope items done, gates green, no deploy/remote/Vercel action taken (hard-stop
respected). Branch `m-007-quality`.

## 1. Security headers (`next.config.ts`, decision TP9)

`async headers()` returns the following set for `/(.*)`  (verified live via `curl -sI` and
`scripts/security-headers.ts --base-url` against `pnpm build && pnpm start` — see §6):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
```

**`'unsafe-inline'` kept on `script-src` and `style-src`, why:** the site is fully static (TP1 —
no SSR, no middleware, no per-request rendering), so a per-request nonce isn't available. Next
emits inline `self.__next_f.push(...)` RSC-hydration bootstrap scripts on every page (confirmed in
the built HTML) and some inlined critical CSS; without `'unsafe-inline'` the page would not
hydrate. There are zero third-party scripts besides Analytics/Speed Insights, and no user input is
ever rendered as HTML (the Ask field renders answers from data, never the raw query — `lib/ask/*`),
so the residual XSS surface is minimal. This matches TP9's own stated tradeoff.

**Analytics/Speed Insights hosts — verified against the installed packages, not assumed** (read
`node_modules/@vercel/{analytics,speed-insights}/dist/index.js` directly): in production/preview
(the only modes these components activate outside `next dev`), both the script tag and the
event/vitals beacon resolve to same-origin paths proxied by the Vercel edge —
`/_vercel/insights/script.js` + `/_vercel/insights`, and `/_vercel/speed-insights/script.js` +
`/_vercel/speed-insights/vitals`. So `connect-src 'self'` already covers them and **no
`*.vercel-insights.com` entry was needed** — this is a v2 architecture change from TP9's original
illustrative example, which assumed the pre-v2 direct-to-`vercel-insights.com` posting model.
`va.vercel-scripts.com` is used only by their local-dev debug script (`next dev`, not `next start`)
and is allowlisted on `script-src` for that case even though the production build never exercises
it.

Also added `X-Frame-Options: DENY` and `frame-ancestors 'none'` per TP9's exact spec.

## 2. Analytics wiring (`app/layout.tsx`)

`<Analytics/>` and `<SpeedInsights/>` (from `@vercel/analytics/next` / `@vercel/speed-insights/next`)
added inside `<body>`, after `<Footer/>`. Both packages were already in `package.json`.

**Static-route confirmation:** `pnpm build` → `scripts/assert-static.ts` → `all routes static (13)`
— identical route count/behavior to before the change. The components are client-side, mount
post-hydration, and add no server-side data dependency, so they cannot force a route dynamic.

**Local no-op confirmation:** loaded `/`, `/work`, `/work/teachspark` in a real browser tab against
`pnpm start`; console showed only the documented "Vercel Web Analytics: Failed to load script...
Be sure to enable Web Analytics for your project" / "Vercel Speed Insights: Failed to load
script... check content blockers" notices (expected off-Vercel — these are `console.log`, not
errors) and **zero CSP violations**.

## 3. Pre-deploy guard (`scripts/predeploy-check.ts`)

Pure, exported check functions + a CLI `main()` (same pattern as `forbidden-strings.ts` /
`validate-content.ts`), wired as the first step of `prebuild` (confirmed empirically that pnpm 11
auto-runs `prebuild` before `build` — see the process note below) and as the standalone `predeploy`
script (`package.json`: `"prebuild": "tsx scripts/predeploy-check.ts && tsx scripts/validate-content.ts"`,
`"predeploy": "tsx scripts/predeploy-check.ts"`).

Failure modes, each proven to fire in `tests/unit/predeploy.test.ts` (18 cases, all green):

| # | Failure mode | Test(s) proving it fires |
|---|---|---|
| 1 | `resume.pdf` present but its PII scan fails (DOB / phone / street-address pattern, or `pdftotext` missing/non-zero-exit → **fail closed**) | `scanResumePii`: 6 cases — binary missing, non-zero exit, DOB, phone, street-address, clean-pass; `checkResume`: "resume.pdf exists but its PII scan fails" |
| 2 | `resumeAvailable === true` without a backing PDF | `checkResume`: "resumeAvailable is true but no resume.pdf exists" |
| 3 | Featured video missing or >4 MB — **only** when `VERCEL_ENV === "production"` (PB4) | `checkFeaturedVideos`: non-production no-op even with all 3 missing; production + missing (3 issues); production + oversized; production + clean pass |
| 4 | Forbidden string hit (delegates to `scripts/forbidden-strings.ts`'s `scan()`) | `checkForbiddenStrings`: clean tree passes, planted `PMP` string caught |

Plus an integration case: `runPredeployChecks({ cwd: process.cwd() })` against the **real repo's
current state passes with 0 issues** (no `resume.pdf`, no videos, `resumeAvailable: false`,
non-production) — matches the brief's stated expectation exactly.

The PII patterns (`DOB_PATTERN`/`PHONE_PATTERN`/`STREET_ADDRESS_PATTERN`) intentionally mirror
`tests/unit/resume-pii.test.ts` / technical-plan.md TKT-08 S08r.01, duplicated rather than shared
because this file is imported at build time and must not depend on anything under `tests/**`.
`resumeAvailable` and the PII scanner are dependency-injectable (`CheckResumeOptions`) purely for
test isolation — production callers (`runPredeployChecks`) use the real `site.resumeAvailable` and
the real `pdftotext`-backed `scanResumePii`.

**Process note (worth recording):** confirmed empirically, not assumed, that pnpm 11.25.0 *does*
auto-run `prebuild` before `build` here (temporarily swapped both scripts for `echo` sentinels,
ran `pnpm run build`, saw both fire in order, then restored `package.json` to its exact original
content via the tracked-file diff — `git diff --stat package.json` was clean before the real edit).
This mattered because pnpm has disabled auto pre/post-install hooks by default in recent majors,
and it was not safe to assume the same applies to a project's own `pre<script>` script names.

## 4. `pnpm audit --audit-level high`

Exit code **0**. Full `pnpm audit` (no level filter) shows:
- **2 high** — both the accepted `extract-zip` advisories (`GHSA-jmr9-qjv8-65gv`,
  `GHSA-7pqw-9j4j-h8q3`) already allowlisted via `auditConfig.ignoreGhsas` in
  `pnpm-workspace.yaml`, matching decision **EXE-2**. (Note: the brief's text located this config
  in `package.json`; it actually lives in `pnpm-workspace.yaml` — confirmed by inspection.)
- **1 moderate — NEW, not previously in `decisions.md`:** `uuid` (`GHSA-w5hq-g745-h8pq`, "missing
  buffer bounds check in v3/v5/v6 when `buf` is provided"), reached via `.>@lhci/cli>uuid`,
  patched at `>=11.1.1`. Dev-only Lighthouse CI tooling, never in the shipped bundle, and moderate
  severity does not gate `--audit-level high` — **flagging per the "report, don't silently ignore"
  rule rather than acting on it**, since adding a new accepted-risk decision entry is outside this
  ticket's stated scope (next touch of `@lhci/cli`/decisions.md should pick this up).

**0 high/critical beyond the accepted EXE-2 risk — gate passes.**

## 5. `docs/deploy.md`

Turnkey runbook covering: GitHub repo creation, Vercel project link (MCP `create_git_project` or
`npx vercel link`), `NEXT_PUBLIC_SITE_URL` (production-only, per the existing TKT-06 fallback
chain in `lib/seo.ts`), preview deploy, promotion to production (where PB4/PB5 become live), and
the Vercel "Instant Rollback" / `vercel rollback` path.

**Preview-only checks deferred (written as exact commands, not faked):**
1. `pnpm exec tsx scripts/security-headers.ts --base-url <preview-url>` (or `curl -sI`) — header
   presence on the real deployed origin.
2. `pnpm exec tsx scripts/forbidden-strings.ts --bundle` against the deployed build output — PII
   never reached the shipped bundle.
3. Manually load the 3 featured-video work pages on the preview and confirm playback.
4. `pnpm eval --base-url <preview-url> --label eval-run-preview-<sha>` — full suite against the
   live origin.
5. Vercel dashboard Analytics/Speed Insights tabs, a few minutes after visiting the preview.

## 6. Local CSP-violation check

`pnpm build && pnpm start`, loaded `/`, `/work`, `/work/teachspark` in a real Chrome tab
(`claude-in-chrome`), read console + network:
- **0 CSP violations** on any route.
- Confirmed via `curl -sI http://127.0.0.1:3000/` that all 6 TP9 headers are present.
- Confirmed via the repo's own `scripts/security-headers.ts --base-url http://127.0.0.1:3000` →
  `present: content-security-policy, strict-transport-security, x-content-type-options,
  referrer-policy, permissions-policy, x-frame-options` — exit 0.
- Server was reaped after each check (`lsof -ti tcp:3000 | xargs kill`; confirmed port free).

## 7. Gate status

| Gate | Result |
|---|---|
| `pnpm typecheck` | PASS (0 errors) |
| `pnpm lint` | PASS (0 errors/warnings) |
| `pnpm test` | PASS — 298 passed, 2 skipped (43 files); predeploy.test.ts: 18/18 |
| `pnpm build` | PASS — `all routes static (13)`; `prebuild` chain ran `predeploy-check.ts` → `predeploy OK`, then `validate-content.ts` → `content OK` |
| `pnpm audit --audit-level high` | PASS (exit 0) — see §4 |
| Local CSP check | PASS — 0 violations |

## 8. Files changed + commit SHAs (branch `m-007-quality`)

| Commit | Files |
|---|---|
| `f71379e` | `next.config.ts` (TP9 security headers) |
| `f0d78d4` | `app/layout.tsx` (Analytics + Speed Insights wiring) |
| `665dbe7` | `scripts/predeploy-check.ts`, `tests/unit/predeploy.test.ts`, `package.json` (prebuild/predeploy wiring) |
| `1aa54cd` | `docs/deploy.md`, `docs/briefs/TKT-50.md` |
| *(this commit)* | `docs/reports/TKT-50.md` |

## 9. Confirmation — no deploy/remote/Vercel action taken

- No `git remote add` / no GitHub repo created or pushed.
- No Vercel project created or linked; `vercel` / `npx vercel` was never invoked.
- No domain purchased.
- No preview or production deploy triggered.
- All verification ran against a **local** `pnpm start` on `127.0.0.1:3000`, reaped after each
  check. Everything in `docs/deploy.md` is written as commands for Tushar (or a future session) to
  run — none were executed here.
