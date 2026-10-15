# TASK-218 — /certifications: LEARN → BUILD → APPLY → GROW paper art

**Replaced:** the footer note's line-doodle `Books` (LEARN / BUILD / APPLY / GROW stacked SVG) + `Plane` (dashed loop trail) pair in
`components/certifications/CertificationTimeline.tsx` (`.cert-foot`). It is the only illustration on the page that plays the learning-progression role
(the opener scene is a pinboard of certificates; the collage and sticky doodles are unrelated). `opengraph-image.tsx` untouched.

**Files:** `public/media/illustrations/certifications-learn-build-apply-grow.webp` (new; 1400x469, q82, 38 kB, sharp from the supplied 2167x726 PNG, 2x of the 640 px max render);
`CertificationTimeline.tsx` (img replaces `<Books/><Plane/>`); `Doodles.tsx` (removed now-unused `Books`, `Plane`); `app/globals.css` (`.cert-foot-art`, grid now art | strip, removed `.cert-book*`, `.cert-plane`, `.cert-dd-dash`);
`tests/e2e/certifications.spec.ts` (+1 test). No old binary asset existed (the old art was inline SVG).

**Layout:** plain `<img>` (the page's convention for decorative art), width/height 1400x469 + `aspect-ratio: 2167/726` + `object-fit: contain`, max-width 640, lazy. Foot grid is art | strip (strip unchanged); < 768 stacks, art full width (342 px at 390, 272 px at 320).

**Alt:** `alt=""`. The foot is an existing `aria-hidden` `data-decor="note"` unit (EVAL-018 count); the old books/plane were decorative and the visible strip "Continuous learning for higher impact." carries the message. Kept as is, so no duplicate SR content.

**Dark mode:** no filter/invert. The cream art sits on a light paper mat made with `box-shadow: 0 0 0 6px var(--color-navy)` (navy = light ink in dark, the same token as the badge disc), so the box keeps its 3:1 ratio.

**Tests:** typecheck pass; lint 0 errors (2 pre-existing warnings, not in touched files); vitest `tests/unit/certifications.test.ts` 5/5; Playwright `certifications.spec.ts` 23 passed, 9 skipped (project-gated by existing design), 0 failed, incl. new test (present, naturalWidth > 0, ratio within 0.03, no overflow at 390). Build passes. No eval specs run (skipped per instruction).

**Screenshots:** `/Volumes/E Drive/Dev/.scratch/certs-218/shots/{before,after}-{light,dark}-{1440,1024,768,390,320}.png` (before = live site). No overflow at any width; no CLS (box reserved).

**Remaining:** at 390/320 the art is 342/272 px wide so the block labels render ~8 px (legible, but small; inherent to a 3:1 image in a narrow column). The 768-1023 range keeps a two-column foot (art 453 px at 768). Light mode shows a faint tone seam between the art's cream and the page paper.
