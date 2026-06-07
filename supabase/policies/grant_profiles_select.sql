-- Grant read access on public.profiles to the anon role
-- Run this in your Supabase SQL editor (Project → SQL Editor) to allow
-- the client (anon) to SELECT from public.profiles.

GRANT SELECT ON public.profiles TO anon;

-- Note: If you prefer Row-Level Security (RLS), use a policy instead
-- (see README or contact me if you want the RLS policy file added).
