import { describe, expect, it } from "vitest";
import { normalise, signature } from "@/lib/ask/normalise";
import { canonicalise } from "@/lib/ask/synonyms";

/**
 * Normalisation (technical-plan.md §A4 step 1). The pinned cases from the S09.02 gate are the spec:
 * unknown tokens are DROPPED (so off-topic probes yield zero canonical tokens → an empty answer,
 * never a fabricated one), and multi-word phrases are joined before canonicalisation.
 */
describe("ask/normalise", () => {
  it("drops stopwords + unknown words, canonicalises the rest", () => {
    // 'products' → built; 'have'/'you'/'what' drop (stopword or unknown).
    expect(normalise("What products have you built?").tokens).toEqual(["built"]);
  });

  it("joins the 'american express' phrase to the enterprise canonical", () => {
    expect(normalise("american express").tokens).toEqual(["enterprise"]);
  });

  it("joins 'product manager' → pm and 'research background' → research", () => {
    expect(normalise("product manager").tokens).toEqual(["pm"]);
    expect(normalise("research background").tokens).toEqual(["research"]);
  });

  it("returns [] for a query with no canonical tokens (PII probe)", () => {
    expect(normalise("phone number").tokens).toEqual([]);
    expect(normalise("what is your salary").tokens).toEqual([]);
    expect(normalise("").tokens).toEqual([]);
  });

  it("is case- and punctuation-insensitive and de-duplicates", () => {
    // 'AI' and 'GENAI' both canonicalise to 'ai' → deduped to one token.
    expect(normalise("AI, GENAI!!!").tokens).toEqual(["ai"]);
    expect(normalise("what is the impact").tokens).toEqual(["impact"]);
  });

  it("canonicalises multi-token queries in order", () => {
    expect(normalise("How do you evaluate an AI product?").tokens).toEqual(["evaluate", "ai", "built"]);
  });

  it("keeps the bare word 'research' on product discovery, not academic research", () => {
    // A4: `discovery ← research`; the academic `research` canonical is reached via patent/paper/etc.
    expect(canonicalise("research")).toBe("discovery");
    expect(canonicalise("patent")).toBe("research");
    expect(normalise("your biosensor research").tokens).toEqual(["research", "discovery"]);
  });

  it("computes canonical-token bigrams", () => {
    expect(normalise("evaluate ai product").bigrams).toEqual(["evaluate ai", "ai built"]);
  });

  it("signature() is the canonical tokens joined by a space", () => {
    expect(signature("What products have you built?")).toBe("built");
    expect(signature("show me your projects")).toBe("built");
  });
});
