/**
 * Speech transcript normaliser (TASK-134, Tushar's voice spec §4–8, §17–18, §44–48, §55).
 *
 * Every Tushky answer has two forms: `displayText` (what the drawer shows, never changed) and
 * `speechText` (what the voice says). This module derives the second from the first,
 * deterministically, and may only normalise presentation (§5): emoji, URLs, markdown, bullets,
 * tables, awkward abbreviations and visual source labels. It never adds a claim, and it never
 * changes a number, date, employer or project name; the one thing it adds is a fixed pointer
 * sentence where a link or code block cannot be read aloud, and a fixed closing line on a summary.
 *
 * Pure and client-safe (no node APIs): the route, the FAQ-audio script and the drawer's player
 * (to pick the "Listen to summary" label) all call it, so they always agree.
 *
 * Rules, in order (each has a unit test in tests/unit/tushky-speech-text.test.ts):
 *   1. code fences → "There is a code sample in the written answer."      (§6)
 *   2. markdown tables → one spoken sentence per row, "Row. Column: value." (§46)
 *   3. headings → a sentence; blockquote markers dropped                  (§6)
 *   4. bullet / numbered items → sentences with a natural pause, markers dropped (§47)
 *   5. visual source lines ("Sources: …") and bracket chips ("[RailCite]", "[1]") dropped (§7, §48)
 *   6. markdown links → their label                                       (§6)
 *   7. "GitHub: github.com/…" → "You can also open the GitHub link below."; any other URL →
 *      "the link below"                                                  (§45)
 *   8. e-mail addresses → spoken ("name at outlook dot com")              (§5 abbreviations)
 *   9. bold / italic / inline code markers dropped, text kept             (§6)
 *  10. emoji dropped ("Woof woof 🐾" → "Woof woof"), with a sentence break kept (§4)
 *  11. certain pronunciations from data/tushky/pronunciations.json        (§8, §44)
 *  12. numbers: "47%" → "forty-seven percent", "5,760" → words, "7+" → "7-plus",
 *      "2016–2018" → "2016 to 2018", "Aug–Sep" / "15 Sep 2026" → full month names, "k=8" → "k equals 8" (§8)
 *  13. whitespace tidied; the transcript ends with sentence punctuation
 *  14. longer than the limits → a summary made of the answer's own leading sentences (§18)
 */
import pronunciations from "@/data/tushky/pronunciations.json";
import { TUSHKY_VOICE } from "@/config/tushky-voice";

export interface SpeechText {
  /** The exact transcript sent to TTS. */
  speechText: string;
  /** True when the answer was too long and `speechText` is its leading sentences (§18, "Listen to summary"). */
  isSummary: boolean;
}

export interface SpeechLimits {
  maxChars: number;
  maxWords: number;
}

const DEFAULT_LIMITS: SpeechLimits = {
  maxChars: TUSHKY_VOICE.limits.maxSpeechChars,
  maxWords: TUSHKY_VOICE.limits.maxSpeechWords,
};

export const CODE_POINTER = "There is a code sample in the written answer.";
export const SUMMARY_CLOSER = "The rest is in the written answer.";
const LINK_BELOW = "the link below";

type Pronunciation = { term: string; say: string };
const TERMS: readonly Pronunciation[] = (pronunciations.terms as Pronunciation[])
  .slice()
  // Longest first, so "PRDs" wins over "PRD" and "PSPO I" over any shorter overlap.
  .sort((a, b) => b.term.length - a.term.length);

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TERM_RES = TERMS.map((t) => ({
  re: new RegExp(`(?<![\\p{L}\\p{N}_.])${escapeRe(t.term)}(?![\\p{L}\\p{N}_])`, "gu"),
  say: t.say,
}));

/* ---------------------------------------------------------------- numbers → words (§6, §8) */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES: [number, string][] = [
  [1_000_000_000, "billion"],
  [1_000_000, "million"],
  [1_000, "thousand"],
];

function underHundred(n: number): string {
  if (n < 20) return ONES[n]!;
  const t = TENS[Math.floor(n / 10)]!;
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}

function underThousand(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (!h) return underHundred(rest);
  return rest ? `${ONES[h]} hundred and ${underHundred(rest)}` : `${ONES[h]} hundred`;
}

/** 5760 → "five thousand seven hundred and sixty" (British "and", as in spec §6's example). */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 1e12) return String(n);
  if (n === 0) return "zero";
  const parts: string[] = [];
  let rest = n;
  for (const [size, name] of SCALES) {
    if (rest >= size) {
      parts.push(`${underThousand(Math.floor(rest / size))} ${name}`);
      rest %= size;
    }
  }
  if (rest) parts.push(parts.length && rest < 100 ? `and ${underHundred(rest)}` : underThousand(rest));
  return parts.join(" ");
}

const MONTHS: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Sept: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

