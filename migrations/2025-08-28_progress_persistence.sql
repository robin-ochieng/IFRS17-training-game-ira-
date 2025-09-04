-- IFRS17 Training Game Progress Persistence Migration
-- Created: 2025-08-28

-- USERS TABLE: ensure columns exist
alter table public.users
  add column if not exists last_module_id int4,
  add column if not exists last_question_index int4 default 0,
  add column if not exists score int4 default 0,
  add column if not exists streak int4 default 0,
  add column if not exists combo int4 default 1,
  add column if not exists completed_modules int4[] default '{}';

-- AUDIT TRAIL: append-only history of changes for transparency
create table if not exists public.progress_events (
  id bigint generated always as identity primary key,
  user_id text not null,
  event_type text not null,                -- e.g., 'LOGIN_RESUME','MODULE_COMPLETE','QUIZ_ADVANCE','SYNC_PROGRESS'
  module_id int4,
  payload jsonb default '{}'::jsonb,       -- arbitrary context (scores, indices, etc.)
  created_at timestamptz default now()
);

-- Helpful index
create index if not exists progress_events_user_time_idx
  on public.progress_events (user_id, created_at desc);

-- RLS
alter table public.progress_events enable row level security;

drop policy if exists "events_insert_own" on public.progress_events;
create policy "events_insert_own" on public.progress_events
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "events_select_own" on public.progress_events;
create policy "events_select_own" on public.progress_events
  for select to authenticated
  using (user_id = auth.uid());

-- USERS RLS (if not already configured):
alter table public.users enable row level security;

drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- OPTIONAL: backfill users.last_module_id from old table if present
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='game_progress') then
    update public.users u
    set last_module_id = gp.last_module_id
    from public.game_progress gp
    where gp.user_id = u.id
      and (u.last_module_id is null or u.last_module_id < gp.last_module_id);
  end if;
end $$;
