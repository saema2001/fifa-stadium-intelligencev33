"use client";

import { useCallback, useRef, useState } from "react";
import { AGENTS, ZONES, clamp, type AgentKey, type IncidentKey } from "@/core/config/domain";
import type { ZoneState } from "@/features/organizer/components/ZoneHeatmap";
import type { FeedEntry } from "@/features/organizer/components/AgentFeed";

function initialZones(): ZoneState[] {
  return ZONES.map((z) => ({ ...z, value: z.baseDensity, flagged: false }));
}

export type RiskLevel = "Low" | "Elevated";

export function useIncidentSimulation() {
  const [zones, setZones] = useState<ZoneState[]>(initialZones);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [risk, setRisk] = useState<RiskLevel>("Low");
  const [readiness, setReadiness] = useState(94);
  const [running, setRunning] = useState(false);
  const idCounter = useRef(0);

  const runIncident = useCallback(
    async (incidentKey: IncidentKey = "transport_delay") => {
      setRunning(true);

      const target = zones.reduce((a, b) => (b.value > a.value ? b : a), zones[0]);
      const flaggedValue = clamp(target.value + 28, 0, 96);

      setZones((prev) =>
        prev.map((z) => (z.id === target.id ? { ...z, flagged: true, value: flaggedValue } : z))
      );
      setRisk("Elevated");
      setReadiness(81);

      const agentOrder: AgentKey[] =
        flaggedValue >= 85
          ? ["transport", "crowd", "volunteer", "emergency", "sustainability"]
          : ["transport", "crowd", "volunteer", "sustainability"];

      for (const agentKey of agentOrder) {
        try {
          const res = await fetch("/api/agents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agentKey,
              zoneId: target.id,
              currentDensity: flaggedValue,
              incidentKey,
            }),
          });
          const data = await res.json();
          idCounter.current += 1;
          setFeed((prev) => [
            {
              id: `${idCounter.current}`,
              agentKey,
              prediction: data.prediction,
              confidence: data.confidence,
              reasoning: data.reasoning,
              action: data.action,
              impact: data.impact,
              provider: data.provider,
              zoneLabel: `Zone ${target.id} · ${target.name}`,
              timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
            },
            ...prev,
          ]);
        } catch {
          // Network failure calling our own API route (distinct from an AI
          // provider failure, which generateFindingSafely already handles
          // server-side). Skip this agent's card rather than aborting the
          // rest of the sequence.
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      setRunning(false);
    },
    [zones]
  );

  const reset = useCallback(() => {
    setZones(initialZones());
    setFeed([]);
    setRisk("Low");
    setReadiness(94);
  }, []);

  return { zones, feed, risk, readiness, running, runIncident, reset, agents: AGENTS };
}
