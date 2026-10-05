# TKT-95 report: page scene openers (EXE-18, Dev-24)

**Ticket:** TKT-95 (Backlog `TASK-90`) · M-009 · Feature · P1 · sp:3 · depends on TKT-93 (done)
**Branch:** `m-009-redesign` (verified; not pushed) · **Model:** Opus 5.5 (standard tier)

## 1. What was built

| Piece | Notes |
|---|---|
| `components/paper/SceneOpener.tsx` (new) | A thin composition: `<section class="scene-opener" data-opener={id}>` → TKT-93's `SceneBanner` (reused, not forked) + `TornEdge fill="paper"`, positioned absolutely on the banner's bottom edge like `.hero-torn`. It is its own EVAL-018 unit with exactly **1** counted decoration (`torn`). The img uses the manifest alt, with no `aria-hidden` anywhere above it. It is not in the paper barrel, for the same jsdom reason as `SceneBanner` |
| `components/paper/SceneBanner.tsx` | New optional `focalY` (0–1). When it is **omitted** (the home hero) nothing changes: the canvas stays at `top: 50%` / `translate -50%`. When it is **given**, the box gets `.scene-banner--focal-y` (`container-type: inline-size`) and the canvas `top` is `clamp(boxH − canvasH, boxH/2 − focalY·canvasH, 0)`, with `canvasH = max(100cqw, boxH·ar) / ar`. The focal row sits at the box centre and the canvas can never expose a gap. This was needed because every opener box is wider than its scene, so the crop is vertical and a centred crop cut the heads off |
| `app/globals.css` | Added after `.scene-banner-img`: the `--focal-y` rules, `.scene-opener .scene-banner { --banner-h: clamp(220px, 32vw, 460px) }`, **`66vw` below 768** (≈3:2, taller than desktop's ≈3.1:1), and `.scene-opener-torn` |
| Pages | The opener is the **first child of `<main>`** on `/work`, `/work/[slug]` (before `ProgressBar`, which is fixed and `aria-hidden`), `/thinking`, `/thinking/[slug]`, `/about`, `/playground` and `/contact`. Nothing else on those pages is restyled; each existing title block sits directly below |
| `components/about/AboutHero.tsx` | Removed the TSK-38 `Illustration id="scene-about" placement="photo"` stand-in column and its now-empty `lg:grid lg:grid-cols-[42fr_58fr]` / `2xl:gap-24`. With the image gone, keeping a two-column grid would have squeezed the copy into the 42 % column. Padding is unchanged |
| Manifest / README | `scene-thinking.usedOn` → `["/thinking", "/thinking/[slug]"]`, and the README "used on" cell matches. The other five already named their real routes |

## 2. Per route

At ≥ 768 the scene canvas is always the full box width, so `focalX` has no effect: every opener crops top and bottom. At 390 the 3:2 box shows almost the whole scene (99 % of a 3:2 scene's height, 88 % of `scene-thinking`, 53 % of the contact portrait). Priority: **every opener is `priority`** (preload + `fetchpriority="high"` + eager). It is the first and largest image above the fold on every route, so it is the LCP candidate. On case studies, no project has a `hero.image` today, so there is no competing priority image. Banner height is `clamp(220px, 32vw, 460px)` at ≥ 768 (460 at 1440) and `66vw` below (257 px at 390).

| Route | Scene | focal (x, y) | Visible height ≥768 | Screenshot (Read) |
|---|---|---|---|---|
| `/work` | `scene-work` | 0.6, 0.38 | 48 % | 1440: head, face and reaching arm pinning the sketch; corkboard on the right; the pen hand falls below the crop. 390: the whole scene. Title block below |
| `/work/teachspark` | `scene-casestudy` | 0.5, 0.32 | 48 % | 1440: face, open book, armchair, lamp, plant, books; **the dog is below the crop** (it is in the alt). 390: the whole scene including the dog. TeachSpark header below |
| `/thinking` | `scene-thinking` | 0.5, 0.29 | 43 % | 1440: full head and face looking down, shoulders, lamp and window; the writing hand is below the crop. 390: head, writing hand, notebook, tea |
| `/thinking/green-tests-prove-it-runs` | `scene-thinking` | 0.5, 0.29 | 43 % | Same crop as `/thinking`; essay h1 below |
| `/about` | `scene-about` | 0.3, 0.44 | 48 % | 1440: figure from behind (head to waist), coffee, trees, snow-capped mountain. 390: whole scene. The about h1 is below; the photo stand-in is gone |
| `/playground` | `scene-playground` | 0.45, 0.30 | 48 % | 1440: full head, face and the cardboard prototype in both hands; lamp and notes. First pass (0.31) grazed the crown, so I moved to 0.30. 390: whole scene incl. breadboard and tablet |
| `/contact` | `scene-contact` | 0.5, **0.20** | **26 %** | **1440: the full head and face fill the banner; of the wave only the fingertips show at the bottom-right edge. The mug and palm are below the crop.** 390: face, whole waving hand and mug top. ContactCard below |

**Contact crop (needs Tushar's eye):** a 1638×2048 portrait in a full-width box shows only ≈ 26 % of its height at any width from 768 up (19 % at 1920). The head and the whole wave span ≈ 7–46 % of the portrait's height (≈ 39 %). Showing both would take a ≈ 720 px-tall box at 1440, so they cannot both fit. I chose `focalY 0.2`, which keeps the whole head: a lower focal point cuts the hair, and a higher one loses the fingers. Options:
- (a) Accept this crop.
- (b) Outpaint a wide contact banner, as was done for home (Higgsfield, about 2 cr; not spent here).
- (c) Give `/contact` a taller box, which pushes the card down.

## 3. Gates

| Gate | Result |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm tokens:check` | ✓ / ✓ / `13/13 tokens round-trip OK` |
| `pnpm test` | 49 files passed · 1 skipped · **464 passed** · 2 skipped |
| `pnpm build` | ✓ `all routes static (13)`; `pnpm start` restarted after every build |
| **FULL `pnpm test:e2e`** (fresh prod server, final build) | **813 passed · 0 failed · 895 skipped** (8.9 min). Baseline was 785 + 28 new |
| `pnpm eval --only EVAL-006,EVAL-008,EVAL-013,EVAL-018,EVAL-021 --skip-build` | **5 pass · 0 fail** → `evals/results/eval-run-0.2.0-1548ae4.json` (491 specs). EVAL-018: the parked `/about` caveat entry still hits, because the AboutHero Caveat subline is unchanged, so it is **not stale**. No opener unit exceeds 1. `eval-018-parked.json` is unchanged |
| Bundle `/` | **158.6 kB gz**, unchanged from TKT-93 |

## 4. Spec changes

- `tests/e2e/about.spec.ts`: the TSK-38 assertion ("the stand-in's alt shows as caption text in the hero section") became two checks. The alt text must be **absent** from the hero section, and `[data-opener="scene-about"] img` must carry the manifest alt. The markup at the top of the page changed legitimately; no spec was deleted.
- New `tests/e2e/scene-opener.spec.ts` (7 routes × 4 widths = 28). Per route it checks that:
  - the opener is the first child of `main#main`;
  - the img alt is byte-equal to the manifest, not inside `aria-hidden`, `fetchpriority="high"` and eager;
  - the opener's `[data-decor]` is exactly `["torn"]`;
  - the canvas covers the banner box on all four edges (this guards the `focalY` clamp);
  - the h1 is below the banner.

  A first run caught `ProgressBar` sitting before the opener on case studies, which I fixed.

## 5. Judgement items

1. **Contact portrait crop** (§2), for Tushar.
2. **Desktop crops are tight on the 3:2 scenes** (43–48 % of their height at ≥ 768). Faces are kept, but secondary elements are lost: the case-study dog, the thinking/work writing and pen hands. Raising the clamp max to 520–560 px would show more, at the cost of fold space. I left it at the brief's example value.
3. **Gap between banner and title.** The legacy heroes keep their own top padding (`space-12/13`; AboutHero `lg:pt-32`), which leaves ≈ 150 px (about ≈ 200 px) between the torn edge and the title at 1440. I didn't touch it because the brief says not to restyle. Each page's Phase B/C ticket should tighten it.
4. `SceneBanner` gained a prop (`focalY`) rather than being forked. The home hero doesn't use it, so its registration maths is untouched (EVAL-019 specs pass in the full run).

## 6. Scope

Staged explicitly:
- `app/{work,work/[slug],thinking,thinking/[slug],about,playground,contact}/page.tsx`
- `app/globals.css`
- `components/paper/{SceneOpener,SceneBanner}.tsx`
- `components/about/AboutHero.tsx`
- `content/media/illustrations/{manifest.ts,README.md}`
- `tests/e2e/{about,scene-opener}.spec.ts`
- `docs/screenshots/m-009/openers/*` (14)
- this report

Churned `docs/screenshots/{about,contact,not-found,playground,thinking,tracer}/**` was restored. Not staged: `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. No Higgsfield spend.
