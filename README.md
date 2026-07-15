# FIFA World Cup 2026 — Stadium Intelligence Command Center (Next.js)

A Next.js (App Router) rebuild of the standalone HTML prototype, scaffolded
toward the original plan's full architecture: feature-based Clean
Architecture, Supabase (auth/DB/RLS), a live MapLibre/OpenFreeMap heatmap,
and a pluggable Gemini-backed
agent swarm — all wired up, all working in demo mode with zero
configuration, and each piece activating for real the moment you add its
API key. See [SETUP.md](./SETUP.md) for that.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — you land on `/organizer`, the flagship
Command Center. The live map (MapLibre + OpenFreeMap) and the agent swarm
(mock provider) both work with zero configuration — no Supabase, no
Mapbox account, no Gemini key needed. Every role route is reachable
without signing in.

## What's actually implemented vs. scaffolded

| Piece                                                                        | Status                                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router, TypeScript, Tailwind v4                                  | Real, builds clean                                                                                                    |
| Feature-based architecture (`core/` / `features/` / `shared/`)               | Real                                                                                                                  |
| Organizer Command Center (heatmap, agent feed, incident simulation)          | Fully working, ported from the standalone prototype                                                                   |
| `/api/agents` Route Handler with zod input validation                        | Real, tested against valid + invalid requests                                                                         |
| AI provider abstraction (mock <-> Gemini, auto-switching)                    | Real, both paths implemented. Gemini free tier needs no credit card (verified July 2026)                              |
| Live heatmap (MapLibre GL JS + OpenFreeMap, no key needed)                   | Real, works out of the box — no account, no token, no card required                                                   |
| Supabase schema + RLS policies                                               | Real SQL, **untested against a live project** — see caveat below. Free tier needs no credit card (verified July 2026) |
| Supabase auth (login/signup)                                                 | Real Supabase Auth calls, demo-mode fallback when unconfigured                                                        |
| RBAC (`proxy.ts` + per-page role checks)                                     | Real, "thin proxy" pattern per current Next.js guidance                                                               |
| Fan / Volunteer / Staff dashboards                                           | Preview panels only, not built out (see `src/app/{fan,volunteer,staff}/page.tsx`)                                     |
| Explainable AI (`Prediction -> Confidence -> Reasoning -> Action -> Impact`) | Real, same format as the standalone prototype                                                                         |

**Important caveat on the "untested against live" row above:** this
environment has no Supabase project to actually connect to, so while the
code is real (not placeholder/pseudocode) and type-checks, lints, and
builds cleanly, the Supabase queries have only been verified by reading
them against Supabase's documented API, not by running them against a
live project. Follow [SETUP.md](./SETUP.md), and if it doesn't work
exactly as documented, that's the first place to look. (The map itself,
by contrast, was switched to MapLibre + OpenFreeMap specifically because
Mapbox required a credit card just to test the free tier — this
environment has no card to test with either, so the swap avoided that
gap rather than leaving it undocumented.)

## Verified, not just claimed

Everything else in this table was actually run, not just written:

```bash
npm run typecheck     # tsc --noEmit — passes with zero errors
npm run lint            # eslint . — passes with zero errors/warnings
npm run format:check      # prettier --check — passes
npm run test                 # vitest — 12/12 tests pass
npm run build                    # next build — succeeds, zero warnings
npm run start                        # verified: all 7 routes return correct status
                                      #   codes, including a 307 redirect on `/` and a
                                      #   working POST to /api/agents with both valid
                                      #   and deliberately-invalid payloads
```

## Project structure

```
src/
├── app/                      # Next.js routes (App Router)
│   ├── (auth)/login|signup   # Supabase Auth pages, demo-mode fallback
│   ├── organizer/            # Flagship Command Center (RBAC-gated)
│   ├── fan|volunteer|staff/  # Preview panels (RBAC-gated where applicable)
│   └── api/agents/           # Route Handler -> AI provider
├── core/                     # Framework-agnostic domain logic
│   ├── ai/                   # Provider abstraction: mock.ts, gemini.ts, index.ts
│   ├── auth/                 # rbac.ts — role resolution + access checks
│   ├── config/                # domain.ts — zones, agents, incident types (+ tests)
│   └── supabase/               # client.ts (browser), server.ts (SSR), types.ts
├── features/organizer/          # The Command Center feature module
│   ├── components/               # ZoneHeatmap, AgentFeed, CommandCenter
│   └── hooks/                      # useIncidentSimulation
├── shared/                    # Cross-feature UI (Button, Panel, Badge, AppShell)
└── proxy.ts                  # Next.js 16's replacement for middleware.ts —
                               # thin session check only, role checks live in
                               # each protected page instead (see SETUP.md)

supabase/schema.sql     # Full DB schema + RLS policies
.env.example              # Every env var, documented
SETUP.md                    # How to provision Supabase / Gemini (map needs no setup)
```

## Relationship to the standalone prototype

The original standalone HTML/CSS/JS prototype proved the UX and the
explainable-agent-swarm concept in a zero-dependency single page. This
Next.js version is the "next increment" toward the original plan's real
architecture — same domain model (`ZONES`, `AGENTS`, `INCIDENT_TYPES`, the
explainable-AI shape), same visual design system (same CSS custom
properties, same Space Grotesk/Inter/JetBrains Mono type system), rebuilt
on a stack that can actually support auth, a real database, and a real map.

**Not done in this pass:** the Fan/Volunteer/Staff dashboards remain
preview-only (matching the prototype's scope), and there's no CI-verified
connection to a live Supabase instance, since none was available to test
against here. (The map has no such gap — MapLibre + OpenFreeMap needed no
account to test against in the first place.)

## License

MIT
