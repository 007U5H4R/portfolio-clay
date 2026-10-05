/**
 * Illustration manifest — the one source of truth for every illustration's id, kind, size and alt
 * (Design.md §6.1; S20 — EVAL-021, EVAL-013). Components never write an alt inline: they render
 * `illustration(id).alt` from `lib/illustrations.ts`.
 *
 * TSK-36: `file` / `publicSrc` / `width` / `height` now point at the shipped renditions under
 * `content/media/illustrations/` and `public/media/illustrations/` (provenance in this folder's
 * `README.md`). Scenes were re-encoded from the PNG masters with sharp (`jpeg({ quality: 82,
 * mozjpeg: true })`, long edge 2048) — `width`/`height` are the re-encoded pixel sizes, not the
 * mockup renditions' (scene-thinking and scene-contact differ from the earlier stub because their
 * long edge, not width, is 2336/2240 in the master).
 * TKT-107 (Dev-95): the six scenes are now 3168×1344 (21:9) Higgsfield outpaints — the home banner's size.
 * TASK-114 (Dev-103/104): two new scenes for `/work` and `/certifications`, encoded the same way at the same size.
 * TASK-117: `polaroid-sunrise`, the `/about` hero polaroid (a landscape without the character, public-only).
 * TASK-121: `cover-teachspark`, TeachSpark's painted 90s cover (carousel cover + `/projects` stage poster, public-only).
 * TASK-127: `cover-<slug>`, the hand-authored SVG product covers (scripts/portfolio-art/, public-only).
 * TASK-129: `cover-slag-city`, the thirteenth cover, in the same system.
 * TASK-144.5 (M-010 T3): the seven tab scenes are paper-cut stills, light + dark twins (`darkFile`), WebP, 3168×1344, with
 * pre-cropped narrow renditions under `public/` (provenance + job ids in this folder's `README.md`); `scene-casestudy` is
 * still the watercolour (144.4 deferred).
 * TASK-133: `featured-<slug>`, the three hand-authored cut-paper collages on the home Featured Work cards
 * (scripts/portfolio-art/featured/, public-only; full-card compositions since the fidelity pass).
 */

export type IllustrationKind = "scene" | "poster" | "clip" | "reference" | "mascot"; // "clip": no entry ships since S24 retired clip A, kept for the alt-prefix table
export interface Illustration {
  id: "hero-desk" | "hero-banner" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "scene-experience" | "scene-certifications" | "character-sheet-b" | "tushky" | "tushky-avatar" | "tushky-paws" | "polaroid-sunrise" | "cover-teachspark" | "cover-railcite" | "cover-velora" | "cover-cubicle" | "cover-nuptis" | "cover-bhakti-vilas" | "cover-token-toli" | "cover-pratyasa" | "cover-tegaki" | "cover-dino-arcade-pwa" | "cover-cinematic-portfolio" | "cover-campfire-board" | "cover-slag-city" | "featured-railcite" | "featured-slag-city" | "featured-campfire-board";
  kind: IllustrationKind;
  file: string;          // relative to content/media/illustrations/ (source rendition; the LIGHT rendition when `darkFile` is set)
  darkFile?: string;     // TASK-140 (S23, EV9, EVAL-025): the paired dark-theme rendition — same entry, same alt, identical pixel size
  publicSrc?: string;    // served path under public/media/illustrations/ (clip + poster + mascot; scenes go through next/image)
  width: number; height: number;
  alt: string;           // MUST start with "Illustration of" (scenes/poster), "Animated illustration of" (clip) or "Tushky, " (mascot); ≥ 8 chars (schema)
  usedOn: string[];      // routes
}

