/**
 * Paper primitives (Design.md §3.1). TSK-33: the counted decorations (`data-decor`). TSK-34: the
 * content paper (`Sheet`, `Illustration`, `DraftTag` — `data-paper`), fasteners (`Tape` default,
 * `Pin` — `data-fastener`), the flat zone (`data-flat`) and the hand exemptions (`data-hand`).
 * Every function export needs a render fixture in `tests/unit/paper.test.tsx` (the barrel check
 * enforces it).
 */
export { TornEdge, type TornEdgeProps, type TornFill } from "./TornEdge";
export { Sticky, type StickyProps } from "./Sticky";
export { Annotation, type AnnotationProps } from "./Annotation";
export { Sketch, type SketchProps, type SketchVariant } from "./Sketch";
export { Note, type NoteProps } from "./Note";
export { Tape, type TapeProps, type FreeTapeProps, type FastenerTapeProps, type TapeSide } from "./Tape";
export { Pin, type PinProps } from "./Pin";
export { Sheet, type SheetProps, type SheetVariant } from "./Sheet";
export { Illustration, type IllustrationProps, type IllustrationPlacement } from "./Illustration";
export { FlatZone, type FlatZoneProps } from "./FlatZone";
export { Hand, type HandProps, type HandKind } from "./Hand";
export { DraftTag, type DraftTagProps } from "./DraftTag";
