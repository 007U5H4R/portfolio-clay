# TASK-113 · Contact section redesign (+ TASK-111 portrait stamp)

Branch `m009/task-113`, cut from `m-009-redesign` @ `93c60a0`, then merged with `m-009-redesign` @ `f3e1921` (TASK-110 / TASK-112). The reference of record is Tushar's spec, `docs/redesign-mockups/m-009/tushar-2026-09-27/contact-spec.md`. Model: Opus 5.5.

## Spec §30 summary

**Files changed**
- `app/contact/page.tsx`: `SceneOpener` → `ContactSection`. The postcard section is gone.
- `components/contact/ContactSection.tsx` (new): `section#contact`, with the head (eyebrow, h1, subline) and the grid.
- `components/contact/ContactCard.tsx` (rewritten): `ContactCard`, `EmailBlock`, `PrimaryContactCTA`, `SecondaryContactLinks`, `PortraitStamp` (TASK-111).
- `components/contact/ContactVisualStory.tsx` (new): the collage, sticky and closing line.
- `components/contact/ContactEntrance.tsx` (new): a small client trigger for the CSS entrance.
- `components/contact/ContactDetails.tsx`: deleted.
- `components/common/CopyButton.tsx`: new optional `name` prop for the accessible name. The default behaviour is unchanged.
- `lib/site.ts`: `contactResumeLink()`.
- `app/globals.css`: the TSK-46 block is replaced by a TASK-113 block. The CopyButton skin is kept and restyled.
- `content/media/portrait/tushar-stamp.webp` + `README.md` (TASK-111 provenance).
- `Design.md`: §2.2 contact h1, §3.3 `/contact` rows, §7.8, and §11 Dev-98–102.
- Tests:
  - `tests/e2e/contact.spec.ts`: rewritten to the new structure.
  - `tests/e2e/torn-parallax.spec.ts`: new `/contact` band case.
  - `tests/e2e/fixtures.ts`: the axe reveal helper now waits for `data-armed` entrances.
  - `tests/unit/contact.test.tsx`: new.
  - `tests/unit/site.test.ts` and `tests/unit/copy-button.test.tsx`: extended.
  - `tests/unit/contrast-pairs.test.ts`: dropped the `.contact-hand-line` row, because that surface no longer exists.

**Component structure** follows spec §24:
```
ContactSection (section#contact)
  ContactEntrance.cx-grid
    .cx-head: eyebrow · h1 · subline
    ContactCard: EmailBlock · PrimaryContactCTA · SecondaryContactLinks · PortraitStamp
    ContactVisualStory: collage · sticky · closing
```

**Copy button.** The state machine is unchanged:
- idle "Copy" → "Copied" with a check icon for 2 s → back to idle;
- if the clipboard fails: "Copy failed" plus the selectable `<output>` fallback, and a `console.warn`;
- an sr-only live region announces "Copied <address>".

The accessible name is now "Copy email address", the look is a compact paper pill, and hover/active get a note-coloured tint.

**Contact links**
- **Email:** the address is text from `site.email`. "Email me →" is a real `mailto:`.
- **LinkedIn ↗:** `target=_blank`, `rel="noopener noreferrer"`, with an sr-only "(opens in new tab)".
- **Résumé:** `a#resume` from `contactResumeLink()`. While `resumeAvailable` is false it reads "Resume — available on request", a `mailto:?subject=Resume%20request`. It becomes "Resume ↓" (a download) automatically when the flag flips. The `#resume` id keeps the site-wide `/contact#resume` links landing here.
- **GitHub ↗:** renders under the S5 rule, which is true today, so it shows as a third secondary button.
- **Location:** shown only behind `site.showLocation`.

**Desktop layout (≥ 1024).** `42fr 58fr`. The story is on the left and vertically centred. The head sits over the card on the right. Content span is 562 px at 1440 (spec ≤ 850). The primary CTA is 54 px tall and the secondary buttons are equal width at 52 px.

**Mobile layout (< 1024).** One column in the spec order: head → card → story. The desk art is 220 px tall (180 px < 560). Secondary buttons stack below 560 px. No overflow at 390, 768, 1024 or 1440.

**Motion.** CSS only, played once on entering the viewport, total ≈ 700 ms:
- head fades up 10 px;
- collage fades in and its rotation settles;
- card fades in from 20 px to the right, 120 ms later;
- sticky rotates 1° into place, 320 ms later.

Nothing is hidden without JS, nothing moves under reduced motion, and nothing loops. Hovers run 200 ms:
- CTA: lifts 2 px, stronger shadow, arrow moves 3 px;
- LinkedIn: the glyph nudges;
- résumé download: the arrow drops 2 px.

`/contact` first-load JS is **154.9 kB** gzip (budget 180).

**Accessibility**
- Real links and buttons throughout. Every control is ≥ 44 px tall and wears the shared rust focus ring.
- All decorations are `aria-hidden`.
- The portrait is a named `<img>` ("Photo of Tushar Pathak").
- The section is its own stacking context at z 0, and its foot is kept empty for the TKT-106 band lag. A test checks that the tear never covers the card or the closing line.

**Compromises**
- All collage art is inline SVG/CSS; there is no image spend.
- The handwritten note sits inside the one `collage` object (Dev-40 / hero-marginalia precedent) to stay within the 4-decoration budget.
- With GitHub showing, the third secondary button sits alone in the grid's second row.

## Gate (merged result, `c166cb5` + tests)
- `pnpm typecheck` ✓. `lint` ✓. `tokens:check` 13/13 ✓. `pnpm test`: 631 passed, 2 skipped. `pnpm build` ✓, all 15 routes static.
- e2e (contact, eval-006/007/008/010, eval-011-dead-controls, eval-018, torn-parallax), 4 projects: **592 passed, 0 failed**, 596 skipped by design.
  - The brief's `eval-011.spec.ts` doesn't exist; the file is `eval-011-dead-controls.spec.ts`.
  - `/contact` band tear: gap 72.0 → −97.3 px at 1440.
- `eval-018-parked.json` stays `[]`. `/contact` counts 4 per unit at 390 and 1440.
- Screenshots: `docs/screenshots/m-009/task-113/contact-{390,768,1024,1440}.png` and `contact-1440-copied.png`.

## New Design.md §11 rows
Dev-97 was taken by TASK-112, so these start at Dev-98. Disposition: "Tushar, 2026-09-27 (TASK-113)".
- **Dev-98:** one section. Numbered list and postcard removed; new copy.
- **Dev-99:** résumé "available on request".
- **Dev-100:** spec §20 entrance.
- **Dev-101:** control sizes, h1 size, CopyButton name/hover.
- **Dev-102:** TASK-111 portrait stamp. It is content, not a decoration.

## Asset follow-ups (no generation done)
A real illustration would improve:
- the desk still-life (coffee cup, airmail envelope, postcard);
- the postcard's "travel photo", which is a simple SVG landscape today;
- the Tushky paw stamp, which is 5 ellipses today.

## Open question for Tushar
"Resume — updating" is gone from `/contact`'s main content and from all visible text. The shared chrome still derives from `resumeAction()`, so the band footer's résumé circle keeps `aria-label="Resume — updating"` on every page, including `/contact`. The `/about` and home résumé controls also still read "Resume — updating". Should `resumeAction()`'s placeholder switch site-wide to "Resume — available on request" (mailto)? That would touch the band footer, `/about`, home and about six tests, which is outside this ticket's scope.
