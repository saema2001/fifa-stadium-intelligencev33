import { redirect } from "next/navigation";
import { AppShell } from "@/shared/components/AppShell";
import { CommandCenter } from "@/features/organizer/components/CommandCenter";
import { getCurrentUser, assertRoleAccess } from "@/core/auth/rbac";

export default async function OrganizerPage() {
  const user = await getCurrentUser();
  if (!assertRoleAccess(user, "/organizer")) {
    redirect("/?denied=/organizer");
  }

  return (
    <AppShell>
      <CommandCenter isDemoMode={user.isDemoMode} />
    </AppShell>
  );
}
