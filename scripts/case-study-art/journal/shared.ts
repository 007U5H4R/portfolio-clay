import type { Asset } from "../kit";

/**
 * TASK-130 journal · shared paper materials: a seamless fibre-and-grain tile for the page ground
 * (a warm journal page, brief §2/§53) and a torn-edge mask for section breaks. Decorative only.
 */
const fiber = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360" aria-hidden="true"><filter id="f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="11" stitchTiles="stitch" result="a"/><feColorMatrix in="a" values="0 0 0 0 0.43  0 0 0 0 0.33  0 0 0 0 0.22  0 0 0 -2.4 1.25" result="fib"/><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch" result="b"/><feColorMatrix in="b" values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 -3.2 1.62" result="grain"/><feMerge><feMergeNode in="fib"/><feMergeNode in="grain"/></feMerge></filter><rect width="360" height="360" filter="url(#f)" opacity="0.32"/></svg>\n`;

function tornEdge(): string {
  const pts: string[] = ["0,40"];
  let x = 0;
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  while (x < 1600) {
    x += 10 + rand() * 22;
    pts.push(`${Math.min(1600, x).toFixed(0)},${(8 + rand() * 18).toFixed(1)}`);
  }
  pts.push("1600,40");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="40" viewBox="0 0 1600 40" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts.join(" ")}" fill="#000"/></svg>\n`;
}

export const journalSharedAssets: Asset[] = [
  { file: "paper-fiber.svg", svg: fiber },
  { file: "torn-edge.svg", svg: tornEdge() },
];
