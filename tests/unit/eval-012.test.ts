import { describe, expect, it } from "vitest";
import { knowledge } from "@/data/knowledge";
import { FALLBACK, LocalKnowledgeProvider } from "@/lib/ask/local-provider";

/**
 * EVAL-012 — the deterministic Ask must answer every canned prompt correctly and fabricate nothing;
 * EVAL-013 — every returned answer carries ≥2 resolving evidence links and its text is byte-identical
 * to the knowledge entry (no paraphrase, no invention). Off-topic / PII probes return the graceful
 * fallback with fresh suggestions, never an answer.
 */
const provider = new LocalKnowledgeProvider(knowledge);
const THRESHOLD = 0.34;

describe("@EVAL-012 deterministic Ask", () => {
  it("has 11 entries split 5 home / 6 panel (PB3), disjoint", () => {
    expect(knowledge).toHaveLength(11);
    const home = knowledge.filter((k) => k.surface.includes("home"));
    const panel = knowledge.filter((k) => k.surface.includes("panel"));
    expect(home).toHaveLength(5);
    expect(panel).toHaveLength(6);
    expect(home.some((k) => k.surface.includes("panel"))).toBe(false);
  });

  it("has a unique canonical signature per entry (no cross-entry exact collisions)", () => {
    const seen = new Map<string, string>();
    for (const e of knowledge) {
      // reuse the provider's own compilation by asking the prompt back
      const a = provider.answerFor(e.prompt);
      expect(a.kind).toBe("answer");
      if (a.kind === "answer") {
        const prev = seen.get(a.matched[0]!);
        expect(prev).toBeUndefined();
        seen.set(a.matched[0]!, e.id);
      }
    }
  });

  it("answers all 11 canned prompts correctly with 0 fabricated", () => {
    let answered = 0;
    let fabricated = 0;
    for (const e of knowledge) {
      const a = provider.answerFor(e.prompt);
      expect(a.kind).toBe("answer");
      if (a.kind !== "answer") continue;
      answered++;
      // no-fabrication invariant: byte-identical text, matched === [entry.id]
      expect(a.text).toBe(e.answer);
      expect(a.matched).toEqual([e.id]);
      expect(a.evidence.length).toBeGreaterThanOrEqual(2);
      expect(a.score).toBeGreaterThanOrEqual(THRESHOLD);
      if (a.matched[0] !== e.id) fabricated++;
    }
    expect(answered).toBe(11);
    expect(fabricated).toBe(0);
  });

  it("resolves every alias to its own entry", () => {
    for (const e of knowledge) {
      for (const alias of e.aliases) {
        const a = provider.answerFor(alias);
        expect(a.kind, `alias "${alias}" (${e.id})`).toBe("answer");
        if (a.kind === "answer") expect(a.matched, `alias "${alias}"`).toEqual([e.id]);
      }
    }
  });

  it("returns the fallback for 5 off-topic / PII probes (never an answer)", () => {
    const offTopic = ["weather in Paris", "write me a poem", "what is your salary", "phone number", "lorem ipsum"];
    let empty = 0;
    for (const q of offTopic) {
      const a = provider.answerFor(q);
      expect(a.kind, q).toBe("empty");
      if (a.kind !== "empty") continue;
      empty++;
      expect(a.text).toBe(FALLBACK);
      expect(a.suggestions).toHaveLength(3);
    }
    expect(empty).toBe(5);
  });

  it("never returns an answer with score below the threshold (200 random word-soup queries)", () => {
    const words = ["banana", "purple", "cloud", "seventeen", "guitar", "ocean", "lantern", "quibble", "zephyr", "marble", "tundra", "velvet"];
    let rng = 12345;
    const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 200; i++) {
      const n = 2 + Math.floor(rand() * 4);
      const q = Array.from({ length: n }, () => words[Math.floor(rand() * words.length)]).join(" ");
      const a = provider.answerFor(q);
      if (a.kind === "answer") expect(a.score, q).toBeGreaterThanOrEqual(THRESHOLD);
    }
  });

  it("answers with a p95 latency under 20 ms over 1000 calls", () => {
    const prompts = knowledge.map((k) => k.prompt);
    const timings: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const q = prompts[i % prompts.length]!;
      const t0 = performance.now();
      provider.answerFor(q);
      timings.push(performance.now() - t0);
    }
    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(timings.length * 0.95)]!;
    console.log(`[EVAL-012] ask() p95 over 1000 calls = ${p95.toFixed(3)} ms`);
    expect(p95).toBeLessThan(20);
  });
});
