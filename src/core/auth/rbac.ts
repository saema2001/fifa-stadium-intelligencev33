import { createClient, isSupabaseConfigured } from "@/core/supabase/server";
import type { UserRole } from "@/core/supabase/types";

export const ROUTE_ROLE_REQUIREMENTS: Record<string, UserRole[]> = {
  "/organizer": ["organizer"],
  "/staff": ["staff", "organizer"],
  "/volunteer": ["volunteer", "organizer"],
  // "/fan" has no entry — every authenticated (or demo-mode) user can view it.
};

export interface CurrentUser {
  id: string | null;
  role: UserRole;
  isDemoMode: boolean;
}

/**
 * Resolves the current user's role for use in Server Components and Route
 * Handlers. In demo mode (no Supabase configured) this always returns an
 * 'organizer' role so every view is reachable without an account — see
 * README/SETUP.md for turning real enforcement on.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (!isSupabaseConfigured) {
    return { id: null, role: "organizer", isDemoMode: true };
  }

  const supabase = await createClient();
  if (!supabase) return { id: null, role: "organizer", isDemoMode: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { id: null, role: "fan", isDemoMode: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: UserRole } | null)?.role ?? "fan";

  return {
    id: user.id,
    role,
    isDemoMode: false,
  };
}

export function roleCanAccess(role: UserRole, pathname: string): boolean {
  const required = ROUTE_ROLE_REQUIREMENTS[pathname];
  if (!required) return true;
  return required.includes(role);
}

/**
 * Authorization check for a protected page's Server Component. In demo
 * mode this always passes (see getCurrentUser). Call this at the top of
 * organizer/staff/volunteer page.tsx and redirect() if it returns false —
 * this is where role authorization actually happens, per the "thin proxy"
 * split: proxy.ts only checks session existence, pages check role.
 */
export function assertRoleAccess(user: CurrentUser, pathname: string): boolean {
  if (user.isDemoMode) return true;
  return roleCanAccess(user.role, pathname);
}
