-- BioTrack shared database and authentication schema.
-- Run this in a new Supabase project's SQL editor. Do not store passwords here.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null default 'commenter' check (role in ('boss','editor','commenter')),
  created_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  name text not null,
  make text,
  model text,
  serial text,
  asset_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment_history (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  event_date date not null check (event_date between date '1926-01-01' and date '2126-12-31'),
  event_type text not null,
  details text not null,
  provider text,
  next_due date,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  direction text not null check (direction in ('Received','Issued')),
  vendor text,
  department text,
  movement_date date not null,
  person text,
  notes text,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  category text not null,
  scope text,
  details text not null,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('equipment','history','stock','daily_log')),
  target_id text not null,
  body text not null,
  author_id uuid not null references public.profiles(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.equipment enable row level security;
alter table public.equipment_history enable row level security;
alter table public.stock_movements enable row level security;
alter table public.daily_logs enable row level security;
alter table public.comments enable row level security;

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as
  $$ select role from public.profiles where id = auth.uid() $$;

create policy "authenticated users read profiles" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "authenticated users read equipment" on public.equipment for select to authenticated using (true);
create policy "editors manage equipment" on public.equipment for all to authenticated using (public.current_role() in ('boss','editor')) with check (public.current_role() in ('boss','editor'));
create policy "authenticated users read history" on public.equipment_history for select to authenticated using (true);
create policy "editors manage history" on public.equipment_history for all to authenticated using (public.current_role() in ('boss','editor')) with check (public.current_role() in ('boss','editor'));
create policy "authenticated users read stock" on public.stock_movements for select to authenticated using (true);
create policy "editors manage stock" on public.stock_movements for all to authenticated using (public.current_role() in ('boss','editor')) with check (public.current_role() in ('boss','editor'));
create policy "authenticated users read logs" on public.daily_logs for select to authenticated using (true);
create policy "editors manage logs" on public.daily_logs for all to authenticated using (public.current_role() in ('boss','editor')) with check (public.current_role() in ('boss','editor'));
create policy "authenticated users read comments" on public.comments for select to authenticated using (true);
create policy "authenticated users add comments" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "boss and editors manage comments" on public.comments for update to authenticated using (public.current_role() in ('boss','editor')) with check (public.current_role() in ('boss','editor'));

-- After Manoj signs up via Supabase Auth, run this once using his Auth user id:
-- insert into public.profiles (id,email,full_name,role)
-- values ('AUTH_USER_UUID','manojmedengg@gmail.com','Manoj','boss');
