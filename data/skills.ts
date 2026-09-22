import type { SkillCluster } from "./schema";

/**
 * `/about` `CapabilityClusters` data (TSK-22, TKT-40 AC 6; TC-094). 4 clusters transcribed from
 * CONTENT_INVENTORY §4.3 — items are grouped, never reworded into new claims. `source` is a plain
 * descriptive citation (the schema gives `SkillCluster` a single string field, not an owned
 * `SourceRef[]`, so it mirrors `data/hero.ts`'s free-text `source` convention rather than an id
 * that must resolve elsewhere).
 *
 * The Execution cluster names one methodology framework alongside Agile/Scrum/Kanban, never as a
 * credential claim (§4.3 Execution row: "methodologies, not certifications"). No credential,
 * DOB, phone, or address strings appear here.
 *
 * This module imports the schema as a type only (never a value) so no client bundle pulls in zod;
 * validation runs at build time in `scripts/validate-content.ts` (prebuild) and in Vitest.
 */
export const skills: SkillCluster[] = [
  {
    id: "product",
    name: "Product",
    tone: "sky",
    items: [
      "Strategy, vision & roadmap",
      "Discovery & requirements",
      "Governance & delivery",
      "End-to-end lifecycle",
      "Data-driven decisions",
    ],
    source: "RESUME Core Competencies",
  },
  {
    id: "ai",
    name: "AI & GenAI",
    tone: "lavender",
    items: [
      "Shipped LLM features: structured outputs, vision, QC pass (TeachSpark)",
      "RAG with citation validation (RailCite)",
      "Multi-agent orchestration design (Cubicle)",
      "Enterprise GenAI adoption (Devin at AmEx; GenAI initiatives at Quantiphi)",
    ],
    source:
      "TS/src/adapters/anthropic.ts, anthropic-paper.ts; RC/lib/embeddings.ts, synthesize.ts, validate.ts; CS6/cubicle/lib/gateway/transport.ts; RESUME",
  },
  {
    id: "technology",
    name: "Technology",
    tone: "mint",
    items: [
      "GCP & AWS",
      "Microservices vs. legacy monoliths",
      "BigQuery, Cloud Spanner & SQL",
      "Looker",
      "Supabase/Postgres (RLS, pgvector)",
      "Next.js/React, Vercel/Railway",
    ],
    source: "RESUME Technical Skills; GR/README.md (18 RLS migrations); RC/migrations/001_init.sql",
  },
  {
    id: "execution",
    name: "Execution",
    tone: "peach",
    items: [
      "Agile & Scrum",
      "SAFe",
      "Kanban",
      "Program governance & cross-functional leadership",
      "Jira / Azure DevOps",
    ],
    source: "RESUME Agile Methodologies, PM Tools",
  },
];
