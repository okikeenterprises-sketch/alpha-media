import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminRole } from "@/lib/projects.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Studio sign in — Alph@ Media" },
      { name: "description", content: "Sign in to the Alph@ Media studio dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Studio sign in — Alph@ Media" },
      { property: "og:description", content: "Private dashboard access for Alph@ Media." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const grantAdmin = useServerFn(ensureAdminRole);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/auth` },
            });
      if (error) throw error;

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.success("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
        return;
      }
      await grantAdmin({ data: undefined });
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-24">
      <div className="text-center">
        <h1 className="font-display text-5xl leading-none md:text-6xl">
          Studio <span className="italic text-primary drop-shadow-[0_0_15px_rgba(255,107,0,0.5)]">access</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Private dashboard for managing the work archive.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-panel mt-10 space-y-5 rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-primary" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary/60 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,107,0,0.2)]"
            placeholder="admin@alphamedia.studio"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-primary" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary/60 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,107,0,0.2)]"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,107,0,0.7)] disabled:opacity-60"
        >
          {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
