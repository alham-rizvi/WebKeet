import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  ["Labs", "/labs"],
  ["Learn Paths", "/learn-paths"],
  ["Leaderboard", "/hall-of-fame"],
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) {
        setSignedIn(Boolean(session));
        router.invalidate();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" aria-label="WebKeet home" className="min-w-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map(([label, to]) => <Link key={label} to={to} className="text-sm font-medium text-muted-foreground hover:text-foreground">{label}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <><Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/dashboard">Dashboard</Link></Button><Button onClick={signOut}>Sign out</Button></>
            ) : (
              <><Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button><Button asChild><Link to="/auth" search={{ mode: "signup" }}>Create account</Link></Button></>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menu && <nav className="grid gap-1 border-t border-border p-4 md:hidden">{nav.map(([label, to]) => <Link key={label} to={to} onClick={() => setMenu(false)} className="px-3 py-3 font-medium">{label}</Link>)}</nav>}
      </header>
      {children}
      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:px-8">
          <div>
            <Brand />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">Hands-on cybersecurity labs powered by WebGoat, Juice Shop, DVWA, NodeGoat, crAPI and our own training images.</p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">Every lab runs in an isolated, time-boxed environment that belongs to you alone. Practice here, and only here — the same techniques used without permission elsewhere are illegal.</p>
          </div>
          <nav aria-label="Platform" className="text-sm">
            <p className="font-semibold">Platform</p>
            <ul className="mt-3 space-y-3">
              <li><Link to="/labs" className="font-medium text-muted-foreground hover:text-foreground">Labs</Link><p className="text-xs text-muted-foreground">45 hands-on challenges across 10 categories, from web basics to forensics.</p></li>
              <li><Link to="/learn-paths" className="font-medium text-muted-foreground hover:text-foreground">Learn Paths</Link><p className="text-xs text-muted-foreground">Guided sequences that take you from first lab to a full skill area.</p></li>
              <li><Link to="/guide" className="font-medium text-muted-foreground hover:text-foreground">Guide</Link><p className="text-xs text-muted-foreground">How WebKeet works: launch, test, submit the proof, earn points.</p></li>
              <li><Link to="/hall-of-fame" className="font-medium text-muted-foreground hover:text-foreground">Hall of Fame</Link><p className="text-xs text-muted-foreground">The leaderboard of top solvers, ranked by verified completions.</p></li>
            </ul>
          </nav>
          <nav aria-label="Company" className="text-sm">
            <p className="font-semibold">WebKeet</p>
            <ul className="mt-3 space-y-3">
              <li><Link to="/about" className="font-medium text-muted-foreground hover:text-foreground">About</Link><p className="text-xs text-muted-foreground">Why we built WebKeet and what we believe about learning security.</p></li>
              <li><Link to="/contact" className="font-medium text-muted-foreground hover:text-foreground">Contact</Link><p className="text-xs text-muted-foreground">Where to get learning help, account help, or report a security issue.</p></li>
              <li><Link to="/categories" className="font-medium text-muted-foreground hover:text-foreground">Categories</Link><p className="text-xs text-muted-foreground">Browse labs by topic: web, API, cloud, crypto, Linux and more.</p></li>
            </ul>
          </nav>
          <nav aria-label="Legal" className="text-sm">
            <p className="font-semibold">Legal</p>
            <ul className="mt-3 space-y-3">
              {([
                ['Terms', 'terms', 'The rules of using WebKeet: your account, your instances, what we provide.'],
                ['Privacy', 'privacy', 'What data we collect, why, and how long we keep it. No selling, ever.'],
                ['Acceptable Use', 'acceptable-use', 'The boundary: train only inside your own WebKeet instances.'],
                ['Cookies', 'cookies', 'The few cookies we use for sign-in and preferences, nothing more.'],
                ['Disclosure', 'responsible-disclosure', 'Found a bug in WebKeet itself? Tell us privately and we will fix it.'],
                ['Licenses', 'licenses', 'Credits and open-source licenses for the engines and artwork we use.'],
              ] as const).map(([label, slug, blurb]) => (
                <li key={slug}><Link to="/legal/$slug" params={{ slug }} className="font-medium text-muted-foreground hover:text-foreground">{label}</Link><p className="text-xs text-muted-foreground">{blurb}</p></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p>© {new Date().getFullYear()} WebKeet. All labs run in authorized, isolated environments only.</p>
            <p>Site made by <span className="font-semibold text-foreground">Alham Rizvi</span> for a college project.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}