export const ILLUSTRATIONS: readonly Illustration[] = [
  {
    id: "hero-desk",
    kind: "poster",
    file: "hero-desk.webp",
    publicSrc: "/media/illustrations/hero-poster.webp",
    width: 1280,
    height: 684,
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, books, a plant, a lamp, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact.",
    // TKT-93: never an <img> on `/`. TASK-140 (S24) retired the clip it was the poster of; it now survives only as the
    // OG image's source (`lib/og.tsx` OG_POSTER_PATH) and the intro video's dev board — retire with the OG re-skin.
    usedOn: ["/"],
  },
  {
    // TASK-140 (S24 / Dev-136): the home banner is now a paper-cut STILL (Higgsfield `gpt_image_2_5`, light + dark twin,
    // 2688×1152 masters → 3168×1344 renditions). The full-bleed home banner and the LCP image; no clip. Static import via
    // lib/illustrations.ts (`sceneImage("hero-banner")`) so next/image emits AVIF/WebP + srcset. `darkFile` is the matched
    // evening twin (identical size, one shared alt) — T2 (TASK-141) wires it to `data-theme`.
    id: "hero-banner",
    kind: "scene",
    file: "hero-banner.webp",
    darkFile: "hero-banner-dark.webp",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar in layered paper-cut at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, a mountain photo, and a stack of books.",
    usedOn: ["/"],
  },
  {
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 11c66397-6bab-437c-904e-4e5511c68643, dark twin job cdcd15cc-7588-4201-8c7c-d2dcea634bb3 (the Portfolio tab's art); masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-work",
    kind: "scene",
    file: "scene-work.webp",
    darkFile: "scene-work-dark.webp",
    width: 3168,
    height: 1344, // 21:9, the home banner's size (Dev-95); TASK-144.5: the paper-cut still, light + dark twin
    alt: "Illustration of a layered paper-cut shelf wall — two wooden shelves of blank project boxes beside a toy train, a skyline model, a campfire, a tiny cubicle, an arcade cabinet, fabric swatches and a potted plant, under a kraft banner with an empty cream frame hanging at the centre.",
    usedOn: ["/projects", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-casestudy",
    kind: "scene",
    file: "scene-casestudy.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table.",
    usedOn: [], // TASK-130 (Dev-130): case studies open on their own product hero; kept for /dev/primitives
  },
  {
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 7d278780-cce9-4310-af45-d0ed1a3932b9, dark twin job 6e6a891c-318e-4376-9bd1-52abcf143a6b (About v2, the mountain overlook); masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-about",
    kind: "scene",
    file: "scene-about.webp",
    darkFile: "scene-about-dark.webp",
    width: 3168,
    height: 1344, // 21:9, the home banner's size (Dev-95); TASK-144.5: the paper-cut still, light + dark twin
    alt: "Illustration of Tushar from behind in layered paper-cut, coffee in one hand and a notebook under his arm, looking out from a grassy hillside over misty blue mountain ridges, a river and pine forest towards a terracotta sun and snow-capped peaks.",
    usedOn: ["/about", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 6b3996bc-c57f-4f38-ae4b-ffbdad03cce7, dark twin job 7193f293-32bc-4847-b883-adab46d94f4b; masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-thinking",
    kind: "scene",
    file: "scene-thinking.webp",
    darkFile: "scene-thinking-dark.webp",
    width: 3168,
    height: 1344, // 21:9, the home banner's size (Dev-95); TASK-144.5: the paper-cut still, light + dark twin
    alt: "Illustration of Tushar in layered paper-cut resting his chin on his hand at a writing desk, a winding paper pathway leading from him across green hills past six stations — a magnifying glass over a page, sticky notes, a glowing light bulb, stacked blocks, a checked sheet and a red star.",
    usedOn: ["/thinking", "/thinking/[slug]"], // TKT-95: the scene opener on the index and every essay
  },
  {
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 056cc7b5-4245-49bc-8c04-98264d72a3a4, dark twin job 25e39e33-90c8-44e2-bed1-2e2d70b91411; masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-playground",
    kind: "scene",
    file: "scene-playground.webp",
    darkFile: "scene-playground-dark.webp",
    width: 3168,
    height: 1344, // 21:9, the home banner's size (Dev-95); TASK-144.5: the paper-cut still, light + dark twin
    alt: "Illustration of Tushar in layered paper-cut at a workshop stage, holding up a small cardboard prototype with a gear between red curtains and a backdrop of cardboard machines and a rocket — a paper plane, a toy car, scissors, tape and a tablet sketch on the desk.",
    usedOn: ["/playground", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 18705997-f3f5-4abf-8171-5d71ca88fff1, dark twin job 81c70e0b-f337-463d-9f99-3f50268e6199; masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-contact",
    kind: "scene",
    file: "scene-contact.webp",
    darkFile: "scene-contact-dark.webp",
    width: 3168,
    height: 1344, // 21:9, the home banner's size (Dev-95); TASK-144.5: the paper-cut still, light + dark twin
    alt: "Illustration of Tushar in layered paper-cut waving with one hand and holding a terracotta mug in the other, on the last page of a ruled notebook beside an envelope, a fountain pen, a paper plane and a flowering plant, with paper hills below.",
    // TASK-144.5: the hero intro video's poster is now its own file (`intro-poster.webp`, the retired watercolour's 4:3
    // character crop, Dev-132) — `scene-contact-mobile.webp` is the new paper-cut crop, so `/` no longer uses this scene.
    usedOn: ["/contact"],
  },
  {
    // TASK-114 (Design.md §11 Dev-103): the `/work` Experience opener — a new Higgsfield `gpt_image_2_5`
    // 21:9 scene (every existing scene is already used on another page), 3840×1648 master cropped 19 px
    // top/bottom to 21:9 and resized to the home banner's 3168×1344.
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 70ec7a0b-961f-4cbf-93eb-d871087034ba, dark twin job b4f6f12c-0d86-4133-8626-046d208d7464 (dark = regeneration 1); masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-experience",
    kind: "scene",
    file: "scene-experience.webp",
    darkFile: "scene-experience-dark.webp",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar in layered paper-cut presenting at a whiteboard of blue, terracotta and yellow sticky notes above a timeline arrow — a laptop, a mug and a notebook on the wooden table before a window onto a paper city skyline.",
    usedOn: ["/work"],
  },
  {
    // TASK-114 (Design.md §11 Dev-104): the `/certifications` opener — a new Higgsfield `gpt_image_2_5`
    // 21:9 scene, encoded as `scene-experience`.
    // TASK-144.5 (M-010 T3) provenance: Higgsfield `gpt_image_2_5` medium 2k 21:9 — light job 7af13257-37ce-43c1-9038-febd82f176f7, dark twin job 7c320b38-d6e9-487d-b9b1-7c5ac8412d9c; masters under Portfolio-illustration/illustrations/paper-cut/.
    id: "scene-certifications",
    kind: "scene",
    file: "scene-certifications.webp",
    darkFile: "scene-certifications-dark.webp",
    width: 3168,
    height: 1344,
    alt: "Illustration of a layered paper-cut credential board — a cork pinboard of eight blank certificates with ribbon rosettes, and a wooden shelf below holding a golden trophy, a stack of books and a potted plant.",
    usedOn: ["/certifications"],
  },
  {
    id: "character-sheet-b",
    kind: "reference",
    file: "reference/character-sheet-b.jpg",
    width: 2688, // never rendered on a page (usedOn: []) — Stage-8 drift check only
    height: 1520,
    alt: "Illustration reference sheet of the Tushar character — front, three-quarter and profile views.",
    usedOn: [],
  },
  {
    // TKT-104 (Design.md §11 Dev-48) → TKT-104 r2 (Dev-62): the Ask Tushky drawer mascot. v2 is a golden
    // retriever, head and shoulders, in a navy bandana lettered "Tushky" (Tushar 2026-09-26). It was
    // generated with Tushar's approved spend: Higgsfield `gpt_image_2_5`, job 20288256-…, 0.5 cr,
    // reference = the round-1 alternate 7312a2c0-…. Served as-is from public/ (231×280 WebP with alpha)
    // and rendered only inside the lazy AskPanel chunk, never on a page, so `usedOn` names the panel.
    id: "tushky",
    kind: "mascot",
    file: "",
    publicSrc: "/media/illustrations/tushky-bandana.webp",
    width: 231,
    height: 280,
    alt: "Tushky, the golden retriever portfolio assistant, wearing a navy bandana lettered Tushky",
    usedOn: ["Ask panel (every route)"],
  },
  {
    // TKT-104 r2 (Dev-62): a 64 px head crop of the same image, used as the chat-bubble and
    // chat-header avatar. It renders decoratively (alt="") because each bubble already names Tushky.
    id: "tushky-avatar",
    kind: "mascot",
    file: "",
    publicSrc: "/media/illustrations/tushky-avatar.webp",
    width: 64,
    height: 64,
    alt: "Tushky, the golden retriever portfolio assistant (chat avatar)",
    usedOn: ["Ask panel (every route)"],
  },
  {
    // TKT-113 (Design.md §11 Dev-67): the Home "Ask Tushky" launcher's mascot — the same bandana
    // retriever, chest up, both front paws resting on the lower edge (spec §5). The drawer's 231×280
    // head-and-shoulders crop has no paws and is too small for ~280 px on 2x screens, so this is a new
    // Higgsfield `gpt_image_2_5` generation (job cb694791-…, reference = the `tushky` source job
    // 20288256-…, 0.5 cr, Tushar-approved spend). 403×560 WebP with alpha (280 px tall at 2x).
    id: "tushky-paws",
    kind: "mascot",
    file: "",
    publicSrc: "/media/illustrations/tushky-paws.webp",
    width: 403,
    height: 560,
    alt: "Tushky, the golden retriever portfolio assistant, resting his paws on the page in a navy bandana lettered Tushky",
    usedOn: ["/"],
  },
  {
    // TASK-117 (Design.md §11, Tushar's About hero spec 2026-09-28 §13): the `/about` hero polaroid — a
    // text-free watercolour mountain sunrise with no people, in the scenes' style (Higgsfield
    // `gpt_image_2_5`, job 0d16b793-…, style reference = the `scene-about` outpaint input). Served from
    // public/ (560×700 WebP, ≈ 2× its largest rendered width) through `Illustration placement="photo"`,
    // lazy — never the LCP (the opener is). A meaningful image (spec §26), so it has a real alt.
    id: "polaroid-sunrise",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/polaroid-sunrise.webp",
    width: 560,
    height: 700,
    alt: "Illustration of a watercolour sunrise over snow-capped mountains, misty pine valleys and a hillside path.",
    usedOn: ["/about"],
  },
  {
    // TASK-121 painted a raster cover here (Dev-115); TASK-127 (fidelity spec §4, §10, §12) replaced it with
    // a hand-authored SVG counterpart of the same concept, so all twelve covers share one illustration
    // style (scripts/portfolio-art/scenes/teachspark.ts). Carousel cover (5:6) + stage poster (16:9).
    id: "cover-teachspark",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-teachspark.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a friendly cream robot with a smiling screen face on a teacher's desk, holding out a fan of three ruled worksheets beside a plain green chat bubble with a page in it, a navy chalkboard of chalk doodles behind, a glowing desk lamp, and a dusk window, globe and phone.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127 (Tushar's portfolio fidelity spec 2026-09-28 §4, §12): RailCite's cover — a hand-authored,
    // text-free 1600×900 SVG (scripts/portfolio-art/scenes/railcite.ts), the carousel cover (5:6 crop)
    // and the stage poster (16:9). No generation, no credits.
    id: "cover-railcite",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-railcite.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a cream streamliner with a rust chevron coming down the line at dusk, the sun setting behind it — every third sleeper a ruled document page, a signal ahead showing green, a lit signal box, and a stack of bound volumes with a magnifier in the foreground.",
    usedOn: ["/projects", "/work/railcite"], // TASK-130: also the case study's pitch-video poster
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/velora.ts) — carousel cover + stage poster.
    id: "cover-velora",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-velora.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a sunset atelier: a dress form in a draped rose gown with a gold sash and a tape measure stands before a garment rack, an arched window shows a violet-to-peach sky over low workshop roofs, and a worktable holds fabric swatches, two tied with thread, spools and shears.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/cubicle.ts) — carousel cover + stage poster.
    id: "cover-cubicle",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-cubicle.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a beige 1990s computer monitor in a navy office cubicle at golden hour, its screen split into four coloured teammate panes with four matching speech bubbles rising above it, pinned index cards joined by string, a wall clock, a plant and four printouts on the desk.",
    usedOn: ["/projects"], // TASK-130 redesign: the journal hero is its own office scene with the real UI
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/nuptis.ts) — carousel cover + stage poster.
    id: "cover-nuptis",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-nuptis.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of an Indian wedding mandap being set up at golden hour: a floral canopy with blush domes on four marigold-wrapped pillars, garland swags and small lights, flower crates on the lawn, a hazy palace, and a planner's table with a checklist clipboard, walkie-talkie and ribbon badges.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/bhakti-vilas.ts) — carousel cover + stage poster.
    id: "cover-bhakti-vilas",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-bhakti-vilas.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of dawn at a riverside temple: a harmonium with open bellows rests on a striped rug on stone steps beside a lit brass diya and manjira cymbals, while across the misty river stand a temple spire and the rising sun, with lotuses, floating lamps, a moored boat and hanging bells.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/token-toli.ts) — carousel cover + stage poster.
    id: "cover-token-toli",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-token-toli.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a cosy hillside home at dusk with a lit window and a rocking chair on the porch, a mailbox by the gate, a lane winding away to a distant city, a paper plane flying along the line between poles, and an open notebook of research notes with sticky notes and glasses in the foreground.",
    usedOn: ["/projects", "/work/token-toli"], // TASK-130: also the case-study hero
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/pratyasa.ts) — carousel cover + stage poster.
    id: "cover-pratyasa",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-pratyasa.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a lab bench at blue hour: a handheld analyser with a curve on its screen and a sample droplet on its sensor strip, a phone showing a line graph, test tubes and a flask, a brass desk lamp, a microscope by the window, and a certificate scroll tied with a ribbon and a wax seal.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/tegaki.ts) — carousel cover + stage poster.
    id: "cover-tegaki",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-tegaki.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a writing desk at dusk: a page of handwritten loops under a brass magnifying glass, a fountain pen, an ink bottle and washi tape, a folded letter with a vermilion seal, a teacup, a paper lantern and a plum-blossom sprig, before an indigo sky with a vermilion sun over a band of wave pattern.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/dino-arcade-pwa.ts) — carousel cover + stage poster.
    id: "cover-dino-arcade-pwa",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-dino-arcade-pwa.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a teal smartphone dressed as a little arcade cabinet, a lit striped marquee on top and a pixel dinosaur on its screen, standing on a shelf before a big striped sunset over red desert mesas and pixel cacti, two coins beside it and a blank memory card sliding towards it.",
    usedOn: ["/projects"], // TASK-130 redesign: the journal hero is its own postcard scene with the real UI
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/cinematic-portfolio.ts) — carousel cover + stage poster.
    id: "cover-cinematic-portfolio",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-cinematic-portfolio.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a dusky screening room: a vintage reel projector on a table throws a warm, dusty beam onto a curtained screen showing mountains at sunrise, with a film strip of tiny landscape frames curling through the foreground, a clapperboard, film cans and a director's chair.",
    usedOn: ["/projects"],
  },
  {
    // TASK-127: hand-authored SVG cover (scripts/portfolio-art/scenes/campfire-board.ts) — carousel cover + stage poster.
    id: "cover-campfire-board",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-campfire-board.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a night campsite: a campfire with rising sparks beside a wooden easel pinned with three columns of paper cards above a plank of staggered bars, three tents, pines, a lantern post and a crescent moon, and a log seat with a mug beside a stack of cut logs.",
    usedOn: ["/projects"],
  },
  {
    // TASK-129: hand-authored SVG cover (scripts/portfolio-art/scenes/slag-city.ts) — carousel cover + stage poster.
    id: "cover-slag-city",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/covers/cover-slag-city.svg",
    width: 1600,
    height: 900,
    alt: "Illustration of a ruined industrial city at smoggy dusk: a forge hammer stands head-down on a heap of slag before a foundry's blazing furnace arch, molten slag runs out towards the viewer, and smokestacks, a blast-furnace tower, gutted buildings, a leaning crane and a broken green dome stand in the haze.",
    usedOn: ["/projects"],
  },
  {
    // TASK-133: hand-authored SVG collage (scripts/portfolio-art/featured/railcite.ts) — the home Featured Work anchor card.
    id: "featured-railcite",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/featured/featured-railcite.svg",
    width: 1450,
    height: 1000,
    alt: "Illustration of a cut-paper collage: a navy, cream and red streamliner coming off a stone viaduct towards the viewer, a railway circular with a round seal and a red approval stamp, a route map and a sepia photo of a viaduct in front of a rust sun, pale mountains with a river and a dark pine forest.",
    usedOn: ["/"],
  },
  {
    // TASK-133: hand-authored SVG collage (scripts/portfolio-art/featured/slag-city.ts) — home Featured Work, top-right card.
    id: "featured-slag-city",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/featured/featured-slag-city.svg",
    width: 1240,
    height: 620,
    alt: "Illustration of a cut-paper collage: a charcoal and navy foundry skyline with smokestacks, a blast furnace, a rust brick block and a conveyor truss before a rust sun, a torn district map, glowing slag running into dark water, and a lone pine.",
    usedOn: ["/"],
  },
  {
    // TASK-133: hand-authored SVG collage (scripts/portfolio-art/featured/campfire-board.ts) — home Featured Work, bottom-right card.
    id: "featured-campfire-board",
    kind: "scene",
    file: "",
    publicSrc: "/media/illustrations/featured/featured-campfire-board.svg",
    width: 1240,
    height: 640,
    alt: "Illustration of a cut-paper collage: a planning board on an easel with a hand-drawn map and pinned, scribbled paper notes, a campfire in a ring of stones between two wooden chairs, a mug, a lake, hills, pines and a low sunset circle.",
    usedOn: ["/"],
  },
];
