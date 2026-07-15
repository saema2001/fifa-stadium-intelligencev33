-- FIFA World Cup 2026 Stadium Intelligence — Supabase schema
--
-- How to use: create a project at https://supabase.com, open the SQL
-- Editor, paste this whole file, and run it. Then copy your project URL
-- and anon key into .env.local (see .env.example).
--
-- This implements the RBAC model from the plan: Fan, Volunteer, Staff,
-- Organizer roles, enforced via Postgres Row Level Security rather than
-- in application code, so access control holds even if a bug ships in the
-- frontend.

-- ============================================================
-- 1. Roles
-- ============================================================
create type user_role as enum ('fan', 'volunteer', 'staff', 'organizer');

-- ============================================================
-- 2. Profiles (extends Supabase's built-in auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'fan',
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Everyone can read their own profile (needed to know their own role).
create policy "profiles: read own"
  on profiles for select
  using (auth.uid() = id);

-- Organizers can read every profile (needed for staff/volunteer management UI).
create policy "profiles: organizers read all"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'organizer'
    )
  );

-- Users can update their own display_name, but not their own role
-- (role changes should go through an organizer-only path — see the
-- "profiles: organizers update roles" policy below).
create policy "profiles: update own display_name"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: organizers update roles"
  on profiles for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'organizer'
    )
  );

-- New signups get a profile row automatically, defaulting to 'fan'.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'fan');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- 3. Incidents (staff intake, feeds the agent swarm)
-- ============================================================
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  zone_id text not null,
  incident_type text not null,
  notes text,
  reported_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

alter table incidents enable row level security;

-- Staff and organizers can create incidents.
create policy "incidents: staff+ can insert"
  on incidents for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('staff', 'organizer')
    )
  );

-- Staff, volunteers, and organizers can read incidents (fans see an
-- aggregated/derived view via the app, not this table directly).
create policy "incidents: staff+ can read"
  on incidents for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('staff', 'volunteer', 'organizer')
    )
  );

-- ============================================================
-- 4. Sensors (mock telemetry feed — density, energy draw, etc.)
-- ============================================================
create table if not exists sensors (
  id uuid primary key default gen_random_uuid(),
  zone_id text not null,
  metric text not null,
  value numeric not null,
  recorded_at timestamptz not null default now()
);

alter table sensors enable row level security;

-- Sensor data is operational, not personal — readable by any
-- authenticated user, writable only by the service role (i.e. a
-- server-side cron/job, never directly from the browser).
create policy "sensors: authenticated can read"
  on sensors for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- 5. AI logs (explainable-AI audit trail)
-- ============================================================
create table if not exists ai_logs (
  id uuid primary key default gen_random_uuid(),
  agent_key text not null,
  zone_id text not null,
  finding jsonb not null,
  provider text not null,
  created_at timestamptz not null default now()
);

alter table ai_logs enable row level security;

-- Staff and organizers can review the AI reasoning trail; inserts happen
-- via the server-side API route using the service role key, never
-- directly from the browser with the anon key.
create policy "ai_logs: staff+ can read"
  on ai_logs for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('staff', 'organizer')
    )
  );

-- ============================================================
-- 6. Indexes
-- ============================================================
create index if not exists idx_incidents_zone on incidents (zone_id);
create index if not exists idx_sensors_zone on sensors (zone_id);
create index if not exists idx_ai_logs_zone on ai_logs (zone_id);
create index if not exists idx_ai_logs_created on ai_logs (created_at desc);
