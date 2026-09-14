export type ToolkitGroup = { group: string; items: string[] };
export type TimelineEntry = { year: string; title: string; body: string };
export type Principle = { title: string; body: string };
export type SocialLink = { label: string; href: string };

export type SiteProfile = {
  name: string;
  role_title: string;
  location: string;
  intro: string;
  bio: string;
  portrait: string;
  email: string;
  availability: string;
  toolkit: ToolkitGroup[];
  timeline: TimelineEntry[];
  services: string[];
  principles: Principle[];
  socials: SocialLink[];
};

/** What the site shows before the migration has run or the row is empty. */
export const DEFAULT_PROFILE: SiteProfile = {
  name: "Alexx",
  role_title: "Web Designer & Visual Creative",
  location: "Lagos, Nigeria",
  intro:
    "A passionate web designer and visual creative with over four years of professional experience creating compelling digital and visual experiences. I work in Canva, Adobe Photoshop, Lightroom and CorelDRAW, with a strong eye for creativity, detail and visual storytelling.",
  bio: "Beyond graphic design, I specialise in UI design, web development and event media coverage — helping brands, businesses and individuals turn ideas into engaging visual experiences, online and offline.",
  portrait: "",
  email: "studio@alphamedia.design",
  availability: "Booking identity work from late next month.",
  toolkit: [
    { group: "Design", items: ["Adobe Photoshop", "CorelDRAW", "Canva", "Figma"] },
    { group: "Photo", items: ["Adobe Lightroom", "Colour grading", "Retouching"] },
    { group: "Web", items: ["UI design", "Responsive layout", "Web development"] },
    { group: "Media", items: ["Event coverage", "Social creatives", "Brand kits"] },
  ],
  timeline: [
    { year: "2022", title: "First paid designs", body: "Started with flyers and social creatives for small businesses — and never put the tools down." },
    { year: "2023", title: "Into UI design", body: "Moved from static graphics into interfaces: landing pages, dashboards, mobile screens." },
    { year: "2024", title: "Web development", body: "Started shipping the designs myself, so the final site looks like the mockup." },
    { year: "2025", title: "Event media coverage", body: "Photo and visual coverage for events, with same-week edits and social cutdowns." },
    { year: "2026", title: "Today", body: "Working with brands, businesses and individuals across design, web and media." },
  ],
  services: [
    "Web design",
    "UI design",
    "Web development",
    "Graphic design",
    "Brand identity",
    "Social media creatives",
    "Photo editing",
    "Event media coverage",
  ],
  principles: [
    { title: "Detail first", body: "Spacing, type and contrast decided on purpose — not by accident." },
    { title: "Visual storytelling", body: "Every layout should say something before anyone reads a word." },
    { title: "Design that ships", body: "Files and builds that work in the real world, online and in print." },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Behance", href: "https://behance.net" },
    { label: "Dribbble", href: "https://dribbble.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asToolkit(value: unknown): ToolkitGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null)
    .map((g) => ({
      group: typeof g["group"] === "string" ? g["group"] : "",
      items: asStringArray(g["items"]),
    }))
    .filter((g) => g.group || g.items.length > 0);
}

function asLabeled(
  value: unknown,
  fields: string[],
): { [k: string]: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .map((e) => {
      const out: { [k: string]: string } = {};
      for (const f of fields) out[f] = typeof e[f] === "string" ? (e[f] as string) : "";
      return out;
    })
    .filter((e) => Object.values(e).some(Boolean));
}

const str = (value: unknown, fallback: string) =>
  typeof value === "string" && value ? value : fallback;

/** Coerce a DB row (or partial data) into a full profile — never returns holes. */
export function mapProfileRow(row: Record<string, unknown>): SiteProfile {
  const d = DEFAULT_PROFILE;
  return {
    name: str(row["name"], d.name),
    role_title: str(row["role_title"], d.role_title),
    location: str(row["location"], d.location),
    intro: typeof row["intro"] === "string" ? row["intro"] : d.intro,
    bio: typeof row["bio"] === "string" ? row["bio"] : d.bio,
    portrait: typeof row["portrait"] === "string" ? row["portrait"] : d.portrait,
    email: str(row["email"], d.email),
    availability: typeof row["availability"] === "string" ? row["availability"] : d.availability,
    toolkit: asToolkit(row["toolkit"]).length > 0 ? asToolkit(row["toolkit"]) : d.toolkit,
    timeline: (asLabeled(row["timeline"], ["year", "title", "body"]) as TimelineEntry[]).length > 0
      ? (asLabeled(row["timeline"], ["year", "title", "body"]) as TimelineEntry[])
      : d.timeline,
    services: asStringArray(row["services"]).length > 0 ? asStringArray(row["services"]) : d.services,
    principles: (asLabeled(row["principles"], ["title", "body"]) as Principle[]).length > 0
      ? (asLabeled(row["principles"], ["title", "body"]) as Principle[])
      : d.principles,
    socials: (asLabeled(row["socials"], ["label", "href"]) as SocialLink[]).length > 0
      ? (asLabeled(row["socials"], ["label", "href"]) as SocialLink[])
      : d.socials,
  };
}
