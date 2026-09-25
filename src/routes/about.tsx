import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Code2, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About WebKeet — Hands-on Security Learning" },
    { name: "description", content: "Why WebKeet teaches cybersecurity through isolated, authorized practice and fix-focused lab write-ups." },
    { property: "og:title", content: "About WebKeet" },
    { property: "og:description", content: "Practical security learning built around safe, isolated labs and responsible disclosure." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: AboutPage,
});

function AboutPage() {
  return <SiteShell><main className="mx-auto min-h-[75vh] max-w-5xl px-5 py-16 lg:px-8"><p className="font-mono text-xs text-muted-foreground">ABOUT WEBKEET</p><h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">Security knowledge becomes useful when you can apply it.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">WebKeet is a focused practice platform for learners who want to understand how vulnerabilities behave, how evidence is gathered, and how software teams remove the underlying risk.</p><div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-3">{[
    {icon:Boxes,tone:"blue",title:"Real training engines",copy:"Exercises build on respected intentionally vulnerable projects and purpose-built lab images."},
    {icon:ShieldCheck,tone:"green",title:"Authorized by design",copy:"Private, expiring instances define a clear boundary for safe experimentation."},
    {icon:Code2,tone:"amber",title:"The fix matters",copy:"Completion unlocks explanations that connect the exploit to secure implementation choices."},
  ].map(item => <article key={item.title} className="bg-background p-6"><VistaIcon icon={item.icon} tone={item.tone} size={42}/><h2 className="mt-5 font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p></article>)}</div><section className="mt-16 border-t border-border pt-10"><h2 className="text-2xl font-semibold">Built on open security education</h2><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">The catalog credits upstream authors and projects. WebKeet does not claim ownership of those projects; it organizes authorized practice around them and adds original scenarios across API, cloud, Linux, cryptography, forensics and secure code review.</p><Link to="/legal/$slug" params={{slug:"licenses"}} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">View licenses and credits <ArrowRight className="size-4"/></Link></section></main></SiteShell>;
}