// TEMPORARY DEBUG VERSION — replace src/app/organizer/page.tsx with this,
// deploy, visit /organizer while signed in, screenshot what it shows,
// then revert to the original file once we've diagnosed the issue.

import { createClient, isSupabaseConfigured } from "@/core/supabase/server";

export default async function OrganizerDebugPage() {
  if (!isSupabaseConfigured) {
    return <Pre data={{ isSupabaseConfigured: false }} />;
  }

  const supabase = await createClient();
  if (!supabase) {
    return <Pre data={{ supabaseClient: null }} />;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Pre
        data={{
          step: "auth.getUser()",
          user: null,
          userError: userError?.message ?? null,
        }}
      />
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <Pre
      data={{
        step: "profiles lookup",
        userId: user.id,
        userEmail: user.email,
        profile,
        profileError: profileError
          ? {
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code,
            }
          : null,
      }}
    />
  );
}

function Pre({ data }: { data: unknown }) {
  return (
    <pre
      style={{
        background: "#111",
        color: "#0f0",
        padding: "24px",
        fontSize: "14px",
        whiteSpace: "pre-wrap",
        minHeight: "100vh",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
