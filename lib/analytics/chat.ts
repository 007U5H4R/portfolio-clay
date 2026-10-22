/**
 * Ask Tushky analytics helpers (TASK-194). The question text NEVER leaves the browser: it is reduced here,
 * locally and deterministically (no model call), to one of six closed categories. If nothing matches
 * confidently the category is `other`, never a guess.
 */
import type { ChatbotCategory } from "./events";

const RULES: ReadonlyArray<readonly [ChatbotCategory, RegExp]> = [
  ["contact", /\b(contact|reach|hire|hiring|email|e-mail|linkedin|resume|r[eé]sum[eé]|cv|available|availability|connect|talk to)\b/i],
  ["cloud_architecture", /\b(cloud|aws|azure|gcp|architecture|infrastructure|devops|serverless|kubernetes|docker|cdn|latency|scal(e|ing|able))\b/i],
  ["ai_product_management", /\b(ai|a\.i\.|llm|gpt|rag|prompt|model|evals?|evaluation|machine learning|ml|agent|hallucinat\w*|copilot|generative)\b/i],
  ["experience", /\b(experience|career|background|work(ed|ing)? (at|for)|role|job|employer|company|companies|years|education|degree|skills?|strengths?|certifications?|awards?|journey)\b/i],
  ["projects", /\b(projects?|built|build|portfolio|case stud(y|ies)|teachspark|railcite|velora|nuptis|tegaki|pratyasa|slag|campfire|bhakti|product(s)?|shipped|launch(ed)?)\b/i],
];

/** The category of free text, derived locally. Order matters: a specific intent beats the broad ones. */
export function categorizeMessage(text: string): ChatbotCategory {
  const t = text.slice(0, 400);
  for (const [category, pattern] of RULES) if (pattern.test(t)) return category;
  return "other";
}

/** The drawer's own suggestion categories (tushky-questions.ts) mapped to the analytics categories. */
export function categoryFromSuggestion(category: string | undefined, text: string): ChatbotCategory {
  switch (category) {
    case "products":
    case "project":
      return "projects";
    case "ai":
      return "ai_product_management";
    case "impact":
    case "skills":
      return "experience";
    default:
      return categorizeMessage(text); // "thinking" and follow-up chips: the same local rules as typed text
  }
}

export function destinationTypeFor(href: string, origin: string): "case_study" | "project" | "contact" | "resume" | "page" | "external" {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return "external";
  }
  if (url.protocol === "mailto:") return "contact";
  if (url.origin !== origin) return url.hostname === "drive.google.com" ? "resume" : "external";
  if (url.pathname.startsWith("/work/")) return "case_study";
  if (url.pathname === "/projects") return "project";
  if (url.pathname === "/contact") return "contact";
  return "page";
}
