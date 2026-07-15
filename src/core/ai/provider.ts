import type { AgentFinding, AgentKey, Zone } from "@/core/config/domain";

export interface AgentPromptContext {
  agentKey: AgentKey;
  zone: Zone;
  currentDensity: number;
  incidentLabel: string;
}

export interface AiProvider {
  /** Human-readable name, surfaced in the UI/logs so it's obvious which
   *  provider actually generated a given response (useful for debugging
   *  and for being transparent with end users about mock vs. live data). */
  name: string;
  generateFinding(ctx: AgentPromptContext): Promise<AgentFinding>;
}

/**
 * Builds the actual prompt sent to whichever LLM provider is active. Kept
 * provider-agnostic and in one place so both Gemini and any future provider
 * (Claude, OpenAI, etc.) produce consistent, comparable output — and so a
 * prompt-injection review only has to happen in one function.
 *
 * Security note: every value interpolated here comes from the fixed
 * `ZONES` / `INCIDENT_TYPES` config in core/config/domain.ts, never from a
 * request body or form field. If you extend this to accept free-text user
 * input, do not interpolate it into this prompt without a dedicated
 * sanitization/allowlist pass — treat it the same as the fan-chat and
 * staff-notes fields in the standalone prototype, which are deliberately
 * never forwarded to the model at all.
 */
export function buildAgentPrompt(ctx: AgentPromptContext): string {
  const { agentKey, zone, currentDensity, incidentLabel } = ctx;
  const focusByAgent: Record<AgentKey, string> = {
    transport: "Focus on transit-driven pedestrian surges and routing recommendations.",
    crowd: "Focus on redistribution and safe-flow density thresholds.",
    volunteer: "Focus on staffing gaps and deployment recommendations.",
    emergency: "Focus on evacuation-readiness thresholds, not general crowd flow.",
    sustainability:
      "Focus on the energy/waste impact of the operational response, not crowd safety.",
  };

  return `You are the ${agentKey} agent for a FIFA World Cup 2026 stadium operations AI.
An incident ("${incidentLabel}") has been reported near ${zone.name} (current density ${currentDensity}%).
${focusByAgent[agentKey]}
Respond ONLY with raw JSON, no markdown, no code fences, in this exact shape:
{"prediction": "...", "confidence": <integer 1-99>, "reasoning": "...", "action": "...", "impact": "short 2-4 word tag"}
Keep prediction, reasoning, and action each under 28 words. Be specific and operational, referencing the zone by name.`;
}
