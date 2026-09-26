/**
 * `/certifications` data (TKT-102, Tushar direction 2026-09-26 — docs/redesign-mockups/m-009/
 * tushar-2026-09-26/certifications-target.png + certifications-spec.md). One array, newest first,
 * rendered with `.map()` by `components/certifications/*`.
 *
 * Source of truth: Tushar's public Credly profile (https://www.credly.com/users/tusharpathak94,
 * `badges.json`, fetched 2026-09-26 — 22 badges). `name`, `issuer`, `year`/`issued`, `expires`,
 * `badge` (the badge artwork, re-encoded — public/media/certifications/README.md) and
 * `credentialUrl` (the INDIVIDUAL credential, never the profile URL) are transcribed verbatim from
 * Credly. `skills` + `applied` on the five certifications in Tushar's reference image are his copy;
 * every other badge carries a verbatim subset of Credly's listed skills and `applied: null` (no
 * sticky note — never an invented claim). Image-vs-Credly mismatches: docs/reports/TKT-102.md.
 *
 * PMP / SAFe: CONTENT_INVENTORY §4.6 excluded both as "banner-only claims, not in RESUME". Both are
 * now Credly-verified (issued Oct / Nov 2025) and Tushar asked for them (2026-09-26), so the
 * forbidden-strings scanner allows them on the certifications surfaces only
 * (`CREDENTIAL_SURFACES` in scripts/forbidden-strings.ts) — everywhere else the ban stands.
 *
 * `expires` is recorded, not rendered: several Credly credentials have lapsed (e.g. Professional
 * Cloud Architect, 2026-09-01) — flagged for Tushar in docs/reports/TKT-102.md.
 */

export interface Certification {
  /** Stable id + the badge file name. */
  slug: string;
  /** Credly badge name, verbatim. */
  name: string;
  /** Credly issuer, verbatim. */
  issuer: string;
  /** Issue year (from `issued`). */
  year: string;
  /** Credly `issued_at_date` (YYYY-MM-DD) — the newest-first sort key. */
  issued: string;
  /** Credly `expires_at_date` (YYYY-MM-DD), or null when the credential does not expire. */
  expires: string | null;
  /** Credly `type_category`: "Certification" → certification, "Validation" → skill badge. */
  kind: "certification" | "skill-badge";
  /** Public path of the badge artwork (240 px WebP). */
  badge: string;
  /** The individual credential: `https://www.credly.com/badges/<id>`. */
  credentialUrl: string;
  skills: string[];
  /** Tushar's "applied in…" sticky-note line, or null → no sticky note. */
  applied: string | null;
}

