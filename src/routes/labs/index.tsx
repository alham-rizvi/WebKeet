import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";
import { getMyDashboard, getPublicData } from "@/lib/webkeet.functions";
import { categoryMeta, DIFFICULTY_CLASS, DIFFICULTY_LABEL } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/labs/")({
  loader: () => getPublicData(),
  head: () => ({ meta: [
    { title: "Labs — WebKeet" },
    { name: "description", content: "48 hands-on cybersecurity labs across web, API, cloud, Linux, cryptography, code review and forensics." },
    { property: "og:title", content: "WebKeet Lab Catalog" },
    { property: "og:description", content: "Practice SQL injection, XSS, IDOR, JWT, SSRF, IAM, forensics and more in isolated instances." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Labs,
});

type Sort = "featured" | "difficulty" | "points" | "completion";

function Labs() {
  const { labs, categories } = Route.useLoaderData();
  const loadDash = useServerFn(getMyDashboard);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [q, setQ] = useState(""); const [diff, setDiff] = useState("All"); const [cat, setCat] = useState("All"); const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<Sort>("featured");

  useEffect(() => { (async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    try { const d = await loadDash(); setSolved(new Set(d.completions.map((c: { lab_id: string }) => c.lab_id))); } catch { /* signed out */ }
  })(); }, [loadDash]);

  const shown = useMemo(() => {
    const arr = labs.filter(l => (diff === "All" || l.difficulty === diff) && (cat === "All" || l.category === cat)
      && (status === "All" || (status === "Solved" ? solved.has(l.id) : !solved.has(l.id)))
      && (l.title + " " + l.category + " " + l.description).toLowerCase().includes(q.toLowerCase()));
    const order = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
    if (sort === "difficulty") arr.sort((a, b) => order[a.difficulty as keyof typeof order] - order[b.difficulty as keyof typeof order]);
    else if (sort === "points") arr.sort((a, b) => b.points - a.points);
    else if (sort === "completion") arr.sort((a, b) => (b.completion_rate ?? 0) - (a.completion_rate ?? 0));
    return arr;
  }, [labs, q, diff, cat, status, sort, solved]);

  return <SiteShell><main className="mx-auto grid min-h-[80vh] max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[240px_1fr] lg:px-6">
    <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Category</p>
        <div className="mt-3 space-y-1">
          <button onClick={() => setCat("All")} className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm ${cat === "All" ? "bg-accent" : "hover:bg-accent/50"}`}><span>All labs</span><span className="text-xs text-muted-foreground">{labs.length}</span></button>
          {categories.map(c => { const meta = categoryMeta(c.name); const count = labs.filter(l => l.category === c.name).length;
            return <button key={c.slug} onClick={() => setCat(c.name)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${cat === c.name ? "bg-accent" : "hover:bg-accent/50"}`}>
              <VistaIcon icon={meta.icon} tone={meta.tone} size={22} /><span className="flex-1 truncate">{c.name}</span><span className="text-xs text-muted-foreground">{count}</span>
            </button>; })}
        </div>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Status</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{["All", "Unsolved", "Solved"].map(x => <Button key={x} size="sm" variant={status === x ? "default" : "outline"} onClick={() => setStatus(x)} className="h-7">{x}</Button>)}</div>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Difficulty</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{["All", "Beginner", "Intermediate", "Advanced"].map(x => <Button key={x} size="sm" variant={diff === x ? "default" : "outline"} onClick={() => setDiff(x)} className="h-7">{x === "Beginner" ? "Easy" : x === "Intermediate" ? "Medium" : x === "Advanced" ? "Hard" : x}</Button>)}</div>
      </div>
    </aside>

    <section>
      <div className="flex items-baseline justify-between">
        <div><h1 className="text-2xl font-semibold">Problem set</h1><p className="mt-1 text-sm text-muted-foreground">{shown.length} of {labs.length} labs · isolated instances · flag or callback verified</p></div>
        <select className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={sort} onChange={e => setSort(e.target.value as Sort)}>
          <option value="featured">Sort: Featured</option><option value="difficulty">Difficulty</option><option value="points">Points</option><option value="completion">Completion %</option>
        </select>
      </div>
      <label className="relative mt-4 block"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-10 pl-9" placeholder="Search title, category or tag" value={q} onChange={e => setQ(e.target.value)} /></label>

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-left">Title</th>
              <th className="hidden px-3 py-2.5 text-left md:table-cell">Category</th>
              <th className="px-3 py-2.5 text-left">Difficulty</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">Points</th>
              <th className="hidden px-3 py-2.5 text-right lg:table-cell">Completion</th>
              <th className="hidden px-3 py-2.5 text-left lg:table-cell">Author</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l, i) => { const meta = categoryMeta(l.category); const isSolved = solved.has(l.id);
              return <tr key={l.id} className={`border-t border-border hover:bg-accent/40 ${i % 2 ? "bg-muted/20" : ""}`}>
                <td className="px-3 py-2.5 text-center">{isSolved ? <CheckCircle2 className="mx-auto size-4 text-easy" /> : <Circle className="mx-auto size-4 text-muted-foreground/60" />}</td>
                <td className="px-3 py-2.5"><Link to="/labs/$slug" params={{ slug: l.slug }} className="flex items-center gap-2.5 font-medium hover:text-primary">
                  <VistaIcon icon={meta.icon} tone={meta.tone} size={22} /><span>{l.title}</span>
                </Link>
                <div className="mt-1 flex flex-wrap gap-1 pl-9">{(l.tags ?? []).slice(0, 3).map(t => <Badge key={t} variant="outline" className="h-5 rounded-sm px-1.5 text-[10px] font-normal text-muted-foreground">{t}</Badge>)}</div>
                </td>
                <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">{l.category}</td>
                <td className={`px-3 py-2.5 font-medium ${DIFFICULTY_CLASS[l.difficulty]}`}>{DIFFICULTY_LABEL[l.difficulty]}</td>
                <td className="hidden px-3 py-2.5 text-right font-mono text-xs md:table-cell">{l.points}</td>
                <td className="hidden px-3 py-2.5 text-right font-mono text-xs text-muted-foreground lg:table-cell">{l.completion_rate ?? 0}%</td>
                <td className="hidden px-3 py-2.5 text-xs text-muted-foreground lg:table-cell">{l.lab_authors?.name}</td>
              </tr>; })}
            {shown.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No labs match those filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  </main></SiteShell>;
}
