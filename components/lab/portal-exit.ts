/**
 * The black hole's sensor handler (TASK-185 follow-up): the first time the gummy enters while the run is live it unlocks YOU REALLY
 * FOUND IT and leaves through the same exit as the Back link and Esc. It fires once only (a second overlap, a bounce back out and
 * in, or the link clicked in the same moment cannot double-navigate); it never pauses or ends the game.
 */
export function portalOnce(isRunning: () => boolean, found: () => void, exit: () => void): () => void {
  let fired = false;
  return () => {
    if (fired || !isRunning()) return;
    fired = true;
    found();
    exit();
  };
}
