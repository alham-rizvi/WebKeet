import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Chrome } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const search = z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional().catch("signin") });

export const Route = createFileRoute("/auth")({
  validateSearch: (value) => search.parse(value),
  head: () => ({
    meta: [
      { title: "Sign in — WebKeet" },
      { name: "description", content: "Sign in or create your WebKeet learner account." },
      { property: "og:title", content: "WebKeet account" },
      { property: "og:description", content: "Access your labs and security training progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState(initial ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage("Check your email for a password reset link.");
      } else if (mode === "signup") {
        if (!accepted) {
          setMessage("Accept the Terms and Acceptable Use Policy to continue.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name, terms_accepted: true },
          },
        });
        if (error) throw error;
        if (data.user) {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            display_name: name || email.split("@")[0] || "Learner",
            terms_accepted_at: new Date().toISOString(),
            acceptable_use_accepted_at: new Date().toISOString(),
          });
          if (profileError) console.error("Profile setup failed", profileError);
          if (data.session) {
            await navigate({ to: "/dashboard" });
          } else {
            setMessage("Account created. Check your email to confirm, then sign in.");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/dashboard" });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google sign-in could not start.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col p-6 sm:p-10">
        <Link to="/" aria-label="WebKeet home" className="inline-flex font-bold"><Brand /></Link>
        <div className="mx-auto my-auto w-full max-w-md py-12">
          <p className="font-mono text-xs text-muted-foreground">SECURE ACCESS</p>
          <h1 className="mt-3 text-4xl font-semibold">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Continue training"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signup" ? "Your progress and points stay with you." : "Access your labs, progress, and active instance."}
          </p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            {mode === "signup" && <div><Label htmlFor="name">Display name</Label><Input id="name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)} required /></div>}
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            {mode !== "forgot" && <div><Label htmlFor="password">Password</Label><Input id="password" type="password" minLength={8} className="mt-2" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>}
            {mode === "signup" && <div className="flex gap-3"><Checkbox id="terms" checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} /><Label htmlFor="terms" className="text-sm font-normal leading-5">I accept the <Link to="/legal/$slug" params={{ slug: "terms" }} className="underline">Terms</Link> and <Link to="/legal/$slug" params={{ slug: "acceptable-use" }} className="underline">Acceptable Use Policy</Link>.</Label></div>}
            {message && <p role="alert" className="border border-border bg-muted p-3 text-sm">{message}</p>}
            <Button className="w-full" size="lg" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}</Button>
          </form>
          {mode !== "forgot" && <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
            <Button variant="outline" size="lg" className="w-full" onClick={signInWithGoogle} disabled={busy}><Chrome />Continue with Google</Button>
          </>}
          <div className="mt-7 flex flex-wrap gap-5 text-sm">
            <button className="underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>{mode === "signup" ? "Already have an account?" : "Create an account"}</button>
            {mode !== "forgot" && <button className="underline" onClick={() => setMode("forgot")}>Forgot password?</button>}
            {mode === "forgot" && <button className="underline" onClick={() => setMode("signin")}>Back to sign in</button>}
          </div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <img src="/illustrations/owasp.svg" alt="OWASP" className="relative h-28 w-28 brightness-0 invert" />
        <blockquote className="relative max-w-xl text-4xl font-semibold leading-tight">Understand the exploit. Ship the fix. Repeat.</blockquote>
        <Link to="/" className="relative flex items-center gap-2 text-sm"><ArrowLeft />Back to WebKeet</Link>
      </section>
    </main>
  );
}
