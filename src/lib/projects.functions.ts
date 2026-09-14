import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const projectInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  client: z.string().default(""),
  year: z.string().default(""),
  category: z.string().default("Branding"),
  blurb: z.string().default(""),
  brief: z.string().default(""),
  role: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  results: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  cover: z.string().default(""),
  width: z.number().int().positive().default(1000),
  height: z.number().int().positive().default(1000),
  gallery: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export const listPublishedProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient, mapRow } = await import("./projects.server");
  const { data, error } = await createPublicClient()
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  // Pre-migration: table missing → empty archive instead of a 500.
  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") return [];
    throw error;
  }
  return (data ?? []).map((row) => mapRow(row));
});

export const ensureAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { ADMIN_EMAIL } = await import("./projects.server");
    const email = String(context.claims["email"] ?? "").toLowerCase();
    if (email !== ADMIN_EMAIL) return { isAdmin: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    return { isAdmin: true };
  });

export const listAdminProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { mapRow } = await import("./projects.server");
    const { data, error } = await context.supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") return [];
      throw error;
    }
    return (data ?? []).map((row) => mapRow(row, false));
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => projectInput.parse(data))
  .handler(async ({ context, data }) => {
    const { id, ...fields } = data;
    if (id) {
      const { error } = await context.supabase.from("projects").update(fields).eq("id", id);
      if (error) throw error;
      return { id };
    }
    const { data: inserted, error } = await context.supabase
      .from("projects")
      .insert(fields)
      .select("id")
      .single();
    if (error) throw error;
    return { id: inserted.id };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
