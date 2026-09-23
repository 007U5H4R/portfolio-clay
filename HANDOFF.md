# HANDOFF — Clay Portfolio

Updated 2026-09-23 (avatar TASK-52 shipped; next = A-bis). **Active work: M-008 Visual redesign ("WoW factor") on branch `m-008-visual-wow`.** Project root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/`. Obsidian mirror: `~/Documents/Documents - Tushar's Macbook/Obsidian Vault/Portfolio-clay/`. Auto-memory: `clay-portfolio-build.md`. PWA: Campfire (`campfire`), project `portfolio-clay`, `http://127.0.0.1:6480`. Live redesign preview (auto-builds on push): **https://portfolio-clay-git-m-008-visual-wow-tushar-49a6.vercel.app**.

> Start the next session by reading the global `~/.claude/CLAUDE.md`, this file, `docs/ledger.md` (tail), `decisions.md` (EXE-12/13, DC1–DC7), and the M-008 sections below. Then continue at "NEXT STEPS".

---

## 1. Baseline (done, shipped) — do not redo
- **M-001…M-007 complete and MERGED to `main`** via PR #1 (`m-007-quality → main`, merge commit `22d6f66`). QA-report.md gate = READY WITH ACCEPTED RISKS, **approved by Tushar 2026-09-23**.
- **Repo is now PUBLIC** `github.com/007U5H4R/portfolio-clay` (EXE-13 — flipped to unblock free GitHub Actions after a full-history secret/PII scrub). **CI (`.github/workflows/eval.yml`) is GREEN** — first passing runs ever; four Linux-only bugs were fixed to get there (EXE-12 CI env; `next typegen` in the typecheck script; `.eval/` mkdir in `bundle-budget.test.ts`; an ffmpeg install step for `eval-014`).
- **Vercel project** `portfolio-clay` (`prj_QrQmCfOiPTcaLV81FVekot4t6zsD`, team `team_pLaStAJybzggE3tGD5ioih5M`). **Production is intentionally gated**: the `main` production build fails closed at the PB4 video gate until `public/video/{teachspark,railcite,velora}.mp4` exist — verified (deploy `dpl_AvnVtzCvU1iLEnifnxFoBU8Jq93D` errored exactly there). Production also needs: sanitised résumé (PB5 + CR-003 delivery decision), a custom domain (`NEXT_PUBLIC_SITE_URL` on Production only; no HSTS preload until every subdomain is HTTPS-only), DRAFT-copy sign-off. **All hard-stops remain Tushar's.**
- Stage 11 closeout docs (lesson-learnt.md, Stage-12 handoff) were not finished before the redesign began — optional follow-ups, superseded by this redesign push.

## 2. M-008 Visual redesign — direction (Tushar, 2026-09-23)
Full visual **replacement** of the flat clay design with a distinctive, premium, "WoW" experience, driven by Tushar's 8-panel redesign mockups + the hero-avatar animation spec (`/Users/tushar/Downloads/animation prompt.md`). All 8 screens. Hero avatar = his new 3D portrait made claymorphic (Higgsfield approved). Sequence: "all in one pass", shipped incrementally with the homepage first.

**Campfire:** milestone **m-7 "M-008 Visual redesign - WoW factor"** + 13 tickets **TASK-50…TASK-62** (= TKT-55…TKT-67). In Progress: TASK-50 (design system), TASK-51 (hero), TASK-52 (claymorphic avatar), TASK-53 (animation). Move tickets: `"/Volumes/E Drive/Dev/Code/Claude/PM Tools/backlog-md-fork/scripts/orchestrator/move-ticket.sh" <projectDir> TASK-nn "<status>"`.

## 3. M-008 — what is DONE on `m-008-visual-wow`
Commits: `292e726` (aurora + hero), `ca7a37c` (milestone + tickets), `754a870` (animation system), `d5dc930` (baton + chosen avatar assets), `8694452` (TASK-52 avatar ship). **All pushed to `origin/m-008-visual-wow`** (HEAD `8694452`); every preview build is READY on Vercel. (Correction to a prior baton: the animation system + avatar assets are pushed, not local-only.)

