import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import faqData from "@/data/tushky/faq.json";
import { knowledge } from "@/data/knowledge";
import { TUSHKY_SUGGESTIONS } from "@/components/ai/tushky-questions";
import type { Answer, AnswerProvider, AskContext } from "@/lib/ask/adapter";
import { FaqCacheProvider, compileFaq, faqCollisions, lookupFaq, type FaqEntry, type FaqLookupEvent } from "@/lib/ask/faq";
import { checkFaq, validateCandidate } from "@/lib/ask/faq-schema";
import { dependencyGroups } from "@/lib/ask/faq-versions";
import { faqIntentKey, isContextDependent } from "@/lib/ask/normalise";
import { LocalKnowledgeProvider } from "@/lib/ask/local-provider";

/**
 * TASK-123 — the Ask Tushky FAQ cache (Tushar's FAQ-cache spec 2026-09-28 §44–66). The §65 cases,
 * the §59 confidence negative, coverage of every question the UI offers, and a mechanical grounding
 * check on every cached answer.
 */
const FAQ = faqData as FaqEntry[];
const ALL_FRESH = FAQ.map((e) => e.id);
const compiled = compileFaq(FAQ);
const hitId = (q: string, fresh: readonly string[] = ALL_FRESH) => {
  const r = lookupFaq(compiled, q, new Set(fresh));
  return r.kind === "hit" ? r.entry.id : undefined;
};

/** A fallback that records what it was asked, standing in for the index (or a future generated path). */
function recordingFallback() {
  const calls: { query: string; ctx: AskContext | undefined }[] = [];
  const reply: Answer = { kind: "answer", text: "fallback", evidence: [{ label: "About", href: "/about" }], matched: ["x"], score: 0.5 };
  const provider: AnswerProvider = {
    name: "fallback",
    ask: (query, ctx) => {
      calls.push({ query, ctx });
      return Promise.resolve(reply);
    },
  };
  return { provider, calls };
}

describe("TASK-123 FAQ cache — §65 test cases", () => {
  it("EXACT: “What products has Tushar built?” → cache hit", () => {
    const r = lookupFaq(compiled, "What products has Tushar built?", new Set(ALL_FRESH));
    expect(r.kind).toBe("hit");
    if (r.kind === "hit") {
      expect(r.entry.id).toBe("products-built");
      expect(r.matchType).toBe("exact");
    }
  });

  it("ALIAS: “Which products has Tushar built?” → cache hit on the configured alias", () => {
    expect(FAQ.find((e) => e.id === "products-built")!.aliases).toContain("Which products has Tushar built?");
    const r = lookupFaq(compiled, "Which products has Tushar built?", new Set(ALL_FRESH));
    expect(r.kind === "hit" && r.matchType).toBe("alias");
    expect(hitId("Which products has Tushar built?")).toBe("products-built");
  });

  it("CASE/PUNCTUATION: “WHAT PRODUCTS HAS TUSHAR BUILT??” → cache hit", () => {
    expect(hitId("WHAT PRODUCTS HAS TUSHAR BUILT??")).toBe("products-built");
    expect(hitId("  what   products has tushar built  ")).toBe("products-built");
    expect(hitId("What’s Tushar’s current role?")).toBe("current-role"); // curly apostrophes + contraction
  });

  it("paraphrase: “Can you tell me about Tushar?” resolves like “Tell me about Tushar” (§47)", () => {
    expect(hitId("Tell me about Tushar")).toBe("who-is-tushar");
    const r = lookupFaq(compiled, "Can you tell me about Tushar?", new Set(ALL_FRESH));
    expect(r.kind === "hit" && r.entry.id).toBe("who-is-tushar");
    expect(r.kind === "hit" && r.matchType).toBe("intent");
  });

  it("OPEN-ENDED: “What product mistake taught Tushar the most?” → miss, goes to the answer path", async () => {
    expect(lookupFaq(compiled, "What product mistake taught Tushar the most?", new Set(ALL_FRESH)).kind).toBe("miss");
    const { provider: fallback, calls } = recordingFallback();
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH });
    const answer = await faq.ask("What product mistake taught Tushar the most?");
    expect(calls).toHaveLength(1);
    expect(answer.kind === "answer" && answer.sourceType).toBeUndefined();
  });

  it("FOLLOW-UP: “Tell me about RailCite.” → cache; “What was hardest about it?” → answer path WITH the conversation", async () => {
    const { provider: fallback, calls } = recordingFallback();
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH });
    const first = await faq.ask("Tell me about RailCite.", { surface: "panel", history: [] });
    expect(first.kind === "answer" && first.sourceType).toBe("faq-cache");
    expect(first.kind === "answer" && first.matched).toEqual(["faq:railcite"]);
    expect(calls).toHaveLength(0);

    const history = ["Tell me about RailCite."];
    await faq.ask("What was hardest about it?", { surface: "panel", history });
    expect(calls).toEqual([{ query: "What was hardest about it?", ctx: { surface: "panel", history } }]);
  });

  it("follow-ups that lean on the conversation never hit the cache (§55–56)", () => {
    for (const q of [
      "What was hardest about it?",
      "what about that one?",
      "Tell me more",
      "What about RailCite?", // after "impact?", this means RailCite's impact — not the RailCite overview
      "And TeachSpark?",
      "Who built them?",
      "What was the hardest decision?", // no pronoun, but no FAQ owns it either
    ]) {
      const r = lookupFaq(compiled, q, new Set(ALL_FRESH));
      expect(r.kind, q).toBe("miss");
    }
    expect(isContextDependent("What was hardest about it?")).toBe(true);
    expect(isContextDependent("What AI products has he worked on?")).toBe(false); // "he" is always Tushar
  });

  it("UPDATED PROFILE: a stale entry is not served — it falls through (versions test covers the hashing)", async () => {
    const { provider: fallback, calls } = recordingFallback();
    const fresh = ALL_FRESH.filter((id) => id !== "current-role");
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh });
    expect(faq.lookup("What is his current role?")).toMatchObject({ kind: "miss", reason: "stale" });
    const answer = await faq.ask("What is his current role?");
    expect(calls).toHaveLength(1);
    expect(answer.kind === "answer" && answer.text).toBe("fallback");
  });

  it("CONFIDENCE (§59): “What did Tushar learn from TeachSpark?” does NOT hit “Tell me about TeachSpark”", () => {
    expect(hitId("Tell me about TeachSpark.")).toBe("teachspark");
    expect(hitId("What did Tushar learn from TeachSpark?")).toBeUndefined();
    expect(hitId("What did he learn building TeachSpark?")).toBeUndefined();
    expect(hitId("How many teachers use TeachSpark today?")).toBeUndefined();
    expect(faqIntentKey("What did Tushar learn from TeachSpark?")).not.toBe(faqIntentKey("Tell me about TeachSpark"));
  });
});

