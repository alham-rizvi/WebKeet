import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, ExternalLink, Lightbulb, Lock, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";
import { categoryMeta, DIFFICULTY_CLASS, DIFFICULTY_LABEL } from "@/lib/catalog";
import { completeLab, getLabDetail, getLabSolution, getPublicData, launchLab, postComment, stopLab } from "@/lib/webkeet.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/labs/$slug")({
  loader: async ({ params }) => ({ ...(await getPublicData()), detail: await getLabDetail({ data: { slug: params.slug } }) }),
  head: ({ params, loaderData }) => {
    const lab = loaderData?.labs.find(l => l.slug === params.slug);
    const title = lab ? `${lab.title} — WebKeet Lab` : "Lab — WebKeet";
    const desc = lab?.description.slice(0, 180) ?? "Hands-on security lab with objectives, hints and an isolated instance.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: Page,
});

const TABS = ["Description", "Hints", "Solution", "Discussion"] as const;

function Page() {
  const { slug } = Route.useParams();
  const { labs, detail } = Route.useLoaderData();
  const lab = labs.find(l => l.slug === slug);
  const launch = useServerFn(launchLab); const stop = useServerFn(stopLab); const complete = useServerFn(completeLab);
  const solutionFn = useServerFn(getLabSolution); const commentFn = useServerFn(postComment);
  const nav = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [instance, setInstance] = useState<{ id: string; status: string; access_url: string | null; error_message: string | null } | null>(null);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const [solution, setSolution] = useState<{ unlocked: boolean; solution: string | null } | null>(null);
  const [draft, setDraft] = useState(""); const [comments, setComments] = useState(detail?.comments ?? []);

  useEffect(() => { if (!instance || instance.status !== "running") return; setLeft(3600);
    const t = setInterval(() => setLeft(v => (v && v > 0 ? v - 1 : 0)), 1000); return () => clearInterval(t); }, [instance]);

  if (!lab) return <SiteShell><main className="mx-auto max-w-4xl px-5 py-24"><h1 className="text-3xl font-semibold">Lab not found</h1><Button asChild className="mt-6"><Link to="/labs">Back to labs</Link></Button></main></SiteShell>;
  const labId = lab.id; const meta = categoryMeta(lab.category);

  async function requireUser() { const { data } = await supabase.auth.getUser(); if (!data.user) { await nav({ to: "/auth" }); return false; } return true; }
  async function start() { if (!await requireUser()) return; setBusy(true);
    try { const row = await launch({ data: { labId } }); setInstance(row); setMsg(row.error_message ?? "Your isolated lab is being prepared."); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Could not launch lab."); } setBusy(false); }
  async function finish() { if (!await requireUser()) return; const r = await complete({ data: { labId } });
    setMsg(r.alreadyCompleted ? "You already completed this lab." : "Completion recorded. Points awarded."); setSolution(await solutionFn({ data: { slug } })); }
  async function openSolution() { setTab("Solution"); if (!solution) { if (!await requireUser()) return; setSolution(await solutionFn({ data: { slug } })); } }
  async function send() { if (!draft.trim() || !await requireUser()) return; await commentFn({ data: { labId, body: draft.trim() } });
    setComments([{ id: crypto.randomUUID(), body: draft.trim(), created_at: new Date().toISOString(), user_id: "you" }, ...comments]); setDraft(""); }

  return <SiteShell><main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
    <Link to="/labs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />All labs</Link>
    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-md border border-border">
        <div className="flex items-start gap-3 border-b border-border p-4">
          <VistaIcon icon={meta.icon} tone={meta.tone} size={40} />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{lab.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className={`font-semibold ${DIFFICULTY_CLASS[lab.difficulty]}`}>{DIFFICULTY_LABEL[lab.difficulty]}</span>
              <span>{lab.points} pts</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{lab.estimated_minutes} min</span>
              <span>{lab.completion_rate ?? 0}% completion</span>
              <a className="underline" href={lab.lab_authors?.profile_url} target="_blank" rel="noreferrer">{lab.lab_authors?.name}</a>
            </div>
          </div>
        </div>
        <div className="flex gap-1 border-b border-border px-2 text-sm">
          {TABS.map(t => <button key={t} onClick={() => (t === "Solution" ? openSolution() : setTab(t))} className={`border-b-2 px-3 py-2.5 ${tab === t ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>)}
        </div>
        <div className="space-y-6 p-5 leading-7">
          {tab === "Description" && <>
            <p>{detail?.description ?? lab.description}</p>
            {detail?.scenario && <div className="rounded-md border border-border bg-muted/40 p-4"><p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Scenario</p><p className="mt-2 text-sm">{detail.scenario}</p></div>}
            {detail?.objectives?.length ? <div><h2 className="font-semibold">Learning objectives</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{detail.objectives.map(o => <li key={o}>{o}</li>)}</ul></div> : null}
            <div className="grid gap-5 sm:grid-cols-2">
              {detail?.prerequisites?.length ? <div><h2 className="font-semibold">Prerequisites</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{detail.prerequisites.map(o => <li key={o}>{o}</li>)}</ul></div> : null}
              {detail?.tools?.length ? <div><h2 className="font-semibold">Tools</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{detail.tools.map(o => <li key={o}>{o}</li>)}</ul></div> : null}
            </div>
            <div className="flex flex-wrap gap-1.5">{(lab.tags ?? []).map(t => <Badge key={t} variant="outline" className="rounded-sm text-xs font-normal">{t}</Badge>)}</div>
          </>}
          {tab === "Hints" && <div className="space-y-3">{(detail?.hints ?? []).map((h, i) => <details key={h} className="rounded-md border border-border p-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Lightbulb className="size-4" />Reveal hint {i + 1}</summary><p className="mt-3 pl-6 text-sm text-muted-foreground">{h}</p></details>)}</div>}
          {tab === "Solution" && (solution?.unlocked
            ? <div><h2 className="font-semibold">Write-up and fix</h2><p className="mt-2 text-sm">{solution.solution}</p></div>
            : <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground"><Lock className="size-8" /><p className="text-sm">The solution write-up unlocks once you complete this lab.</p></div>)}
          {tab === "Discussion" && <div className="space-y-4">
            <div className="flex gap-2"><input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Share an approach (no full spoilers)" className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm" /><Button onClick={send} size="sm">Post</Button></div>
            {comments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No comments yet. Be the first.</p>}
            {comments.map(c => <div key={c.id} className="rounded-md border border-border p-3 text-sm"><p className="font-mono text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p><p className="mt-1.5">{c.body}</p></div>)}
          </div>}
        </div>
      </div>

      <aside className="h-fit rounded-md border border-border lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Lab instance</span>
          <span className="flex items-center gap-1.5 text-xs"><span className={`size-2 rounded-full ${instance?.status === "running" ? "bg-easy" : instance?.status === "failed" ? "bg-hard" : "bg-muted-foreground"}`} />{instance?.status ?? "not running"}</span>
        </div>
        <div className="space-y-3 p-4">
          <dl className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between"><dt>Engine</dt><dd className="font-mono text-foreground">{lab.engine}</dd></div>
            <div className="flex justify-between gap-2"><dt>Image</dt><dd className="truncate font-mono text-foreground">{lab.docker_image}</dd></div>
            <div className="flex justify-between"><dt>Lesson</dt><dd className="truncate font-mono text-foreground">{lab.lesson_path}</dd></div>
            <div className="flex justify-between"><dt>Time limit</dt><dd className="font-mono text-foreground">{left !== null ? `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}` : "60:00"}</dd></div>
          </dl>
          {instance?.error_message && <div className="flex gap-2 rounded-md border border-border bg-muted p-3 text-xs"><AlertTriangle className="size-4 shrink-0" />{instance.error_message}</div>}
          {msg && !instance?.error_message && <p className="text-xs text-muted-foreground">{msg}</p>}
          <Button className="w-full" onClick={start} disabled={busy}><Play />{busy ? "Launching…" : "Launch lab"}</Button>
          {instance && <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={async () => { await stop({ data: { instanceId: instance.id } }); setInstance({ ...instance, status: "stopped" }); }}><Square />Stop</Button>
            <Button variant="outline" size="sm" onClick={start}><RotateCcw />Reset</Button>
          </div>}
          {instance?.access_url && <Button asChild className="w-full" variant="outline"><a href={instance.access_url} target="_blank" rel="noreferrer">Open in new tab <ExternalLink /></a></Button>}
          <Button className="w-full" variant="secondary" onClick={finish}><CheckCircle2 />Mark complete</Button>
          <p className="text-[11px] leading-5 text-muted-foreground">Attack only inside this instance. Instances are private, capped and destroyed after 60 minutes.</p>
        </div>
      </aside>
    </div>
  </main></SiteShell>;
}