/* ---------------------------------------------------------------- the block-level rules */

function speakTable(lines: string[]): string {
  const cells = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
  const isSeparator = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
  const rows = lines.filter((l) => !isSeparator(l)).map(cells);
  const [header, ...body] = rows;
  if (!header || body.length === 0) return rows.map((r) => sentence(r.filter(Boolean).join(", "))).join(" ");
  return body
    .map((row) => {
      const [first, ...rest] = row;
      const pairs = rest
        .map((value, i) => (value ? `${header[i + 1] ? `${header[i + 1]}: ` : ""}${value}` : ""))
        .filter(Boolean);
      return sentence([first, pairs.join(", ")].filter(Boolean).join(". "));
    })
    .join(" ");
}

/** Ensure a fragment ends as a sentence (a pause for the voice), without doubling punctuation. */
function sentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  return /[.!?…:;]["”’)]?$/.test(t) ? t : `${t}.`;
}

function blocks(text: string): string {
  const out: string[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // 1. code fences
    if (/^\s*(```|~~~)/.test(line)) {
      const fence = line.trim().slice(0, 3);
      while (i + 1 < lines.length && !lines[i + 1]!.trim().startsWith(fence)) i++;
      i++; // the closing fence
      out.push("\n", CODE_POINTER, "\n");
      continue;
    }
    // 2. tables: two or more consecutive pipe rows
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const table = [line];
      while (i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[i + 1]!)) table.push(lines[++i]!);
      out.push("\n", table.length > 1 ? speakTable(table) : sentence(line.replace(/\|/g, " ")), "\n");
      continue;
    }
    // 5. visual source / reference lines are UI, not the answer
    if (/^\s*(?:[-*•]\s*)?(?:sources?(?: from portfolio)?|evidence|references?|citations?)\s*:/i.test(line)) continue;
    // 3. headings and blockquotes
    const heading = /^\s*#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      out.push("\n", sentence(heading[1]!), "\n");
      continue;
    }
    const unquoted = line.replace(/^\s*>\s?/, "");
    // 4. list items (bullets and numbers) — the marker is dropped, the item becomes a sentence
    const item = /^\s*(?:[-*+•▪◦‣]|\d{1,3}[.)])\s+(.*)$/.exec(unquoted);
    if (item) {
      out.push("\n", sentence(item[1]!), "\n");
      continue;
    }
    out.push(unquoted.trim() === "" ? "\n" : unquoted);
  }
  // Block elements were fenced with blank lines above, so each is its own paragraph. Paragraph breaks
  // become sentence breaks; soft line breaks inside a paragraph become spaces.
  return out
    .join("\n")
    .split(/\n\s*\n+/)
    .map((para) => para.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((para, idx, all) => (idx < all.length - 1 ? sentence(para) : para))
    .join(" ");
}

/* ---------------------------------------------------------------- the inline rules */

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"”’]|\b(?:[a-z0-9-]+\.)+(?:com|org|io|dev|app|in|net|ai|co|me)\/[^\s<>()]*[^\s<>().,;:!?'"”’]?/gi;
/** "GitHub: github.com/…" — a capitalised label (up to four words) directly followed by a URL. */
const LABELLED_URL_RE = /\b([A-Z][\w&'’-]*(?: [A-Z][\w&'’-]*){0,3}):\s*(?:https?:\/\/|www\.|(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}\/)[^\s<>()]*[^\s<>().,;:!?'"”’]/g;
const EMAIL_RE = /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)\b/g;
const EMOJI_RE = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}])+/gu;

function speakEmail(local: string, domain: string): string {
  const say = (part: string) => part.replace(/_/g, " underscore ").replace(/\./g, " dot ").replace(/-/g, " dash ").replace(/\s+/g, " ").trim();
  return `${say(local)} at ${say(domain)}`;
}

function inline(text: string): string {
  let t = text;
  // 6. markdown links → label (before bare URLs, so the label survives)
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  t = t.replace(/\[([^\]]+)\]\((?:[^()\s]+|\([^)]*\))+\)/g, "$1");
  // 5. bracket chips and numeric citation markers: "[RailCite]", "[1]", "[Experience]"
  t = t.replace(/\s?\[(?:\d{1,3}|[A-Z][\w &'’.-]{0,40})\](?!\()/g, "");
  // 8. e-mail addresses (before URLs: "outlook.com" must not become "the link below")
  t = t.replace(EMAIL_RE, (_m, local: string, domain: string) => speakEmail(local, domain));
  // 7. "Label: url" → a pointer sentence; any other URL → "the link below"
  t = t.replace(LABELLED_URL_RE, (_m, label: string) => `You can also open the ${label} link below.`);
  t = t.replace(URL_RE, LINK_BELOW);
  // 9. emphasis and inline code markers (text kept; a pipe inside code is an "or")
  t = t.replace(/`([^`]+)`/g, (_m, code: string) => code.replace(/\s*\|\s*/g, " or ").replace(/_/g, " "));
  t = t.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "$2");
  t = t.replace(/(^|[\s(“"'])([*_])(?=\S)([^*_\n]*?\S)\2(?=[\s).,;:!?”"']|$)/g, "$1$3");
  t = t.replace(/~~(?=\S)([\s\S]*?\S)~~/g, "$1");
  // 10. emoji: dropped; where one ended a sentence ("Woof woof 🐾 I'll…"), keep the full stop
  t = t.replace(new RegExp(`\\s*(?:${EMOJI_RE.source})\\s*(?=[A-Z“"])`, "gu"), (m, offset: number, whole: string) => {
    const before = whole.slice(0, offset).trimEnd();
    return before === "" || /[.!?…:;—–-]$/.test(before) ? " " : ". ";
  });
  t = t.replace(EMOJI_RE, " ");
  return t;
}

function pronounce(text: string): string {
  let t = text;
  for (const { re, say } of TERM_RES) t = t.replace(re, say);
  return t;
}

function numbers(text: string): string {
  let t = text;
  // "47%" / "47 %" → "forty-seven percent"; decimals keep their digits: "37.5 percent"
  t = t.replace(/(\d[\d,]*(?:\.\d+)?)\s?%/g, (_m, n: string) => {
    const plain = n.replace(/,/g, "");
    return `${/^\d+$/.test(plain) ? numberToWords(Number(plain)) : plain} percent`;
  });
  // "5,760" → "five thousand seven hundred and sixty" (grouped integers only; years and IDs untouched)
  t = t.replace(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d,]|\.\d)/g, (m) => numberToWords(Number(m.replace(/,/g, ""))));
  // "7+" / "35+" → "7-plus"
  t = t.replace(/(\d)\+(?=[\s,.;:)]|$)/g, "$1-plus");
  // ranges: "2016–2018" / "Aug–Sep" → "to"
  t = t.replace(/(\d)\s?[–—]\s?(\d)/g, "$1 to $2");
  t = t.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\s?[–—]\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b/g, "$1 to $2");
  // month abbreviations next to a day, a year or another month → the full name
  t = t.replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b(?=\s+(?:to\s+)?(?:\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))|(?<=\d\s)(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b|(?<=\bto\s)(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\b/g, (m) => MONTHS[m] ?? m);
  // "k=8" → "k equals 8"
  t = t.replace(/(\b[\w.]+)\s?=\s?([\w.]+\b)/g, "$1 equals $2");
  return t;
}

function tidy(text: string): string {
  return text
    .replace(/[ \t ]+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([.!?])(?:\s*\.)+/g, "$1")
    .replace(/,\s*\./g, ".")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    // A spelled-out number can open a sentence ("five thousand…"): capitalise sentence starts.
    .replace(/(^|[.!?]\s+)(\p{Ll})/gu, (_m, lead: string, ch: string) => lead + ch.toUpperCase());
}

/* ---------------------------------------------------------------- summary (§18) */

const SENTENCE_SPLIT = /(?<=[.!?…]["”’)]?)\s+(?=["“(]?[A-Z0-9])/;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function summarise(text: string, limits: SpeechLimits): string {
  const budgetChars = limits.maxChars - SUMMARY_CLOSER.length - 1;
  const budgetWords = limits.maxWords - words(SUMMARY_CLOSER);
  const kept: string[] = [];
  let chars = 0;
  let count = 0;
  for (const s of text.split(SENTENCE_SPLIT)) {
    const w = words(s);
    if (chars + s.length + 1 > budgetChars || count + w > budgetWords) break;
    kept.push(s);
    chars += s.length + 1;
    count += w;
  }
  // A first sentence longer than the whole budget still gets spoken up to a word boundary.
  if (kept.length === 0) {
    const cut = text.slice(0, budgetChars).split(/\s+/).slice(0, budgetWords);
    cut.pop();
    kept.push(`${cut.join(" ")}…`);
  }
  return `${kept.join(" ")} ${SUMMARY_CLOSER}`;
}

/* ---------------------------------------------------------------- the one entry point */

/** displayText → speechText (see the rule list at the top). Deterministic: same input, same output. */
export function toSpeechText(displayText: string, limits: SpeechLimits = DEFAULT_LIMITS): SpeechText {
  const normalised = displayText.normalize("NFC").replace(/\r\n?/g, "\n");
  const spoken = tidy(numbers(pronounce(inline(blocks(normalised)))));
  const full = spoken === "" ? "" : sentence(spoken);
  if (full.length <= limits.maxChars && words(full) <= limits.maxWords) return { speechText: full, isSummary: false };
  return { speechText: summarise(full, limits), isSummary: true };
}
