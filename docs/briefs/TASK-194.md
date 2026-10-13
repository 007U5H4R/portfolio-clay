# TASK-194 brief: Mixpanel analytics for tusharpathak.com (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one will answer questions during the run, so make the call that best serves his spec and record each call in your report.

## 1. Setup
- **Repo:** https://github.com/007U5H4R/portfolio-clay, branch `m013/mixpanel`. The branch is `main` (production) plus this brief and the spec.
- **Stack:** Next.js 16, Tailwind v4, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** in every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Before the final push:** `git fetch origin && git merge origin/main`. Other branches are in flight that change many components (interaction phases, header, About, carousel). Keep your component edits minimal: one tracking call per interaction, so merges stay easy.

## 2. Read first
- `docs/specs/TASK-194-mixpanel-spec.md`: Tushar's full spec, verbatim. It is the source of truth.
- `Design.md`, `decisions.md`, `evals/eval-cases.json`.
- `next.config.*`: the **CSP is strict**, so Mixpanel's script and API hosts must be allowed explicitly and nothing else.
- `app/layout.tsx`, the Ask Tushky components (`components/ai/`), the project carousel/media player, the contact and résumé CTAs, `components/lab/` (Gummy Lab), and the theme toggle.

## 3. Facts that settle the spec
1. **The token is not available yet.** Read it from `NEXT_PUBLIC_MIXPANEL_TOKEN`. With no token, analytics must be a complete no-op: no script loaded, no network calls, no errors. Tushar adds the token in Vercel afterwards. Document exactly which env vars to set, for which environments (Production only, or also Preview).
2. **Privacy first** (spec §2+):
   - no PII;
   - no free-text from Ask Tushky questions unless the spec explicitly allows a sanitised form; prefer a category or intent, or the FAQ id that matched;
   - respect Do Not Track / GPC where the spec asks;
   - no session replay unless the spec requires it, and then off by default;
   - IP and geo handling as the spec says.
3. **Performance is a hard gate:**
   - load Mixpanel lazily, after hydration or idle, never on the LCP path;
   - no added main-thread work on scroll;
   - the first-load JS budget test (`pnpm eval` / bundle scans) must still pass;
   - report the size delta.
4. **One tracking module:** a typed `lib/analytics/` with an event catalogue (names plus property schemas) that unit tests validate. Components call `track(EventName, props)`, never the SDK directly.
5. **Dev and preview:** don't send events from localhost or Preview unless an explicit `NEXT_PUBLIC_ANALYTICS_ENV` allows it. Document this.

## 4. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, `ALLOW_DEV_ROUTES=1 pnpm build`, then the full `pnpm test`.
- The **full** `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` at all 4 widths. Re-run any failure alone with `--workers=1` and explain every one that remains. Known pre-existing failures: EVAL-008 `/dev/artifacts` (TASK-178), EVAL-033 (TASK-173), and EVAL-039 flaky (TASK-191).
- **New tests:**
  - unit: the event catalogue schema, the no-op without a token, DNT/GPC behaviour, and the property sanitisation, with no PII;
  - e2e: with a stubbed token and network route interception, the key conversions fire once with the right properties (résumé, LinkedIn, email, project video play, Ask Tushky answer, Gummy Lab discovery); without a token, zero requests to Mixpanel hosts;
  - the CSP still blocks every other third-party host.
- **Docs:** `docs/analytics.md` covering:
  - the event dictionary;
  - the funnels and reports Tushar should build in Mixpanel to answer the spec's 10 questions;
  - setup steps for the token and Vercel env vars;
  - the privacy notes.

## 5. Commits, push, report
- **Commits:** imperative subjects that include TASK-194. **No AI attribution** of any kind: no `Co-Authored-By`, no "Generated with", no session links.
- **Push:** push only `m013/mixpanel`. Never touch `main` or `m-009-redesign`, never deploy, and don't edit `backlog/`.
- **Report:** commit `docs/reports/TASK-194.md` last. Include what changed, the event list, the judgement calls, the gate counts, the bundle delta, and the setup steps Tushar must do (the token).
