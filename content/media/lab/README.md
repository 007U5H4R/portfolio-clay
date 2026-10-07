# Gummy Lab remodel assets — provenance (TASK-168)

Served from `public/media/lab/{art,sfx,music}/`. Masters, tools and work files: `/Volumes/E Drive/Dev/.scratch/gummy-remodel/` (outside the repo). Copied verbatim from the asset manifest below; WebP images, AAC .m4a with .mp3 fallback.


Root: /Volumes/E Drive/Dev/.scratch/gummy-remodel/ . Style gate: contact-sheet.png (light left, dark right, textures + HUD plates below).

## Credits
- Higgsfield: **6 credits** of the 40 budget (473.15 balance at start): 5 images used (frame, backdrop, paper texture, plaque, round button) + 1 generated but UNUSED (sage hills layer, job 1500ca89-32f7-4840-8a43-cfecbfc7b3a8, replaced by segmenting the backdrop; kept at work/_unused-hills-sage-raw.png). All gpt_image_2_5, medium, 2k (frame/backdrop/plaque 16:9, texture/button 1:1). remove_background was NOT used: layers needing transparency were generated on flat #FF00FF and keyed/split locally (Pillow) for cleaner torn edges and no credits.
- ElevenLabs sound effects v2: 14 generations x 50 credits (about $0.07). Chimes/flourish synthesised locally (0 credits).
- Higgsfield audio was not used (its generate_audio is speech-only).

## Skipped / caveats
- No SFX or music was auditioned by ear (headless): picked by waveform events, cut, loudness-matched and checked numerically. Spot-listen before shipping, esp. squish, pluck-pop, thud, rustle.
- ElevenLabs returns whole-second takes with several events; one event was cut from each. Hard-cut tails use a 40-250 ms fade-out (5 ms fade-in always); the 5 ms spec applies to the start.
- Rustle: only 1 take (second request hit 429); fine.
- Loudness: ebur128 measured on the clip zero-padded to 1.5 s (clips < 0.4 s have no gated value otherwise). Percussive clips (click, pluck-pop, tick) sit at -19 to -20 LUFS because the -1.5 dBFS limiter caps them; chimes sit at -18.
- Bounce/combo/win use playbackRate pitch shifts sparingly: chimes are C major (C5 E5 G5; win adds C6 E6 G6); shifting breaks the key, prefer fixed.
- A small pink stain exists at the top-right corner of frame-1-outer (present in the generation; reads as a paper blemish). Dark frame/plaque variants are algorithmic recolours (paper grain preserved, navy never pure black, cream = oklch .289 .062 264 family).
- Textures are mapped from one generated sheet (recoloured), so grain is identical across colours.
- No dark variants for paper textures, bump map or the vignette (colour of candy platforms/collectibles is theme-independent).