describe("TASK-123 FAQ cache — contract, coverage and grounding", () => {
  it("the committed file passes the FAQ gate (shape, links, follow-ups, banned strings, PII)", () => {
    expect(checkFaq(faqData)).toEqual([]);
  });

  it("no question, alias or intent key is claimed by two entries", () => {
    expect(faqCollisions(FAQ)).toEqual([]);
  });

  it("every question and alias in the file is itself a hit on its own entry", () => {
    for (const e of FAQ) for (const q of [e.question, ...e.aliases]) expect(hitId(q), q).toBe(e.id);
  });

  it("covers every suggestion the UI shows: the six cards (label and query), panel prompts and index follow-up chips", () => {
    for (const s of TUSHKY_SUGGESTIONS) {
      expect(hitId(s.label), s.label).toBeDefined();
      expect(hitId(s.query), s.query).toBe(hitId(s.label));
    }
    for (const k of knowledge) expect(hitId(k.prompt), k.prompt).toBeDefined();
    for (const e of FAQ) for (const f of e.followUps) expect(hitId(f), `${e.id} → ${f}`).toBeDefined();
  });

  it("covers Tushar's §45 list", () => {
    const expected: Record<string, string> = {
      "Who is Tushar?": "who-is-tushar",
      "What products has Tushar built?": "products-built",
      "What AI experience does he have?": "ai-experience",
      "What are his strongest skills?": "strongest-skills",
      "Tell me about TeachSpark.": "teachspark",
      "Tell me about RailCite.": "railcite",
      "What is his current role?": "current-role",
      "What enterprise programs has he worked on?": "enterprise-programs",
      "What cloud experience does he have?": "cloud-experience",
      "What certifications does he have?": "certifications",
      "What is his product thinking process?": "product-thinking",
      "What is his research background?": "research-background",
    };
    for (const [q, id] of Object.entries(expected)) expect(hitId(q), q).toBe(id);
  });

  it("private or unanswerable questions never hit the cache (§55) — and the index gives its honest empty", () => {
    const index = new LocalKnowledgeProvider(knowledge);
    for (const q of ["Where is Tushar based?", "What is Tushar's phone number?", "What is his salary?", "How old is Tushar?", "What is the weather in Paris?"]) {
      expect(hitId(q), q).toBeUndefined();
    }
    expect(index.answerFor("Where is Tushar based?").kind).toBe("empty");
    expect(index.answerFor("What is Tushar's phone number?").kind).toBe("empty");
  });

  it("a hit returns the §49 contract with the file's answer text unmodified", async () => {
    const { provider: fallback } = recordingFallback();
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH });
    const entry = FAQ.find((e) => e.id === "products-built")!;
    const a = await faq.ask("What products has Tushar built?");
    expect(a).toEqual({
      kind: "answer",
      text: entry.answer,
      evidence: entry.sources,
      matched: ["faq:products-built"],
      score: 1,
      sourceType: "faq-cache",
      suggestedFollowUps: entry.followUps.slice(0, 3).map((q) => ({ label: q, query: q })),
      draft: true,
    });
  });

  it("follow-up chips skip answers this conversation already got from the cache", async () => {
    const { provider: fallback } = recordingFallback();
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH });
    const a = await faq.ask("What products has Tushar built?", { history: ["Tell me about TeachSpark."] });
    const labels = a.kind === "answer" ? (a.suggestedFollowUps ?? []).map((f) => f.label) : [];
    expect(labels).not.toContain("Tell me about TeachSpark.");
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it("analytics get the lookup result only — never the question text (§62)", async () => {
    const events: FaqLookupEvent[] = [];
    const { provider: fallback } = recordingFallback();
    const faq = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH, onLookup: (e) => events.push(e) });
    await faq.ask("What products has Tushar built?");
    await faq.ask("my secret question about zebras");
    expect(events.map((e) => e.lookup.kind)).toEqual(["hit", "miss"]);
    expect(JSON.stringify(events)).not.toContain("zebras");
    const throwing = new FaqCacheProvider(FAQ, fallback, { fresh: ALL_FRESH, onLookup: vi.fn(() => { throw new Error("boom"); }) });
    await expect(throwing.ask("Who is Tushar?")).resolves.toMatchObject({ sourceType: "faq-cache" });
  });

  it("every number in every cached answer appears in the data it depends on (no invented figures)", () => {
    const groups = dependencyGroups();
    for (const e of FAQ) {
      const context = e.dependsOn.map((g) => JSON.stringify(groups.get(g))).join("\n");
      const digits = context.replace(/,/g, "");
      for (const m of e.answer.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
        const n = m[0].replace(/,$/, "");
        expect(context.includes(n) || digits.includes(n.replace(/,/g, "")), `${e.id}: "${n}"`).toBe(true);
      }
    }
  });

  it("personality is written in, and sparingly: “woof woof 🐾” appears in at most two answers", () => {
    const woofs = FAQ.filter((e) => /woof woof 🐾/i.test(e.answer));
    expect(woofs.length).toBeGreaterThanOrEqual(1);
    expect(woofs.length).toBeLessThanOrEqual(2);
  });

  it("keeps the truthfulness caveats the data carries", () => {
    const text = (id: string) => FAQ.find((e) => e.id === id)!.answer;
    expect(text("teachspark")).toMatch(/uptime after 9 Sep 2026 is unverified/);
    expect(text("products-built")).toMatch(/uptime after 9 Sep 2026 is unverified/);
    expect(text("impact")).toMatch(/self-reported/);
    expect(text("velora")).toMatch(/mock data/);
    expect(text("products-built")).toMatch(/built but not launched/);
    for (const e of FAQ) expect(e.answer, e.id).not.toMatch(/Bengaluru|Bangalore|\+91/);
  });

  it("the refresh script never runs in the build (§60)", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
    for (const [name, cmd] of Object.entries(pkg.scripts)) expect(cmd, name).not.toContain("tushky-faq-refresh");
  });

  it("a Gemini draft is rejected when it quotes outside the data, invents a number, adds a woof or leaks escapes (§60)", () => {
    const entry = FAQ.find((e) => e.id === "current-role")!;
    const context = "Senior Product Manager (Accounts Receivable) at American Express since 2026-06, 35+ capabilities.";
    const base = "Tushar is a Senior Product Manager for Accounts Receivable at American Express, where he owns the roadmap for 35+ capabilities as they move to the MARS platform and drives Devin adoption across the engineering teams there.";
    const ok = validateCandidate(entry, { answer: base, evidence: ["Senior Product Manager (Accounts Receivable)"] }, context, FAQ);
    expect(ok).toEqual([]);
    // Quotes inside the JSON context are escaped (\"); a verbatim quote containing them still counts.
    const jsonContext = JSON.stringify({ note: `${context} As the series put it: "Weddings were blue."` });
    expect(validateCandidate(entry, { answer: base, evidence: ['"Weddings were blue."'] }, jsonContext, FAQ)).toEqual([]);
    const problems = (answer: string, evidence = ["American Express"]) => validateCandidate(entry, { answer, evidence }, context, FAQ).join(" | ");
    expect(problems(base, ["He leads 400 engineers"])).toMatch(/evidence not found verbatim/);
    expect(problems(`${base} He manages 400 engineers.`)).toMatch(/number "400"/);
    expect(problems(`${base} Woof woof 🐾`)).toMatch(/adds "woof woof/);
    expect(problems(`${base} \\u201cgood\\u201d`)).toMatch(/escape sequence/);
  });

  it("the file-level woof limit is enforced by the gate", () => {
    const tooMany = FAQ.map((e) => ({ ...e, answer: `${e.answer} Woof woof 🐾` }));
    expect(checkFaq(tooMany).join("\n")).toMatch(/"woof woof 🐾" in 21 answers/);
  });
});
