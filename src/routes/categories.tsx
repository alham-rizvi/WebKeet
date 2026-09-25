import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";
import { categoryMeta } from "@/lib/catalog";
import { getPublicData } from "@/lib/webkeet.functions";

export const Route = createFileRoute("/categories")({
  loader: () => getPublicData(),
  head: () => ({ meta: [
    { title: "Cybersecurity Categories — WebKeet" },
    { name: "description", content: "Explore WebKeet labs by web, API, cloud, Linux, cryptography, forensics, code review and access control." },
    { property: "og:title", content: "Cybersecurity Categories — WebKeet" },
    { property: "og:description", content: "Choose a focused security discipline and start a hands-on lab." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, labs } = Route.useLoaderData();
  return <SiteShell><main className="mx-auto min-h-[75vh] max-w-7xl px-5 py-14 lg:px-8">
    <p className="font-mono text-xs uppercase text-muted-foreground">Explore by discipline</p>
    <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Security categories</h1>
    <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Focus on one skill area or move between offense and defense. Every category contains practical labs with clear objectives and verified completion.</p>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(category => {
        const meta = categoryMeta(category.name);
        const items = labs.filter(lab => lab.category === category.name);
        return <Link key={category.slug} to="/labs" search={{ category: category.name }} className="group border border-border bg-card p-5 hover:border-primary">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4"><VistaIcon icon={meta.icon} tone={meta.tone} size={42}/><div className="min-w-0"><h2 className="font-semibold">{category.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{category.blurb}</p><p className="mt-4 font-mono text-xs text-muted-foreground">{items.length} labs · {items.reduce((sum, lab) => sum + lab.points, 0)} points</p></div><ArrowRight className="size-4 text-muted-foreground group-hover:text-primary"/></div>
        </Link>;
      })}
    </div>
  </main></SiteShell>;
}