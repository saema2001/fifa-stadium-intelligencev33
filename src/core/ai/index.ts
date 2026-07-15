import type { AgentFinding } from "@/core/config/domain";
import { MockProvider } from "./mock";
import { GeminiProvider } from "./gemini";
import type { AgentPromptContext, AiProvider } from "./provider";

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;
  const apiKey = process.env.GEMINI_API_KEY;
  cachedProvider = apiKey ? new GeminiProvider(apiKey) : new MockProvider();
  return cachedProvider;
}

/**
 * Generate a finding, always falling back to the mock provider on any
 * failure (network error, timeout, malformed response) rather than letting
 * an incident-response UI break because an upstream AI call failed. This
 * mirrors the fallbackData() behavior in the standalone HTML prototype.
 */
export async function generateFindingSafely(
  ctx: AgentPromptContext
): Promise<AgentFinding & { provider: string }> {
  const provider = getAiProvider();
  try {
    const finding = await provider.generateFinding(ctx);
    return { ...finding, provider: provider.name };
  } catch {
    const fallback = new MockProvider();
    const finding = await fallback.generateFinding(ctx);
    return { ...finding, provider: `${fallback.name} (fallback after error)` };
  }
}

export type { AgentPromptContext, AiProvider, AgentFinding };
