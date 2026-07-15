# Setup guide

This app runs with **zero configuration** — `npm install && npm run dev`
gets you the full Organizer Command Center, including a real interactive
map (MapLibre + OpenFreeMap, both free with no signup) and a working mock
AI agent swarm. Supabase and Gemini are optional and each activates
independently the moment its env vars are set — no code changes required.

Copy `.env.example` to `.env.local` and fill in whichever of these you want
to enable.

## 1. Supabase (auth, database, RBAC) — free, no credit card

Supabase's free tier requires no credit card (verified as of July 2026):
500MB database, 50,000 monthly active users, unlimited API requests,
never expires. The one operational quirk worth knowing — free projects
auto-pause after 7 days with no activity, which just means clicking
"unpause" in the dashboard the next time you use it, not any cost risk.

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to the **SQL Editor**, paste the entire
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates the `profiles` / `incidents` / `sensors` / `ai_logs` tables,
   the `user_role` enum (`fan` / `volunteer` / `staff` / `organizer`), and
   all the Row Level Security policies.
3. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only —
     never expose this to the browser, never prefix it `NEXT_PUBLIC_`)
4. Restart `npm run dev`. Sign up at `/signup` — new accounts default to
   the `fan` role via the schema's trigger.
5. **To make yourself an organizer**, run this in the SQL Editor once
   you've signed up (replace the email):
   ```sql
   update profiles set role = 'organizer'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
6. Once configured, `/organizer`, `/staff`, and `/volunteer` are actually
   protected: `src/proxy.ts` checks for a session, and each page's Server
   Component (`src/app/organizer/page.tsx`, etc.) checks the role via
   `getCurrentUser()` / `assertRoleAccess()` in `src/core/auth/rbac.ts`.

## 2. Map (live heatmap) — no setup required

The heatmap already works, with nothing to configure. It's built on:

- **[MapLibre GL JS](https://maplibre.org)** — an open-source (BSD-3)
  fork of Mapbox GL JS's last open-source release. It's just an npm
  package, not a hosted service — no account, no token, ever.
- **[OpenFreeMap](https://openfreemap.org)** — a public vector-tile
  service that is genuinely free: no API key, no registration, no card,
  no usage limits, funded by donations. (This project originally used
  Mapbox GL JS + a Mapbox token, but Mapbox requires a credit card to
  activate even its free tier and has no hard spending cap — real
  billing risk for a demo project — so it was swapped for this
  no-account alternative instead. See
  `src/features/organizer/components/ZoneHeatmap.tsx` for the
  implementation.)

Two things worth knowing if you want to customize it:

- The zone coordinates in `src/core/config/domain.ts`
  (`ZONE_COORDINATES`) are placeholder points near MetLife Stadium.
  Replace them with your actual venue's real gate coordinates.
- The basemap style is set via `TILE_STYLE_URL` in `ZoneHeatmap.tsx`,
  currently OpenFreeMap's `positron` (light, minimal — designed to stay
  out of the way of data overlays). OpenFreeMap also offers `liberty`
  and `bright` styles at the same base URL if you want a different look;
  see [openfreemap.org/quick_start](https://openfreemap.org/quick_start/).

## 3. Gemini (agent swarm reasoning) — free, no credit card

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) —
   sign in with any Google account, accept the terms, and a key is generated
   immediately. **No credit card required** for the free tier (verified as
   of July 2026); this is Google's standard developer path, not a special
   program. It never expires, though daily/per-minute request caps apply
   and reset each day — plenty for a demo or prototype.
2. Set `GEMINI_API_KEY` in `.env.local` (server-only, deliberately has no
   `NEXT_PUBLIC_` prefix).
3. Restart the dev server. `src/core/ai/index.ts`'s `getAiProvider()`
   automatically switches from `MockProvider` to `GeminiProvider` — the
   `/api/agents` route and the `useIncidentSimulation` hook that calls it
   don't change at all.
4. If a Gemini call ever fails (rate limit, network, malformed response),
   `generateFindingSafely()` automatically falls back to the mock
   provider rather than breaking the incident-simulation UI — you'll see
   `provider: "mock (... fallback after error)"` in the response when
   that happens.
5. This project targets `gemini-2.5-flash` (see `src/core/ai/gemini.ts`).
   Google's free-tier model lineup has shifted more than once in 2026 —
   if you ever get a "model not found" error, check
   [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
   for the current free-tier-eligible model name and update the
   `GEMINI_MODEL` constant.

## Verifying everything works

```bash
npm install
npm run typecheck   # TypeScript, zero errors expected
npm run lint         # ESLint, zero errors/warnings expected
npm run format:check # Prettier, should report no issues
npm run test          # Vitest unit tests, all should pass
npm run build          # Production build — succeeds even with zero env vars set
npm run dev              # http://localhost:3000
```

The CI workflow (`.github/workflows/ci.yml`) runs all of the above on every
push/PR, with all env vars intentionally left blank — this is a guardrail
against ever accidentally requiring a real key just to build the project.
