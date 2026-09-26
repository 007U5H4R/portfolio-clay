/**
 * Journey path geometry (TKT-110, spec §2 / §3 / §20). Pure: pin centres in → one SVG path `d` per
 * segment out — `start → stage 1`, `stage n → stage n + 1`, and a short tail after the last stage.
 *
 * The line is drawn over the assembled board (it sits above the cards), so it must stay off the
 * text: every segment arcs ABOVE the pin row (through the board's top padding and the cards' torn
 * top margins, never the headings), and each end is trimmed back to the pin's rim so the line
 * arrives AT the pin instead of crossing it.
 */

export interface Point {
  x: number;
  y: number;
}

export interface JourneyPathOptions {
  /** How far each arc rises above the higher of its two ends, per segment (handmade variance). */
  lifts: readonly number[];
  /** Distance kept clear around a pin centre (pin radius + a hair). */
  trim: number;
  /** Where the line starts, relative to the first pin. */
  lead: Point;
  /** Where the tail ends, relative to the last pin. */
  tail: Point;
}

export const JOURNEY_PATH_OPTIONS: JourneyPathOptions = {
  lifts: [18, 34, 28, 38, 30, 36, 16],
  trim: 14,
  lead: { x: -110, y: -18 },
  tail: { x: 96, y: -24 },
};

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Move `from` toward `to` by `d` (used to trim an end back to the pin rim along the curve's tangent). */
function toward(from: Point, to: Point, d: number): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(d, len / 2) / len;
  return { x: from.x + dx * k, y: from.y + dy * k };
}

function arc(a: Point, b: Point, lift: number, trimA: number, trimB: number): string {
  const top = Math.min(a.y, b.y) - lift;
  const run = (b.x - a.x) * 0.35;
  const c1 = { x: a.x + run, y: top };
  const c2 = { x: b.x - run, y: top };
  const s = trimA ? toward(a, c1, trimA) : a;
  const e = trimB ? toward(b, c2, trimB) : b;
  return `M${r1(s.x)} ${r1(s.y)} C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(e.x)} ${r1(e.y)}`;
}

/** `pins.length + 1` segments: lead-in, the joins between consecutive pins, and the tail. */
export function journeyPathSegments(pins: readonly Point[], o: JourneyPathOptions = JOURNEY_PATH_OPTIONS): string[] {
  if (pins.length === 0) return [];
  const lift = (i: number) => o.lifts[i % o.lifts.length] ?? 24;
  const first = pins[0]!;
  const last = pins[pins.length - 1]!;
  const out = [arc({ x: first.x + o.lead.x, y: first.y + o.lead.y }, first, lift(0), 0, o.trim)];
  for (let i = 1; i < pins.length; i++) out.push(arc(pins[i - 1]!, pins[i]!, lift(i), o.trim, o.trim));
  out.push(arc(last, { x: last.x + o.tail.x, y: last.y + o.tail.y }, lift(pins.length), o.trim, 0));
  return out;
}
