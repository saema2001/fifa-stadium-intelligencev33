import { cn } from "@/shared/utils/cn";

export function Button({
  children,
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger-outline";
}) {
  const variantClasses: Record<string, string> = {
    default:
      "bg-panel-2 border border-border text-text hover:border-border-strong hover:-translate-y-px",
    primary:
      "bg-gradient-to-br from-turf to-[#14a85c] text-[#06170d] border-none hover:shadow-[0_4px_22px_var(--turf-dim)]",
    "danger-outline": "bg-panel-2 border border-danger/40 text-danger hover:border-danger",
  };

  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-2.5 font-body text-[13px] font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
