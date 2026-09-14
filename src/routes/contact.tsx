import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Reveal } from "@/components/site/reveal";
import { Magnetic } from "@/components/site/magnetic";
import { useSiteProfile } from "@/hooks/use-site-profile";
import { DEFAULT_PROFILE } from "@/lib/profile-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Start a Project with Alph@ Media" },
      {
        name: "description",
        content:
          "Send your brief: identity, packaging, campaign or motion. Tell us the scope and budget and we'll reply within two working days.",
      },
      { property: "og:title", content: "Contact — Start a Project with Alph@ Media" },
      {
        property: "og:description",
        content: "Share your brief and budget — we reply within two working days.",
      },
    ],
  }),
  component: ContactPage,
});

const services = [
  "Brand identity",
  "Logo / mark",
  "Packaging",
  "Print & editorial",
  "Motion",
  "Other",
];
const budgets = ["Under $2k", "$2k – $6k", "$6k – $15k", "$15k+"];

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-5 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground transition-all duration-300 focus:border-primary/60 focus:bg-white/[0.07] focus:shadow-[0_0_25px_rgba(255,107,0,0.25)]";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.2em] text-primary drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]";

type Errors = Partial<Record<"name" | "email" | "service" | "budget" | "message", string>>;

function ContactPage() {
  const { data } = useSiteProfile();
  const profile = data ?? DEFAULT_PROFILE;
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = "A valid email, please.";
    if (!form.service) next.service = "Pick a service.";
    if (!form.budget) next.budget = "Pick a budget range.";
    if (form.message.trim().length < 20)
      next.message = "A few more details — 20 characters minimum.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Check the highlighted fields.");
      return;
    }
    setSent(true);
    toast.success("Brief received — we'll reply within two working days.");
  };

  return (
    <div>
      <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Contact</p>
          </div>
          <h1 className="mt-6 font-display text-6xl leading-[0.88] md:text-[8rem]">
            Send the <span className="italic text-primary drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">brief</span>
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-24 md:px-10">
        <div className="grid gap-8 md:grid-cols-[1.3fr_0.7fr]">
          <div className="glass-panel rounded-3xl p-6 md:p-12 border border-white/10 shadow-2xl">
            {sent ? (
              <div className="glass-card rounded-2xl p-8 border border-primary/40 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                <h2 className="font-display text-4xl leading-none text-foreground md:text-6xl">
                  Thanks, {form.name.split(" ")[0]}.
                </h2>
                <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  Your brief is in. Expect a reply within two working days with next steps, a
                  proposed scope and available start dates.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", service: "", budget: "", message: "" });
                  }}
                  className="glass-pill mt-8 inline-flex rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary hover:border-primary/60 hover:text-primary transition-all"
                >
                  Send another brief
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      className={cn(inputClass, "mt-3", errors.name && "border-destructive/80 focus:border-destructive")}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Ada Obi"
                    />
                    {errors.name && <p className="mt-2 text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={cn(inputClass, "mt-3", errors.email && "border-destructive/80 focus:border-destructive")}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@studio.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <fieldset>
                  <legend className={labelClass}>Service</legend>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {services.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set("service", s)}
                        className={cn(
                          "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
                          form.service === s
                            ? "glass-pill-active text-primary"
                            : "glass-pill text-muted-foreground hover:text-foreground hover:bg-white/10",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.service && (
                    <p className="mt-2 text-xs text-destructive">{errors.service}</p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Budget</legend>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {budgets.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => set("budget", b)}
                        className={cn(
                          "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
                          form.budget === b
                            ? "glass-pill-active text-primary"
                            : "glass-pill text-muted-foreground hover:text-foreground hover:bg-white/10",
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {errors.budget && (
                    <p className="mt-2 text-xs text-destructive">{errors.budget}</p>
                  )}
                </fieldset>

                <div>
                  <label className={labelClass} htmlFor="message">
                    Project details
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className={cn(
                      inputClass,
                      "mt-3 resize-y",
                      errors.message && "border-destructive/80 focus:border-destructive",
                    )}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="What are you building, who is it for, and when does it need to land?"
                  />
                  {errors.message && (
                    <p className="mt-2 text-xs text-destructive">{errors.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Magnetic type="submit">Send brief</Magnetic>
                </div>
              </form>
            )}
          </div>

          <aside className="glass-card rounded-3xl p-6 md:p-12 space-y-10 border border-white/10 flex flex-col justify-between">
            <div className="space-y-10">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Direct
                </h2>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-3 block font-display text-3xl leading-none text-foreground transition-colors hover:text-primary"
                >
                  {profile.email}
                </a>
                <p className="mt-3 text-sm text-muted-foreground">
                  Replies within two working days, Mon–Fri.
                </p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Studio
                </h2>
                <p className="mt-3 text-lg leading-relaxed text-foreground/90">
                  {profile.location} — remote-first, working worldwide.
                </p>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Elsewhere
                </h2>
                <ul className="mt-3 space-y-2.5 text-lg">
                  {profile.socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 text-foreground shadow-[0_0_20px_rgba(255,107,0,0.15)]">
              <p className="font-display text-2xl leading-tight">
                {profile.availability || "Available for new projects."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
