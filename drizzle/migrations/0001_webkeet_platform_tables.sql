DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lab_difficulty' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.lab_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'instance_status' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.instance_status AS ENUM ('provisioning', 'running', 'stopped', 'expired', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'New learner',
  username text UNIQUE,
  avatar_url text,
  bio text,
  website_url text,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  completed_count integer NOT NULL DEFAULT 0 CHECK (completed_count >= 0),
  terms_accepted_at timestamptz,
  acceptable_use_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE IF NOT EXISTS public.lab_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  profile_url text NOT NULL,
  organization text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lab_authors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lab_authors TO authenticated;
GRANT ALL ON public.lab_authors TO service_role;
ALTER TABLE public.lab_authors ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  difficulty public.lab_difficulty NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  description text NOT NULL,
  objectives text[] NOT NULL DEFAULT '{}',
  hints text[] NOT NULL DEFAULT '{}',
  author_id uuid NOT NULL REFERENCES public.lab_authors(id),
  lesson_path text NOT NULL,
  estimated_minutes integer NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.labs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.labs TO authenticated;
GRANT ALL ON public.labs TO service_role;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.lab_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lab_id uuid NOT NULL REFERENCES public.labs(id),
  status public.instance_status NOT NULL DEFAULT 'provisioning',
  external_id text,
  access_url text,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 minutes'),
  stopped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_instances TO authenticated;
GRANT ALL ON public.lab_instances TO service_role;
ALTER TABLE public.lab_instances ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS one_active_instance_per_user ON public.lab_instances(user_id) WHERE status IN ('provisioning', 'running');

CREATE TABLE IF NOT EXISTS public.completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lab_id uuid NOT NULL REFERENCES public.labs(id),
  points_awarded integer NOT NULL CHECK (points_awarded > 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lab_id)
);
GRANT SELECT ON public.completions TO anon, authenticated;
GRANT INSERT ON public.completions TO authenticated;
GRANT ALL ON public.completions TO service_role;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users create own profile" ON public.profiles;
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public authors are readable" ON public.lab_authors;
CREATE POLICY "Public authors are readable" ON public.lab_authors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage authors" ON public.lab_authors;
CREATE POLICY "Admins manage authors" ON public.lab_authors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Published labs are public" ON public.labs;
CREATE POLICY "Published labs are public" ON public.labs FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage labs" ON public.labs;
CREATE POLICY "Admins manage labs" ON public.labs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users read own instances" ON public.lab_instances;
CREATE POLICY "Users read own instances" ON public.lab_instances FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users create own instances" ON public.lab_instances;
CREATE POLICY "Users create own instances" ON public.lab_instances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own instances" ON public.lab_instances;
CREATE POLICY "Users update own instances" ON public.lab_instances FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users delete own instances" ON public.lab_instances;
CREATE POLICY "Users delete own instances" ON public.lab_instances FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Completions are public" ON public.completions;
CREATE POLICY "Completions are public" ON public.completions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users record own completion" ON public.completions;
CREATE POLICY "Users record own completion" ON public.completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users create own audit entries" ON public.audit_logs;
CREATE POLICY "Users create own audit entries" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

CREATE OR REPLACE FUNCTION public.recalculate_profile_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET
    points = (SELECT COALESCE(SUM(points_awarded), 0) FROM public.completions WHERE user_id = NEW.user_id),
    completed_count = (SELECT COUNT(*) FROM public.completions WHERE user_id = NEW.user_id),
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS completion_totals_after_insert ON public.completions;
CREATE TRIGGER completion_totals_after_insert AFTER INSERT ON public.completions FOR EACH ROW EXECUTE FUNCTION public.recalculate_profile_totals();

CREATE INDEX IF NOT EXISTS labs_category_idx ON public.labs(category);
CREATE INDEX IF NOT EXISTS labs_difficulty_idx ON public.labs(difficulty);
CREATE INDEX IF NOT EXISTS completions_user_idx ON public.completions(user_id);
CREATE INDEX IF NOT EXISTS instances_user_status_idx ON public.lab_instances(user_id, status);