## Art (WebP, RGBA; light unless -dark)
| file | purpose | size | dims | sha256[:16] | source | theme |
|---|---|---|---|---|---|---|
| art/bg-1-sky-dark.webp | Opaque sky paper (powder blue to cream) with ochre sun + 2 clouds | 57 KB | 2400x1357 | 054501eb04955252 | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) ; dark = Pillow recolour/gradient map | dark |
| art/bg-1-sky.webp | Opaque sky paper (powder blue to cream) with ochre sun + 2 clouds | 72 KB | 2400x1357 | f55421c5c4e1a873 | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) | light |
| art/bg-2-hills-far-dark.webp | Far hills, powder-blue torn paper (bottom-aligned) | 84 KB | 2400x661 | e059a1ee3bdd18ec | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) ; dark = Pillow recolour/gradient map | dark |
| art/bg-2-hills-far.webp | Far hills, powder-blue torn paper (bottom-aligned) | 132 KB | 2400x661 | 7daa09c5b31d3ec2 | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) | light |
| art/bg-3-hills-mid-dark.webp | Mid hills, sage torn paper | 69 KB | 2400x547 | d424ed0d25082220 | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) ; dark = Pillow recolour/gradient map | dark |
| art/bg-3-hills-mid.webp | Mid hills, sage torn paper | 112 KB | 2400x547 | 0ab08cce9072dede | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) | light |
| art/bg-4-hills-near-dark.webp | Near hills, dusty-rose/terracotta torn paper | 80 KB | 2400x379 | 41ddcc29f4fa25f5 | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) ; dark = Pillow recolour/gradient map | dark |
| art/bg-4-hills-near.webp | Near hills, dusty-rose/terracotta torn paper | 114 KB | 2400x379 | 9446c746b05bcd5e | HF job 4e036f03-bc61-45ed-9420-280d37ee6033 segmented into sky + 3 hill layers (Pillow) | light |
| art/button-round-dark.webp | Blank round paper button (pause / sound) | 26 KB | 512x523 | 84502fbcdeb06fab | HF job 1b0d5988-2317-4c0a-a7e8-525434955f79 magenta-keyed (Pillow) ; dark = Pillow recolour | dark |
| art/button-round.webp | Blank round paper button (pause / sound) | 40 KB | 512x523 | 431c5d9e536cfd90 | HF job 1b0d5988-2317-4c0a-a7e8-525434955f79 magenta-keyed (Pillow) | light |
| art/frame-1-outer-dark.webp | Outer torn cream parchment sheet of the diorama frame (opening is transparent) | 49 KB | 2400x1357 | 46e6afc043db3983 | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) ; dark = Pillow recolour | dark |
| art/frame-1-outer.webp | Outer torn cream parchment sheet of the diorama frame (opening is transparent) | 165 KB | 2400x1357 | f11c7067cfebde5d | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) | light |
| art/frame-2-secondary-dark.webp | Dusty-rose torn sheet inside the outer sheet | 133 KB | 2400x1357 | ece1e37a146b9147 | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) ; dark = Pillow recolour | dark |
| art/frame-2-secondary.webp | Dusty-rose torn sheet inside the outer sheet | 162 KB | 2400x1357 | 937cc197eaa7c7a5 | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) | light |
| art/frame-3-inner-dark.webp | Sage torn sheet, innermost frame layer | 104 KB | 2400x1357 | 120f24832178ef97 | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) ; dark = Pillow recolour | dark |
| art/frame-3-inner.webp | Sage torn sheet, innermost frame layer | 134 KB | 2400x1357 | ac0f4436ee9ca6ea | HF job 2a73425f-f3e3-458e-8aa8-53d4268f8f7f split into 3 layers by colour (Pillow) | light |
| art/frame-4-vignette.webp | Inner-shadow vignette over the world, UNDER the frame layers | 90 KB | 2400x1357 | 55bb9e66b283df76 | procedural (Pillow radial inner-shadow), no credits | light |
| art/paper-blue.webp | Seamless 1024 paper texture, blue | 206 KB | 1024x1024 | e0b8f657f3ee68ee | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/paper-bump.webp | Grayscale bump/roughness map (paper tooth), tileable | 73 KB | 512x512 | 01378e7c185471f1 | derived (Pillow high-pass) from HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e | light |
| art/paper-cream.webp | Seamless 1024 paper texture, cream | 216 KB | 1024x1024 | f2ea10e8335f1b5d | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/paper-ochre.webp | Seamless 1024 paper texture, ochre | 224 KB | 1024x1024 | 9683eefe6d0a7f31 | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/paper-rose.webp | Seamless 1024 paper texture, rose | 215 KB | 1024x1024 | 7570f1de0dab2a2b | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/paper-sage.webp | Seamless 1024 paper texture, sage | 201 KB | 1024x1024 | bfb762db4a036d92 | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/paper-terracotta.webp | Seamless 1024 paper texture, terracotta | 166 KB | 1024x1024 | 2d5911a3e0364291 | HF job 8f6abba2-d6e7-48e1-9353-f77b577b9a2e, seamless-tiled + recoloured (Pillow) | light |
| art/plaque-combo-dark.webp | Blank HUD plate: sage rim (combo) | 22 KB | 800x369 | c192f7ea379c5a30 | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow); colour variant by Pillow recolour ; dark = Pillow recolour | dark |
| art/plaque-combo.webp | Blank HUD plate: sage rim (combo) | 33 KB | 800x369 | b5e47f7bacf19c2f | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow); colour variant by Pillow recolour | light |
| art/plaque-score-dark.webp | Blank HUD plate: rose rim (score) | 26 KB | 800x369 | 03b49f9bda87fea2 | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow) ; dark = Pillow recolour | dark |
| art/plaque-score.webp | Blank HUD plate: rose rim (score) | 33 KB | 800x369 | 78ddc79fa6729cdb | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow) | light |
| art/plaque-timer-dark.webp | Blank HUD plate: powder-blue rim (timer) | 22 KB | 800x369 | d229f198251b449b | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow); colour variant by Pillow recolour ; dark = Pillow recolour | dark |
| art/plaque-timer.webp | Blank HUD plate: powder-blue rim (timer) | 34 KB | 800x369 | 1a165287eb692e08 | HF job d1b2c8d2-00ff-4f4e-9f47-c01c3e96f844 magenta-keyed (Pillow); colour variant by Pillow recolour | light |


