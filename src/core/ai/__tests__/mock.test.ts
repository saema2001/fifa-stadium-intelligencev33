import { describe, it, expect } from "vitest";
import { MockProvider } from "../mock";
import { AGENTS, ZONES, INCIDENT_TYPES } from "@/core/config/domain";

describe("MockProvider", () => {
  const provider = new MockProvider();

  it("returns a well-formed finding for every agent", async () => {
    for (const agent of AGENTS) {
      const finding = await provider.generateFinding({
        agentKey: agent.key,
        zone: ZONES[0],
        currentDensity: 82,
        incidentLabel: INCIDENT_TYPES.transport_delay.label,
      });
      expect(finding.agentKey).toBe(agent.key);
      expect(finding.prediction.length).toBeGreaterThan(0);
      expect(finding.confidence).toBeGreaterThanOrEqual(1);
      expect(finding.confidence).toBeLessThanOrEqual(99);
      expect(finding.reasoning.length).toBeGreaterThan(0);
      expect(finding.action.length).toBeGreaterThan(0);
      expect(finding.impact.length).toBeGreaterThan(0);
    }
  });

  it("references the zone name in its prediction", async () => {
    const zone = ZONES.find((z) => z.id === "D")!;
    const finding = await provider.generateFinding({
      agentKey: "crowd",
      zone,
      currentDensity: 60,
      incidentLabel: INCIDENT_TYPES.overcrowding.label,
    });
    expect(finding.prediction).toContain(zone.name);
  });
});
