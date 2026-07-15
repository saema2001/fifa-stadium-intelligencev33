import type { AgentFinding } from "@/core/config/domain";
import type { AgentPromptContext, AiProvider } from "./provider";

const TEMPLATES: Record<
  AgentPromptContext["agentKey"],
  (ctx: AgentPromptContext) => Omit<AgentFinding, "agentKey">
> = {
  transport: (ctx) => ({
    prediction: `Transit disruption near ${ctx.zone.name} is likely to raise pedestrian volume by 30-40% within 20 minutes.`,
    confidence: 78,
    reasoning: `Historical pattern: disruptions upstream of ${ctx.zone.name} consistently redirect foot traffic to the nearest surface gate within 15-25 minutes.`,
    action: `Open an overflow lane at ${ctx.zone.name} and dispatch two additional stewards.`,
    impact: "Congestion contained",
  }),
  crowd: (ctx) => ({
    prediction: `Density at ${ctx.zone.name} is projected to cross 75% within 15 minutes without redistribution.`,
    confidence: 81,
    reasoning: `Current trend plus the incoming surge exceeds this gate's safe-flow throughput threshold.`,
    action: `Redirect roughly 20% of arriving fans to an adjacent, lower-density zone via signage and app push.`,
    impact: "Wait time -6 min",
  }),
  volunteer: (ctx) => ({
    prediction: `Volunteer coverage at ${ctx.zone.name} is one team below what the projected surge needs.`,
    confidence: 73,
    reasoning: `Current roster allocation was set for baseline flow, not the incident-driven spike now predicted.`,
    action: `Reassign one volunteer team from an under-utilized zone to ${ctx.zone.name}.`,
    impact: "Coverage restored",
  }),
  emergency: (ctx) => ({
    prediction: `Egress risk at ${ctx.zone.name} remains within acceptable bounds at the currently projected density.`,
    confidence: 66,
    reasoning: `Projected density stays under the 90% threshold that would trigger evacuation-lane pre-staging.`,
    action: `Maintain standard monitoring; no evacuation-plan escalation needed yet.`,
    impact: "No escalation",
  }),
  sustainability: (ctx) => ({
    prediction: `Overflow lighting/HVAC draw at ${ctx.zone.name} will rise roughly 8% during the redistribution window.`,
    confidence: 70,
    reasoning: `Additional stewarding and signage in the overflow lane requires temporary zone lighting to come online.`,
    action: `Cap overflow lighting to essential fixtures and revert once density normalizes.`,
    impact: "Energy +8%, temp.",
  }),
};

export class MockProvider implements AiProvider {
  name = "mock (no GEMINI_API_KEY configured)";

  async generateFinding(ctx: AgentPromptContext): Promise<AgentFinding> {
    // Small artificial delay so the UI's loading states are exercised the
    // same way they would be against a real network call.
    await new Promise((r) => setTimeout(r, 250));
    const template = TEMPLATES[ctx.agentKey](ctx);
    return { agentKey: ctx.agentKey, ...template };
  }
}
