import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_PROFILE, mapProfileRow, type SiteProfile } from "./profile-types";

/** Public bio — falls back to defaults when the table/row doesn't exist yet. */
export const getProfile = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteProfile> => {
    const { createPublicClient } = await import("./projects.server");
    const { data, error } = await createPublicClient()
      .from("site_profile")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      // Pre-migration: PostgREST schema cache doesn't know the table yet.
      if (error.code === "PGRST205" || error.code === "42P01") return DEFAULT_PROFILE;
      throw error;
    }
    if (!data) return DEFAULT_PROFILE;
    return mapProfileRow(data);
  },
);

const labeled = (fields: string[]) => {
  const shape: Record<string, z.ZodString> = {};
  for (const f of fields) shape[f] = z.string();
  return z.object(shape);
};

const profileInput = z.object({
  name: z.string().min(1).max(80),
  role_title: z.string().max(120).default(""),
  location: z.string().max(120).default(""),
  intro: z.string().max(2000).default(""),
  bio: z.string().max(2000).default(""),
  portrait: z.string().max(500).default(""),
  email: z.string().max(160).default(""),
  availability: z.string().max(280).default(""),
  toolkit: z
    .array(z.object({ group: z.string(), items: z.array(z.string()) }))
    .default([]),
  timeline: z.array(labeled(["year", "title", "body"])).default([]),
  services: z.array(z.string()).default([]),
  principles: z.array(labeled(["title", "body"])).default([]),
  socials: z.array(labeled(["label", "href"])).default([]),
});

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => profileInput.parse(data))
  .handler(async ({ context, data }) => {
    // RLS allows only admins to write; everyone else gets a policy denial.
    const { error } = await context.supabase
      .from("site_profile")
      .upsert({ id: 1, ...data }, { onConflict: "id" });
    if (error) throw error;
    return { ok: true };
  });

/** Lets the dashboard show a setup banner before the migration has run. */
export const profileTableReady = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicClient } = await import("./projects.server");
    const { error } = await createPublicClient().from("site_profile").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") return { ready: false };
      throw error;
    }
    return { ready: true };
  } catch {
    return { ready: false };
  }
});
