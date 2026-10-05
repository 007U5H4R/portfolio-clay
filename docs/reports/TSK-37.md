# TSK-37 report — hero section + `HeroClip` (TP13) + `eval-019.spec.ts` + EVAL-019 un-deferred

**Ticket:** TSK-37 (`TASK-68.2`) · parent TKT-73 (`TASK-68`) · M-009 · Task · P0 · sp:3
**Branch:** `m-009-redesign` (verified before work; never `main`; not pushed)
**Model:** Fable 5.1 (most-capable tier)

## 1. Files

| Path | Change |
|---|---|
| `components/hero/HeroClip.tsx` | new — `"use client"`; TP13 state machine `idle → poster \| video`; one mount effect reads `prefers-reduced-motion`, `(hover: none), (pointer: coarse)`, `navigator.connection?.saveData` once; video mode mounts `<video autoplay muted playsinline preload="metadata" poster aria-hidden tabindex="-1" data-hero-clip>` with webm → mp4 sources, no `loop`/`controls`; a second effect calls `play()` once and unmounts on rejection; `onError` unmounts; `ended` untouched. File-scoped ESLint `no-restricted-syntax` **configuration comment** (see §7) |
| `components/hero/Hero.tsx` | rewritten — server component; `<section class="hero" aria-labelledby="hero-h">` → `Container.hero-wrap` grid; eyebrow / h1 / support from `data/hero.ts` (no data edit); last three h1 words in `.underline-host` + `<Sketch variant="underline"/>`; `<Annotation size="hero" rotate={-1.5}>` hand-sub; CTAs `View my work →` (`next/link` → `/work`, `Hand kind="cta"`) and `Ask my portfolio` (magnifier glyph → `#ask`); `<figure class="hero-scene" data-illustration="hero-desk">` → `.frame` → `next/image` poster (`preload`, `fetchPriority="high"`, `loading="eager"`, `sizes="(min-width: 1024px) 58vw, 100vw"`, 1280×684, alt from `illustration("hero-desk")`) + `<HeroClip poster webm mp4/>` → `<Annotation as="figcaption" size="sm">`. Old `AvatarStage`/`FloatingTiles`/`ClayButton`/hero `Annotation` imports dropped (files stay for TSK-38) |
| `app/globals.css` | `/* TSK-37 · hero */` block appended (`@layer components`): §5.1 grid + paddings, h1 size/axes, underline placement (mockup `.hero h1 .ul`), hand-sub offset, support hidden < 768, CTA pills (mockup `.btn*`, ≥ 44 px, `color-mix` shadows), `.frame` 1280/684 with the poster and clip absolutely stacked under one cream mask, caption placement, reduced-motion transitions off. Tokens / `color-mix` / derived vars only |
| `tests/unit/hero-clip.test.tsx` | new — jsdom: SSR renders `""`; default mode attribute set (incl. `muted` attribute + property, no `loop`), sources order, `play()` once; a re-render with flipped signals never remounts/replays; reduced-motion / coarse / Save-Data → no `<video>`, `play()` never called; `play()` rejected → unmounted; `error` event → unmounted; source grep for the TC-141 step-6 list (comments stripped) |
| `tests/e2e/eval-019.spec.ts` | new — tag `@EVAL-019`; the matrix (§3), SSR check, caps; measured values pushed as `eval-019` annotations |
| `tests/e2e/fixtures.ts` | `saveData` fixture (`context.addInitScript` → `navigator.connection = { saveData: true }`) |
| `tests/e2e/home.spec.ts` | hero assertions updated: mobile order is h1 → `View my work →` → poster (alt from the manifest) → …; `site.avatarAlt` / `View My Work →` gone from the hero checks. No spec deleted |
| `scripts/eval-cases.ts` | `DEFERRED_SPECS` → `{}` (EVAL-018 left at TSK-35; EVAL-019 leaves here) |
| `docs/eval.md` | EVAL-019 section (modes table, thresholds, static guards, commands); Playwright layer row lists 019 |
| `docs/screenshots/m-009/tracer/hero-end-1440.png` | held last frame (667×357, the `.frame` element at w1440) |

