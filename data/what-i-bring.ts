/**
 * `/work` "What I Bring" journey (TASK-187; Tushar's spec 2026-10-08, DECISIONS.md items 1–5).
 * Seven stages, ambiguity to impact. Copy follows the spec; every tool and figure is a claim and carries
 * an `evidence` term that must appear in `data/` (tests/unit/what-i-bring.test.ts reads the corpus and fails
 * on a miss). The reference image invented LangChain, Planview, Confluence, Miro and OKRs; they are excluded
 * (and asserted absent). Proof figures are the existing self-reported ones from data/experience.ts.
 */
/**
 * A tool's one data-backed project (TASK-201): `slug` is a `data/projects.ts` slug, `name` its display name (the project name or a part of it, e.g. the employer), and
 * `evidence` a term that must appear in that project's own record (tests/unit/what-i-bring.test.ts checks all three).
 * Absent = no project in `data/` backs the pairing, so the chip shows no label. Never add a pairing from memory.
 */
export type WibToolProject = { slug: string; name: string; evidence: string };
export type WibTool = { label: string; evidence: string; project?: WibToolProject };
export type WibProof = { value: string; label: string; note?: string; evidence: string };
export type WibStage = {
  id: "ambiguity" | "discovery" | "product" | "ai-genai" | "technology" | "execution" | "impact";
  number: string;
  title: string;
  principle: string[];
  /** TASK-216: the stage's paper-craft illustration (`public/media/experience/stage-<id>.webp`, 880 x 663) and its alt text. */
  art: { src: string; alt: string };
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
export const wibHint = "Select a stage on the landscape or in the track to see how I apply it and what I bring.";

export const wibStages: WibStage[] = [
  {
    id: "ambiguity",
    number: "01",
    title: "Ambiguity",
    principle: ["Messy problems.", "Real context."],
    art: { src: "/media/experience/stage-ambiguity.webp", alt: "A paper-craft rocky passage where several narrow paths branch before converging at a question-mark rock, with a small terracotta marker" },
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
    art: { src: "/media/experience/stage-discovery.webp", alt: "A paper-craft research station with an open notebook, a compass, loose note sheets and a path leading to a new route" },
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
      { label: "Analytics", evidence: "analytics", project: { slug: "teachspark", name: "TeachSpark", evidence: "analytics" } },
    ],
  },
  {
    id: "product",
    number: "03",
    title: "Product",
    principle: ["Turn insights into direction."],
    art: { src: "/media/experience/stage-product.webp", alt: "A paper-craft product district: a folded blueprint, a cream paper lightbulb and three product blocks along a roadmap" },
    heading: "I turn ambiguity into product direction.",
    capabilities: [
      "Strategy & vision",
      "Roadmaps & prioritisation",
      "Requirements & governance",
      "Data-driven decisions",
      "Lifecycle management",
    ],
    tools: [
      { label: "Roadmaps", evidence: "roadmap", project: { slug: "mars-ar-modernization", name: "American Express", evidence: "roadmap" } },
      { label: "PRDs", evidence: "PRD" },
      { label: "Prioritisation", evidence: "prioritiz", project: { slug: "nuptis", name: "Nuptis", evidence: "prioritization" } },
    ],
  },
  {
    id: "ai-genai",
    number: "04",
    title: "AI + GenAI",
    principle: ["Use AI to create leverage and new possibilities."],
    art: { src: "/media/experience/stage-ai-genai.webp", alt: "A paper-craft AI core surrounded by a small network of nodes, with a workflow turning input documents into an output" },
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
      { label: "RAG", evidence: "RAG", project: { slug: "railcite", name: "RailCite", evidence: "RAG" } },
      { label: "Evaluation", evidence: "evaluation" },
      { label: "Agents", evidence: "multi-agent", project: { slug: "cubicle", name: "Cubicle", evidence: "multi-agent" } },
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
    art: { src: "/media/experience/stage-technology.webp", alt: "Paper-craft cloud structures, a satellite dish, server and data blocks connected by thin pathways" },
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
      { label: "Spanner", evidence: "Spanner", project: { slug: "cloud-modernization-programs", name: "Quantiphi & Shellkode", evidence: "Spanner" } },
      { label: "Supabase", evidence: "Supabase", project: { slug: "teachspark", name: "TeachSpark", evidence: "Supabase" } },
      { label: "Railway", evidence: "Railway", project: { slug: "teachspark", name: "TeachSpark", evidence: "Railway" } },
    ],
  },
  {
    id: "execution",
    number: "06",
    title: "Execution",
    principle: ["Turn plans into shipped outcomes."],
    art: { src: "/media/experience/stage-execution.webp", alt: "A paper-craft construction site with a crane lowering a bridge section, buildings and a connecting road" },
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
      { label: "Kanban", evidence: "Kanban", project: { slug: "campfire-board", name: "Campfire Board", evidence: "Kanban" } },
    ],
    flow: ["Discover", "Plan", "Build", "Ship", "Measure", "Iterate"],
  },
  {
    id: "impact",
    number: "07",
    title: "Impact",
    principle: ["Real products.", "Real users.", "Real value."],
    art: { src: "/media/experience/stage-impact.webp", alt: "A paper-craft mountain road climbing to a summit with a flag and terracotta sun above a small connected city" },
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
