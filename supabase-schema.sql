-- =========================================================
-- BioTrack shared database and authentication schema.
-- Run this in a new Supabase project's SQL editor.
-- Do NOT store passwords here.
-- =========================================================

-- ---------------------------------------------------------
-- 1) PROFILES
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null default 'pending'
       check (role in ('boss','viewer','pending')),
  created_at timestamptz not null default now()
);

alter table public.profiles alter column role set default 'pending';
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'pending' where role <> 'boss';
alter table public.profiles add constraint profiles_role_check
  check (role in ('boss','viewer','pending'));

-- ---------------------------------------------------------
-- 2) EQUIPMENT
-- ---------------------------------------------------------
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  department text not null,
  name text not null,
  make text,
  model text,
  serial text,
  asset_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 3) EQUIPMENT HISTORY
-- ---------------------------------------------------------
create table if not exists public.equipment_history (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  event_date date not null
    check (event_date between date '1926-01-01' and date '2126-12-31'),
  event_type text not null,
  details text not null,
  provider text,
  next_due date,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 4) STOCK MOVEMENTS
-- ---------------------------------------------------------
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  item text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  direction text not null check (direction in ('Received','Issued')),
  vendor text,
  contact_person text,
  contact_number text,
  department text,
  movement_date date not null,
  person text,
  notes text,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 5) DAILY LOGS
-- ---------------------------------------------------------
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  log_date date not null,
  category text not null,
  scope text,
  details text not null,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 6) COMMENTS
-- ---------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  target_type text not null
    check (target_type in ('equipment','history','stock','daily_log')),
  target_id text not null,
  body text not null,
  author_id uuid references public.profiles(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.equipment add column if not exists client_id text;
alter table public.equipment_history add column if not exists client_id text;
alter table public.stock_movements add column if not exists client_id text;
alter table public.stock_movements add column if not exists contact_person text;
alter table public.stock_movements add column if not exists contact_number text;
alter table public.daily_logs add column if not exists client_id text;
alter table public.comments add column if not exists client_id text;
update public.equipment set client_id = 'legacy-' || id::text where client_id is null;
update public.equipment_history set client_id = 'legacy-' || id::text where client_id is null;
update public.stock_movements set client_id = 'legacy-' || id::text where client_id is null;
update public.daily_logs set client_id = 'legacy-' || id::text where client_id is null;
update public.comments set client_id = 'legacy-' || id::text where client_id is null;
alter table public.comments alter column author_id drop not null;
alter table public.comments drop constraint if exists comments_author_id_fkey;
alter table public.comments add constraint comments_author_id_fkey
  foreign key (author_id) references public.profiles(id) on delete set null;
create unique index if not exists equipment_client_id_key on public.equipment(client_id);
create unique index if not exists equipment_history_client_id_key on public.equipment_history(client_id);
create unique index if not exists stock_movements_client_id_key on public.stock_movements(client_id);
create unique index if not exists daily_logs_client_id_key on public.daily_logs(client_id);
create unique index if not exists comments_client_id_key on public.comments(client_id);

-- ---------------------------------------------------------
-- 7) ENABLE RLS
-- ---------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.equipment         enable row level security;
alter table public.equipment_history enable row level security;
alter table public.stock_movements   enable row level security;
alter table public.daily_logs        enable row level security;
alter table public.comments          enable row level security;

-- ---------------------------------------------------------
-- 8) ROLE HELPER
-- ---------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ---------------------------------------------------------
-- 9) AUTO-CREATE PROFILE ON SIGNUP
--    New users are pending; the Boss provisions view-only users via Edge Function.
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- 10) updated_at TRIGGER FOR EQUIPMENT
-- ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists equipment_touch on public.equipment;
create trigger equipment_touch
  before update on public.equipment
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------
-- 11) POLICIES — PROFILES
-- ---------------------------------------------------------
drop policy if exists "authenticated users read profiles" on public.profiles;
create policy "authenticated users read profiles"
  on public.profiles for select
  to authenticated
  using (public.current_role() in ('boss','viewer'));

drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "boss manages all profiles" on public.profiles;
create policy "boss manages all profiles"
  on public.profiles for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 12) POLICIES — EQUIPMENT
-- ---------------------------------------------------------
drop policy if exists "authenticated users read equipment" on public.equipment;
create policy "authenticated users read equipment"
  on public.equipment for select
  to authenticated using (public.current_role() in ('boss','viewer'));

drop policy if exists "editors manage equipment" on public.equipment;
drop policy if exists "boss manages equipment" on public.equipment;
create policy "boss manages equipment"
  on public.equipment for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 13) POLICIES — EQUIPMENT HISTORY
-- ---------------------------------------------------------
drop policy if exists "authenticated users read history" on public.equipment_history;
create policy "authenticated users read history"
  on public.equipment_history for select
  to authenticated using (public.current_role() in ('boss','viewer'));

drop policy if exists "editors manage history" on public.equipment_history;
drop policy if exists "boss manages history" on public.equipment_history;
create policy "boss manages history"
  on public.equipment_history for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 14) POLICIES — STOCK
-- ---------------------------------------------------------
drop policy if exists "authenticated users read stock" on public.stock_movements;
create policy "authenticated users read stock"
  on public.stock_movements for select
  to authenticated using (public.current_role() in ('boss','viewer'));

drop policy if exists "editors manage stock" on public.stock_movements;
drop policy if exists "boss manages stock" on public.stock_movements;
create policy "boss manages stock"
  on public.stock_movements for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 15) POLICIES — DAILY LOGS
-- ---------------------------------------------------------
drop policy if exists "authenticated users read logs" on public.daily_logs;
create policy "authenticated users read logs"
  on public.daily_logs for select
  to authenticated using (public.current_role() in ('boss','viewer'));

drop policy if exists "editors manage logs" on public.daily_logs;
drop policy if exists "boss manages logs" on public.daily_logs;
create policy "boss manages logs"
  on public.daily_logs for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 16) POLICIES — COMMENTS
-- ---------------------------------------------------------
drop policy if exists "authenticated users read comments" on public.comments;
create policy "authenticated users read comments"
  on public.comments for select
  to authenticated using (public.current_role() in ('boss','viewer'));

drop policy if exists "authenticated users add comments" on public.comments;
drop policy if exists "boss and editors manage comments" on public.comments;
drop policy if exists "boss manages comments" on public.comments;
create policy "boss manages comments"
  on public.comments for all
  to authenticated
  using (public.current_role() = 'boss')
  with check (public.current_role() = 'boss');

-- ---------------------------------------------------------
-- 17) GRANTS (safety net — some projects require explicit)
-- ---------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.equipment, public.equipment_history,
                public.stock_movements, public.daily_logs, public.comments
  to authenticated;
grant insert, update, delete on public.equipment, public.equipment_history,
                public.stock_movements, public.daily_logs, public.comments
  to authenticated;
grant insert, update on public.profiles to authenticated;
grant execute on function public.current_role() to authenticated;

-- =========================================================
-- 18) BOOTSTRAP THE BOSS ACCOUNT
-- =========================================================
-- STEP A: Create the Boss Auth user in Supabase Dashboard > Authentication > Users.
--         The trigger creates a pending profile automatically.
--
-- STEP B: Run supabase-boss-bootstrap.sql in the SQL editor to create or
--         promote the Boss profile for the configured Boss Auth account.
-- =========================================================