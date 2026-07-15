import { redirect } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { RolePreview } from "@/shared/components/RolePreview";
import { getCurrentUser, assertRoleAccess } from "@/core/auth/rbac";

export default async function StaffPage() {
  const user = await getCurrentUser();
  if (!assertRoleAccess(user, "/staff")) {
    redirect("/?denied=/staff");
  }

  return (
    <AppShell>
      <RolePreview
        title="Venue Staff Console"
        description="Planned: incident intake writing to Supabase (see supabase/schema.sql's incidents table), evacuation-plan generation from the Emergency Agent, and equipment/energy tracking. Not yet built in this scaffold."
        icon={
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
          </svg>
        }
      />
    </AppShell>
  );
}
