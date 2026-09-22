# Deploy runbook (TKT-50)

Turnkey steps for taking `portfolio-clay` from a local repo to a live Vercel deployment, plus the
rollback path. **Nothing in this document has been executed by the implementer** — the GitHub
repo, the Vercel project, and every deploy are Tushar's account-scoped, irreversible actions
(TKT-50 hard-stop). Everything below is what makes that turnkey once he runs it.

## 0. Prerequisites (already true today)

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass locally.
- `pnpm predeploy` (`scripts/predeploy-check.ts`, wired into `prebuild`) passes in the current
  state: no `public/resume.pdf`, no `public/video/*.mp4`, `site.resumeAvailable === false`,
  `VERCEL_ENV` unset — every non-production check is a no-op and the forbidden-strings scan is
  clean.
- Security headers (`next.config.ts` `headers()`, TP9) and Vercel Analytics/Speed Insights
  (`app/layout.tsx`) are wired and verified locally (§3 below).
- `pnpm audit --audit-level high` exits 0 (2 accepted `extract-zip` highs, EXE-2 — see
  `docs/reports/TKT-50.md`).

## 1. Create the GitHub repo (Tushar)

```bash
cd "/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay"
gh repo create 007U5H4R/portfolio-clay --private --source=. --remote=origin
git push -u origin m-007-quality   # or main, once this branch is merged
```

(`technical-plan.md` A10 names `007U5H4R/portfolio-clay` as the target repo — confirm the account/org
scope before creating it.)

## 2. Create/link the Vercel project (Tushar)

Either the Vercel MCP tool or the CLI works; both are account-scoped actions the implementer does
not perform.

**Via Vercel MCP** (`create_git_project`): point it at the pushed GitHub repo, framework preset
`Next.js`, root directory `/` (this is the repo root, not a monorepo subpackage).

**Via CLI**, once the GitHub remote exists:
```bash
npx vercel link       # confirms the team/project scope interactively — do not skip this prompt
npx vercel git connect
```

## 3. Environment variables

Set on the **Production** environment only (Preview intentionally uses the `VERCEL_URL` fallback —
see `lib/seo.ts` and TKT-06's env chain; do not set `NEXT_PUBLIC_SITE_URL` on Preview or every
preview's OG/canonical URLs will wrongly point at production):

```bash
npx vercel env add NEXT_PUBLIC_SITE_URL production
# value: https://<the production domain from TKT-53>
```

No other environment variables are required for this slice — Analytics/Speed Insights need no
config (`<Analytics/>` / `<SpeedInsights/>` auto-detect the Vercel platform at runtime).

## 4. Deploy a preview

```bash
npx vercel                     # preview deploy; prints the preview URL
```

On Vercel the build command comes from the committed **`vercel.json`** (`pnpm run prebuild &&
next build && pnpm exec tsx scripts/assert-static.ts`) — **not** from the `pnpm build` script.
That is deliberate (CR-001, Stage 9): `pnpm build` wraps `next build` in `dotenv -e .env.tooling`,
and `.env.tooling` hard-codes this machine's E-Drive paths (`TMPDIR`, `PLAYWRIGHT_BROWSERS_PATH`)
plus a placeholder `NEXT_PUBLIC_SITE_URL` — none of which exist / are correct on Vercel's Linux
builder (the first real deploy proved it). Keep `vercel.json` and the `build` script's gate chain in
sync whenever the chain changes. The chain itself is identical, in order: `prebuild`
(`predeploy-check.ts` → `validate-content.ts`) → `next build` → `assert-static.ts`. A preview
deploy has `VERCEL_ENV=preview`, so the featured-video check (PB4) is a no-op even though
`public/video/*.mp4` aren't committed yet — this is intentional, not a bug. Preview OG/canonical
URLs self-reference via `VERCEL_URL`: `lib/seo.ts` uses the production host only when
`VERCEL_ENV=production` (CR-002 — before that fix every preview's `og:image` pointed at a
production host that 404s until the first production deploy exists).

## 5. Preview-only checks (deferred — cannot run without a live URL)

These are turnkey commands to run **once a preview URL exists**; do not fake their results.

| Check | Command | What it proves |
|---|---|---|
| Security headers | `pnpm exec tsx scripts/security-headers.ts --base-url <preview-url>` (or `curl -sI <preview-url>/`) | The TP9 header set (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options) is actually served by Vercel's edge, not just locally by `next start`. |
| Deployed-bundle PII/forbidden-string scan | `pnpm exec tsx scripts/forbidden-strings.ts --bundle` run against a checkout of the deployed commit after `next build` | No forbidden string reached the shipped `.next` bundle (EVAL-016). |
| Three featured videos play | Manually load `<preview-url>/work/{teachspark,railcite,velora}` and confirm the `DemoVideo` component plays (or shows the documented `no-video` state if TKT-22–27 haven't landed yet) | The production video gate (PB4) isn't masking a broken player. |
| Full eval suite against the preview | `pnpm eval --base-url <preview-url> --label eval-run-preview-<sha>` | Runs axe/Playwright/header checks against the real deployed origin (Lighthouse is skipped under `--base-url`, per `docs/eval.md`); writes `evals/results/eval-run-preview-<sha>.json`. |
| Vercel Analytics / Speed Insights actually report | Open the Vercel dashboard → Analytics / Speed Insights tabs a few minutes after visiting the preview | Confirms the components aren't just no-op-safe locally but genuinely wired once served by Vercel. |

## 6. Promote to production

Once the preview passes §5 and Tushar approves:
```bash
npx vercel --prod
```
This is the first run where `VERCEL_ENV === "production"`, so `predeploy-check.ts`'s PB4 video
gate becomes live — the build **fails** if `public/video/{teachspark,railcite,velora}.mp4` are
missing or any exceeds 4 MB (TKT-22–27 must land first), and PB5 requires `public/resume.pdf` to
pass its PII gate before `site.resumeAvailable` is flipped to `true` (TKT-08). This is deliberate:
production is the one environment that must never ship a placeholder as if it were real content.

## 7. Rollback path

Every route is static (TP1) — there is no data-migration surface, so rollback is atomic:

- **Vercel dashboard:** Deployments → select the previous good production deployment → **Promote
  to Production** ("Instant Rollback").
- **CLI:** `npx vercel rollback <deployment-url-or-id>`.
- **Code:** the bad commit is reverted via a normal PR into `main` — worktrees mean `main` is
  never edited in place (`technical-plan.md` A10/A15).

Rollback has no separate testing step: because `predeploy-check.ts` already blocked a bad build
from reaching this deployment slot, "instant rollback" restores the last build that passed every
gate in this document.

## 8. Content/media gate (Tushar-supplied, not code)

`public/resume.pdf` and the three featured `public/video/*.mp4` files are **Tushar-supplied**
inputs, not code. Until they exist:
- Preview deploys work today (PB4/PB5 only bite at `VERCEL_ENV=production`).
- Production deploys will fail closed at `pnpm predeploy` until the videos are committed (≤4 MB
  each, TKT-22–27) and the sanitised resume passes `tests/unit/resume-pii.test.ts` (TKT-08) and
  `site.resumeAvailable` is flipped to `true`. This is the intended gate, not a bug to route around.
