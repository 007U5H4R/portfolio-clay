# Product logos (TASK-250)

`logo-<slug>-dark.webp` is for the dark theme (light ink); `logo-<slug>-light.webp` is for the light theme. Transparent backgrounds.
Pixel sizes of the `-dark` files live in `data/portfolio.ts` (`logo: { width, height }`); paths are derived from the slug (`productLogoSrc`, `lib/portfolio.ts`).

Lockups were rendered by `/Volumes/E Drive/Dev/.scratch/product-logos/render-lockups.mjs` (not in the repo) from each product's own mark and its own wordmark font and colours. Dark-theme variants of dark-ink wordmarks use light ink.

- teachspark: favicon ball from the repo (`web/public/favicon.svg`) + the header wordmark text from `web/src/components/Wordmark.tsx` ("Teach" #f5f5f5 + "Spark" #5cc46a, Baloo 2 ExtraBold).
- railcite: the live header inline SVG mark (#2f7bf0) + the wordmark "RaılCıte" (Quicksand 700; "C" and the first i-dot in #2f7bf0, the rest in --text #182740, light ink for the dark theme).
- velora: no logo exists; the product's own text wordmark ("Velora", Fraunces 600, #E8E9ED) with its gold hairline #E3AC49, from `RoleSelect.module.css`. The repo's /favicon.svg is the stock Vite logo and is not used.
- nuptis: the app's own DM/LM wordmark files (`Case Study 3/Nuptis-DM-transparent.png`, `Nuptis-LM-transparent.png`), cropped. The app renders it as text: Orbitron 900, #2d5ba8.
- bhakti-vilas: no logo or icon exists; the live header text "भक्ति Vilas" (Gotu bold, #3c030c; #fff8f5 for the dark theme) set as a wordmark. Not invented.
- pratyasa: redrawn as monoline vector strokes (TASK-254) from the repo's header wordmark (`pratyasa-site/assets/wordmark.webp`, itself keyed from the device case print — no font exists for it): squared P/R/S bowls, crossbarless A's, the dotted middle A, the curved-arm Y. Gold #E9CE62 (the brand gold in `build-notes/ledger.md`) for the dark theme, ink #7A5C0C for the light theme. SVG masters: `/Volumes/E Drive/Dev/.scratch/product-logos/pratyasa-gold.svg`, `pratyasa-ink.svg`.
- campfire-board: the in-app flame-and-stones logo (`src/web/assets/logo.ts`) + the wordmark from `campaign/decks/assets/wordmark.png`. The icon is low-res (127x160).
- slag-city: one-line transparent wordmark (heavier, worn-metal variant), regenerated 2026-10-21 at Tushar's request (TASK-340) via Higgsfield GPT Image 2.5 image-to-image from the game's `docs/art/candidates/ui/marquee-1.png`; the light variant adds a thin dark-umber outline + soft shadow for cream. Masters in `/Volumes/E Drive/Dev/.scratch/slag-logo/final/cand-B/`.
- shravans-round: the live header inline SVG mark (copper bars #f9aa60 to #e29458) + wordmark: "THE" in Geist Mono caps #c2764e above "Shravan's Round" in Hanken Grotesk 600 (#f4efea; dark ink for the light theme).
- urja: the live header glyph (arc + needle, #ed7d24, tile removed) + the wordmark "Urja" (Inter 620, -.01em; #f8f6f4 for the dark theme).
