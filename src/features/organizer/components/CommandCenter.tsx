"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Panel } from "@/shared/components/ui/Panel";
import { Badge } from "@/shared/components/ui/Badge";
import { useIncidentSimulation } from "@/features/organizer/hooks/useIncidentSimulation";
import { ZoneHeatmap } from "@/features/organizer/components/ZoneHeatmap";
import { AgentFeed } from "@/features/organizer/components/AgentFeed";

export function CommandCenter({ isDemoMode }: { isDemoMode: boolean }) {
  const { zones, feed, risk, readiness, running, runIncident, reset } = useIncidentSimulation();
  const [hasRun, setHasRun] = useState(false);

  const flaggedZone = zones.find((z) => z.flagged);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {isDemoMode && (
          <div className="rounded-xl border border-amber/30 bg-amber-dim px-4 py-2.5 text-[12.5px] text-amber">
            Demo mode — Supabase isn&apos;t configured, so auth/RBAC is bypassed and every role is
            reachable. See <code className="font-mono">SETUP.md</code> to enable real accounts and
            access control.
          </div>
        )}

        <Panel className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold">🧠 AI Executive Summary</h2>
            <div className="flex items-center gap-2">
              <Badge variant={risk === "Elevated" ? "amber" : "turf"}>Risk: {risk}</Badge>
              <Badge variant={readiness >= 90 ? "turf" : "amber"}>Readiness: {readiness}%</Badge>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-text-dim">
            {!hasRun ? (
              "Gate distribution nominal across all zones. Transport network operating within normal parameters. No elevated risk factors detected in the last sync."
            ) : flaggedZone ? (
              <>
                Transit disruption near <b className="text-text">{flaggedZone.name}</b> is driving
                elevated density. Agents concur on redistribution and staffing reinforcement.
                Executing recommended actions should return the zone to baseline within roughly
                12-15 minutes.
              </>
            ) : (
              "Zones back to baseline."
            )}
          </p>
        </Panel>

        <Panel className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold">📍 Live Zone Heatmap</h2>
            <Button
              variant={hasRun ? "default" : "danger-outline"}
              disabled={running}
              onClick={async () => {
                if (hasRun) {
                  reset();
                  setHasRun(false);
                } else {
                  setHasRun(true);
                  await runIncident("transport_delay");
                }
              }}
            >
              {running
                ? "⏳ Agents reasoning…"
                : hasRun
                  ? "↻ Reset Simulation"
                  : "⚡ Simulate Transport Delay"}
            </Button>
          </div>
          <ZoneHeatmap zones={zones} />
        </Panel>
      </div>

      <AgentFeed entries={feed} />
    </div>
  );
}