- **Aurora background** (`app/globals.css`): fixed animated gradient-mesh behind all pages using the existing palette via `color-mix` (13-token gate intact); `.glow-halo` utility; reduced-motion freezes both.
- **WoW hero** (`components/hero/Hero.tsx`): badge/pill eyebrow, glow halo around the avatar, bolder composition; LCP avatar image kept `priority`.
- **Hero avatar animation system** (agent-built, commit `754a870`, gates green — typecheck/lint/tokens 0): new `lib/heroMotion.ts` (single `HERO_MOTION` tuning config), `hooks/usePointerParallax.ts` (card-centre-normalised spring parallax; off on reduced-motion/touch), `components/hero/AvatarScene.tsx` (client: staged entrance, layered parallax, ±2° card tilt, idle breathing, icon-tile hover lift/glow, Ask-focus activation), `components/hero/HeroActivationContext.tsx` (Ask-focus↔hero boolean, no-op default), `AvatarStage.tsx` now a thin server wrapper, `AskPortfolio.tsx` focus/blur wired, `app/page.tsx` wrapped in `HeroActivationProvider`, `globals.css` hero keyframes + reduced-motion overrides. Entrance is pure-CSS (LCP-safe, JS-off-safe); no `domAnimation`/`domMax` pulled (bundle-lean, follows the `Parallax.tsx` TKT-49 pattern).
  - **Deferred (impossible with one flat avatar image; cleanly stubbed, NOT faked):** laptop-screen glow, plant-leaf tilt, books emphasize, eye-gaze toward icons, blink, the 4 expressions, true frame-vs-person depth split. All need **separated foreground/background or multi-frame avatar assets**. The `hovered`/`askActive` state is already wired to the extension seam in `AvatarScene`'s `ClayFrame`.

