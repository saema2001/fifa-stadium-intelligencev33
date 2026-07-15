import { AppShell } from "@/shared/components/AppShell";
import { RolePreview } from "@/shared/components/RolePreview";

export default function FanPage() {
  return (
    <AppShell>
      <RolePreview
        title="Fan Companion"
        description="Planned: multilingual AI chat, personalized wayfinding, accessibility-aware routing, and live gate wait times. Not yet built in this scaffold — the Organizer Command Center is the flagship view so far."
        icon={
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        }
      />
    </AppShell>
  );
}
