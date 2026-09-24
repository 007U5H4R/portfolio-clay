/**
 * Paper primitives (Design.md §3.1). TSK-33: the counted decorations (`data-decor`). TSK-34 adds
 * the content paper, fasteners, flat zone and hand exemptions here — and must add a render
 * fixture for each new export to `tests/unit/paper.test.tsx` (the barrel check enforces it).
 */
export { TornEdge, type TornEdgeProps, type TornFill } from "./TornEdge";
export { Sticky, type StickyProps } from "./Sticky";
export { Annotation, type AnnotationProps } from "./Annotation";
export { Sketch, type SketchProps, type SketchVariant } from "./Sketch";
export { Note, type NoteProps } from "./Note";
export { Tape, type TapeProps } from "./Tape";
