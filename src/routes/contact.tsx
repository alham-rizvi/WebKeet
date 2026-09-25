import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, LifeBuoy, ShieldAlert } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { VistaIcon } from "@/components/vista-icon";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Help and Contact — WebKeet" },
    { name: "description", content: "Find WebKeet help for lab learning, account access and responsible security disclosure." },
    { property: "og:title", content: "Help and Contact — WebKeet" },
    { property: "og:description", content: "Get to the right WebKeet help channel quickly." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: ContactPage,
});

function ContactPage() {
  const choices = [
    {icon:BookOpen,tone:"blue",title:"Learning help",copy:"Start with the field guide, then use the discussion tab inside a lab for questions tied to that exercise.",label:"Open the guide",to:"/guide" as const},
    {icon:LifeBuoy,tone:"green",title:"Account access",copy:"Use the password reset flow when you cannot sign in. It is the only account flow that requires an email link.",label:"Reset password",to:"/reset-password" as const},
    {icon:ShieldAlert,tone:"red",title:"Security report",copy:"Review scope and safe harbor before reporting a possible vulnerability in WebKeet itself.",label:"Disclosure policy",to:"/legal/$slug" as const,slug:"responsible-disclosure"},
  ];
  return <SiteShell><main className="mx-auto min-h-[75vh] max-w-5xl px-5 py-16 lg:px-8"><p className="font-mono text-xs text-muted-foreground">HELP CENTER</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Get to the right help.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Choose the route that matches your question. This keeps lab discussion, account recovery and sensitive security reports separate.</p><div className="mt-12 grid gap-4 md:grid-cols-3">{choices.map(item => <article key={item.title} className="flex min-h-64 flex-col border border-border bg-card p-5"><VistaIcon icon={item.icon} tone={item.tone} size={42}/><h2 className="mt-5 text-lg font-semibold">{item.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>{item.slug ? <Link to={item.to} params={{slug:item.slug}} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">{item.label}<ArrowRight className="size-4"/></Link> : <Link to={item.to} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">{item.label}<ArrowRight className="size-4"/></Link>}</article>)}</div><p className="mt-10 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">A general support inbox has not been published yet. WebKeet does not display a made-up email address; account recovery and lab discussions remain available through the links above.</p></main></SiteShell>;
}