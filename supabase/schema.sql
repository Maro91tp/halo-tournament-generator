create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  app_player_id text,
  name text not null unique,
  gamertag text,
  rank_tier text not null,
  rank_level integer not null,
  strength_value integer,
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tournaments (
  id text primary key,
  name text not null,
  status text not null,
  step text not null,
  config jsonb,
  players jsonb not null default '[]'::jsonb,
  teams jsonb not null default '[]'::jsonb,
  tournament jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  saved_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  expires_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
before update on public.players
for each row
execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.tournaments enable row level security;

drop policy if exists "Allow anon read players" on public.players;
create policy "Allow anon read players"
on public.players
for select
to anon, authenticated
using (true);

drop policy if exists "Allow anon write players" on public.players;
create policy "Allow anon write players"
on public.players
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon update players" on public.players;
create policy "Allow anon update players"
on public.players
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Allow anon read tournaments" on public.tournaments;
create policy "Allow anon read tournaments"
on public.tournaments
for select
to anon, authenticated
using (true);

drop policy if exists "Allow anon write tournaments" on public.tournaments;
create policy "Allow anon write tournaments"
on public.tournaments
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon update tournaments" on public.tournaments;
create policy "Allow anon update tournaments"
on public.tournaments
for update
to anon, authenticated
using (true)
with check (true);
