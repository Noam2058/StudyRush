-- Creates a public.profiles table and a trigger that copies new auth.users rows
-- into public.profiles. Run this in the Supabase SQL editor (or psql) as a
-- project admin.

-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Function to insert profile when a new auth.user is created
create or replace function public.handle_auth_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, created_at)
  values (new.id, new.email, (new.raw_user_meta_data->>'full_name')::text, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users
drop trigger if exists auth_user_created on auth.users;
create trigger auth_user_created
after insert on auth.users
for each row execute procedure public.handle_auth_user_created();
