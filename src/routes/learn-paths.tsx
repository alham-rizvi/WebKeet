import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";
import { categoryMeta, DIFFICULTY_CLASS, DIFFICULTY_LABEL } from "@/lib/catalog";
import { getPublicData } from "@/lib/webkeet.functions";

export const Route = createFileRoute("/learn-paths")({
  loader: () => getPublicData(),
  head: () => ({ meta: [
    { title: "Learn Paths — WebKeet" },
    { name: "description", content: "Guided sequences: web application security fundamentals, API security, cloud security basics, Linux privilege escalation and defensive foundations." },
    { property: "og:title", content: "WebKeet Learn Paths" },
    { property: "og:description", content: "Ordered lab sequences that take you from first exploit to confident reviewer." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});

function Page() {
  const { paths, labs } = Route.useLoaderData();
  return <SiteShell><main className="mx-auto min-h-[80vh] max-w-5xl px-4 py-10 lg:px-6">
    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Guided sequences</p>
    <h1 className="mt-2 text-3xl font-semibold">Learn paths</h1>
    <p className="mt-3 max-w-2xl text-muted-foreground">Each path is an ordered run of labs. Work top to bottom and every lab builds on the one before it. Progress is tracked per lab, so you can leave and come back.</p>
    <div className="mt-8 space-y-6">
      {paths.map(p => {
        const items = p.labs.map(s => labs.find(l => l.slug === s)).filter(Boolean);
        const points = items.reduce((n, l) => n + (l?.points ?? 0), 0);
        return <section key={p.slug} className="rounded-md border border-border">
          <div className="flex items-start gap-3 border-b border-border p-4">
            <VistaIcon icon={RouteIcon} tone={p.level === "Advanced" ? "red" : p.level === "Intermediate" ? "amber" : "green"} size={40} />
            <div>
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.level} · {items.length} labs · {points} points</p>
            </div>
          </div>
          <p className="border-b border-border p-4 text-sm leading-7">{p.description}</p>
          <ol className="divide-y divide-border text-sm">
            {items.map((l, i) => l ? <li key={l.slug}>
              <Link to="/labs/$slug" params={{ slug: l.slug }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40">
                <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <VistaIcon icon={categoryMeta(l.category).icon} tone={categoryMeta(l.category).tone} size={20} />
                <span className="flex-1">{l.title}</span>
                <span className={`text-xs font-medium ${DIFFICULTY_CLASS[l.difficulty]}`}>{DIFFICULTY_LABEL[l.difficulty]}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </li> : null)}
          </ol>
        </section>;
      })}
    </div>
  </main></SiteShell>;
}
