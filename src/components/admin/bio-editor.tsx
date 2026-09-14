import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, profileTableReady, saveProfile } from "@/lib/profile.functions";
import {
  DEFAULT_PROFILE,
  type Principle,
  type SiteProfile,
  type SocialLink,
  type TimelineEntry,
  type ToolkitGroup,
} from "@/lib/profile-types";
import { imageUrl } from "@/lib/project-types";
import { cn } from "@/lib/utils";

export function BioEditor() {
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const checkReady = useServerFn(profileTableReady);
  const save = useServerFn(saveProfile);

  const [draft, setDraft] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const loaded = useRef(false);

  const profileQuery = useQuery({ queryKey: ["site-profile"], queryFn: () => fetchProfile({}) });
  const readyQuery = useQuery({
    queryKey: ["site-profile-ready"],
    queryFn: () => checkReady({}),
  });

  useEffect(() => {
    if (profileQuery.data && !loaded.current) {
      loaded.current = true;
      setDraft(profileQuery.data);
      setDirty(false);
    }
  }, [profileQuery.data]);

  function update(patch: Partial<SiteProfile>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: SiteProfile) => save({ data: payload }),
    onSuccess: () => {
      toast.success("Bio saved — About page updated");
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["site-profile"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  async function handlePortrait(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      update({ portrait: path });
      toast.success("Portrait uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const ready = readyQuery.data?.ready ?? true;

  return (
    <div className="mt-10">
      {!ready && (
        <div className="border-2 border-foreground bg-accent p-5 text-sm text-accent-foreground">
          <p className="font-semibold uppercase tracking-[0.16em]">One-time setup needed</p>
          <p className="mt-2 leading-relaxed">
            The <code>site_profile</code> table doesn&apos;t exist yet. Run{" "}
            <code>supabase/migrations/20260913010000_site_profile.sql</code> in your Supabase SQL
            editor, then reload this page. Reads already fall back to the current text; saving
            needs the table.
          </p>
        </div>
      )}

      {profileQuery.isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading bio…</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(draft);
          }}
          className="mt-8 space-y-10"
        >
          <Section title="Basics" hint="Name, role, contact">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <TextInput value={draft.name} onChange={(v) => update({ name: v })} required />
              </Field>
              <Field label="Role / title">
                <TextInput value={draft.role_title} onChange={(v) => update({ role_title: v })} />
              </Field>
              <Field label="Location">
                <TextInput value={draft.location} onChange={(v) => update({ location: v })} />
              </Field>
              <Field label="Email">
                <TextInput value={draft.email} onChange={(v) => update({ email: v })} />
              </Field>
            </div>
            <Field label="Availability note" hint={`${draft.availability.length} chars`}>
              <TextInput
                value={draft.availability}
                onChange={(v) => update({ availability: v })}
              />
            </Field>
            <Field label="Intro paragraph">
              <TextArea
                value={draft.intro}
                rows={4}
                onChange={(v) => update({ intro: v })}
              />
            </Field>
            <Field label="Second paragraph">
              <TextArea value={draft.bio} rows={4} onChange={(v) => update({ bio: v })} />
            </Field>
          </Section>

          <Section title="Portrait" hint="Shown on the About page">
            <div className="flex flex-wrap items-start gap-6">
              {draft.portrait ? (
                <img
                  src={imageUrl(draft.portrait)}
                  alt="Portrait preview"
                  className="aspect-[4/5] w-44 border-2 border-foreground object-cover"
                />
              ) : (
                <p className="grid aspect-[4/5] w-44 place-items-center border-2 border-dashed border-foreground p-4 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  No portrait — site shows the default artwork
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent">
                  <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload portrait"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void handlePortrait(e.target.files)}
                  />
                </label>
                {draft.portrait && (
                  <button
                    type="button"
                    onClick={() => update({ portrait: "" })}
                    className="border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Services marquee" hint="One per line">
            <TextArea
              value={draft.services.join("\n")}
              rows={Math.max(4, draft.services.length + 1)}
              onChange={(v) =>
                update({ services: v.split("\n").map((s) => s.trim()).filter(Boolean) })
              }
            />
          </Section>

          <Section title="Toolkit" hint="Groups with one skill per line">
            <div className="space-y-4">
              {draft.toolkit.map((g, i) => (
                <ToolkitRow
                  key={i}
                  group={g}
                  onChange={(next) =>
                    update({ toolkit: draft.toolkit.map((x, j) => (j === i ? next : x)) })
                  }
                  onRemove={() => update({ toolkit: draft.toolkit.filter((_, j) => j !== i) })}
                />
              ))}
              <AddButton
                label="Add group"
                onClick={() => update({ toolkit: [...draft.toolkit, { group: "", items: [] }] })}
              />
            </div>
          </Section>

          <Section title="Timeline" hint="About page journey">
            <div className="space-y-4">
              {draft.timeline.map((t, i) => (
                <EntryRow<TimelineEntry>
                  key={i}
                  entry={t}
                  fields={[
                    { key: "year", label: "Year", wide: false },
                    { key: "title", label: "Title", wide: true },
                    { key: "body", label: "Body", wide: true, textarea: true },
                  ]}
                  onChange={(next) =>
                    update({ timeline: draft.timeline.map((x, j) => (j === i ? next : x)) })
                  }
                  onRemove={() => update({ timeline: draft.timeline.filter((_, j) => j !== i) })}
                />
              ))}
              <AddButton
                label="Add entry"
                onClick={() =>
                  update({
                    timeline: [...draft.timeline, { year: "", title: "", body: "" }],
                  })
                }
              />
            </div>
          </Section>

          <Section title="Principles" hint="About page cards">
            <div className="space-y-4">
              {draft.principles.map((t, i) => (
                <EntryRow<Principle>
                  key={i}
                  entry={t}
                  fields={[
                    { key: "title", label: "Title", wide: true },
                    { key: "body", label: "Body", wide: true, textarea: true },
                  ]}
                  onChange={(next) =>
                    update({ principles: draft.principles.map((x, j) => (j === i ? next : x)) })
                  }
                  onRemove={() =>
                    update({ principles: draft.principles.filter((_, j) => j !== i) })
                  }
                />
              ))}
              <AddButton
                label="Add principle"
                onClick={() => update({ principles: [...draft.principles, { title: "", body: "" }] })}
              />
            </div>
          </Section>

          <Section title="Social links" hint="About page + contact">
            <div className="space-y-4">
              {draft.socials.map((t, i) => (
                <EntryRow<SocialLink>
                  key={i}
                  entry={t}
                  fields={[
                    { key: "label", label: "Label", wide: false },
                    { key: "href", label: "URL", wide: true },
                  ]}
                  onChange={(next) =>
                    update({ socials: draft.socials.map((x, j) => (j === i ? next : x)) })
                  }
                  onRemove={() => update({ socials: draft.socials.filter((_, j) => j !== i) })}
                />
              ))}
              <AddButton
                label="Add link"
                onClick={() => update({ socials: [...draft.socials, { label: "", href: "" }] })}
              />
            </div>
          </Section>

          <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t-2 border-foreground bg-background py-4">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:border-primary hover:bg-primary disabled:opacity-60"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? "Saving…" : dirty ? "Save bio" : "Saved"}
            </button>
            {dirty && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Unsaved changes
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-2 border-foreground p-6">
      <div className="flex items-baseline justify-between gap-2 border-b-2 border-foreground pb-4">
        <h2 className="font-display text-3xl leading-none">{title}</h2>
        {hint && (
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
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

function TextInput({
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

function TextArea({
  value,
  rows,
  onChange,
}: {
  value: string;
  rows: number;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-foreground bg-background px-3 py-2 outline-none focus:border-primary"
    />
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 border-2 border-dashed border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-accent"
    >
      <Plus className="size-4" /> {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center gap-1 border-2 border-foreground px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}

function ToolkitRow({
  group,
  onChange,
  onRemove,
}: {
  group: ToolkitGroup;
  onChange: (g: ToolkitGroup) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 border-2 border-foreground p-4 md:grid-cols-[200px_1fr_auto]">
      <Field label="Group">
        <TextInput value={group.group} onChange={(v) => onChange({ ...group, group: v })} />
      </Field>
      <Field label="Skills (one per line)">
        <TextArea
          value={group.items.join("\n")}
          rows={4}
          onChange={(v) =>
            onChange({ ...group, items: v.split("\n").map((s) => s.trim()).filter(Boolean) })
          }
        />
      </Field>
      <div className="flex items-start">
        <RemoveButton onClick={onRemove} label="Remove group" />
      </div>
    </div>
  );
}

type FieldDef<T> = {
  key: keyof T & string;
  label: string;
  wide: boolean;
  textarea?: boolean;
};

function EntryRow<T extends Record<string, string>>({
  entry,
  fields,
  onChange,
  onRemove,
}: {
  entry: T;
  fields: FieldDef<T>[];
  onChange: (e: T) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border-2 border-foreground p-4">
      <div className={cn("grid gap-3", fields.some((f) => f.textarea) ? "md:grid-cols-2" : "md:grid-cols-[160px_1fr_1fr_auto]")}>
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            {f.textarea ? (
              <TextArea
                value={entry[f.key] ?? ""}
                rows={3}
                onChange={(v) => onChange({ ...entry, [f.key]: v })}
              />
            ) : (
              <TextInput
                value={entry[f.key] ?? ""}
                onChange={(v) => onChange({ ...entry, [f.key]: v })}
              />
            )}
          </Field>
        ))}
        <div className="flex items-start md:pt-7">
          <RemoveButton onClick={onRemove} label="Remove entry" />
        </div>
      </div>
    </div>
  );
}
