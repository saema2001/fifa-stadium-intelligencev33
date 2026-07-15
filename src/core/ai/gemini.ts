import type { AgentFinding } from "@/core/config/domain";
import { buildAgentPrompt, type AgentPromptContext, type AiProvider } from "./provider";

// gemini-2.0-flash (this project's original choice) was retired March 3,
// 2026. gemini-2.5-flash is the current stable, free-tier-eligible model
// as of this writing — verify against https://ai.google.dev/gemini-api/docs/models
// if this ever needs to change again, since Google's free-tier model
// lineup has shifted multiple times through 2026.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function stripCodeFences(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function clampConfidence(raw: unknown): number {
  const n = Math.round(Number(raw));
  if (Number.isNaN(n)) return 50;
  return Math.max(1, Math.min(99, n));
}

function truncateWords(text: unknown, maxWords: number): string {
  const words = String(text ?? "")
    .trim()
    .split(/\s+/);
  if (words.length <= maxWords) return String(text ?? "").trim();
  return words.slice(0, maxWords).join(" ") + "…";
}

/**
 * Validates and normalizes whatever the model returns before it's ever
 * treated as trusted data. A model response is untrusted input — this is
 * the equivalent of the sanitizeAgentPayload() step in the standalone
 * prototype, kept here rather than in a shared UI-layer file since it's
 * specifically about validating a provider's raw output shape.
 */
function validateFinding(
  agentKey: AgentPromptContext["agentKey"],
  raw: unknown
): AgentFinding | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!r.prediction || r.confidence === undefined) return null;
  return {
    agentKey,
    prediction: truncateWords(r.prediction, 30),
    confidence: clampConfidence(r.confidence),
    reasoning: truncateWords(r.reasoning, 30),
    action: truncateWords(r.action, 30),
    impact: truncateWords(r.impact, 6),
  };
}

export class GeminiProvider implements AiProvider {
  name = "gemini-2.5-flash";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFinding(ctx: AgentPromptContext): Promise<AgentFinding> {
    const prompt = buildAgentPrompt(ctx);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Header-based auth is what Google's current docs use as the
          // standard form; the older `?key=` query-string form still works
          // for backwards compatibility but is no longer the documented
          // default as of mid-2026.
          "x-goog-api-key": this.apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini API returned ${res.status}`);
      }

      const data = await res.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = JSON.parse(stripCodeFences(text));
      const finding = validateFinding(ctx.agentKey, parsed);
      if (!finding) throw new Error("Gemini response failed shape validation");
      return finding;
    } finally {
      clearTimeout(timeout);
    }
  }
}
