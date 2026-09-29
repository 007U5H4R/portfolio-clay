# Trace — Slag City (TASK-129, M-009)

Every field in the Slag City `Project` record (`data/projects.ts`, slug `slag-city`) and its Portfolio
entry (`data/portfolio.ts`) traces to a source below. Sources are the `SourceRef.id`s declared in
`slagCity.sources[]`; every source resolves to CONTENT_INVENTORY §8.13. `SC` = `Slag City/` (read-only;
nothing was written there).

**Depth decision.** Slag City is a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`), like Campfire Board. Its `/work/slag-city` page is the
shared thin template, showing the two `overview.thirtySecond` paragraphs and the "Deep dive coming" tag.
The repo has a Discovery PRD, a Solution PRD and a build ledger that could fill chapters later; this ticket
adds the product, not a case study.

**Names.** No story character is named anywhere on the site. The README names the hero's targets and the
three bosses; the final boss shares a name with a well-known Indian TV villain (Tushar, 2026-09-29). The
copy describes the story as "a three-boss gauntlet" with "an eight-slide intro and the boss dialogue".

**AI.** The game has no AI features: the README describes none, and the Solution PRD's `ai/` folder is
ordinary enemy behaviour (attacker tickets, targeting, boss phases). The **art** is AI-generated, and the
overview says so (README Credits & license: "Character and background art was generated with Higgsfield").
The cover draws no robot or AI imagery (the README's enemies are "the machines"; none are drawn).

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `SC-README` | Slag City README | `SC/README.md` (header, intro, Highlights, How it works, Credits & license) | §8.13 |
| `SC-DISCOVERY` | Slag City Discovery PRD | `SC/Discovery-PRD.md` §1 (2026-09-05) | §8.13 |
| `SC-DEPLOY` | Slag City deploy notes | `SC/docs/deploy/DEPLOY.md` (LIVE 2026-09-16) | §8.13 |

## Fields → source

| Field | Value | Source line |
|---|---|---|
| `name` | "Slag City" | README marquee alt "SLAG CITY"; YouTube titles "slag city launch" / "SlagCity demo enhanced" |
| `tagline` | "An original arcade beat-'em-up that runs in your browser — one complete stage, on a desktop cabinet or a phone." | README header: "An original arcade beat-'em-up that runs in your browser."; intro: "It is one complete stage … playable on a desktop in a simulated cabinet or on a phone with on-screen controls" |
| `tags` | Phaser 3 · Beat-'em-up · Browser game | README badges (Phaser 3.90); header ("beat-'em-up that runs in your browser") |
| `status` / `statusLabel` / `statusAsOf` | `live` / "Live · browser game" / 2026-09-29 | DEPLOY.md: "🚀 LIVE 2026-09-16 — https://slag-city.vercel.app"; HTTP 200 checked 2026-09-29 by Tushar and by the TASK-129 implementer |
| `role` | "Owner · personal build" | Discovery PRD §2: "Primary — the owner"; HANDOFF: "Owner approved …", "owner said …" |
| `dates` / `duration` | 2026-09 / "Sep 2026" | Discovery PRD "2026-09-05"; first commit 2026-09-06; DEPLOY.md live 2026-09-16; last commit 2026-09-17 |
| `links.live` | `https://slag-city.vercel.app` | README "▶ Play it — slag-city.vercel.app"; DEPLOY.md; HTTP 200 (2026-09-29) |
| `links.github` / `repoPublic` | `https://github.com/007U5H4R/slag-city` / `true` | README clone URL; DEPLOY.md "(PRIVATE — make public when ready)"; made public at Tushar's request 2026-09-29 (orchestrator; GitHub API 200 without auth, re-checked by the implementer) |
| `overview.thirtySecond[0]` | coin-op loop, 10-second continue, one stage, three-boss gauntlet, eight-slide intro, desktop cabinet or phone, coins free, why (Dino Arcade can't be published) | README intro ("built the way a coin-op cabinet behaves: attract mode, insert coin, fight, continue countdown, initials on the hi-score table", "one complete stage", "Coins are free"); Highlights ("a 10-second CONTINUE countdown", "A three-boss gauntlet with dialogue", "an eight-slide intro and a twist delivered in the boss dialogue"); Discovery PRD §1 ("It is fine for private use and cannot be published"; "a publishable … *original* arcade beat-'em-up … with wholly original IP") |
| `overview.thirtySecond[1]` | Phaser 3 + TypeScript + Vite on Vercel; pure deterministic core, seeded RNG, hashed replays, golden; one input frame; Web Audio; Higgsfield art + atlas pipeline | README badges; How it works ("`src/core` is pure, deterministic game logic", "Input is just a frame of booleans … OR-ed into one `InputFrame`", "Audio is synthesised in the browser with Web Audio"); Highlights ("the game logic is pure TypeScript with a seeded RNG; recorded input replays are hashed in tests, so a behaviour change fails a golden"); Credits & license ("Character and background art was generated with Higgsfield and processed through the repo's atlas pipeline") |
| portfolio `code` | "SC-01" | initials + edition (the file's convention) |
| portfolio `coverLine` | "Coin-op brawler, in the browser" | README header "Coin-op loop"; intro "a side-scrolling brawler"; header "runs in your browser" |
| portfolio `meta` | "Live · browser game" | shortening of `statusLabel` (identical) |
| portfolio `accent` / `lettering` / `coverGlyph` | `rust` / `block` / `Hammer` | packaging: rust for the foundry, block lettering (a heavy arcade feel), the forge hammer (README intro: "you crawl out of the rubble with a forge hammer") |
| portfolio `pitchVideo` | YouTube `1xvj8j79Svs` | Tushar 2026-09-29: oEmbed title "slag city launch", channel "The Purposeful PM", public + embeddable (re-checked via oEmbed by the implementer) |
| portfolio `demoVideo` | YouTube `tc4QDVl8NJM` | Tushar 2026-09-29: oEmbed title "SlagCity demo enhanced", public + embeddable (re-checked) |
| cover `cover-slag-city` | hand-authored SVG, `scripts/portfolio-art/scenes/slag-city.ts` | README intro (Earth "turned … to slag", "rubble", "a forge hammer"); LEDGER ticket 14.3 (the stage's belts, molten channel and ladle pours) — a foundry, a molten channel and a conveyor are drawn; no character, no machine enemy, no game art |

## Honesty / hedges preserved

- **No metrics, users or outcomes** (`metrics: []`, `learnings: []`): none are recorded. The optional
  Mixpanel funnel in the README has no recorded numbers.
- **"Original"** is the README's own word (original IP: story, design, code); the overview also says the
  art was generated with Higgsfield, so "original" is never read as "hand-drawn".
- **Trademark:** DEPLOY.md records the working title's USPTO/EUIPO clearance as an open owner gate. The site
  makes no claim about it; flagged to Tushar in the TASK-129 report.
