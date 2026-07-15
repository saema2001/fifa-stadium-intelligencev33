import { redirect } from "next/navigation";
import { getCurrentUser } from "@/core/auth/rbac";

// Sends each visitor to the dashboard that matches their role, instead of
// unconditionally redirecting everyone to /organizer. That old behavior
// caused an infinite redirect loop for any non-organizer account: /organizer
// would reject them to /?denied=/organizer, and this page would immediately
// bounce them straight back to /organizer, forever.
export default async function RootPage() {
  const user = await getCurrentUser();

  switch (user.role) {
    case "organizer":
      redirect("/organizer");
    case "staff":
      redirect("/staff");
    case "volunteer":
      redirect("/volunteer");
    default:
      // "fan", or unauthenticated (getCurrentUser returns role "fan" when
      // there's no session) — /fan has no role restriction, see rbac.ts.
      redirect("/fan");
  }
}
