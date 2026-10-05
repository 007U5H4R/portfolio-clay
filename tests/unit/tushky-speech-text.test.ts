import { describe, expect, it } from "vitest";
import faqData from "@/data/tushky/faq.json";
import pronunciations from "@/data/tushky/pronunciations.json";
import { knowledge } from "@/data/knowledge";
import type { FaqEntry } from "@/lib/ask/faq";
import { CODE_POINTER, numberToWords, SUMMARY_CLOSER, toSpeechText } from "@/lib/tushky-voice/speech-text";
import { TITLE_CREDENTIAL_PATTERNS } from "@/scripts/forbidden-strings";

/**
 * TASK-134 — the speech transcript normaliser (Tushar's voice spec §4–8, §17–18, §44–48, §55).
 * One `describe` per spec rule. The last block runs every real answer the site can give through it
 * and checks the invariants: no emoji, no URL, no markdown, and no number or name changed except by
 * the documented rules.
 */
const FAQ = faqData as FaqEntry[];
const say = (text: string) => toSpeechText(text).speechText;

describe("§4 woof woof delivery: the emoji is never spoken", () => {
  it("'woof woof 🐾' becomes 'woof woof'", () => {
    expect(say("Woof woof 🐾 — RailCite is a trust-first RAG assistant.")).toBe("Woof woof — RailCite is a trust-first rag assistant.");
  });
  it("an emoji that ends a sentence keeps the sentence break", () => {
    expect(say("Email is best. Woof woof 🐾 I'll be right here.")).toBe("Email is best. Woof woof. I'll be right here.");
  });
  it("a trailing emoji is dropped cleanly", () => {
    expect(say("He turns messy problems into products. Woof woof 🐾")).toBe("He turns messy problems into products. Woof woof.");
  });
});

describe("§5 displayText vs speechText", () => {
  it("the spec's example pair", () => {
    expect(say("Woof woof 🐾 — RailCite is a trust-first RAG assistant…")).toBe("Woof woof — RailCite is a trust-first rag assistant…");
  });
  it("never mutates its input and is deterministic", () => {
    const display = "**RailCite** — 5,760 documents 🐾";
    const copy = `${display}`;
    expect(say(display)).toBe(say(display));
    expect(display).toBe(copy);
  });
  it("normalises only presentation: plain prose passes through unchanged", () => {
    const prose = "Nuptis came first: vendor ops for wedding-planning agencies. He killed it on day seven.";
    expect(say(prose)).toBe(prose);
  });
});

describe("§6 speech cleanup: markdown, bold, links, bullets, headings, code fences", () => {
  it("the spec's example: bold title + bullet list", () => {
    expect(say("**RailCite**\n- 5,760 documents indexed\n- 0 invented citations")).toBe(
      "RailCite. Five thousand seven hundred and sixty documents indexed. 0 invented citations.",
    );
  });
  it("bold, italic, strikethrough and inline code markers go; their words stay", () => {
    expect(say("It is **trust-first**, _cited_ and ~~never~~ `answered|refused`.")).toBe("It is trust-first, cited and never answered or refused.");
  });
  it("headings become sentences", () => {
    expect(say("## The build\nNext.js and pgvector")).toBe("The build. Next.js and pgvector.");
  });
  it("markdown links keep their label only", () => {
    expect(say("Read [the RailCite case study](/work/railcite#06-evaluation).")).toBe("Read the RailCite case study.");
  });
  it("a code fence is not read; a fixed pointer replaces it", () => {
    expect(say("Setup:\n```ts\nconst k = 8;\n```\nThat is all.")).toBe(`Setup: ${CODE_POINTER} That is all.`);
  });
  it("blockquote markers are dropped", () => {
    expect(say("> refusal is a success state")).toBe("Refusal is a success state.");
  });
});

describe("§7 / §48 source chips and references are not read aloud", () => {
  it("a 'Sources:' line is dropped", () => {
    expect(say("RailCite cites circulars.\nSources: RailCite, Experience")).toBe("RailCite cites circulars.");
  });
  it("bracket chips and numeric citation markers are dropped", () => {
    expect(say("He built RailCite [RailCite] [1] and TeachSpark [Experience].")).toBe("He built RailCite and TeachSpark.");
  });
  it("'Sources from portfolio:' (the drawer's own label) is dropped", () => {
    expect(say("Answer text.\nSources from portfolio: About, Experience")).toBe("Answer text.");
  });
});

describe("§8 numbers and acronyms", () => {
  it("'47%' → 'forty-seven percent'; decimals keep digits", () => {
    expect(say("A 47% cut and 37.5% more.")).toBe("A forty-seven percent cut and 37.5 percent more.");
  });
  it("'5,760' is spoken as words (the §6 example), years and IDs stay digits", () => {
    expect(say("5,760 documents and 14,406 chunks in 2026, patent IN 429867.")).toBe(
      "Five thousand seven hundred and sixty documents and fourteen thousand four hundred and six chunks in 2026, patent IN 429867.",
    );
  });
  it("GCP and PRD as letters; RAG as the word", () => {
    expect(say("PRDs and a PRD on GCP with RAG.")).toBe("P R Ds and a P R D on G C P with rag.");
  });
  it("'7+' / '35+' → '-plus'; year and month ranges → 'to'; month abbreviations → full names", () => {
    expect(say("7+ years, 35+ capabilities, 2016–2018, Aug–Sep 2026, as of 15 Sep 2026.")).toBe(
      "7-plus years, 35-plus capabilities, 2016 to 2018, August to September 2026, as of 15 September 2026.",
    );
  });
  it("'k=8' → 'k equals 8'", () => {
    expect(say("retrieves k=8 passages")).toBe("Retrieves k equals 8 passages.");
  });
  it("numberToWords", () => {
    expect(numberToWords(5760)).toBe("five thousand seven hundred and sixty");
    expect(numberToWords(47)).toBe("forty-seven");
    expect(numberToWords(100)).toBe("one hundred");
    expect(numberToWords(1_000_005)).toBe("one million and five");
    expect(numberToWords(0)).toBe("zero");
  });
});

