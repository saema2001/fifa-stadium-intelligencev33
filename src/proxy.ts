import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/organizer", "/staff", "/volunteer"];

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Demo mode: no Supabase configured, so there's no session to check.
  // Every role-gated route stays reachable so the app is fully explorable
  // before Supabase is wired up — see SETUP.md.
  if (!isSupabaseConfigured) return NextResponse.next();

  // Thin check only: does a session exist at all? Role authorization
  // (which role, which routes) is deliberately NOT done here — it happens
  // in each protected page's Server Component via getCurrentUser(), per
  // Next.js 16's "thin proxy" guidance. Keeping DB/role lookups out of the
  // proxy avoids edge-runtime latency and the cookie-sync redirect loops
  // that heavier proxy logic is prone to with Supabase.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/organizer/:path*", "/staff/:path*", "/volunteer/:path*"],
};
