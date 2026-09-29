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
 */

export type IllustrationKind = "scene" | "poster" | "clip" | "reference" | "mascot";
export interface Illustration {
  id: "hero-desk" | "hero-banner" | "hero-clip" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "scene-experience" | "scene-certifications" | "character-sheet-b" | "tushky" | "tushky-avatar" | "tushky-paws" | "polaroid-sunrise" | "cover-teachspark" | "cover-railcite" | "cover-velora" | "cover-cubicle" | "cover-nuptis" | "cover-bhakti-vilas" | "cover-token-toli" | "cover-pratyasa" | "cover-tegaki" | "cover-dino-arcade-pwa" | "cover-cinematic-portfolio" | "cover-campfire-board" | "cover-slag-city";
  kind: IllustrationKind;
  file: string;          // relative to content/media/illustrations/ (source rendition)
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
    // TKT-93: no longer rendered as an <img>; ships as the clip's `poster` attribute on `/` (Design.md §5.2).
    usedOn: ["/"],
  },
  {
    // TKT-93 (Dev-23 / EXE-15): the 21:9 outpaint of `hero-desk` — the full-bleed home banner and the
    // LCP image; the clip is registered on it (components/hero/registration.ts). Static import via
    // lib/illustrations.ts (`sceneImage("hero-banner")`) so next/image emits AVIF/WebP + srcset.
    id: "hero-banner",
    kind: "scene",
    file: "hero-banner.webp",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, and books titled Product Thinking, AI & Society, System Thinking and A Better Tomorrow.",
    usedOn: ["/"],
  },
  {
    id: "hero-clip",
    kind: "clip",
    file: "",
    publicSrc: "/media/illustrations/hero-animation.webm",
    width: 1280,
    height: 684,
    alt: "Animated illustration of Tushar thinking at his desk and turning a pen — plays once.",
    usedOn: ["/"],
  },
  {
    id: "scene-work",
    kind: "scene",
    file: "scene-work.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar pinning a product sketch to a corkboard already covered in wireframes, flow diagrams, sticky notes and small landscape photos — a plant and a green mug on the shelf below — beside a quiet studio corner: a wooden bookshelf, trailing and potted plants, and sketches, swatches and landscapes taped to the wall.",
    usedOn: ["/projects", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-casestudy",
    kind: "scene",
    file: "scene-casestudy.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table.",
    usedOn: ["/work/[slug]"],
  },
  {
    id: "scene-about",
    kind: "scene",
    file: "scene-about.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar from behind on a hillside path at dawn, coffee in one hand and a notebook under his arm, looking out over pine forest towards a snow-capped mountain horizon.",
    usedOn: ["/about", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-thinking",
    kind: "scene",
    file: "scene-thinking.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar writing in an open notebook at a wooden desk by a window — a green lamp, a cup of tea, stacked books, a plant, and a sketched flow diagram on loose paper.",
    usedOn: ["/thinking", "/thinking/[slug]"], // TKT-95: the scene opener on the index and every essay
  },
  {
    id: "scene-playground",
    kind: "scene",
    file: "scene-playground.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar at a tinkering workbench, holding up a small cardboard prototype with wires; a breadboard, tape, scissors, paper planes and a tablet sketch sit on the desk under a green lamp.",
    usedOn: ["/playground", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-contact",
    kind: "scene",
    file: "scene-contact.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar standing by a window next to a tall leafy plant, a terracotta coffee mug in one hand, the other raised in a friendly wave.",
    usedOn: ["/contact"],
  },
  {
    // TASK-114 (Design.md §11 Dev-103): the `/work` Experience opener — a new Higgsfield `gpt_image_2_5`
    // 21:9 scene (every existing scene is already used on another page), 3840×1648 master cropped 19 px
    // top/bottom to 21:9 and resized to the home banner's 3168×1344.
    id: "scene-experience",
    kind: "scene",
    file: "scene-experience.jpg",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar in a sunlit meeting room pointing at a whiteboard of sticky notes in three columns above a timeline arrow — a laptop, a mug and a notebook on the long wooden table, plants, and a city skyline through tall windows.",
    usedOn: ["/work"],
  },
  {
    // TASK-114 (Design.md §11 Dev-104): the `/certifications` opener — a new Higgsfield `gpt_image_2_5`
    // 21:9 scene, encoded as `scene-experience`.
    id: "scene-certifications",
    kind: "scene",
    file: "scene-certifications.jpg",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar in a warm home study hanging a framed certificate on a wall of framed certificates and a ribbon medal, his golden retriever sitting and looking up at him — an armchair by the window, a bookshelf and a desk lamp.",
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
    usedOn: ["/projects"],
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
    usedOn: ["/projects"],
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
    usedOn: ["/projects"],
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
    usedOn: ["/projects"],
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
];
