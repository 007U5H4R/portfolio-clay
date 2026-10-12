/**
 * `/work` "What I Bring" journey (TASK-187; Tushar's spec 2026-10-08, DECISIONS.md items 1–5).
 * Seven stages, ambiguity to impact. Copy follows the spec; every tool and figure is a claim and carries
 * an `evidence` term that must appear in `data/` (tests/unit/what-i-bring.test.ts reads the corpus and fails
 * on a miss). The reference image invented LangChain, Planview, Confluence, Miro and OKRs; they are excluded
 * (and asserted absent). Proof figures are the existing self-reported ones from data/experience.ts.
 */
export type WibTool = { label: string; evidence: string };
export type WibProof = { value: string; label: string; note?: string; evidence: string };
export type WibStage = {
  id: "ambiguity" | "discovery" | "product" | "ai-genai" | "technology" | "execution" | "impact";
  number: string;
  title: string;
  principle: string[];
  heading: string;
  capabilities: string[];
  tools: WibTool[];
  /** AI stage only: portfolio examples shown as small evidence cards (names only, no outcomes). */
  examples?: { name: string; evidence: string }[];
  /** AI stage only: the activated flow. */
  flow?: string[];
  /** Impact stage only: existing self-reported figures. */
  proof?: WibProof[];
};

export const wibHeading = "What I Bring";
export const wibStatement = "I turn ambiguous problems into shipped products.";
export const wibHint = "Hover, focus or tap a stage to see how I apply it and what I bring.";

export const wibStages: WibStage[] = [
  {
    id: "ambiguity",
    number: "01",
    title: "Ambiguity",
    principle: ["Messy problems.", "Real context."],
    heading: "I ask the right questions.",
    capabilities: [
      "Problem framing",
      "Stakeholder context",
      "User research",
      "Market & domain analysis",
      "Identify real opportunities",
    ],
    tools: [
      { label: "Interviews", evidence: "interview" },
      { label: "JTBD", evidence: "JTBD" },
      { label: "Market research", evidence: "market research" },
    ],
  },
  {
    id: "discovery",
    number: "02",
    title: "Discovery",
    principle: ["Find the uncomfortable truth."],
    heading: "I find clarity in complexity.",
    capabilities: [
      "User insights",
      "Data analysis",
      "Problem decomposition",
      "Opportunity sizing",
      "Define success metrics",
    ],
    tools: [
      { label: "Market research", evidence: "market research" },
      { label: "JTBD", evidence: "JTBD" },
      { label: "Analytics", evidence: "analytics" },
    ],
  },
  {
    id: "product",
    number: "03",
    title: "Product",
    principle: ["Turn insights into direction."],
    heading: "I turn ambiguity into product direction.",
    capabilities: [
      "Strategy & vision",
      "Roadmaps & prioritisation",
      "Requirements & governance",
      "Data-driven decisions",
      "Lifecycle management",
    ],
    tools: [
      { label: "Roadmaps", evidence: "roadmap" },
      { label: "PRDs", evidence: "PRD" },
      { label: "Prioritisation", evidence: "prioritiz" },
    ],
  },
  {
    id: "ai-genai",
    number: "04",
    title: "AI + GenAI",
    principle: ["Use AI to create leverage and new possibilities."],
    heading: "I turn AI capability into useful products.",
    capabilities: [
      "LLMs & prompt engineering",
      "RAG & citation validation",
      "AI agents & multi-agent systems",
      "Evaluation & structured outputs",
      "Enterprise AI adoption",
    ],
    tools: [
      { label: "Vertex AI", evidence: "Vertex AI" },
      { label: "RAG", evidence: "RAG" },
      { label: "Evaluation", evidence: "evaluation" },
      { label: "Agents", evidence: "multi-agent" },
    ],
    flow: ["User", "AI agent", "RAG / data", "Validation", "Output"],
    examples: [
      { name: "TeachSpark", evidence: "TeachSpark" },
      { name: "RailCite", evidence: "RailCite" },
      { name: "Cubicle", evidence: "Cubicle" },
      { name: "American Express", evidence: "American Express" },
    ],
  },
  {
    id: "technology",
    number: "05",
    title: "Technology",
    principle: ["Build on scalable, reliable systems."],
    heading: "I understand the system underneath.",
    capabilities: [
      "GCP / AWS",
      "Data platforms (BigQuery, Spanner)",
      "APIs & microservices",
      "Supabase / Postgres",
      "Next.js / React",
      "Vercel / Railway",
      "AI infrastructure",
    ],
    tools: [
      { label: "BigQuery", evidence: "BigQuery" },
      { label: "Spanner", evidence: "Spanner" },
      { label: "Supabase", evidence: "Supabase" },
      { label: "Railway", evidence: "Railway" },
    ],
  },
  {
    id: "execution",
    number: "06",
    title: "Execution",
    principle: ["Turn plans into shipped outcomes."],
    heading: "I make ideas survive contact with reality.",
    capabilities: [
      "Agile / Scrum",
      "SAFe / Kanban",
      "Program governance",
      "Cross-functional leadership",
      "Jira / Azure DevOps",
      "Stakeholder management",
    ],
    tools: [
      { label: "Jira", evidence: "Jira" },
      { label: "Azure DevOps", evidence: "Azure DevOps" },
      { label: "SAFe", evidence: "SAFe" },
      { label: "Kanban", evidence: "Kanban" },
    ],
    flow: ["Discover", "Plan", "Build", "Ship", "Measure", "Iterate"],
  },
  {
    id: "impact",
    number: "07",
    title: "Impact",
    principle: ["Real products.", "Real users.", "Real value."],
    heading: "I create outcomes that compound.",
    capabilities: [
      "User value & adoption",
      "Measurable impact",
      "Long-term scalability",
      "Continuous iteration",
      "New opportunities",
    ],
    tools: [],
    proof: [
      { value: "12", label: "features in 11 months", note: "self-reported", evidence: "12 features shipped in 11 months" },
      { value: "30%", label: "delivery-cycle reduction", note: "self-reported", evidence: "feature delivery cycle time" },
    ],
  },
];
