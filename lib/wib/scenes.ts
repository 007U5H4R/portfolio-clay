/**
 * TASK-203 · "What I Bring" paper-craft scenes: the ART and ANIMATION configuration, kept apart from the copy
 * (`data/what-i-bring.ts`). One entry per stage: its depth-ordered parts (bottom to top), where each part pivots, the
 * hand-drawn overlay strokes (SVG, viewBox 720) and how long the signature sequence runs (the CSS in `app/globals.css`
 * `=== TASK-203 ===` owns the keyframes; `duration` is only the timer that moves the state machine to `settled`).
 *
 * Art provenance: `public/media/what-i-bring/scenes/<stage>/<light|dark>/<part>.webp` (512 px RGBA). Light = the TASK-187
 * masters, night = Higgsfield GPT Image 2.5 relights of them (they register to the light masters at IoU >= 0.99, so one
 * set of cut masks serves both themes). Parts were cut top to bottom and each hole was filled, so a moving part exposes
 * paper, not a copy of itself.
 */
import type { WibStage } from "@/data/what-i-bring";

export type StageId = WibStage["id"];
export type WibPart = {
  id: string;
  /** Parallax depth: 1 back, 2 middle, 3 front (2 / 4 / 6 px at most). */
  depth: 1 | 2 | 3;
  /** transform-origin, % of the 720 box. */
  origin?: string;
  /** A second sprite cross-faded in by the activation (bulb, chip): `<id>-lit.webp`. */
  lit?: boolean;
};
export type WibStroke = {
  id: string;
  d: string;
  /** Part whose wrapper carries this stroke, so it moves with the part. Omitted = scene level. */
  on?: string;
  /** Scene-level strokes render just before this part (default: after every part). */
  before?: string;
  /** Present at rest as a faint line (AI and Technology connectors); others only exist once drawn. */
  rest?: boolean;
  kind?: "line" | "ring" | "mark";
};
export type WibScene = {
  parts: WibPart[];
  strokes: WibStroke[];
  /** Soft ellipse under the lifted object: [left %, top %, width %, height %] of the box, attached to `part`. */
  shade?: { part: string; box: [number, number, number, number] };
  /** Signature sequence length in ms (matches the longest part animation + delay in the CSS). */
  duration: number;
  /** Alt text of the activated end state, for the sr-only description. */
  settledAlt: string;
};

export const ROAD =
  "M405 697C405 693 410 680 407 674C404 668 391 667 384 663C377 659 372 653 366 650C360 647 350 651 346 647C342 643 342 633 339 626C336 619 326 610 325 603C324 596 328 586 333 581C338 576 348 578 355 575C362 572 371 567 378 563C385 559 390 554 397 551C404 548 413 550 419 546C425 542 433 531 434 524C435 517 430 509 425 502C420 495 413 486 406 482C399 478 392 480 385 479C378 478 370 475 362 473C354 471 346 472 339 468C332 464 326 456 323 449C320 442 318 433 320 426C322 419 330 413 337 409C344 405 352 403 360 400C368 397 375 395 383 392C391 389 400 386 406 381C412 376 418 367 417 360C416 353 409 344 403 338C397 332 388 330 380 327C372 324 364 322 357 317C350 312 339 307 337 300C335 293 338 284 343 277C348 270 359 266 364 261C369 256 369 256 371 250C373 244 377 227 378 222";