export const certifications: Certification[] = [
  {
    slug: "gcp-generative-ai-leader",
    name: "Generative AI Leader Certification",
    issuer: "Google Cloud",
    year: "2025",
    issued: "2025-11-22",
    expires: "2028-11-22",
    kind: "certification",
    badge: "/media/certifications/gcp-generative-ai-leader.webp",
    credentialUrl: "https://www.credly.com/badges/edcaeb61-b777-4fef-883f-3fc541df83d5",
    // skills + applied: Tushar's copy, reference 2026-09-26 (certifications-target.png)
    skills: ["GenAI strategy", "use cases", "responsible adoption"],
    applied: "Directly applied in AI-native product initiatives.",
  },
  {
    slug: "safe-6-agilist",
    name: "Certified SAFe® 6 Agilist",
    issuer: "SAFe by Scaled Agile, Inc.",
    year: "2025",
    issued: "2025-11-15",
    expires: "2026-11-15",
    kind: "certification",
    badge: "/media/certifications/safe-6-agilist.webp",
    credentialUrl: "https://www.credly.com/badges/84cca0db-e6e4-4879-9b88-786a462e26c3",
    // skills + applied: Tushar's copy, reference 2026-09-26 (certifications-target.png)
    skills: ["Scaled Agile execution", "PI planning", "ART alignment"],
    applied: "Used in multi-team product delivery.",
  },
  {
    slug: "pmp",
    name: "Project Management Professional (PMP)®",
    issuer: "Project Management Institute",
    year: "2025",
    issued: "2025-10-18",
    expires: "2028-10-18",
    kind: "certification",
    badge: "/media/certifications/pmp.webp",
    credentialUrl: "https://www.credly.com/badges/9872a6d2-4564-49cc-ac07-fde97e3e5177",
    // skills + applied: Tushar's copy, reference 2026-09-26 (certifications-target.png)
    skills: ["Program governance", "risk", "stakeholder alignment", "delivery"],
    applied: "Applied across enterprise programs.",
  },
  {
    slug: "gcp-skill-rag-genai-solution",
    name: "Build and Deploy a Generative AI Solution Using a RAG Framework Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-08-07",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-rag-genai-solution.webp",
    credentialUrl: "https://www.credly.com/badges/49fd1f4f-f060-493c-8b58-5c1a0ff60214",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["RAG", "Embeddings", "Prompt Engineering"],
    applied: null,
  },
  {
    slug: "gcp-professional-cloud-database-engineer",
    name: "Professional Cloud Database Engineer Certification",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-26",
    expires: "2026-05-26",
    kind: "certification",
    badge: "/media/certifications/gcp-professional-cloud-database-engineer.webp",
    credentialUrl: "https://www.credly.com/badges/157217e5-12b8-49d3-b55e-ae8e62fc73cd",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Cloud SQL", "Data Migration", "Database Administration"],
    applied: null,
  },
  {
    slug: "gcp-skill-vertex-ai-search-2024-05-22",
    name: "Integrate Vertex AI Search and Conversation into Voice and Chat Apps Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-22",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-vertex-ai-search-2024-05-22.webp",
    credentialUrl: "https://www.credly.com/badges/38cf9439-74d3-4e41-b300-829e6c49fb53",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Vertex AI", "Conversational AI", "Dialogflow"],
    applied: null,
  },
  {
    slug: "gcp-skill-text-prompt-engineering",
    name: "Text Prompt Engineering Techniques Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-17",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-text-prompt-engineering.webp",
    credentialUrl: "https://www.credly.com/badges/bf3f1e2a-e4c6-4e45-96a3-71846538b234",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Prompt Engineering", "Gemini APIs"],
    applied: null,
  },
  {
    slug: "gcp-skill-ml-on-vertex-ai",
    name: "Build and Deploy Machine Learning Solutions on Vertex AI Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-15",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-ml-on-vertex-ai.webp",
    credentialUrl: "https://www.credly.com/badges/a0d86719-d3e7-4d9d-9ab1-65eddaab5125",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Vertex AI", "AutoML", "ML Model Training"],
    applied: null,
  },
  {
    slug: "gcp-professional-cloud-architect",
    name: "Professional Cloud Architect Certification",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-12",
    expires: "2026-09-01",
    kind: "certification",
    badge: "/media/certifications/gcp-professional-cloud-architect.webp",
    credentialUrl: "https://www.credly.com/badges/babd7fda-9699-4ea8-809f-4d12bf79c276",
    // skills + applied: Tushar's copy, reference 2026-09-26 (certifications-target.png)
    skills: ["Cloud architecture", "modernization", "scalability", "security"],
    applied: "Foundation for GCP programs at Quantiphi.",
  },
  {
    slug: "gcp-skill-vertex-ai-search-2024-05-08",
    name: "Integrate Vertex AI Search and Conversation into Voice and Chat Apps Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-08",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-vertex-ai-search-2024-05-08.webp",
    credentialUrl: "https://www.credly.com/badges/8ecb19dd-024e-4319-8324-f7eb0bb9bce9",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Enterprise Search", "Virtual Agents", "Conversational AI"],
    applied: null,
  },
  {
    slug: "gcp-skill-load-balancing",
    name: "Implement Load Balancing on Compute Engine Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-08",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-load-balancing.webp",
    credentialUrl: "https://www.credly.com/badges/2f3fbd75-a0a5-4409-b94d-fbf0d8883d32",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Compute Engine", "Networking", "Kubernetes"],
    applied: null,
  },
  {
    slug: "gcp-skill-app-dev-environment",
    name: "Set Up an App Dev Environment on Google Cloud Skill Badge",
    issuer: "Google Cloud",
    year: "2024",
    issued: "2024-05-08",
    expires: null,
    kind: "skill-badge",
    badge: "/media/certifications/gcp-skill-app-dev-environment.webp",
    credentialUrl: "https://www.credly.com/badges/1f44af09-1b2d-4e9b-a084-49397668a517",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Cloud Functions", "Cloud Storage", "IAM", "Pub/sub"],
    applied: null,
  },
  {
    slug: "gcp-professional-cloud-developer",
    name: "Professional Cloud Developer Certification",
    issuer: "Google Cloud",
    year: "2023",
    issued: "2023-10-14",
    expires: "2025-10-14",
    kind: "certification",
    badge: "/media/certifications/gcp-professional-cloud-developer.webp",
    credentialUrl: "https://www.credly.com/badges/760ac7dd-5656-47ff-be66-4031231d92a4",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Cloud Run", "CI/CD", "Cloud-Native Applications"],
    applied: null,
  },
  {
    slug: "aws-developer-associate",
    name: "AWS Certified Developer – Associate",
    issuer: "Amazon Web Services Training and Certification",
    year: "2023",
    issued: "2023-10-07",
    expires: "2026-10-07",
    kind: "certification",
    badge: "/media/certifications/aws-developer-associate.webp",
    credentialUrl: "https://www.credly.com/badges/b506f8fa-c501-42be-a5b3-a3632222ae86",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["AWS Cloud", "Code Development", "Code Deployment"],
    applied: null,
  },
  {
    slug: "pspo-i",
    name: "Professional Scrum Product Owner™ I (PSPO I)",
    issuer: "Scrum.org",
    year: "2023",
    issued: "2023-08-14",
    expires: null,
    kind: "certification",
    badge: "/media/certifications/pspo-i.webp",
    credentialUrl: "https://www.credly.com/badges/ca4e651c-0912-4242-b610-9140fd9e08d8",
    // skills + applied: Tushar's copy, reference 2026-09-26 (certifications-target.png)
    skills: ["Product ownership", "backlog", "stakeholder management"],
    applied: "Strengthened product thinking and execution.",
  },
  {
    slug: "aws-data-analytics-specialty",
    name: "AWS Certified Data Analytics – Specialty",
    issuer: "Amazon Web Services Training and Certification",
    year: "2023",
    issued: "2023-06-10",
    expires: "2026-06-10",
    kind: "certification",
    badge: "/media/certifications/aws-data-analytics-specialty.webp",
    credentialUrl: "https://www.credly.com/badges/282fac9d-a237-434e-903a-a3894d02cac3",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Big Data Analytics", "Data Analysis", "Data Visualization"],
    applied: null,
  },
  {
    slug: "aws-machine-learning-specialty",
    name: "AWS Certified Machine Learning – Specialty",
    issuer: "Amazon Web Services Training and Certification",
    year: "2023",
    issued: "2023-05-27",
    expires: "2026-05-27",
    kind: "certification",
    badge: "/media/certifications/aws-machine-learning-specialty.webp",
    credentialUrl: "https://www.credly.com/badges/7b8c8d4f-e1bb-4635-a888-5988bd2a1512",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Machine Learning", "Data Engineering", "Model Evaluation And Validation"],
    applied: null,
  },
  {
    slug: "psm-i",
    name: "Professional Scrum Master™ I (PSM I)",
    issuer: "Scrum.org",
    year: "2023",
    issued: "2023-04-14",
    expires: null,
    kind: "certification",
    badge: "/media/certifications/psm-i.webp",
    credentialUrl: "https://www.credly.com/badges/ed64d03b-0336-4369-99b1-815b78878f64",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Scrum", "Scrum Master", "Agile"],
    applied: null,
  },
  {
    slug: "aws-solutions-architect-associate",
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services Training and Certification",
    year: "2023",
    issued: "2023-02-11",
    expires: "2026-02-11",
    kind: "certification",
    badge: "/media/certifications/aws-solutions-architect-associate.webp",
    credentialUrl: "https://www.credly.com/badges/578ef8f7-e9c0-4001-b623-af052861bb36",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Cloud Architecture", "Cloud Infrastructure", "Cloud Services"],
    applied: null,
  },
  {
    slug: "gcp-professional-machine-learning-engineer",
    name: "Professional Machine Learning Engineer Certification",
    issuer: "Google Cloud",
    year: "2022",
    issued: "2022-12-28",
    expires: "2024-12-28",
    kind: "certification",
    badge: "/media/certifications/gcp-professional-machine-learning-engineer.webp",
    credentialUrl: "https://www.credly.com/badges/d4f9d488-92b7-4f6d-8790-157bfee113c1",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Vertex AI", "ML Ops", "Responsible AI"],
    applied: null,
  },
  {
    slug: "gcp-professional-data-engineer",
    name: "Professional Data Engineer Certification",
    issuer: "Google Cloud",
    year: "2022",
    issued: "2022-12-28",
    expires: "2024-12-28",
    kind: "certification",
    badge: "/media/certifications/gcp-professional-data-engineer.webp",
    credentialUrl: "https://www.credly.com/badges/14b18e2d-3cc0-45aa-a83a-a6014456dbc3",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["BigQuery", "Data Pipelines", "Data Warehouses"],
    applied: null,
  },
  {
    slug: "gcp-associate-cloud-engineer",
    name: "Associate Cloud Engineer Certification",
    issuer: "Google Cloud",
    year: "2022",
    issued: "2022-12-04",
    expires: "2026-09-01",
    kind: "certification",
    badge: "/media/certifications/gcp-associate-cloud-engineer.webp",
    credentialUrl: "https://www.credly.com/badges/75651e13-00d3-489f-8041-ada04db95702",
    // skills: verbatim subset of Credly's listed skills; no applied note (not in Tushar's reference)
    skills: ["Cloud Architecture", "Compute Engine", "GKE", "Infrastructure as Code (IaC)"],
    applied: null,
  },
];

/** The reference's five annotated certifications (the timeline), newest first. */
export const featuredCertifications: Certification[] = certifications.filter((c) => c.applied !== null);

/** Every other Credly badge (the "More on Credly" shelf), newest first. */
export const otherCertifications: Certification[] = certifications.filter((c) => c.applied === null);
