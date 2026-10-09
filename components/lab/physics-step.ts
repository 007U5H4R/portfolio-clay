/**
 * The fixed physics step (s). Rapier advances in whole steps of this size and the gummy controller
 * applies its forces once per step, so gameplay is independent of the rendered frame rate.
 */
export const PHYSICS_DT = 1 / 60;

/** Arena gravity (u/s²): a little floatier than Earth so the bear hangs a beat at the top of a bounce. */
export const GRAVITY = -16;