## SFX (mono, AAC .m4a 80 kbps + .mp3 96 kbps, 44.1 kHz)

| file(.m4a/.mp3) | game event | dur | LUFS | m4a / mp3 size | sha256[:16] (m4a) | source |
|---|---|---|---|---|---|---|
| sfx/squish | audio.play('squish') (Driver.tsx: speed>7 collision + grab/release squish) | 0.45s | -19.4 | 5 KB / 6 KB | 3d7ad04a6f59fdce | ElevenLabs eleven_text_to_sound_v2, flow ukDuz8jSagKCwf36jwgj gen 7FRTFSQ0l6eUUdUhdEe5; prompt: 'Single short soft squish of a gummy candy being grabbed and pressed between fingers...' |
| sfx/bounce-1 | audio.play('bounce') - alternate with bounce-2 | 0.55s | -18.9 | 6 KB / 7 KB | 8db85842c87a5364 | ElevenLabs text_to_sound_v2, flow mJtnPvvlwJWTsa6r8Trx gen G3nuGcWCV1ZpKotGjLVl; prompt: 'Soft muted rubbery bounce of a small jelly gummy landing on thick paper...' |
| sfx/bounce-2 | audio.play('bounce') - alternate with bounce-1 | 0.56s | -18.9 | 7 KB / 7 KB | c5a7e97be949042b | same prompt, gen jZdwVq6Fzh09UzYsSJTw |
| sfx/pluck-pop | audio.play('star') / pickup of star, droplet | 0.20s | -19.8 | 3 KB / 3 KB | 2a25002eb901f5c3 | ElevenLabs, flow VjKPsKRzKWmCRuuw04Ep gen 04jZpnhDz5Er18OPGtw2; 'A tiny paper pluck pop...' (cut one event from a multi-pop take) |
| sfx/combo-chime | audio.play('ring') (ring pickup / combo step); may be pitched via playbackRate for higher combos | 0.90s | -18.5 | 9 KB / 11 KB | 4e1ea661cf2a7f80 | Synthesised in Python (tools/synth.py): soft additive bells C5-E5-G5, 110 ms steps (C major) |
| sfx/tick | timer tick in final seconds (danger countdown); new, no existing event | 0.15s | -19.3 | 2 KB / 2 KB | 25ccadef81d6f310 | ElevenLabs, flow wihpJfsnNYt3JotBvF1c gen 3Px2OTNAZGyFWYGsqkFe; 'One subtle soft tap of a fingernail on a thick sheet of paper' |
| sfx/win-flourish | audio.play('powerup') or 'secret' / results win; new for win state | 1.90s | -18.5 | 20 KB / 23 KB | affe7c9d294a99ce | Synthesised in Python: C5 E5 G5 C6 arpeggio then C major chord (C6/E6/G6/G5) ring-out |
| sfx/thud | audio.play('gameover') | 0.81s | -20.4 | 9 KB / 10 KB | 1d05e34930f489d1 | ElevenLabs, flow IwFfKL7kx6hqIqzI7OOU gen tAJE5GpF3iei4fxaTPn5; 'soft low muted thud ... felt-wrapped object settling onto a stack of paper' (event cut from 4 s take) |
| sfx/click | UI buttons (pause, sound, Play, Back); new | 0.16s | -20.7 | 2 KB / 2 KB | 2158c712f0f4e2b5 | ElevenLabs, flow sbMzbhjGKkTU4bmxccPN gen x5jZECtSBd4JatyB9Aqg; 'A soft crisp paper click...' (one event cut) |
| sfx/rustle | panel open/close (intro, pause, results cards); new | 0.78s | -18.9 | 9 KB / 9 KB | c1d19605e319908d | ElevenLabs, flow foiMbKImox481zJozStk gen IKdguoh9va3YdbVnFnfi; 'gentle soft rustle of a sheet of paper' (1 of 2 requested, other hit 429) |

## Music (loop-ready, 60 ms baked seam)