## 4. M-008 — the AVATAR (chosen, needs one cleanup step)
- **Tushar chose Option 2** — a glossy, well-lit claymorphic portrait (bright key + rim light, shiny skin, catchlights), generated from his 3D portrait via Higgsfield `gpt_image_2_5`.
- **Assets saved (durable) at `content/media/avatar/redesign-v2/`:** `avatar-cutout-v2.png` (1792×2240 RGBA, background removed — THE chosen asset), `avatar-clay-v2-raw.png` (pre-cutout), `avatar-source-portrait.png` (the input 3D portrait).
- **KNOWN ISSUE:** the cutout has a **dark edge halo** (the render's dark backdrop bled at the alpha edge during background removal). Clean it before going live.

## 5. NEXT STEPS (in order)

**✅ A. DONE 2026-09-23 — new avatar shipped (TASK-52, commit `8694452`, pushed, preview verified).** Old scene cutout backed up → `content/media/avatar/avatar-cutout-v1-scene.png`; v2 cutout swapped in; `media:avatar --erode 3` killed the dark hair halo; `public/avatar/*` regenerated (avatar.webp 147 kB); `site.avatarAlt` + `AvatarScene` dims (1440×1800) + `about.spec.ts` (single-source alt) updated. Gate green (typecheck/lint/tokens 0/0/13, build all-static). Framing verified 390/768/1024/1440; **new bust confirmed live on the Vercel preview** (avif w=520). See ledger "M-008 · TASK-52" incl. the dev-AVIF-cache scar (verify avatars against a prod build / the preview, NOT `next dev`). **NEXT = A-bis.**

<details><summary>A. (original instructions, now complete)</summary>

**A. Finish + ship the new avatar (TASK-52; finalises TASK-50/51).**
   1. Clean the halo. `scripts/avatar.ts` (`pnpm media:avatar`) reads `content/media/avatar/avatar-cutout.png` → writes `public/avatar/{avatar.webp, avatar@2x.webp, avatar-poster.webp, avatar-blur.txt}`, and supports `--erode <px>` to shrink the alpha matte and kill an edge halo. So: back up the current `content/media/avatar/avatar-cutout.png` (→ `avatar-cutout-v1-scene.png`), copy `redesign-v2/avatar-cutout-v2.png` → `content/media/avatar/avatar-cutout.png`, run `pnpm media:avatar --erode 3` (raise erode until the dark rim is gone; inspect the PNG). If erode can't fully fix it, regenerate the clay avatar in Higgsfield with `background: opaque` on a light bg, then `remove_background`.
   2. `AvatarScene.tsx` renders `/avatar/avatar.webp` `object-cover` top-aligned in the 4:5 hero frame — the new bust should frame head+shoulders; verify at 390/768/1024/1440. Update `site.avatarAlt` (`lib/site.ts`).
   3. Verify `pnpm typecheck && pnpm lint && pnpm exec tsx scripts/tokens-check.ts` (all 0); screenshot the hero (dev server + `pnpm exec playwright screenshot --viewport-size=1440,2400 http://127.0.0.1:PORT/ out.png`, `PLAYWRIGHT_BROWSERS_PATH=/Volumes/E Drive/Dev/.cache/ms-playwright`). Commit + **push** `m-008-visual-wow`; confirm the preview.

</details>

**A-bis. Avatar pose + expression set (TASK-63 / TKT-68) — Tushar-requested 2026-09-23, do right after the cleanup.** Once the clean base avatar exists, generate a CONSISTENT set of claymorphic variants from it (use the chosen avatar as the `image_references` base so face/lighting/style match): **expressions** — default/friendly, thinking (eyes up), smile (on success), surprised (on discovery); and **gaze/lean poses** — looking toward laptop / book / plant, and an ask-focus lean-in. Background-remove + optimize each to webp, save under `public/avatar/` (e.g. `avatar-thinking.webp`, `avatar-smile.webp`, `avatar-gaze-laptop.webp`, …) with sources in `content/media/avatar/redesign-v2/`. Then **wire the deferred `AvatarScene` states** (section 3) to swap these on icon hover (gaze) and Ask-focus (lean/expression) and idle blink — the `hovered`/`askActive` state is already plumbed to the extension seam. Keep it subtle (spec: "alive, not animated"); reduced-motion shows only the static default.

**B. Redesign the remaining screens to the mockups (TASK-54…59, 61).** Homepage Featured Work as product scenes (mockup 2), How-I-Think interactive journey path (mockup 3), About editorial opening + visual product-journey timeline (mockups 4–5), Work editorial numbered layout (mockup 6), Case study cinematic beats (mockup 7), Contact personal scene (mockup 8), then Thinking/Playground/404 restyle. Prefer real interactive UI for "product scenes" over generated images; use Higgsfield only for clay props (TASK-60).

**C. Redesign QA (TASK-62).** Re-run EVAL-006/007/008/010 (a11y/keyboard/reduced-motion/responsive), tokens 13/13, typecheck/lint/build, re-measure bundle/LCP (redesign will grow the bundle — accepted, but measure), update `Design.md` + `decisions.md`. This milestone reopens the design/QA gates (full replacement).

## 6. Frontend map (key rendering paths)
Tailwind v4 (tokens in `app/globals.css` `@theme`, no config file); motion via `motion/react` + `lib/motion.ts` (`springs`, `easings`, `useReducedMotionSafe`, `usePointerFine`, `LazyMotionRoot`). Screens: Home `app/page.tsx` (Hero → Ask section → `FeaturedWork` → `HowIThink` → `FinalCTA`); About `app/about/page.tsx` (`AboutHero`→`ProductJourney`→`CapabilityClusters`→`Impact`→`ExperienceTimeline`→`Awards`/`Research`/`Education`); Work `app/work/page.tsx` (`WorkHero`+`FilterTabs`+`WorkGrid`/`EditorialGrid`+`ExperienceStrip`); Case study `app/work/[slug]/page.tsx` (`CaseStudyHeader`→`OverviewToggle`→chapters→`NextProject`); Contact `app/contact/page.tsx` (`ContactCard`); Thinking `app/thinking/*`; Playground `app/playground/*`; 404 `app/not-found.tsx`. Clay primitives in `components/clay/*`; content in typed `data/*.ts` (zod-validated at build via `data/index.ts` `validateAll()`).

## 7. Guardrails (enforce every step)
13 colour-token gate (`pnpm tokens:check` = 13/13; no new `--color-*` — use `color-mix`) · content-truth + **never publish PII** (no new email/phone/address/DOB; real contact = email/LinkedIn/phone per EXE-8; the mockups' gmail/city are NOT to be used) · reduced-motion + touch fallbacks · keep the avatar LCP `priority` · don't break the build · commit attribution `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` · the cinematic site + `portfolio/index.html` are untouchable · footer = "Built with curiosity."

## 8. Tooling notes
- **Higgsfield** (balance ~270 credits, Pro): for an ON-DISK image use `media_upload` → `curl -X PUT --data-binary @file '<upload_url>'` → `media_confirm` → `generate_image`. No widget for on-disk files (the widget is only for chat attachments). Model `gpt_image_2_5`, media role `image_references`, aspect `4:5`; `background:transparent` renders on a dark backdrop → follow with `remove_background`. **Recraft MCP disconnected** this session — retry if needed.
- **GateGuard hook** fires a "Fact-Forcing Gate" before each file's first Edit/Write and before destructive Bash — satisfy with a one-line importers/API/data/instruction note, then retry. Consider `GATEGUARD_EXEMPT_GLOBS` / `ECC_GATEGUARD=off` for many edits.
- Dev server on a free port; machine resource-contended (Playwright `workers:1`).

## 9. Persistence
Keep `docs/ledger.md`, the Obsidian vault, and `MEMORY.md`/`memory/clay-portfolio-build.md` in sync (Obsidian wins on conflict). This HANDOFF is the baton — rewrite it in place at each stage boundary.
