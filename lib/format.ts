/**
 * lib/format.ts (technical-plan.md §B S08.03) — the tiny, pure formatting layer shared by the
 * data-driven views. Deterministic and locale-independent (month names are hard-coded, not
 * `toLocaleString`-derived) so the same string renders on every machine, in SSG, and in tests.
 *
 *   formatAsOf('2026-08-24')                    → 'as of 24 Aug 2026'   (metric freshness, A3)
 *   formatRange({ start:'2026-08' })            → 'Aug 2026 – present'   (open-ended role/project)
 *   formatRange({ start:'2022-01', end:'2026-08' }) → 'Jan 2022 – Aug 2026'
 *   formatNumber(1234)                          → '1,234'                (render with tabular-nums)
 *   readingTime(400)                            → '2 min read'          (200 wpm, min 1)
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Words per minute used by {@link readingTime}. */
export const WORDS_PER_MINUTE = 200;

function monthName(month1to12: number): string {
  const name = MONTHS[month1to12 - 1];
  if (!name) throw new Error(`formatDate: month out of range (${month1to12})`);
  return name;
}

/**
 * Format an ISO `YYYY-MM-DD` date (a schema `asOf`) as `as of 24 Aug 2026`. The day is un-padded
 * (24, not 04 → "4"). Throws on a malformed input rather than silently rendering garbage.
 */
export function formatAsOf(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) throw new Error(`formatAsOf: expected YYYY-MM-DD, got "${isoDate}"`);
  const [, year, month, day] = m;
  return `as of ${Number(day)} ${monthName(Number(month))} ${year}`;
}

/** Format a single `YYYY-MM` as `Aug 2026`. */
export function formatYearMonth(yearMonth: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!m) throw new Error(`formatYearMonth: expected YYYY-MM, got "${yearMonth}"`);
  const [, year, month] = m;
  return `${monthName(Number(month))} ${year}`;
}

/**
 * Format a `{ start, end? }` date range (both `YYYY-MM`) as `Jan 2022 – Aug 2026`, or
 * `Aug 2026 – present` when `end` is absent. Uses an en dash with spaces (typographic range).
 */
export function formatRange(range: { start: string; end?: string | null }): string {
  const left = formatYearMonth(range.start);
  const right = range.end ? formatYearMonth(range.end) : "present";
  return `${left} – ${right}`;
}

/**
 * Group a number with thousands separators (`1234` → `1,234`). Rendered with `tabular-nums` so
 * digits align in columns; the CSS lives at the call site, this returns the string only.
 * Non-finite input throws (a missing/NaN metric must fail loudly, never render "NaN").
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`formatNumber: non-finite value (${value})`);
  const negative = value < 0;
  const [intPart, fracPart] = Math.abs(value).toString().split(".");
  const grouped = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fracPart ? `${grouped}.${fracPart}` : grouped;
  return negative ? `-${body}` : body;
}

/**
 * Estimated reading time for a word count at {@link WORDS_PER_MINUTE} (rounded up, floor 1):
 * `readingTime(400)` → `'2 min read'`. Non-positive input yields `'1 min read'`.
 */
export function readingTime(words: number): string {
  const minutes = Math.max(1, Math.ceil((Number.isFinite(words) ? words : 0) / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}
