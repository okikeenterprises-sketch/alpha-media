import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Trash2,
  Upload,
  LogOut,
  Search,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Images,
  FolderOpen,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BioEditor } from "@/components/admin/bio-editor";
import {
  deleteProject,
  ensureAdminRole,
  listAdminProjects,
  saveProject,
} from "@/lib/projects.functions";
import { imageUrl, type ProjectRecord } from "@/lib/project-types";
import { categories } from "@/data/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — Alph@ Media CMS" },
      { name: "description", content: "Manage the Alph@ Media project archive." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — Alph@ Media CMS" },
      { property: "og:description", content: "Manage the Alph@ Media project archive." },
    ],
  }),
  component: AdminPage,
});

type Draft = Omit<ProjectRecord, "id"> & { id?: string };

const emptyDraft: Draft = {
  slug: "",
  title: "",
  client: "",
  year: String(new Date().getFullYear()),
  category: "Branding",
  blurb: "",
  brief: "",
  role: [],
  deliverables: [],
  results: [],
  cover: "",
  width: 1000,
  height: 1000,
  gallery: [],
  sort_order: 0,
  published: true,
};

type StatusFilter = "all" | "published" | "draft";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const grantAdmin = useServerFn(ensureAdminRole);
  const fetchProjects = useServerFn(listAdminProjects);
  const save = useServerFn(saveProject);
  const remove = useServerFn(deleteProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<"projects" | "bio">("projects");

  useEffect(() => {
    grantAdmin({ data: undefined }).catch(() => undefined);
  }, [grantAdmin]);

  const projectsQuery = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => fetchProjects({}),
  });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);

  const stats = useMemo(() => {
    const published = projects.filter((p) => p.published).length;
    const images = projects.reduce(
      (sum, p) => sum + p.gallery.length + (p.cover ? 1 : 0),
      0,
    );
    const cats = new Set(projects.map((p) => p.category)).size;
    return { total: projects.length, published, drafts: projects.length - published, images, cats };
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (status === "published" && !p.published) return false;
      if (status === "draft" && p.published) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!q) return true;
      return [p.title, p.client, p.slug, p.category].some((f) =>
        (f ?? "").toLowerCase().includes(q),
      );
    });
  }, [projects, query, status, categoryFilter]);

  function update(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Draft) => save({ data: payload }),
    onSuccess: (res) => {
      toast.success("Project saved");
      setSelectedId(res.id);
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const quickMutation = useMutation({
    mutationFn: (payload: Draft) => save({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Project deleted");
      setSelectedId(null);
      setDraft(emptyDraft);
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  function select(p: ProjectRecord) {
    setSelectedId(p.id);
    setDraft({ ...p });
    setDirty(false);
  }

  function togglePublished(p: ProjectRecord) {
    quickMutation.mutate({ ...p, published: !p.published });
    if (selectedId === p.id) setDraft((d) => ({ ...d, published: !p.published }));
    toast.success(p.published ? "Moved to drafts" : "Published");
  }

  function duplicate(p: ProjectRecord) {
    const { id: _id, ...rest } = p;
    quickMutation.mutate({
      ...rest,
      title: `${p.title} (copy)`,
      slug: `${p.slug}-copy`,
      published: false,
      sort_order: projects.length + 1,
    });
    toast.success("Duplicated as draft");
  }

  function move(p: ProjectRecord, dir: -1 | 1) {
    const ordered = [...projects].sort((a, b) => a.sort_order - b.sort_order);
    const i = ordered.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ordered.length) return;
    const other = ordered[j]!;
    quickMutation.mutate({ ...p, sort_order: other.sort_order });
    quickMutation.mutate({ ...other, sort_order: p.sort_order });
  }

  function moveGallery(index: number, dir: -1 | 1) {
    const next = [...draft.gallery];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    update({ gallery: next });
  }

  async function handleUpload(files: FileList | null, target: "cover" | "gallery") {
    if (!files?.length) return;
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `uploads/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        paths.push(path);
      }
      if (target === "cover") update({ cover: paths[0]! });
      else update({ gallery: [...draft.gallery, ...paths] });
      toast.success(`${paths.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const isForbidden =
    projectsQuery.isError &&
    /unauthor|permission|denied/i.test(String((projectsQuery.error as Error)?.message ?? ""));

  const completeness = useMemo(() => {
    const checks = [
      Boolean(draft.title),
      Boolean(draft.slug),
      Boolean(draft.client),
      Boolean(draft.blurb),
      Boolean(draft.brief),
      Boolean(draft.cover),
      draft.role.length > 0,
      draft.deliverables.length > 0,
      draft.results.length > 0,
      draft.gallery.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [draft]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Studio dashboard
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none md:text-7xl">
            Studio <span className="italic text-primary">dashboard</span>
          </h1>
          <div className="mt-5 flex gap-2">
            {(["projects", "bio"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "border-2 border-foreground px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
                  tab === t ? "bg-foreground text-background" : "hover:bg-accent",
                )}
              >
                {t === "projects" ? "Projects" : "Bio"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <ExternalLink className="size-4" /> View site
          </Link>
          <button
            onClick={() => {
              setSelectedId(null);
              setDraft({ ...emptyDraft, sort_order: projects.length + 1 });
              setDirty(false);
            }}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:border-primary hover:bg-primary"
          >
            <Plus className="size-4" /> New project
          </button>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      {isForbidden && (
        <p className="mt-8 border-2 border-foreground bg-accent p-5 text-sm text-accent-foreground">
          This account doesn't have admin access. Sign in with the studio owner email.
        </p>
      )}

      {tab === "projects" ? (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat icon={FolderOpen} label="Projects" value={stats.total} />
            <Stat icon={CheckCircle2} label="Published" value={stats.published} />
            <Stat icon={EyeOff} label="Drafts" value={stats.drafts} />
            <Stat icon={Images} label="Images" value={stats.images} />
            <Stat icon={Layers} label="Categories" value={stats.cats} />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <div className="flex items-center gap-2 border-2 border-foreground px-3 py-2">
            <Search className="size-4 shrink-0 opacity-60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, client, slug…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "published", "draft"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "border-2 border-foreground px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  status === s ? "bg-foreground text-background" : "hover:bg-accent",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border-2 border-foreground bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {visible.length} of {projects.length} shown
          </p>

          <div className="space-y-2">
            {projectsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading projects…</p>
            )}
            {!projectsQuery.isLoading && visible.length === 0 && (
              <p className="border-2 border-dashed border-foreground p-4 text-sm text-muted-foreground">
                No projects match these filters.
              </p>
            )}
            {visible.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "border-2 border-foreground transition-colors",
                  selectedId === p.id ? "bg-foreground text-background" : "hover:bg-accent",
                )}
              >
                <button onClick={() => select(p)} className="flex w-full gap-3 p-3 text-left">
                  {p.cover ? (
                    <img
                      src={imageUrl(p.cover)}
                      alt=""
                      className="size-14 shrink-0 border-2 border-current object-cover"
                    />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center border-2 border-dashed border-current text-[10px] uppercase">
                      No art
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display text-xl leading-none">{p.title}</span>
                      {!p.published && (
                        <span className="shrink-0 border border-current px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em]">
                          Draft
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs uppercase tracking-[0.14em] opacity-70">
                      {p.category} · {p.client || "—"} · {p.year || "—"}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] opacity-60">
                      #{p.sort_order} · {p.gallery.length} gallery
                    </span>
                  </span>
                </button>
                <div className="flex divide-x-2 divide-current border-t-2 border-current text-[10px] uppercase tracking-[0.14em]">
                  <IconAction label={p.published ? "Unpublish" : "Publish"} onClick={() => togglePublished(p)}>
                    {p.published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </IconAction>
                  <IconAction label="Up" onClick={() => move(p, -1)}>
                    <ArrowUp className="size-3.5" />
                  </IconAction>
                  <IconAction label="Down" onClick={() => move(p, 1)}>
                    <ArrowDown className="size-3.5" />
                  </IconAction>
                  <IconAction label="Copy" onClick={() => duplicate(p)}>
                    <Copy className="size-3.5" />
                  </IconAction>
                  <IconAction label="Open" onClick={() => navigate({ to: "/work/$slug", params: { slug: p.slug } })}>
                    <ExternalLink className="size-3.5" />
                  </IconAction>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(draft);
          }}
          className="space-y-5 border-2 border-foreground p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {selectedId ? "Editing" : "New project"}
              </p>
              <p className="mt-1 font-display text-3xl leading-none">
                {draft.title || "Untitled project"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {dirty ? "Unsaved changes" : "Saved"} · {completeness}% complete
              </p>
              <div className="mt-2 h-2 w-40 border-2 border-foreground">
                <div className="h-full bg-primary" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input
                value={draft.title}
                onChange={(v) =>
                  update(
                    selectedId || draft.slug ? { title: v } : { title: v, slug: slugify(v) },
                  )
                }
                required
              />
            </Field>
            <Field label="Slug (url)" hint={draft.slug ? `/work/${draft.slug}` : undefined}>
              <div className="flex gap-2">
                <Input value={draft.slug} onChange={(v) => update({ slug: v })} required />
                <button
                  type="button"
                  onClick={() => update({ slug: slugify(draft.title) })}
                  className="shrink-0 border-2 border-foreground px-3 text-[10px] font-semibold uppercase tracking-[0.16em] hover:bg-accent"
                >
                  Auto
                </button>
              </div>
            </Field>
            <Field label="Client">
              <Input value={draft.client} onChange={(v) => update({ client: v })} />
            </Field>
            <Field label="Year">
              <Input value={draft.year} onChange={(v) => update({ year: v })} />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => update({ category: e.target.value })}
                className="w-full border-2 border-foreground bg-background px-3 py-2 outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <Input
                value={String(draft.sort_order)}
                onChange={(v) => update({ sort_order: Number(v) || 0 })}
              />
            </Field>
          </div>

          <Field label="Short blurb" hint={`${draft.blurb.length} chars`}>
            <Input value={draft.blurb} onChange={(v) => update({ blurb: v })} />
          </Field>

          <Field label="The brief" hint={`${draft.brief.trim().split(/\s+/).filter(Boolean).length} words`}>
            <textarea
              value={draft.brief}
              onChange={(e) => update({ brief: e.target.value })}
              rows={5}
              className="w-full border-2 border-foreground bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Roles (comma separated)" hint={`${draft.role.length} items`}>
              <Input value={draft.role.join(", ")} onChange={(v) => update({ role: splitList(v) })} />
            </Field>
            <Field label="Deliverables (comma separated)" hint={`${draft.deliverables.length} items`}>
              <Input
                value={draft.deliverables.join(", ")}
                onChange={(v) => update({ deliverables: splitList(v) })}
              />
            </Field>
          </div>

          <Field label="Results (label:value, comma separated)">
            <Input
              value={draft.results.map((r) => `${r.label}:${r.value}`).join(", ")}
              onChange={(v) =>
                update({
                  results: splitList(v).map((pair) => {
                    const [label, value = ""] = pair.split(":");
                    return { label: (label ?? "").trim(), value: value.trim() };
                  }),
                })
              }
            />
          </Field>

          {draft.results.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {draft.results.map((r, i) => (
                <div key={`${r.label}-${i}`} className="border-2 border-foreground p-3">
                  <p className="font-display text-2xl leading-none">{r.value || "—"}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cover width (px)">
              <Input
                value={String(draft.width)}
                onChange={(v) => update({ width: Number(v) || 1000 })}
              />
            </Field>
            <Field label="Cover height (px)">
              <Input
                value={String(draft.height)}
                onChange={(v) => update({ height: Number(v) || 1000 })}
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Cover image</p>
              {draft.cover ? (
                <img
                  src={imageUrl(draft.cover)}
                  alt="Selected cover"
                  className="mt-3 w-full border-2 border-foreground object-cover"
                />
              ) : (
                <p className="mt-3 grid h-40 place-items-center border-2 border-dashed border-foreground text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  No cover yet
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent">
                  <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload cover"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files, "cover")}
                  />
                </label>
                {draft.cover && (
                  <button
                    type="button"
                    onClick={() => update({ cover: "" })}
                    className="border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                Gallery ({draft.gallery.length})
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {draft.gallery.map((g, i) => (
                  <div key={`${g}-${i}`} className="border-2 border-foreground">
                    <img src={imageUrl(g)} alt="" className="aspect-square w-full object-cover" />
                    <div className="flex divide-x-2 divide-foreground border-t-2 border-foreground">
                      <IconAction label="←" onClick={() => moveGallery(i, -1)}>
                        <ArrowUp className="size-3 -rotate-90" />
                      </IconAction>
                      <IconAction label="→" onClick={() => moveGallery(i, 1)}>
                        <ArrowDown className="size-3 -rotate-90" />
                      </IconAction>
                      <IconAction
                        label="Del"
                        onClick={() =>
                          update({ gallery: draft.gallery.filter((_, idx) => idx !== i) })
                        }
                      >
                        <Trash2 className="size-3" />
                      </IconAction>
                    </div>
                  </div>
                ))}
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent">
                <Upload className="size-4" /> Add images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files, "gallery")}
                />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => update({ published: e.target.checked })}
              className="size-4 accent-current"
            />
            Published on the site
          </label>

          <div className="flex flex-wrap gap-2 border-t-2 border-foreground pt-5">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:border-primary hover:bg-primary disabled:opacity-60"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? "Saving…" : selectedId ? "Save changes" : "Create project"}
            </button>
            {selectedId && (
              <>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/work/$slug", params: { slug: draft.slug } })}
                  className="inline-flex items-center gap-2 border-2 border-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
                >
                  <ExternalLink className="size-4" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this project?")) deleteMutation.mutate(selectedId);
                  }}
                  className="inline-flex items-center gap-2 border-2 border-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </>
            )}
          </div>
        </form>
      </div>
        </>
      ) : (
        <BioEditor />
      )}
    </div>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="border-2 border-foreground p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 font-display text-4xl leading-none">{value}</p>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1 px-2 py-2 hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</span>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Input({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-foreground bg-background px-3 py-2 outline-none focus:border-primary"
    />
  );
}
