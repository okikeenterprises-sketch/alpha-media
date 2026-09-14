-- Singleton table holding the studio bio (About page content).
-- One row only (id = 1); the app upserts that row from the admin dashboard.

CREATE TABLE public.site_profile (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT 'Alexx',
  role_title text NOT NULL DEFAULT 'Web Designer & Visual Creative',
  location text NOT NULL DEFAULT 'Lagos, Nigeria',
  intro text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  portrait text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT 'studio@alphamedia.design',
  availability text NOT NULL DEFAULT '',
  toolkit jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  principles jsonb NOT NULL DEFAULT '[]'::jsonb,
  socials jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_profile TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_profile TO authenticated;
GRANT ALL ON public.site_profile TO service_role;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile is viewable by everyone"
ON public.site_profile FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert profile"
ON public.site_profile FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update profile"
ON public.site_profile FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_profile_set_updated_at
BEFORE UPDATE ON public.site_profile
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_profile (name, role_title, location, intro, bio, email, availability, toolkit, timeline, services, principles, socials) VALUES
('Alexx', 'Web Designer & Visual Creative', 'Lagos, Nigeria',
'A passionate web designer and visual creative with over four years of professional experience creating compelling digital and visual experiences. I work in Canva, Adobe Photoshop, Lightroom and CorelDRAW, with a strong eye for creativity, detail and visual storytelling.',
'Beyond graphic design, I specialise in UI design, web development and event media coverage — helping brands, businesses and individuals turn ideas into engaging visual experiences, online and offline.',
'studio@alphamedia.design',
'Booking identity work from late next month.',
'[{"group":"Design","items":["Adobe Photoshop","CorelDRAW","Canva","Figma"]},{"group":"Photo","items":["Adobe Lightroom","Colour grading","Retouching"]},{"group":"Web","items":["UI design","Responsive layout","Web development"]},{"group":"Media","items":["Event coverage","Social creatives","Brand kits"]}]'::jsonb,
'[{"year":"2022","title":"First paid designs","body":"Started with flyers and social creatives for small businesses — and never put the tools down."},{"year":"2023","title":"Into UI design","body":"Moved from static graphics into interfaces: landing pages, dashboards, mobile screens."},{"year":"2024","title":"Web development","body":"Started shipping the designs myself, so the final site looks like the mockup."},{"year":"2025","title":"Event media coverage","body":"Photo and visual coverage for events, with same-week edits and social cutdowns."},{"year":"2026","title":"Today","body":"Working with brands, businesses and individuals across design, web and media."}]'::jsonb,
'["Web design","UI design","Web development","Graphic design","Brand identity","Social media creatives","Photo editing","Event media coverage"]'::jsonb,
'[{"title":"Detail first","body":"Spacing, type and contrast decided on purpose — not by accident."},{"title":"Visual storytelling","body":"Every layout should say something before anyone reads a word."},{"title":"Design that ships","body":"Files and builds that work in the real world, online and in print."}]'::jsonb,
'[{"label":"Instagram","href":"https://instagram.com"},{"label":"Behance","href":"https://behance.net"},{"label":"Dribbble","href":"https://dribbble.com"},{"label":"LinkedIn","href":"https://linkedin.com"}]'::jsonb
);