describe("§44 pronunciation map: certain terms only", () => {
  it("every entry is applied as a whole word, case-sensitively, never inside another word", () => {
    expect(say("HIPAA and FHIR, SAFe, GenAI, AWS, M.Tech, B.E., K–12, PSM I and PSPO I.")).toBe(
      "Hippa and fire, safe, Gen A I, A W S, M Tech, B E, K to 12, P S M one and P S P O one.",
    );
    expect(say("RAGS, GCPs and safe")).toBe("RAGS, GCPs and safe.");
  });
  it("uncertain names are listed for Tushar and NOT applied", () => {
    const terms = pronunciations.terms.map((t) => t.term);
    for (const name of ["Tushar", "Tushky", "Quantiphi", "RailCite", "MARS"]) {
      expect(terms).not.toContain(name);
      expect(pronunciations.unconfirmed.map((u) => u.term)).toContain(name);
    }
    expect(say("Tushar worked at Quantiphi on MARS.")).toBe("Tushar worked at Quantiphi on MARS.");
  });
  it("the map itself never carries a banned credential string", () => {
    const text = JSON.stringify(pronunciations);
    for (const pattern of TITLE_CREDENTIAL_PATTERNS) expect(text).not.toMatch(pattern.re);
  });
});

describe("§45 links in speech", () => {
  it("'GitHub: github.com/…' → 'You can also open the GitHub link below.'", () => {
    expect(say("GitHub: github.com/007u5h4r/railcite")).toBe("You can also open the GitHub link below.");
    expect(say("Code — GitHub: https://github.com/x/y.")).toBe("Code — You can also open the GitHub link below.");
  });
  it("any other URL is never read out", () => {
    expect(say("See https://railcite.example.com/docs?x=1 or www.example.org for more.")).toBe("See the link below or the link below for more.");
  });
  it("an e-mail address is spoken, not spelled as a URL", () => {
    expect(say("Email: Tushar_Pathak@outlook.com")).toBe("Email: Tushar underscore Pathak at outlook dot com.");
  });
});

describe("§46 markdown tables are spoken, not read as pipes", () => {
  it("one sentence per row, 'column: value'", () => {
    const table = "| Area | Tool | Notes |\n|---|:---:|---|\n| Retrieval | pgvector | k=8 |\n| Model | Claude | cited |";
    const spoken = say(table);
    expect(spoken).toBe("Retrieval. Tool: pgvector, Notes: k equals 8. Model. Tool: Claude, Notes: cited.");
    expect(spoken).not.toMatch(/\||---/);
  });
});

describe("§47 bullet lists: natural pauses, no 'bullet one'", () => {
  it("bullets and numbers become sentences without their markers", () => {
    expect(say("Three things:\n• Discovery\n* AI design\n1. Delivery\n2) Scale")).toBe("Three things: Discovery. AI design. Delivery. Scale.");
    expect(say("- a\n- b")).not.toMatch(/bullet|one/i);
  });
});

describe("§17–18 / §55 length: short answers untouched, long ones summarised, never silently cut", () => {
  it("a short answer is spoken in full, with no padding", () => {
    expect(toSpeechText("Short answer.")).toEqual({ speechText: "Short answer.", isSummary: false });
  });
  it("a long answer becomes its own leading sentences plus a fixed closer", () => {
    const sentence = "RailCite validates every citation before it shows an answer to the inspector.";
    const long = Array.from({ length: 40 }, () => sentence).join(" ");
    const result = toSpeechText(long, { maxChars: 400, maxWords: 60 });
    expect(result.isSummary).toBe(true);
    expect(result.speechText.endsWith(SUMMARY_CLOSER)).toBe(true);
    expect(result.speechText.length).toBeLessThanOrEqual(400);
    expect(result.speechText.startsWith(sentence)).toBe(true);
  });
});

describe("every real answer the site gives", () => {
  const answers = [...FAQ.map((e) => ({ id: `faq:${e.id}`, text: e.answer })), ...knowledge.map((k) => ({ id: k.id, text: k.answer }))];

  it.each(answers)("$id: clean, bounded and faithful", ({ text }) => {
    const { speechText, isSummary } = toSpeechText(text);
    expect(isSummary).toBe(false); // every answer today is short enough to speak in full
    expect(speechText).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(speechText).not.toMatch(/https?:\/\/|www\.|\*\*|`|\|/);
    expect(speechText).toMatch(/[.!?…]$/);
    // Every multi-digit figure that is not comma-grouped (years, decimals, IDs) survives verbatim.
    for (const n of text.match(/(?<![\d,])\d+(?:\.\d+)?(?![\d,%])/g) ?? []) expect(speechText).toContain(n);
  });

  it("the displayed answers are never modified by the voice feature", () => {
    const before = JSON.stringify(FAQ.map((e) => e.answer));
    for (const e of FAQ) toSpeechText(e.answer);
    expect(JSON.stringify(FAQ.map((e) => e.answer))).toBe(before);
  });
});
