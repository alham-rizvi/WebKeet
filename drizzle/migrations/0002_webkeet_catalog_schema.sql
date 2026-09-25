-- Extend labs with engine/content fields and add categories, learn paths, discussions
ALTER TABLE public.labs
  ADD COLUMN IF NOT EXISTS engine text NOT NULL DEFAULT 'Custom Docker Lab',
  ADD COLUMN IF NOT EXISTS docker_image text NOT NULL DEFAULT 'webkeet/custom-lab:latest',
  ADD COLUMN IF NOT EXISTS scenario text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prerequisites text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tools text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS solution text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cover_image text;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  blurb text NOT NULL DEFAULT '',
  cover_image text,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are public" ON public.categories;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.learn_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'Beginner',
  cover_image text,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.learn_paths TO anon, authenticated;
GRANT ALL ON public.learn_paths TO service_role;
ALTER TABLE public.learn_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Paths are public" ON public.learn_paths;
CREATE POLICY "Paths are public" ON public.learn_paths FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage paths" ON public.learn_paths;
CREATE POLICY "Admins manage paths" ON public.learn_paths FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.path_labs (
  path_id uuid NOT NULL REFERENCES public.learn_paths(id) ON DELETE CASCADE,
  lab_slug text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (path_id, lab_slug)
);
GRANT SELECT ON public.path_labs TO anon, authenticated;
GRANT ALL ON public.path_labs TO service_role;
ALTER TABLE public.path_labs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Path labs are public" ON public.path_labs;
CREATE POLICY "Path labs are public" ON public.path_labs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage path labs" ON public.path_labs;
CREATE POLICY "Admins manage path labs" ON public.path_labs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id uuid NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 2 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.discussions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.discussions TO authenticated;
GRANT ALL ON public.discussions TO service_role;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Discussions are public" ON public.discussions;
CREATE POLICY "Discussions are public" ON public.discussions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users post own comments" ON public.discussions;
CREATE POLICY "Users post own comments" ON public.discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own comments" ON public.discussions;
CREATE POLICY "Users delete own comments" ON public.discussions FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- Categories
INSERT INTO public.categories (slug, name, blurb, sort_order) VALUES
  ('web-application-security','Web Application Security','Injection, cross-site scripting, request forgery, traversal and deserialization flaws in classic web apps.',1),
  ('authentication-session','Authentication and Session','Broken login flows, JWT tampering, OAuth misconfiguration and unsafe password resets.',2),
  ('api-security','API Security','Object-level authorization, mass assignment, rate-limit bypass and GraphQL abuse.',3),
  ('access-control-logic','Access Control and Business Logic','Privilege boundaries, workflow abuse, price tampering and race conditions.',4),
  ('cryptography','Cryptography','Weak hashing, ECB patterns, padding oracles and predictable randomness.',5),
  ('cloud-container','Cloud and Container Security','Docker misconfiguration, exposed object storage, over-broad IAM and leaked secrets.',6),
  ('linux-network','Linux and Network Basics','Privilege escalation, SUID binaries, cron abuse, scanning and traffic analysis.',7),
  ('secure-code-review','Secure Code Review','Read a diff, find the vulnerability, propose and submit the fix.',8),
  ('forensics-logs','Forensics and Logs','Reconstruct attacks from access logs, spot indicators of compromise, build a timeline.',9),
  ('reverse-misc','Reverse Engineering and Misc','JavaScript deobfuscation, hidden endpoints, source-map leaks and client-side secrets.',10)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, blurb = EXCLUDED.blurb, sort_order = EXCLUDED.sort_order;

-- Authors (upstream projects + WebKeet lab team)
INSERT INTO public.lab_authors (name, profile_url, organization) VALUES
  ('OWASP WebGoat Team','https://owasp.org/www-project-webgoat/','OWASP'),
  ('OWASP Juice Shop Team','https://owasp.org/www-project-juice-shop/','OWASP'),
  ('DVWA Maintainers','https://github.com/digininja/DVWA','Digininja'),
  ('OWASP NodeGoat Team','https://github.com/OWASP/NodeGoat','OWASP'),
  ('crAPI Project','https://github.com/OWASP/crAPI','OWASP'),
  ('WebKeet Lab Team','/about','WebKeet'),
  ('WebKeet Cloud Guild','/about','WebKeet'),
  ('WebKeet Blue Team','/about','WebKeet')
ON CONFLICT DO NOTHING;

-- Learn paths
INSERT INTO public.learn_paths (slug, title, summary, description, level, sort_order) VALUES
  ('web-application-security-fundamentals','Web Application Security Fundamentals','Start here: the injection, scripting and traversal bugs that still break production apps.','Ten labs that take you from your first SQL injection to blind exploitation, stored cross-site scripting and server-side request forgery. Each lab pairs the attack with the code-level fix so you leave able to review a pull request, not just run a payload.','Beginner',1),
  ('api-security','API Security','Attack and defend REST and GraphQL interfaces the way real testers do.','Modern products are APIs with a thin client. This path covers broken object-level authorization, mass assignment, rate-limit bypass, GraphQL introspection abuse and JWT handling against crAPI and custom labs.','Intermediate',2),
  ('cloud-security-basics','Cloud Security Basics','Container and cloud misconfiguration, from exposed buckets to escaping a careless container.','Six labs on the mistakes that leak cloud environments: world-readable object storage, secrets committed to git, an over-permissive IAM policy, a Docker socket mounted into a container and metadata-service abuse.','Intermediate',3),
  ('linux-privilege-escalation','Linux Privilege Escalation','Go from a shell to root using only what the host already gave you.','Enumerate a compromised host, abuse a SUID binary, hijack a world-writable cron script, exploit a misconfigured sudo rule and capture traffic on the local segment.','Advanced',4),
  ('defensive-foundations','Defensive Foundations','Review code, read logs and write the fix rather than the exploit.','A blue-team path: spot the vulnerability in a diff, harden authentication, reconstruct an attack from access logs and identify indicators of compromise.','Intermediate',5)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, description = EXCLUDED.description, level = EXCLUDED.level;