/**
 * Voice audition samples (TASK-134, voice spec §74–75). Used by the dev-only audition route/page and
 * `scripts/tushky-voice-audition.ts`. Samples A–E are REAL answers the site gives (brief §3.10); the
 * last one is a pronunciation fixture for QA listening only, never shown or served to visitors.
 */
import faqData from "@/data/tushky/faq.json";
import type { FaqEntry } from "@/lib/ask/faq";
import { FALLBACK } from "@/lib/ask/local-provider";

const FAQ = faqData as FaqEntry[];
const faqAnswer = (id: string): string => {
  const entry = FAQ.find((e) => e.id === id);
  if (!entry) throw new Error(`audition: FAQ entry "${id}" is missing`);
  return entry.answer;
};

export interface AuditionSample {
  id: string;
  label: string;
  /** Where the text comes from. */
  source: string;
  text: string;
}

export const AUDITION_SAMPLES: readonly AuditionSample[] = [
  { id: "A", label: "Introduction", source: "faq:who-is-tushar", text: faqAnswer("who-is-tushar") },
  { id: "B", label: "Technical answer", source: "faq:project-walkthrough", text: faqAnswer("project-walkthrough") },
  { id: "C", label: "Metrics-heavy answer", source: "faq:impact", text: faqAnswer("impact") },
  { id: "D", label: "Playful \"woof woof\" answer", source: "faq:contact", text: faqAnswer("contact") },
  { id: "E", label: "Limitation / refusal answer", source: "local-index fallback", text: FALLBACK },
  { id: "Q1", label: "QA: Tell me about RailCite", source: "faq:railcite", text: faqAnswer("railcite") },
  { id: "Q2", label: "QA: What makes Tushar a product manager?", source: "faq:why-pm", text: faqAnswer("why-pm") },
  { id: "Q3", label: "QA: What certifications does he have?", source: "faq:certifications", text: faqAnswer("certifications") },
  {
    id: "P",
    label: "QA: pronunciation fixture (5,760 · 47% · GCP · FHIR · PRD · RAG)",
    source: "fixture (audition only, never served)",
    text: "Pronunciation check: 5,760 documents, a 47% cut, GCP, FHIR, a PRD and a RAG pipeline.",
  },
];

export function auditionSample(id: string): AuditionSample | undefined {
  return AUDITION_SAMPLES.find((s) => s.id === id);
}
