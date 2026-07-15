import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns null (never throws) when Supabase env vars aren't set, so pages
 * can render a "demo mode" banner instead of crashing. This is the
 * intentional fallback behavior requested for this pass: build with
 * placeholders now, wire in real keys later without code changes.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