| file | dur | size | sha256[:16] | source |
|---|---|---|---|---|
| music/music-1.m4a | 39.61s | 475 KB | 537fd14fb40f643c | copy of gummy-audio/a-loop.m4a |
| music/music-1.mp3 | 39.61s | 464 KB | 7e8f511d0c2feb54 | copy of gummy-audio/a-loop.mp3 |
| music/music-2.m4a | 40.45s | 485 KB | 541ee0954e90bbad | copy of gummy-audio/b-loop.m4a |
| music/music-2.mp3 | 40.45s | 474 KB | f766d58421f12158 | copy of gummy-audio/b-loop.mp3 |

## Prompts (Higgsfield, gpt_image_2_5 medium 2k)
Common ending on all: "Muted luxury editorial palette, matte only ... No text, letters, numbers, logos".
- frame (2a73425f): "Front-on flat view of a luxury layered paper-craft diorama FRAME made of three stacked torn cardstock sheets (cream parchment outside, then dusty rose, then sage), deckled hand-torn fibrous edges ... The entire centre opening is filled with perfectly flat solid pure magenta #FF00FF ... Outer edge sits on a pure white background."
- backdrop (4e036f03): "Flat front-on view of a layered paper-craft diorama landscape BACKDROP ... soft powder-blue to cream sky paper with a pale ochre paper sun disc and two tiny torn paper clouds; three overlapping torn-edge paper hill layers (powder blue, sage, dusty rose/terracotta) ... wide open centre for gameplay."
- texture (8f6abba2): "perfectly flat top-down macro photograph of a single sheet of matte terracotta-rose handmade cotton cardstock, uniform even lighting, no shadows/vignette/edges, seamless tileable."
- plaque (d1b2c8d2): "single blank HUD plaque: wide rounded-rectangle label of two stacked layers of matte cardstock, cream parchment top plate with thin deckled torn edge on a slightly larger dusty rose plate ... flat magenta background ... completely blank."
- button (1b0d5988): same idea as a circular cream disc on a larger sage disc, 1:1.

## How the build should use these
**Layer order (back to front), parallax factors from Paper World spec (0, .05, .12, .22, .40):**
1. bg-1-sky (0) - fixed; scale to cover.
2. bg-2-hills-far (.05) 3. bg-3-hills-mid (.12) 4. bg-4-hills-near (.22) - hill layers are cropped to their own top edge and bottom-aligned: anchor each layer's bottom to the bottom of the world window, scale width to about 110% of the opening so parallax never reveals edges. (Contact sheet lifts them 16% so the hills sit in the opening.) Gameplay 3D scene renders above these.
5. frame-4-vignette (0) - draws over the world, UNDER the frame.
6. frame-3-inner (.22), frame-2-secondary (.30), frame-1-outer (.40) - all three share the same 2400x1357 canvas and alignment (draw them stacked identically; offset for parallax). The opening is transparent; keep the canvas aspect (about 16:9) and letterbox/cover to the viewport, with HUD safe area inside the sage ring. On mobile portrait crop to the opening or scale the frame to cover with the opening centred.
7. HUD plates (parallax 0 / fixed): plaque-score (rose), plaque-combo (sage), plaque-timer (powder blue), button-round for pause and sound. They are BLANK: render values with live editorial serif text in ink colour (dark ink on cream, light cream on the dark twin). Light plate cream is about #EADBC4 so use AA-contrast ink.
- Dark theme: swap each file for its `-dark` twin (same dims). Vignette and textures are shared.
- Textures (paper-*.webp, 1024^2, seamless): set `wrapS = wrapT = RepeatWrapping`, sRGB colour space, repeat so one tile is about 2-3 world units; use paper-bump.webp (512, linear, grayscale) as bumpMap/roughnessMap with a low bumpScale. Suggested mapping: platforms -> terracotta / sage / blue / cream (cycle by index), collectibles: star -> ochre, ring -> rose, droplet -> blue, power-ups -> cream with their glyph textures.
- Lighting: upper-left key; baked shadows in the art fall bottom-right; keep real shadows consistent.

**Music** (muted by default, /lab only): queue music-1 -> music-2 -> music-1 ..., 60 ms equal-power crossfade at the seam; load music-2 only after music-1 has started; prefer .m4a with .mp3 fallback (Safari/Firefox). Loop files already have the seam baked; do not add extra gap.

**SFX loading/mute**: lazy-load all SFX (about 190 KB total) on first user gesture after unmute; honour the existing `muted` store flag (no SFX when muted); prefer .m4a, .mp3 fallback; pool 2-3 voices for bounce/squish; alternate bounce-1/bounce-2; throttle bounce to once per 120 ms; keep volume below the music.

