-- Tighten RLS for digital_client_profiles and add helper function for admin checks
-- 1) Helper function (security definer) to avoid recursive RLS in policies
create or replace function public.is_digital_client_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.digital_client_profiles p
    where p.id = _user_id
      and p.role = 'admin'
  );
$$;

-- 2) Ensure RLS is enabled (idempotent)
alter table public.digital_client_profiles enable row level security;
alter table public.digital_client_profiles force row level security;

-- 3) Drop existing overly broad/duplicated policies to remove ambiguity
-- (IF EXISTS makes this idempotent across environments)
DROP POLICY IF EXISTS "Digital client admins can update all profiles" ON public.digital_client_profiles;
DROP POLICY IF EXISTS "Digital client admins can view all profiles" ON public.digital_client_profiles;
DROP POLICY IF EXISTS "Digital clients can update own profile" ON public.digital_client_profiles;
DROP POLICY IF EXISTS "Digital clients can view own profile" ON public.digital_client_profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.digital_client_profiles;

-- 4) Re-create precise policies scoped to authenticated users only
create policy "Digital clients can view own profile"
  on public.digital_client_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Digital client admins can view all profiles"
  on public.digital_client_profiles
  for select
  to authenticated
  using (public.is_digital_client_admin(auth.uid()));

create policy "Digital clients can update own profile"
  on public.digital_client_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Digital client admins can update all profiles"
  on public.digital_client_profiles
  for update
  to authenticated
  using (public.is_digital_client_admin(auth.uid()))
  with check (public.is_digital_client_admin(auth.uid()));