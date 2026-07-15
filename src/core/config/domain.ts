/**
 * Domain configuration for the stadium simulation. This is intentionally
 * framework-agnostic (no React, no Next-specific imports) so it can be
 * imported from both client components and the server-side API route
 * without pulling either into the other's bundle unnecessarily.
 */

export type ZoneId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface Zone {
  id: ZoneId;
  name: string;
  baseDensity: number; // 0-100 baseline crowd density
}

export const ZONES: readonly Zone[] = [
  { id: "A", name: "Gate A · North", baseDensity: 32 },
  { id: "B", name: "Gate B · North", baseDensity: 28 },
  { id: "C", name: "Gate C · East", baseDensity: 41 },
  { id: "D", name: "Gate D · East", baseDensity: 55 },
  { id: "E", name: "Gate E · South", baseDensity: 37 },
  { id: "F", name: "Concourse F", baseDensity: 22 },
  { id: "G", name: "Transit Plaza", baseDensity: 48 },
  { id: "H", name: "Parking West", baseDensity: 19 },
] as const;

/**
 * Approximate real-world coordinates for MetLife Stadium's perimeter,
 * spread out enough to give each zone a distinct heatmap point. Swap for
 * your actual venue's gate coordinates when adapting this to a real stadium.
 */
export const ZONE_COORDINATES: Record<ZoneId, [number, number]> = {
  A: [-74.0745, 40.8138], // [lng, lat]
  B: [-74.0765, 40.8142],
  C: [-74.0728, 40.8131],
  D: [-74.0715, 40.8126],
  E: [-74.0742, 40.8108],
  F: [-74.0752, 40.8122],
  G: [-74.0708, 40.8118],
  H: [-74.0778, 40.8115],
};

export type AgentKey = "transport" | "crowd" | "volunteer" | "emergency" | "sustainability";

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  colorVar: string; // CSS variable name, e.g. "--cyan"
  focus: string; // one-line description of what this agent optimizes for
}

export const AGENTS: readonly AgentDefinition[] = [
  {
    key: "transport",
    name: "Transport Agent",
    colorVar: "--cyan",
    focus: "Metro, bus, parking, and weather-driven routing predictions",
  },
  {
    key: "crowd",
    name: "Crowd Agent",
    colorVar: "--turf",
    focus: "Gate congestion prediction and redistribution recommendations",
  },
  {
    key: "volunteer",
    name: "Volunteer Agent",
    colorVar: "--amber",
    focus: "Staffing-gap detection and deployment recommendations",
  },
  {
    key: "emergency",
    name: "Emergency Agent",
    colorVar: "--danger",
    focus: "Evacuation-readiness thresholds and vulnerable-user prioritization",
  },
  {
    key: "sustainability",
    name: "Sustainability Agent",
    colorVar: "--violet",
    focus: "Energy/waste impact of operational responses",
  },
] as const;

export type IncidentKey = "transport_delay" | "weather" | "medical" | "overcrowding";

export interface IncidentType {
  key: IncidentKey;
  label: string;
  densityBoost: number; // how much this incident type raises target-zone density
}

export const INCIDENT_TYPES: Record<IncidentKey, IncidentType> = {
  transport_delay: {
    key: "transport_delay",
    label: "Transport Delay",
    densityBoost: 28,
  },
  weather: { key: "weather", label: "Severe Weather", densityBoost: 18 },
  medical: { key: "medical", label: "Medical Incident", densityBoost: 12 },
  overcrowding: {
    key: "overcrowding",
    label: "Overcrowding Report",
    densityBoost: 34,
  },
};

/** Explainable-AI shape every agent response must conform to. */
export interface AgentFinding {
  agentKey: AgentKey;
  prediction: string;
  confidence: number; // 1-99
  reasoning: string;
  action: string;
  impact: string;
}

export function densityLevel(value: number): {
  label: "Low" | "Moderate" | "High";
  colorVar: string;
} {
  if (value >= 75) return { label: "High", colorVar: "--danger" };
  if (value >= 50) return { label: "Moderate", colorVar: "--amber" };
  return { label: "Low", colorVar: "--turf" };
}

export function clamp(n: number, min: number, max: number): number {
  const v = Number(n);
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}
