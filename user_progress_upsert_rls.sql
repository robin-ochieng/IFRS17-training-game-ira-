-- user_progress_upsert_rls.sql
-- Purpose: Ensure public.user_progress supports client upserts with RLS in place.
-- Notes:
-- - Uses TEXT user_id (matches your current schema/screenshots)
-- - Adds unique index on user_id so ON CONFLICT (user_id) upserts work
-- - Enables permissive SELECT/INSERT/UPDATE for authenticated role (browser with auth session)
-- - If you need to tighten later, switch USING/ WITH CHECK to comparisons to auth.uid() or a joined users table

begin;

-- 1) Create table if it doesn't exist
create table if not exists public.user_progress (
  id serial primary key,
  user_id text not null,
  progress_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Ensure unique index on user_id for upsert
create unique index if not exists user_progress_user_id_uidx
  on public.user_progress (user_id);

-- 3) Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

-- 4) Enable RLS
alter table public.user_progress enable row level security;

-- 5) Drop existing policies if present (idempotent)
-- Using IF EXISTS where supported; otherwise re-run safely in SQL editor
drop policy if exists "user_progress_select" on public.user_progress;
drop policy if exists "user_progress_insert" on public.user_progress;
drop policy if exists "user_progress_update" on public.user_progress;

-- 6) Policies
-- Allow authenticated users to read all rows (adjust later if needed)
create policy "user_progress_select"
  on public.user_progress
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert rows (client ensures correct user_id)
create policy "user_progress_insert"
  on public.user_progress
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update rows (no restriction so upsert works)
create policy "user_progress_update"
  on public.user_progress
  for update
  to authenticated
  using (true)
  with check (true);

commit;
