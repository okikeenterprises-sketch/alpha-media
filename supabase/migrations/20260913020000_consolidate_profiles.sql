-- Consolidate user_roles + profiles into a single public.profiles table.
-- Run this AFTER the existing migrations (20260823... and 20260913...).

-- 1) New unified profiles table
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'editor',
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read all.
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Migrate existing roles
INSERT INTO public.profiles (user_id, role)
SELECT user_id, role FROM public.user_roles
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- 3) Point has_role() at the new table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4) Drop the old table (policies & function now use profiles)
DROP TABLE public.user_roles;

-- 5) Keep updated_at fresh
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();