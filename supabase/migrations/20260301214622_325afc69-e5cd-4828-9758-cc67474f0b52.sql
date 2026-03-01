
-- Create a security definer function to check if a user is admin
-- This avoids infinite recursion when used in profiles RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = 'admin'
  )
$$;

-- Drop the existing overly permissive SELECT policy
DROP POLICY "Enable read access for authenticated users" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Also fix the admin UPDATE/DELETE policies to use the new function (avoids recursion)
DROP POLICY "Enable update for admins" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY "Enable delete for admins" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