**SFX -> game event mapping** (existing `audio.play(...)` names in components/lab/Driver.tsx; branch m-009-redesign): 
- 'squish' -> sfx/squish  - 'bounce' -> sfx/bounce-1 | bounce-2
- 'star' -> sfx/pluck-pop  - 'ring' -> sfx/combo-chime (combo step)
- 'powerup' / 'secret' -> sfx/win-flourish (or pluck-pop for powerup if flourish is too long; `secret` is a one-off)
- 'danger' -> sfx/tick (loop once per second during the DANGER countdown)
- 'gameover' -> sfx/thud
- New hooks not in the code today: UI pause/sound/intro buttons -> sfx/click; intro/pause/results card open/close -> sfx/rustle.

## Local post-processing in the repo (TASK-168)
- `art/frame-1-outer.webp` and `art/frame-1-outer-dark.webp` were re-keyed after delivery: the manifest art has an opaque page-colour surround (white `#FEFEFE` in light, navy in dark) outside the torn edge, which showed as a solid rectangle behind the frame. The surround (a neutral near-white region flood-filled from the border of the light file, one mask for both twins) is now transparent, and its baked shadow is kept as semi-transparent shadow-ink alpha. Script: `.eval/key-outer.mjs` (git-ignored; sharp, WebP q78 / alpha q80). Sizes: 184 KB light, 74 KB dark. Everything else is byte-identical to the manifest.
- Stacking: the three frame sheets are drawn back to front as outer, secondary, inner (the art is built that way: the cream sheet is the big one at the back, sage on top).

## Intro scene art (TASK-168, intro redesign)
Served from `public/media/lab/intro/`. Higgsfield gpt_image_2_5, 13 credits (12 layers + 1 plate sheet), keyed locally; the `-dark` plate variants in the manifest are not shipped (dark mode dims the light plates in CSS). Masters and tools: `/Volumes/E Drive/Dev/.scratch/gummy-remodel/intro/`. Table copied from the intro MANIFEST:
## Layer order (bottom to top), 2400x1350, all stack at 0,0
1. intro-bg (opaque) 2. intro-arch 3. intro-stage 4. intro-props-left 5. intro-props-right 6. [live 3D bear] 7. intro-fg. Stage is deliberately below the props (props stand on the desk). Plates and live text go above fg.
Parallax multipliers (suggested, base ~4px pointer travel): bg 1x, arch/stage/props 2x, bear 3x, fg 4x. Keep bg scale >=1.04 and fg >=1.08 to avoid edge reveal.

## Anchors (px in 2400x1350; percent = /2400, /1350)
- Stage top-centre (bear feet): x=1200, y=905 (centre of top disc surface). Top disc rim highest point y=809; top disc spans x~790-1710 (approx 38% of width).
- Sign tags (BLANK, same positions light and dark; tags are rotated about 0-3 deg, so inset text ~8%): 
  - tag1 x1714-2028 y266-408
  - tag2 x1752-2069 y411-535
  - tag3 x1740-2035 y542-679
  - tag4 x1743-2035 y684-816
- Lamp bulb centre approx (2190,205); in dark mode it is the warm amber source (glow spill to the right wall and signpost).
- Arch opening (transparent in intro-arch): x~700-1830, y 0-~960.

## Mobile (1080x1350, crop x660-1740 of the desktop framing, same px y)
bg, arch, stage only. props-left, props-right and fg omitted on mobile (crop removes them anyway); stage anchor becomes x=540,y=905. Stage disc is slightly clipped at the sides (about 60 px each).

