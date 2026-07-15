import { AGENTS, type AgentFinding } from "@/core/config/domain";
import { Panel, PanelHeader } from "@/shared/components/ui/Panel";

export interface FeedEntry extends AgentFinding {
  id: string;
  zoneLabel: string;
  timestamp: string;
  provider: string;
}

export function AgentFeed({ entries }: { entries: FeedEntry[] }) {
  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader title={<>⚡ Agent Swarm Feed</>} subtitle="explainable reasoning" />
      <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite" aria-atomic="false">
        {entries.length === 0 ? (
          <p className="p-6 text-center text-[12.5px] leading-relaxed text-text-faint">
            Trigger an incident from the Operations panel. Every agent reasons through it in real
            time — prediction, confidence, cause, and recommended action.
          </p>
        ) : (
          entries.map((entry) => <AgentCard key={entry.id} entry={entry} />)
        )}
      </div>
    </Panel>
  );
}

function AgentCard({ entry }: { entry: FeedEntry }) {
  const agent = AGENTS.find((a) => a.key === entry.agentKey)!;

  return (
    <article
      className="rounded-xl border border-border bg-bg-2 p-3.5"
      style={{ borderLeft: `3px solid var(${agent.colorVar})` }}
      aria-label={`${agent.name} finding for ${entry.zoneLabel}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
          style={{
            background: `var(${agent.colorVar}-dim)`,
            color: `var(${agent.colorVar})`,
          }}
          aria-hidden
        >
          <AgentIcon agentKey={entry.agentKey} />
        </div>
        <div>
          <div
            className="font-display text-[12.5px] font-semibold"
            style={{ color: `var(${agent.colorVar})` }}
          >
            {agent.name}
          </div>
          <div className="font-mono text-[10px] text-text-faint">{entry.zoneLabel}</div>
        </div>
        <div className="ml-auto font-mono text-[10px] text-text-faint">{entry.timestamp}</div>
      </div>

      <XaiRow label="Prediction">{entry.prediction}</XaiRow>
      <XaiRow label="Confidence">
        <div className="flex flex-1 items-center">
          <div className="h-1.5 flex-1 overflow-hidden rounded bg-border">
            <div
              className="h-full rounded"
              style={{ width: `${entry.confidence}%`, background: `var(${agent.colorVar})` }}
            />
          </div>
          <span
            className="ml-2 font-mono text-[11px] font-semibold"
            style={{ color: `var(${agent.colorVar})` }}
          >
            {entry.confidence}%
          </span>
        </div>
      </XaiRow>
      <XaiRow label="Reasoning">{entry.reasoning}</XaiRow>
      <XaiRow label="Action">{entry.action}</XaiRow>
      <XaiRow label="Impact">
        <span
          className="inline-block rounded-md px-2 py-0.5 font-mono text-[10.5px]"
          style={{ background: `var(${agent.colorVar}-dim)`, color: `var(${agent.colorVar})` }}
        >
          {entry.impact}
        </span>
      </XaiRow>
      <div className="mt-1 font-mono text-[9px] text-text-faint">via {entry.provider}</div>
    </article>
  );
}

function XaiRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-start gap-2">
      <div className="w-16 shrink-0 pt-px font-mono text-[9px] uppercase tracking-wide text-text-faint">
        {label}
      </div>
      <div className="flex-1 text-[12px] leading-relaxed text-text">{children}</div>
    </div>
  );
}

function AgentIcon({ agentKey }: { agentKey: string }) {
  const paths: Record<string, string> = {
    transport: "M3 12h18M12 3v18",
    crowd:
      "M8 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M16 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 20c0-3 2-5 4-5s4 2 4 5M12 20c0-3 2-5 4-5s4 2 4 5",
    volunteer: "M12 3l2 4 4.5.6-3.2 3.2.8 4.4-4.1-2.2-4.1 2.2.8-4.4L5.5 7.6 10 7z",
    emergency:
      "M12 2v6M12 22v-6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2",
    sustainability: "M12 22c5-2 8-6 8-12V5l-8-3-8 3v5c0 6 3 10 8 12z",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d={paths[agentKey] ?? paths.crowd} />
    </svg>
  );
}
