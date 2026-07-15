import { cn } from "@/shared/utils/cn";

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-b from-panel to-panel-2 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 className="font-display text-[13px] font-semibold tracking-tight flex items-center gap-2">
        {title}
      </h2>
      {subtitle && (
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-faint">
          {subtitle}
        </span>
      )}
    </div>
  );
}