## Files
| file | size | dims | sha256[:16] | source job |
|---|---|---|---|---|
| intro-arch-dark-mobile.webp | 65 KB | 1080x1350 | 27fdd51a408943e7 | 499cba5f-21e1-49be-a65d-5eb033a030b2 (cropped x660-1740) |
| intro-arch-dark.webp | 231 KB | 2400x1350 | 104f575e2d177598 | 499cba5f-21e1-49be-a65d-5eb033a030b2 |
| intro-arch-light-mobile.webp | 61 KB | 1080x1350 | 3369132ec4efcebe | fff7818c-1200-472e-9e12-e42ba39667f1 (cropped x660-1740) |
| intro-arch-light.webp | 255 KB | 2400x1350 | 27b6bfca322bf9d6 | fff7818c-1200-472e-9e12-e42ba39667f1 |
| intro-bg-dark-mobile.webp | 83 KB | 1080x1350 | 326ba55b5674da09 | 065304f9-a8dc-4467-a138-0bbab53bda94 (cropped x660-1740) |
| intro-bg-dark.webp | 239 KB | 2400x1350 | 3a9565473712d5fb | 065304f9-a8dc-4467-a138-0bbab53bda94 |
| intro-bg-light-mobile.webp | 62 KB | 1080x1350 | a7fb5cc5ca8b7004 | be6b5c7d-fe23-486d-8451-fcc8022cc5c2 (cropped x660-1740) |
| intro-bg-light.webp | 168 KB | 2400x1350 | dda38d0cb3d7b727 | be6b5c7d-fe23-486d-8451-fcc8022cc5c2 |
| intro-fg-dark.webp | 46 KB | 2400x1350 | 6ec226ca2254bb36 | 01f00bd8-8702-42c5-a1cc-9d22e1d816b4 |
| intro-fg-light.webp | 31 KB | 2400x1350 | 2149d0c85aee45f1 | 08ee2fee-d8d1-4b85-80e5-fdce670b7b64 |
| intro-plate-backtab-light.webp | 13 KB | 579x179 | 0e706d01ba9ce270 | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-plate-banner-light.webp | 64 KB | 1265x562 | ba6f60ced075c062 | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-plate-button-light.webp | 49 KB | 1000x318 | 1dacef90152a7ac7 | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-plate-key-light.webp | 18 KB | 571x294 | bdd7a7800da5956b | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-plate-note-light.webp | 13 KB | 557x187 | ae61cd3bdcd2455e | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-plate-sheet-light.webp | 51 KB | 624x812 | 47f4a4cb75efbd3f | 4b5c7404-e7c6-4335-969a-f8e37af6dc2a (sheet split, Pillow) |
| intro-props-left-dark.webp | 73 KB | 2400x1350 | 7758455b93f89b1c | a356c071-e0c3-4a39-bec8-9fc3f4674e8f |
| intro-props-left-light.webp | 72 KB | 2400x1350 | 10241db6e41b7f83 | e7d42a33-7a83-4687-8238-46270ebe38e4 |
| intro-props-right-dark.webp | 145 KB | 2400x1350 | 810b08b24cf24c9c | edea81bf-b408-4cbd-80c6-5d461050e7b7 |
| intro-props-right-light.webp | 157 KB | 2400x1350 | 96f87a071f88c1b1 | 9e59c5ec-586d-438d-9e6d-5708445a48f4 |
| intro-stage-dark-mobile.webp | 72 KB | 1080x1350 | 05dd26e8f0d8494b | f6991b4c-4851-4bc9-8347-c775d24be9ee (cropped x660-1740) |
| intro-stage-dark.webp | 138 KB | 2400x1350 | 98d6c82ff12d513b | f6991b4c-4851-4bc9-8347-c775d24be9ee |
| intro-stage-light-mobile.webp | 62 KB | 1080x1350 | 5af3373bcee51b35 | c775879c-78c9-4064-8ab0-b8b85e119f6b (cropped x660-1740) |
| intro-stage-light.webp | 130 KB | 2400x1350 | 2aa5ae95e94d63bb | c775879c-78c9-4064-8ab0-b8b85e119f6b |

Plates (text-free; trim includes ~6 px margin and soft shadow): banner (title, tape at top-centre), sheet (instructions, tape), note, button (terracotta, embossed inset border), backtab, key. Dark plate variants are Pillow recolours (charcoal-slate paper, burgundy button).
## Caveats
- Layers were generated separately on magenta, registered by composition prompt (dark by image reference); alignment verified visually on contact-intro.png, not pixel-exact. bg-dark composition (moon, clouds) differs from bg-light but the mountain/horizon band matches.
- Dark props desaturated 20% in post. Dark lamp: a small pink glow halo under the bulb was cut by a mask, leaving a slightly flat bulb bottom; glass jars keep a faint pink cast from the magenta backdrop (light and dark).
- Dark plates are dark and flat; tape strips on dark plates are barely visible; builder should lighten text/ink on them.
- No Pillow-level pixel-exact test of aspect: 2688x1520 originals were centre-cropped to 16:9 then resized.
- Some layers are baked-in lighting, so parallax shifts should be small (hence base ~4px).
