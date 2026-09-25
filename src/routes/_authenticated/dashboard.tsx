import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Award, CalendarDays, Flame, Play, ShieldCheck, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { getMyDashboard } from "@/lib/webkeet.functions";
import { supabase } from "@/integrations/supabase/client";
import { categoryMeta, DIFFICULTY_CLASS, DIFFICULTY_LABEL } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — WebKeet" },
      { name: "description", content: "Your WebKeet streak, points, category progress, recommended labs and recent activity." },
      { property: "og:title", content: "WebKeet Dashboard" },
      { property: "og:description", content: "Track your hands-on web security progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type Data = Awaited<ReturnType<typeof getMyDashboard>>;

function dayKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function Page() {
  const load = useServerFn(getMyDashboard);
  const [info, setInfo] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await supabase.from("profiles").upsert(
            { id: user.id, display_name: String(user.user_metadata?.["display_name"] ?? user.user_metadata?.["full_name"] ?? user.email?.split("@")[0] ?? "Learner") },
            { onConflict: "id", ignoreDuplicates: true },
          );
        }
        setInfo(await load());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your workspace.");
      }
    })();
  }, [load]);

  if (error) return <SiteShell><main className="grid min-h-[70vh] place-items-center text-muted-foreground">{error}</main></SiteShell>;
  if (!info) return <SiteShell><main className="grid min-h-[70vh] place-items-center text-muted-foreground">Loading your workspace…</main></SiteShell>;

  const active = info.instances.find((x) => ["running", "provisioning"].includes(x.status));
  const done = info.completions.length;
  const pct = info.totalLabs ? Math.round((done / info.totalLabs) * 100) : 0;
  const activeSet = new Set(info.streak.activeDays);
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (27 - i)));
    return { key: dayKey(d), on: activeSet.has(dayKey(d)) };
  });
  const weekPoints = info.completions
    .filter((c) => Date.now() - new Date(c.completed_at).getTime() < 7 * 86_400_000)
    .reduce((s, c) => s + c.points_awarded, 0);

  return (
    <SiteShell>
      <main className="mx-auto min-h-[75vh] max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">YOUR WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Welcome back, {info.profile?.display_name ?? "Learner"}</h1>
          </div>
          <div className="flex gap-2">
            {info.isAdmin && <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button>}
            <Button asChild><Link to="/labs">Browse labs</Link></Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
          <Stat icon={Flame} value={`${info.streak.current}d`} label={`Current streak · best ${info.streak.longest}d`} />
          <Stat icon={Award} value={String(info.profile?.points ?? 0)} label={`Total points · +${weekPoints} this week`} />
          <Stat icon={ShieldCheck} value={`${done}/${info.totalLabs}`} label="Labs completed" />
          <Stat icon={Target} value={`${pct}%`} label="Overall progress" bar={pct} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <Panel title="Recommended today" action={<Link to="/labs" className="text-sm text-muted-foreground hover:text-foreground">All labs</Link>}>
              {info.recommended.length ? (
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  {info.recommended.map((lab) => {
                    const Icon = categoryMeta(lab.category).icon;
                    return (
                      <Link key={lab.id} to="/labs/$slug" params={{ slug: lab.slug }} className="bg-background p-4 hover:bg-muted">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" />{lab.category}</div>
                        <p className="mt-2 font-medium">{lab.title}</p>
                        <div className="mt-3 flex gap-3 font-mono text-xs">
                          <span className={DIFFICULTY_CLASS[lab.difficulty]}>{DIFFICULTY_LABEL[lab.difficulty]}</span>
                          <span className="text-muted-foreground">{lab.points} pts</span>
                          <span className="text-muted-foreground">~{lab.estimated_minutes}m</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : <Empty>You've completed every lab. Impressive.</Empty>}
            </Panel>

            <Panel title="Category progress" action={<Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">Categories</Link>}>
              <div className="divide-y divide-border">
                {info.categoryProgress.filter((c) => c.total > 0).map((c) => {
                  const Icon = categoryMeta(c.name).icon;
                  return (
                    <div key={c.slug} className="flex items-center gap-4 px-4 py-3">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                      <div className="hidden h-1.5 w-32 bg-muted sm:block"><div className="h-full bg-primary" style={{ width: `${c.percent}%` }} /></div>
                      <span className="w-14 text-right font-mono text-xs text-muted-foreground">{c.completed}/{c.total}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Active lab">
              <div className="p-4">
                {active ? (
                  <>
                    <p className="font-medium">{active.labs?.title}</p>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">Status: {active.status}</p>
                    <Button asChild className="mt-4 w-full"><Link to="/labs/$slug" params={{ slug: active.labs?.slug ?? "" }}>Continue <Play /></Link></Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">No lab is running.</p>
                    <Button asChild variant="outline" className="mt-4 w-full"><Link to="/labs">Choose a lab</Link></Button>
                  </>
                )}
              </div>
            </Panel>

            <Panel title="Last 4 weeks" action={<CalendarDays className="size-4 text-muted-foreground" />}>
              <div className="grid grid-cols-7 gap-1.5 p-4">
                {days.map((d) => <div key={d.key} title={d.key} className={`aspect-square ${d.on ? "bg-primary" : "bg-muted"}`} />)}
              </div>
              <p className="px-4 pb-4 text-xs text-muted-foreground">{info.streak.activeDays.length} active day{info.streak.activeDays.length === 1 ? "" : "s"} in total</p>
            </Panel>

            <Panel title="Recent activity" action={<Link to="/hall-of-fame" className="text-muted-foreground hover:text-foreground"><Trophy className="size-4" /></Link>}>
              {done ? (
                <div className="divide-y divide-border">
                  {info.completions.slice(0, 6).map((c) => (
                    <Link key={c.id} to="/labs/$slug" params={{ slug: c.labs?.slug ?? "" }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.labs?.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(c.completed_at).toLocaleDateString()}</p>
                      </div>
                      <span className="font-mono text-xs text-primary">+{c.points_awarded}</span>
                    </Link>
                  ))}
                </div>
              ) : <Empty>No completed labs yet. Start with a recommendation.</Empty>}
            </Panel>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

function Stat({ icon: Icon, value, label, bar }: { icon: typeof Award; value: string; label: string; bar?: number }) {
  return (
    <div className="bg-background p-5">
      <Icon className="size-4 text-muted-foreground" />
      <div className="mt-4 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      {bar !== undefined && <div className="mt-3 h-1 bg-muted"><div className="h-full bg-primary" style={{ width: `${bar}%` }} /></div>}
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-8 text-center text-sm text-muted-foreground">{children}</div>;
}
