-- Run this SQL in Supabase SQL Editor after running prisma migrate
-- Creates a trigger that auto-inserts a User row when someone signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (id, email, "fullName", "avatarUrl", credits, role, locale, "createdAt", "updatedAt")
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    5,         -- 5 free credits on signup
    'USER',
    'tr',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
