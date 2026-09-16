/**
 * RagProvider — reserved stub (technical-plan.md §A4). NOT wired in v1: the Ask is deterministic
 * (decision S7), so nothing under `app/` or `components/` imports this file (S09.06 gate). It exists
 * so the `AnswerProvider` seam is real — a future backend implements the same interface and its
 * replies are parsed through `AnswerSchema`, so a backend can never return a shape the UI does not
 * understand. It never runs in the local, offline build.
 */
import { AnswerSchema, AskError, type Answer, type AnswerProvider, type AskContext } from "./adapter";

export class RagProvider implements AnswerProvider {
  readonly name = "rag";

  constructor(private readonly endpoint: string | undefined = process.env.RAG_ENDPOINT) {}

  async ask(query: string, ctx?: AskContext): Promise<Answer> {
    if (!this.endpoint) throw new AskError("RAG_ENDPOINT not configured");
    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: query, ctx }),
      });
    } catch (cause) {
      throw new AskError("RAG request failed", cause);
    }
    if (!res.ok) throw new AskError(`RAG ${res.status}`);

    const parsed = AnswerSchema.safeParse(await res.json());
    if (!parsed.success) throw new AskError("RAG returned a malformed answer", parsed.error);
    return parsed.data;
  }
}
