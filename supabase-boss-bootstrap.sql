-- Run in Supabase SQL Editor after creating the Boss under Authentication > Users.
-- This script only promotes the configured Boss account; it does not create an Auth user.
do $$
declare
  boss_user auth.users%rowtype;
begin
  select * into boss_user
  from auth.users
  where lower(email) = 'manojmedengg@gmail.com';

  if not found then
    raise exception 'Create the Boss Auth user for manojmedengg@gmail.com, then run this script again.';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (boss_user.id, boss_user.email, 'Manoj', 'boss')
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = 'boss';
end;
$$;

select u.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = 'manojmedengg@gmail.com';npx supabase login