`app/page.tsx` untouched (hero import unchanged; `HeroActivationProvider` stays until TSK-38). `data/hero.ts` untouched (`tiles` stay in data, unused).

## 2. SSR greps (`pnpm build && pnpm start`, `curl -s http://127.0.0.1:3000`)

| Gate | Result |
|---|---|
| `grep -c '<video'` | **0** |
| poster `img` with `fetchpriority="high"` + `hero-poster` | **1** — note React 19's server renderer emits the prop as written, **`fetchPriority="high"`** (camelCase), so the literal lowercase S73.06 grep returns 0; `grep -ci` returns 1, and in the parsed DOM `img.getAttribute("fetchpriority") === "high"` and `img.fetchPriority === "high"` (asserted in the spec). Also `loading="eager" width="1280" height="684" decoding="async" sizes="(min-width: 1024px) 58vw, 100vw"` + a 9-entry `srcSet` via the Next optimizer |
| `grep -c 'Illustration of Tushar at a warm desk'` | **1** (lines). Raw occurrences = 2: one in the `<img alt>`, one inside the inline RSC flight `<script>` payload (every prop string is repeated there). Outside `<script>` blocks the alt occurs exactly once — that is what the spec asserts |
| `[data-decor]` inside `section.hero` | `sketch, annotation, annotation` = **3** |
| CTAs | `a[href="/work"]` "View my work →" and `a[href="#ask"]` "Ask my portfolio" present |
| `pnpm build` | `all routes static (13)` |

## 3. EVAL-019 matrix — `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-019.spec.ts`

**9 passed · 5 skipped (by design) · 0 failed** (28.5 s). Skips are the mode/width cells that do not exist (default and play()-rejected at w390 — w390 *is* the touch mode; touch at w1440 — fine pointer; SSR and caps run once).

| Mode | w390 | w1440 |
|---|---|---|
| default | n/a (w390 = touch project) | **PASS** — `video[data-hero-clip]` with `autoplay muted playsinline preload="metadata" poster="/media/illustrations/hero-poster.webp" aria-hidden="true" tabindex="-1"`, `loop` and `controls` absent, `video.loop === false`, `video.muted === true`, sources `[hero-animation.webm video/webm], [hero-animation.mp4 video/mp4]` |
| `ended` | — | **3200 ms** (run 1) · **2937 ms** (run 2) · **~3.1 s** in the harness run — all ≤ 4000 ms, measured in-page with `performance.now()` from navigation start on the `ended` event |
| 0 restarts | — | 13 samples over 3 s (wheel +600, dispatched `visibilitychange`, dispatched `resize`, wheel −600): `2.500` × 13 — never decreases; after 3 s `{"paused":true,"ended":true,"loop":false,"duration":2.5}`; still exactly 1 `<video>` |
| reduced motion (`test.use({ reducedMotion: "reduce" })`) | **PASS** — 0 `<video>` | **PASS** — 0 `<video>` |
| touch / coarse (w390 project `hasTouch`+`isMobile`) | **PASS** — 0 `<video>` | n/a |
| Save-Data (`saveData` fixture; stub verified on the document) | **PASS** — 0 `<video>` | **PASS** — 0 `<video>` |
| play() rejected (`HTMLMediaElement.prototype.play` → `NotAllowedError`) | n/a | **PASS** — 0 `<video>` after settle, poster visible |
| SSR (`request.get("/")`) | once | **PASS** — 0 `<video`, 1 poster `<img>` with `fetchpriority="high"` (ci), `loading="eager"`, 1280×684, `sizes`, alt byte-equal; live DOM `fetchpriority`/`fetchPriority` = high |
| caps | once | **PASS** — webm 175 761 ≤ 204 800 · mp4 312 137 ≤ 358 400 · poster 86 800 ≤ 122 880 |

Poster-only modes measure "after hydration" as `load` + 2 s settle (TC-140 steps 2–4); the default-mode cell shows hydration + clip *ended* well inside that window.

**Unit:** `pnpm test -- hero-clip` → 9/9 passed (part of the full run below).

## 4. Held-frame comparison (TC-141 step 4)

