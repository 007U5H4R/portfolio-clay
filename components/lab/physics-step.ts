/**
 * The fixed physics step (s). Rapier advances in whole steps of this size and the gummy controller
 * applies its forces once per step, so gameplay is independent of the rendered frame rate.
 */
export const PHYSICS_DT = 1 / 60;
