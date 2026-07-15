import { describe, it, expect } from "vitest";
import { clamp, densityLevel, ZONES, AGENTS, INCIDENT_TYPES } from "../domain";

describe("clamp", () => {
  it("keeps values within range unchanged", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps values above max", () => {
    expect(clamp(500, 0, 100)).toBe(100);
  });

  it("clamps values below min", () => {
    expect(clamp(-20, 0, 100)).toBe(0);
  });

  it("falls back to min for non-numeric input", () => {
    expect(clamp(Number("not-a-number"), 0, 100)).toBe(0);
  });
});

describe("densityLevel", () => {
  it("classifies low density", () => {
    expect(densityLevel(10).label).toBe("Low");
    expect(densityLevel(49).label).toBe("Low");
  });

  it("classifies moderate density", () => {
    expect(densityLevel(50).label).toBe("Moderate");
    expect(densityLevel(74).label).toBe("Moderate");
  });

  it("classifies high density", () => {
    expect(densityLevel(75).label).toBe("High");
    expect(densityLevel(150).label).toBe("High");
  });
});

describe("domain config integrity", () => {
  it("has 8 zones with unique ids", () => {
    expect(ZONES.length).toBe(8);
    const ids = new Set(ZONES.map((z) => z.id));
    expect(ids.size).toBe(ZONES.length);
  });

  it("has 5 agents matching the plan's Agentic AI Swarm", () => {
    expect(AGENTS.map((a) => a.key).sort()).toEqual(
      ["crowd", "emergency", "sustainability", "transport", "volunteer"].sort()
    );
  });

  it("every incident type has a positive density boost", () => {
    Object.values(INCIDENT_TYPES).forEach((incident) => {
      expect(incident.densityBoost).toBeGreaterThan(0);
    });
  });
});