`docs/screenshots/m-009/tracer/hero-end-1440.png` (the `.frame` element, 667×357) vs
`/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/animation/export/hero-end.webp` (1280×684), both read as images:
same composition and pose — Tushar with his hand on his chin looking up-left, pen in the other hand;
the pinned "Problem → Insight → Bet → Build → Evaluate → Impact" list with "The journey. I enjoy." arrow
at the left, the mountain photo "Bigger horizons", the "Curiosity, compounds." note, the "Currently:"
checklist, the green lamp, the "Better products. Kinder systems." wall text, the laptop "Good Products
Brighter People", the mug "Same Curiosity. Bigger Problems.", the book stack, plants, and the
sleeping golden retriever at bottom-right. Differences are exactly the design's: the cream `mask-image`
fades the left 5–15 % and the bottom 12 % (the leftmost book spines and the very bottom of the desk
soften into paper), and the frame is 667 px wide (58 fr at 1440) so fine text is smaller. No frame
mismatch, no poster-vs-last-frame confusion (the poster is frame 0 — Tushar looking down at the
notebook — and the held frame is the pen-turned, looking-up pose). A first capture was taken during a
smooth wheel scroll and had the sticky header overlapping the frame top; the spec now scrolls
instantly to the top before the element screenshot.

Also eyeballed (scratch screenshots, not committed): the full first viewport at 1440×900 and 390×844.
1440: eyebrow (y 152), h1 (219–524) with the underline drawn under "people can use.", hand-sub, support,
both CTAs (bottom 819 < 900), the held clip in the 666×356 frame, caption bottom-right. 390: copy first
(eyebrow 124, h1 213–342, hand-sub, CTAs 501–545), the poster frame from y 565 — every 5-second-test
element intersects the first viewport at both widths (TC-139 step 5); `scrollWidth === clientWidth` at both.

## 5. Gate outputs

- `pnpm typecheck` ✓ · `pnpm lint` ✓ (after two fixes: `next/link` for the `/work` CTA per `@next/next/no-html-link-for-pages`; and one documented `eslint-disable-next-line react-hooks/set-state-in-effect` on the single mount-time `setMode` — see §7) · `pnpm tokens:check` → `13/13 tokens round-trip OK`.
- `pnpm test` → **47 files passed, 1 skipped · 431 tests passed, 2 skipped** (was 422 + 9 new).
- `pnpm build` ✓ (`all routes static (13)`); server restarted after the build before every Playwright run (TSK-30 scar).
- Lint positive control: planting `video.load(); video.currentTime = 0;` in `HeroClip.tsx` → `pnpm exec eslint components/hero/HeroClip.tsx` reports **2** `no-restricted-syntax` errors; file restored byte-identical (`git diff` empty) and clean.
- `pnpm exec tsx scripts/eval-cases.ts --check-specs` → `22 cases OK · 18 automated · 4 manual` / `spec coverage OK · 11 Playwright-automated ids tagged · deferred: ` (empty).
- `pnpm eval --only EVAL-019,EVAL-021 --skip-build` → `evals/results/eval-run-0.2.0-3923974.json` (git-ignored per-ticket run): `totals: 2 pass · 0 fail · 20 skip` — **EVAL-019 PASS, EVAL-021 PASS**.
- `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-018.spec.ts` (full sweep, 24 routes): **45 passed · 2 failed · 7 skipped**. `/` at both widths: `section[aria-labelledby="hero-h"]` count **3** (`sketch, annotation, annotation`), 0 caveat / flat / hidden violations; every other `/` unit (header, `#ask`, `#work-featured`, `#how-i-think`, `#cta`, footer) 0 — **no other legacy-section hits on `/`**. The 2 failures are the known pre-existing `/about` hit (`AboutHero` Caveat hand-sub, `section[aria-labelledby="about-hero-heading"]`, rule `caveat`, ×2 widths → TKT-86; TSK-35 §4, to be parked at TKT-74 S74.02). Not fixed here.
- `tests/e2e/home.spec.ts` at w390/w1440: 13 passed, 7 skipped (viewport-scoped), 0 failed — including the rewritten mobile-order test.

## 6. Pre-existing failures (not touched)

