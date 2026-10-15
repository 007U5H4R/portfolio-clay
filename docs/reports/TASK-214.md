# TASK-214 — Contact page artwork: 3D origami paper-craft still life

## Modified files
- `components/contact/ContactVisualStory.tsx` — inline-SVG/CSS desk objects replaced by four WebP cut-outs; note, sticky and closing line stay real HTML (copy untouched). The sticky now sits inside the collage's desk so it can overlap the cup (still `aria-hidden`, decor count unchanged: annotation x2, collage, sticky).
- `app/globals.css` (TASK-113 `cx-` block only) — new `.cx-desk` (fixed-ratio, `container-type: inline-size`, max 440 px), `.cx-art*` placement, sticky sized in `cqw`, drop-shadow off `--shadow-ink` (works in both themes); old envelope/postcard/cup/sprig rules removed.
- `components/contact/ContactEntrance.tsx` — IntersectionObserver threshold 0.2 -> 0.1. The larger art makes the grid taller, so 20 % of it was no longer in view in a 1440x900 first view and the entrance never armed (`contact.spec` entrance test failed). Only behaviour change outside the art; flagged for review.
- `public/media/contact/{envelope-postcard,coffee-cup,sprig,paw}.webp` (new, sharp, trimmed, alpha).

No old assets deleted (the old art was inline SVG/CSS; nothing else referenced it).

## Artwork (Higgsfield, model `gpt_image_2_5`, text-free, plain cream bg)
1. Envelope + postcard (4:3): "premium 3D origami paper-craft still life ... cream airmail envelope, navy and terracotta striped border, over a kraft envelope, small paper stamp; taped white-bordered postcard with layered-paper slate-blue mountains, pine trees, yellow sun ... NO letters, words, numbers or handwriting; address lines not drawn."
2. Coffee cup (1:1): faceted folded cream-paper cup on a paper saucer, layered-paper coffee with a crescent swirl, angular handle; no other props, no text.
3. Sprig + paw (3:4): one folded-paper sprig (forest/sage leaves) and one terracotta paper paw print; no text. Cropped into `sprig.webp` and `paw.webp`.
Then `remove_background` on each image for transparency. All first-try keepers, no pseudo-text.

Credits: 3 generations x ~1.5 + 3 background removals (balance before: 373.15; exact post-balance not re-read). Well under the 25 budget. The reference PNG upload failed (bad signed-URL paste), so prompts were text-only.

## Alt text (images sit under the decorative `aria-hidden` collage per Design.md §3.2, so alt is present but not exposed; HTML copy is not duplicated in alt)
- Envelope: "A cream airmail envelope with a navy and terracotta border, overlapped by a taped postcard of a layered paper mountain landscape."
- Cup: "A faceted paper coffee cup on a saucer." · Sprig: "A folded paper sprig with green leaves." · Paw: decorative, `alt=""`.
All images have width/height (no CLS), `loading="lazy"`, `decoding="async"`. Nothing animates beyond the existing CSS entrance (reduced motion respected as before).

## Dark mode
Existing theme architecture, no separate assets: cut-outs are self-contained paper objects that read well on navy; the sticky uses the existing dark `--color-note` with ivory ink.

## Tests
- `pnpm typecheck`: pass. `eslint components/contact`: clean.
- `playwright tests/e2e/contact*` (against `next build`/`start` on :3371): 37 passed, 35 skipped (viewport-gated). No test edits needed (class hooks `.cx-note/.cx-sticky/.cx-closing/.cx-collage/.cx-story` kept).
- `vitest tests/unit/contact.test.tsx`: 5 passed.
- Screenshot churn under docs/screenshots discarded.
- Manual: /contact at 1440/768/390/320, light + dark: no horizontal overflow, 0 console errors (production build). Shots in `/Volumes/E Drive/Dev/.scratch/contact-214/shots/final-{light,dark}-{1440,768,390,320}.png`.

## Remaining issues
- Sticky text is small at 320 px (clamped to 16 px floor of a ~138 px sticky); readable, not generous.
- Cut-outs lost the baked shadows; CSS drop-shadow approximates them.
- Entrance threshold change (above) needs a human nod.