export const wibScenes: Record<StageId, WibScene> = {
  ambiguity: {
    parts: [
      { id: "base", depth: 1 },
      { id: "note-o", depth: 2, origin: "28% 74%" },
      { id: "note-g", depth: 2, origin: "69% 50%" },
      { id: "note-y", depth: 2, origin: "35% 46%" },
      { id: "tag", depth: 3, origin: "49% 47%" },
    ],
    strokes: [
      { id: "c1", d: "M285 300C310 270 335 242 352 216" },
      { id: "c2", d: "M440 300C420 280 402 252 392 224" },
      { id: "c3", d: "M190 440C195 426 205 412 216 402" },
    ],
    shade: { part: "tag", box: [44, 40, 24, 8] },
    duration: 1500,
    settledAlt: "The crumpled paper has settled, the question tag stands tall and the notes are squared up and connected",
  },
  discovery: {
    parts: [
      { id: "base", depth: 1 },
      { id: "page", depth: 2, origin: "43% 78%" },
      { id: "card-b", depth: 2, origin: "85% 61%" },
      { id: "card-a", depth: 2, origin: "83% 44%" },
      { id: "lens", depth: 3, origin: "42% 53%" },
    ],
    strokes: [
      { id: "hl", on: "page", d: "M345 262H462", kind: "mark" },
      { id: "ul", on: "page", d: "M348 296q10-8 20 0t20 0t20 0t20 0t20 0" },
    ],
    shade: { part: "page", box: [8, 70, 62, 10] },
    duration: 1500,
    settledAlt: "The notebook has opened a little, the magnifying glass rests over a highlighted passage and two research notes have slid into view",
  },
  product: {
    parts: [
      { id: "base", depth: 1 },
      { id: "board", depth: 2, origin: "51% 76%" },
      { id: "compass", depth: 3, origin: "33% 81%" },
      { id: "rays", depth: 2, origin: "74% 17%" },
      { id: "bulb", depth: 3, origin: "74% 26%", lit: true },
    ],
    strokes: [
      { id: "ln", on: "board", d: "M290 438L362 421L435 394L510 367" },
      { id: "n1", on: "board", d: "M290 438m-13 0a13 13 0 1 0 26 0a13 13 0 1 0-26 0", kind: "ring" },
      { id: "n4", on: "board", d: "M510 367m-16 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0", kind: "ring" },
      { id: "tab", on: "board", d: "M452 306h92v36h-92z", kind: "mark" },
    ],
    shade: { part: "board", box: [24, 70, 56, 9] },
    duration: 1700,
    settledAlt: "A line has been drawn across the blueprint, a planning note is pinned to it and the paper lightbulb is lit",
  },
  "ai-genai": {
    parts: [
      { id: "base", depth: 1 },
      { id: "context", depth: 2, origin: "31% 72%" },
      { id: "input", depth: 2, origin: "28% 32%" },
      { id: "output", depth: 2, origin: "76% 72%" },
      { id: "chip", depth: 3, origin: "51% 41%", lit: true },
      { id: "badge", depth: 3, origin: "87% 72%" },
    ],
    strokes: [
      { id: "c1", before: "chip", rest: true, d: "M232 252C258 272 290 284 322 296" },
      { id: "c2", before: "chip", rest: true, d: "M236 470C268 436 308 392 348 346" },
      { id: "c3", before: "chip", rest: true, d: "M404 322C470 358 540 420 582 462" },
    ],
    shade: { part: "chip", box: [30, 56, 42, 8] },
    duration: 2000,
    settledAlt: "The workflow has run: an input document, a context artifact, the processor, a validation badge and the output document are all connected",
  },
  technology: {
    parts: [
      { id: "base", depth: 1 },
      { id: "upper", depth: 2, origin: "50% 39%" },
      { id: "cloud", depth: 3, origin: "49% 21%" },
    ],
    strokes: [
      { id: "ca", rest: true, before: "cloud", d: "M404 306H540V474H404" },
      { id: "cb", rest: true, before: "cloud", d: "M404 566H574V648H404" },
      { id: "nd", before: "cloud", d: "M355 558m-17 0a17 17 0 1 0 34 0a17 17 0 1 0-34 0", kind: "ring" },
    ],
    shade: { part: "cloud", box: [14, 28, 56, 8] },
    duration: 1600,
    settledAlt: "The infrastructure layers have risen into alignment and two connectors join the nodes",
  },
  execution: {
    parts: [
      { id: "base", depth: 1 },
      { id: "notes-c", depth: 2, origin: "76% 33%" },
      { id: "notes-b", depth: 2, origin: "54% 36%" },
      { id: "notes-a", depth: 3, origin: "33% 35%" },
      { id: "gear", depth: 3, origin: "76% 77%" },
      { id: "target", depth: 3, origin: "24% 74%" },
      { id: "arrow", depth: 3, origin: "25% 76%" },
    ],
    strokes: [],
    shade: { part: "notes-a", box: [22, 6, 52, 8] },
    duration: 1500,
    settledAlt: "The sticky notes have aligned, the gear has turned and the arrow has settled into the target",
  },
  impact: {
    parts: [
      { id: "base", depth: 1 },
      { id: "chart", depth: 2, origin: "74% 60%" },
      { id: "flag", depth: 3, origin: "49% 21%" },
    ],
    strokes: [
      { id: "road", before: "flag", d: ROAD },
      { id: "cl", on: "chart", d: "M446 296L508 262L552 214L592 184L624 154" },
    ],
    duration: 1900,
    settledAlt: "The road runs to the summit, the flag stands raised and the chart line climbs",
  },
};

export const wibStageIds = Object.keys(wibScenes) as StageId[];
