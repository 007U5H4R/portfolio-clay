# TASK-114 · Scene openers on Experience (`/work`) and Certifications (`/certifications`)

Tushar 2026-09-27: "include image scene in Experience and ceritfication tabs like the other tabs so that it looks consistent and uniform … Just make sure its not repeated. Keep the pixel and image size uniform like other tabs."

## What changed
- **Two new scenes** (the orchestrator generated them with Higgsfield, 17 credits; this task spent no credits): `scene-experience` (Tushar at a whiteboard in a sunlit meeting room) and `scene-certifications` (Tushar hanging a framed certificate while the golden retriever looks up at him). Both use the TKT-107 pipeline:
  - The 3840×1648 masters were cropped to 3840×1629 (10 px off the top, 9 px off the bottom; only wall and floor are lost) and resized with lanczos3 to **3168×1344**.
  - The wide files are JPEG q82 mozjpeg, under the 600 KB cap on the first pass.
  - The narrow files for < 768 are the focal-point 4:3 region plus 16 px on each side, WebP q86 effort 6.

| file | size | bytes |
|---|---|---|
| `content/media/illustrations/scene-experience.jpg` | 3168×1344 | 476,325 |
| `content/media/illustrations/scene-certifications.jpg` | 3168×1344 | 482,860 |
| `public/media/illustrations/scene-experience-mobile.webp` (focal 0.60, crop 989 + 1824) | 1824×1344 | 241,486 |
| `public/media/illustrations/scene-certifications-mobile.webp` (focal 0.55, crop 830 + 1824) | 1824×1344 | 208,354 |

  The focal points keep Tushar's face and the key prop inside the phone crop: the whole whiteboard on one; the certificate wall, the ribbon and the dog on the other.
- **Manifest and alts:** the new ids are in `SceneId`, `manifest.ts` and `lib/illustrations.ts`. The focal points are in `scene-opener-frames.ts`. The provenance README has rows plus a TASK-114 encoding section, which records the round-1 jobs that omitted the character references as an orchestrator error. Design.md is updated in §6.1 (the id union), §6.3 (the alts) and §7.2.
- **Pages:** `<SceneOpener id=… priority />` is now the first child of `<main>` on `/work` and `/certifications`, as on `/projects` and `/about`. The existing title strip (the deckled "Work Experience" / "Certifications" note) sits directly under the opener's torn edge. There is only one torn edge, and no extra spacing (see the gap table below). The page doc comments are updated.
- **CSS** (the `/* TASK-114 */` block at the end of `app/globals.css`): the openers needed no new rules. One unlayered rule zeroes `sr-only`'s −1 px margin on `/work`'s h1. Without it, the h1 sat 1 px inside the banner and failed `scene-opener.spec`.
- **Tests:**
  - The unit tests that pin the manifest ids and alts are extended from 13 to 15 ids: `paper.test.tsx` now requires the §6.3 rows, and `eval-021.test.ts` checks the id list. `scene-opener-frames.test.ts` covers the eight scenes.
  - `experience-page.test.tsx` stubs `SceneOpener` (the static image import doesn't work under jsdom) and asserts the opener comes first with priority.
  - `scene-opener.spec.ts` adds `/work` and `/certifications`, plus a new test that no two tabs repeat an opener scene. This is the scar for "make sure it's not repeated".

## Banner height (px), measured under `next start`
| width | /work | /certifications | /projects | /about | / |
|---|---|---|---|---|---|
| 390 | 292.5 | 292.5 | 292.5 | 292.5 | 292.5 |
| 768 | 325.8 | 325.8 | 325.8 | 325.8 | 325.8 |
| 1024 | 434.4 | 434.4 | 434.4 | 434.4 | 434.4 |
| 1440 | 610.9 | 610.9 | 610.9 | 610.9 | 610.9 |

Gap from the opener's bottom to the title block is 22 / 24 / 32 / 46 px on `/work`, 23 / 25 / 33 / 46 px on `/certifications` and 24 / 24 / 31 / 43 px on `/about`. It matches because the pages use the same padding band. The `/projects` figure is measured to its h1, which sits below an eyebrow, so it is not comparable.

Below 768 the pages serve the `-mobile.webp` rendition; at 768 and above they serve the full scene via next/image. This was confirmed from `currentSrc`.

## Parallax
There is no text overlap on `/work` or `/certifications` at 390 or 1440. The probe scrolls the whole page in 150 px steps and checks for any two painted text boxes from different sections intersecting; it found zero hits. `parallax-stacking.spec.ts` and `torn-parallax.spec.ts` pass on all 4 projects. The mid-scroll evidence is `*-mid.png`: the opener image lags under the paper and the torn edge leads.

## Gate (on the merged result, e9aaa55 + report)
- `pnpm typecheck` ✓ · `lint` ✓ · `tokens:check` ✓ · `test` **632 passed** / 2 skipped ✓ · `build` ✓ (all routes static, 15).
- `test:e2e` on `parallax-stacking`, `torn-parallax`, `scene-opener`, `eval-006`, `eval-008`, `eval-018`, `work` and `certifications`, all 4 projects: **542 passed, 0 failed** (314 skipped by project gating).
- `pnpm eval --only EVAL-021,EVAL-013 --skip-build`: **2 pass, 0 fail**.
- **First-load JS** (`scripts/bundle-budget.ts`): `/work` 153.1 kB gz (TKT-101 recorded 153.0; the 0.1 kB came in with merged header and contact work, and the opener is a server component with no client code). `/certifications` 153.9 kB gz, the same as TKT-102.
- **Screenshots:** `docs/screenshots/m-009/task-114/{work,certifications}-{390,1440}-{top,mid}.png`.

## Design.md §11 rows
- **Dev-103**: `/work` opens on `scene-experience`. It supersedes Dev-90's "no scene opener" and the §7.2 note. Disposition: Tushar, 2026-09-27 (TASK-114).
- **Dev-104**: `/certifications` opens on `scene-certifications`. It supersedes Dev-46/47's "no scene opener". Disposition: Tushar, 2026-09-27 (TASK-114).
- These were renumbered twice at merge (97/98 → 98/99 → 103/104) after TASK-112 and TASK-113 took Dev-97 to Dev-102.

## Notes
- No caption annotation was added to either opener, so §3.3 decoration counts are unchanged. Each opener section counts `torn` = 1.
- This branch did not update the Campfire status for TASK-114; the orchestrator owns the board.
