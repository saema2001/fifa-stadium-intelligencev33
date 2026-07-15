import { cn } from "@/shared/utils/cn";

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "danger" | "amber" | "turf";
}) {
  const variantClasses: Record<string, string> = {
    default: "bg-panel-2 text-text-dim border-border",
    danger: "bg-danger-dim text-danger border-transparent",
    amber: "bg-amber-dim text-amber border-transparent",
    turf: "bg-turf-dim text-turf border-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