Per the brief: `.glow-halo` overflow ×11, `featured.spec` vs `ProductScene` ×5, `tracer.spec` `AVATAR_ALT` ×4 (TSK-30 §4a). The full e2e suite was not re-run here (only `eval-019`, `eval-018`, `home`); the `tracer.spec` hero frame / tile tests (AVATAR_ALT, floating tiles) will now additionally fail because the avatar and tiles are gone — that is TSK-38's delete-only scope (`avatar-edge.spec.ts`, `tracer.spec` hero cases) and is expected.

## 7. Deviations and judgement calls (for the orchestrator)

1. **ESLint rule location.** The brief asks for the `no-restricted-syntax` rule in `eslint.config.mjs` scoped to `HeroClip.tsx`; the user's `config-protection` hook **blocked every edit to `eslint.config.mjs`** ("Fix the source code … disable the config-protection hook temporarily"). I did not touch the hook. The rule is instead a file-scoped `/* eslint no-restricted-syntax: [...] */` configuration comment at the top of `HeroClip.tsx` — same selectors (`.currentTime =`, `.load(`, JSX `loop`, `"visibilitychange"`, `addEventListener("change")`), enforced by `pnpm lint`, positive control proven (§5). Weaker than the config file only in that the same edit could delete the comment — so `tests/unit/hero-clip.test.tsx` also greps the source for the list from outside the file. If the orchestrator prefers the config-file form, the block is ready to paste (the selectors are the ones in the comment) once the hook is lifted.
2. **`react-hooks/set-state-in-effect`.** The TP13 contract *is* a mount-time `setState` (server cannot know the mode; the first client render must match the SSR HTML; `useSyncExternalStore`/subscriptions were rejected so a later change never re-decides). One `eslint-disable-next-line` with that justification, on that one line.
3. **`muted` attribute.** React sets `muted` as a DOM property on client renders, so the mounted `<video>` would not carry the `muted` *attribute* TC-140 names. The play effect sets `video.defaultMuted = true` (reflects the attribute) and `video.muted = true` before `play()`. Not a restart primitive; documented in the component.
4. **`fetchPriority` casing in SSR** and the **alt appearing twice in the raw HTML** (RSC payload) — see §2; the spec asserts the parsed-DOM truth and the markup-only count.
5. **`mp4` path** is derived from the manifest's `hero-clip.publicSrc` (`.webm` → `.mp4`) in `Hero.tsx` so the manifest stays the single source; the clip's two renditions are one illustration.
6. **Playwright cannot import `lib/illustrations.ts`** (static JPEG imports) — `eval-019.spec.ts` and `home.spec.ts` read `ILLUSTRATIONS` from the manifest module directly.
7. **CTA classes are hero-scoped** (`.hero-btn*`), not a global `.btn` system — the mockups share `.btn`, but a site-wide button contract is not this task's; the ticket that needs it next (band / about CTA) can lift these.
8. `next/image` optimizer is left on for the poster (SSR `srcSet` 280–1920 w; the 390 viewport downloads a ~390 w rendition). `<video poster>` points at the raw 87 kB webp. If LCP on the preview (TKT-74 S74.04) prefers the raw file, `unoptimized` is a one-prop change.

## 8. Scope note

`git status --short` before staging showed only: `app/globals.css`, `components/hero/{Hero,HeroClip}.tsx`, `tests/unit/hero-clip.test.tsx`, `tests/e2e/{eval-019.spec,fixtures,home.spec}.ts`, `scripts/eval-cases.ts`, `docs/eval.md`, `docs/screenshots/m-009/tracer/hero-end-1440.png`, this report. No `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. `evals/results/eval-run-0.2.0-3923974.json` is a git-ignored per-ticket run. Scratch files lived under `/Volumes/E Drive/Dev/.scratch/tsk37/` and the git-ignored `.eval/` (removed).

## 9. Commits

1. `7597bab` — `feat(hero): illustrated hero + HeroClip once-and-hold (TSK-37)` — `HeroClip.tsx`, `Hero.tsx`, `globals.css`, `hero-clip.test.tsx`.
2. `test(eval): EVAL-019 hero mode matrix (TSK-37)` — spec, fixtures, `home.spec`, `eval-cases.ts`, `docs/eval.md`, the held-frame PNG, this report (SHA in the chat reply).
