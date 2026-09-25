import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, Flag, Play, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [
    { title: "Getting Started Guide — WebKeet" },
    { name: "description", content: "Learn how to choose, launch and complete authorized WebKeet cybersecurity labs safely." },
    { property: "og:title", content: "Getting Started Guide — WebKeet" },
    { property: "og:description", content: "Your first WebKeet lab, from choosing a path to submitting the flag." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: GuidePage,
});

const steps = [
  { icon: BookOpen, title: "Choose a path", copy: "Start with Web Application Security Fundamentals if you are new, or browse by category when you already know your target skill." },
  { icon: Play, title: "Launch your instance", copy: "Each assigned target is private and time-boxed. Wait until its status is running before opening it." },
  { icon: Wrench, title: "Test the scenario", copy: "Work only inside your assigned instance. Read the objectives, inspect the application and use progressive hints when needed." },
  { icon: Flag, title: "Submit the proof", copy: "Enter the lab flag or complete the engine callback. Verified completion awards points once and unlocks the solution." },
];

function GuidePage() {
  return <SiteShell><main>
    <section className="border-b border-border"><div className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><p className="font-mono text-xs text-muted-foreground">WEBKEET FIELD GUIDE</p><h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">From first launch to verified skill.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">A practical workflow for learning safely, keeping notes, and understanding the fix—not merely collecting flags.</p><Button asChild className="mt-8"><Link to="/learn-paths">Choose a learn path <ArrowRight/></Link></Button></div></section>
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8"><div className="grid gap-px border border-border bg-border md:grid-cols-2">{steps.map((step, index) => <article key={step.title} className="bg-background p-6"><div className="flex items-center justify-between"><VistaIcon icon={step.icon} tone={["blue","green","amber","red"][index]} size={42}/><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span></div><h2 className="mt-6 text-xl font-semibold">{step.title}</h2><p className="mt-2 leading-7 text-muted-foreground">{step.copy}</p></article>)}</div></section>
    <section className="border-y border-border bg-muted/30"><div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 md:grid-cols-2 lg:px-8"><div><ShieldCheck className="size-7 text-primary"/><h2 className="mt-4 text-2xl font-semibold">Stay inside the boundary</h2><p className="mt-3 leading-7 text-muted-foreground">WebKeet authorizes testing only against the lab instance assigned to you. Never test the platform, another learner, or an external system without explicit written permission.</p><Link to="/legal/$slug" params={{slug:"acceptable-use"}} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Read acceptable use <ArrowRight className="size-4"/></Link></div><div><CheckCircle2 className="size-7 text-primary"/><h2 className="mt-4 text-2xl font-semibold">Build a repeatable habit</h2><p className="mt-3 leading-7 text-muted-foreground">Aim for one focused lab each day. Record the vulnerable assumption, the evidence, and the defensive change that removes the weakness.</p></div></div></section>
  </main></SiteShell>;
}