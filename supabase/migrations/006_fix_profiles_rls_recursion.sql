-- Fix: "infinite recursion detected in policy for relation profiles" (42P17)
--
-- Root cause:
--   A policy on `profiles` referenced `profiles` again via a subquery, which triggers
--   recursive RLS evaluation and causes Postgres to throw 42P17.
--
-- Approach:
--   Use a SECURITY DEFINER helper that checks the current user's admin flag while
--   bypassing RLS (table owner), then reference that helper in the admin policy.

-- Helper: current user is admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Replace the recursive policy with a non-recursive one.
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

