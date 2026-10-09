import type { ArenaSpec } from "./arena";

/**
 * The shooter lane's one-way gate (TASK-185 follow-up). The gate is open while the gummy sits on the plunger and while it
 * travels up and round the arch, so any launch, however weak, can still fall back onto the plunger. It shuts the moment a
 * launched gummy is clearly out in the playfield (left of the divider and above its top), and stays shut until the next
 * serve. Pure position test: the controller latches it once per physics step.
 */
export const GATE_CLEAR = 0.5;

export function clearedLane(arena: ArenaSpec, pos: { x: number; y: number }): boolean {
  return pos.x < arena.lane.xIn - GATE_CLEAR && pos.y > arena.lane.dividerTop;
}
