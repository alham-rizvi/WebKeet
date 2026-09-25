import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type LabView = { id: string; slug: string; title: string; category: string; difficulty: string; points: number; description: string; estimated_minutes: number; completion_count?: number; lab_authors?: { name: string; profile_url: string } | null };

export function LabCard({ lab }: { lab: LabView }) {
  return (
    <article className="group flex h-full flex-col border border-border bg-card p-5 transition-[border-color,transform] hover:-translate-y-1 hover:border-foreground">
      <div className="flex items-start justify-between gap-4"><Badge variant="outline" className="rounded-none">{lab.category}</Badge><span className="text-sm font-semibold">{lab.points} pts</span></div>
      <h3 className="mt-7 text-xl font-semibold">{lab.title}</h3>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{lab.description}</p>
      <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground"><span>{lab.difficulty}</span><span className="flex items-center gap-1"><Clock3 className="size-3.5" />{lab.estimated_minutes}m</span><span className="flex items-center gap-1"><Users className="size-3.5" />{lab.completion_count ?? 0}</span></div>
      <div className="mt-auto flex items-end justify-between pt-5"><a href={lab.lab_authors?.profile_url} className="text-xs text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">By {lab.lab_authors?.name ?? "OWASP"}</a><Link to="/labs/$slug" params={{ slug: lab.slug }} className="grid size-9 place-items-center bg-primary text-primary-foreground" aria-label={`Open ${lab.title}`}><ArrowUpRight className="size-4" /></Link></div>
    </article>
  );
}