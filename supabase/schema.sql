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

create table if not exists public.app_keepalive (
  id integer primary key default 1,
  last_ping timestamp with time zone default now()
);

insert into public.app_keepalive (id)
values (1)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
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
alter table public.app_keepalive enable row level security;

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

drop policy if exists "Allow all app keepalive" on public.app_keepalive;
drop policy if exists "Allow anon read app keepalive" on public.app_keepalive;
drop policy if exists "Allow anon write app keepalive" on public.app_keepalive;
drop policy if exists "Allow anon update app keepalive" on public.app_keepalive;
create policy "Allow all app keepalive"
on public.app_keepalive
for all
to anon, authenticated
using (true)
with check (true);

alter table public.tournaments
  add column if not exists password_hash text;

drop function if exists public.save_tournament(jsonb, text);
drop function if exists public.verify_tournament_password(text, text);
drop function if exists public.delete_tournament(text, text);

create or replace function public.save_tournament(
  payload jsonb,
  tournament_password text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_id text;
  v_hash text;
  v_row public.tournaments;
begin
  v_id := payload->>'id';
  if v_id is null or v_id = '' then
    raise exception 'Tournament id is required';
  end if;
  if tournament_password is null or tournament_password = '' then
    raise exception 'Tournament password is required';
  end if;

  v_hash := (select password_hash from public.tournaments where id = v_id);

  if v_hash is null then
    insert into public.tournaments (
      id, name, status, step, config, players, teams, tournament,
      created_at, saved_at, completed_at, expires_at, password_hash
    ) values (
      v_id,
      payload->>'name',
      payload->>'status',
      payload->>'step',
      payload->'config',
      coalesce(payload->'players', '[]'::jsonb),
      coalesce(payload->'teams', '[]'::jsonb),
      payload->'tournament',
      coalesce(nullif(payload->>'created_at', '')::timestamptz, now()),
      coalesce(nullif(payload->>'saved_at', '')::timestamptz, now()),
      nullif(payload->>'completed_at', '')::timestamptz,
      nullif(payload->>'expires_at', '')::timestamptz,
      crypt(tournament_password, gen_salt('bf'))
    )
    returning * into v_row;
  else
    if v_hash <> crypt(tournament_password, v_hash) then
      raise exception 'Invalid tournament password' using errcode = '28000';
    end if;

    update public.tournaments set
      name         = coalesce(payload->>'name', name),
      status       = coalesce(payload->>'status', status),
      step         = coalesce(payload->>'step', step),
      config       = coalesce(payload->'config', config),
      players      = coalesce(payload->'players', players),
      teams        = coalesce(payload->'teams', teams),
      tournament   = coalesce(payload->'tournament', tournament),
      saved_at     = coalesce(nullif(payload->>'saved_at', '')::timestamptz, now()),
      completed_at = coalesce(nullif(payload->>'completed_at', '')::timestamptz, completed_at),
      expires_at   = coalesce(nullif(payload->>'expires_at', '')::timestamptz, expires_at)
    where id = v_id
    returning * into v_row;
  end if;

  return to_jsonb(v_row) - 'password_hash';
end;
$func$;

create or replace function public.verify_tournament_password(
  tournament_id text,
  tournament_password text
) returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_hash text;
begin
  v_hash := (select password_hash from public.tournaments where id = tournament_id);
  if v_hash is null then
    return false;
  end if;
  return v_hash = crypt(tournament_password, v_hash);
end;
$func$;

create or replace function public.delete_tournament(
  tournament_id text,
  tournament_password text
) returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_hash text;
begin
  v_hash := (select password_hash from public.tournaments where id = tournament_id);
  if v_hash is null then
    return false;
  end if;
  if v_hash <> crypt(tournament_password, v_hash) then
    raise exception 'Invalid tournament password' using errcode = '28000';
  end if;
  delete from public.tournaments where id = tournament_id;
  return true;
end;
$func$;

grant execute on function public.save_tournament(jsonb, text) to anon, authenticated;
grant execute on function public.verify_tournament_password(text, text) to anon, authenticated;
grant execute on function public.delete_tournament(text, text) to anon, authenticated;
