import { Panel } from "@/shared/components/ui/Panel";

export function RolePreview({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Panel className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-text-faint">
        {icon}
      </div>
      <h2 className="mb-1.5 font-display text-[15px] font-semibold">{title}</h2>
      <p className="text-[12.5px] leading-relaxed text-text-dim">{description}</p>
    </Panel>
  );
}
