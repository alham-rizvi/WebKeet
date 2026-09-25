import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

type LegalDoc = { title: string; updated: string; sections: Array<[string, string]> };
const updated = "September 24, 2026";
const docs: Record<string, LegalDoc> = {
  terms: { title: "Terms of Service", updated, sections: [
    ["Agreement", "By creating an account or using WebKeet, you agree to these Terms and the Acceptable Use Policy. You must be legally able to enter this agreement."],
    ["Training service", "WebKeet provides educational access to intentionally vulnerable WebGoat environments. Availability, lesson content, and scores may change."],
    ["Your account", "Keep your credentials confidential and provide accurate information. You are responsible for activity performed through your account."],
    ["Suspension", "We may restrict accounts that threaten the platform, other users, or third parties."],
    ["Liability", "The service is provided as available for education. To the maximum extent allowed by law, WebKeet is not liable for indirect or consequential loss."],
  ] },
  privacy: { title: "Privacy Policy", updated, sections: [
    ["Data we collect", "We store account identity, profile fields, policy acceptance, lab activity, completions, scores, active instance records, and security audit events."],
    ["Why we use it", "We use this data to authenticate you, operate labs, measure progress, prevent abuse, and maintain platform security."],
    ["Sharing", "We do not sell personal data. Infrastructure providers process limited data only to operate WebKeet."],
    ["Retention and rights", "We retain data while your account is active and as needed for security or legal obligations. You may request access, correction, or deletion."],
    ["Security", "WebKeet separates its account data from vulnerable lab environments and applies access controls to user data."],
  ] },
  "acceptable-use": { title: "Acceptable Use & Ethical Hacking Policy", updated, sections: [
    ["Authorized targets only", "Use security techniques only against the lab instance assigned to your account or another system where you have explicit written permission."],
    ["Prohibited activity", "Do not attack WebKeet, other users, third-party systems, shared infrastructure, authentication, or the control plane. Do not exfiltrate data, evade limits, or disrupt service."],
    ["Lab isolation", "Do not attempt to escape containers, access another learner’s instance, enable outbound attacks, or persist after expiry."],
    ["Enforcement", "Violations may lead to immediate instance termination, account suspension, evidence preservation, and reporting where required by law."],
  ] },
  cookies: { title: "Cookie Policy", updated, sections: [
    ["Essential storage", "WebKeet uses essential browser storage and cookies to maintain secure sessions, remember theme preference, and protect account access."],
    ["No advertising cookies", "We do not use behavioral advertising cookies."],
    ["Control", "Blocking essential storage may prevent sign-in and protected labs from working."],
  ] },
  "responsible-disclosure": { title: "Responsible Disclosure", updated, sections: [
    ["Scope", "Reports about WebKeet’s platform security are welcome. WebGoat lesson vulnerabilities are intentional and are not reportable."],
    ["Safe harbor", "Good-faith research that avoids privacy harm, disruption, persistence, and data destruction will not be pursued by WebKeet."],
    ["Report quality", "Include the affected page, reproduction steps, impact, and supporting evidence. Do not include unnecessary personal data."],
    ["Coordination", "Allow reasonable time for investigation and remediation before public disclosure."],
  ] },
  disclaimer: { title: "Security Training Disclaimer", updated, sections: [
    ["Education only", "WebKeet is provided solely for authorized security education. It is not legal advice and does not grant permission to test any third-party system."],
    ["Responsibility", "You are responsible for complying with applicable law, contracts, and authorization boundaries."],
    ["Intentional vulnerabilities", "Lab environments contain known weaknesses and must never be used for sensitive information."],
  ] },
  licenses: { title: "Licenses & Credits", updated, sections: [
    ["WebGoat", "OWASP WebGoat is licensed under GNU GPL v2.0. Source: https://github.com/WebGoat/WebGoat. WebKeet provisions WebGoat; it does not reimplement it."],
    ["Visual foundation", "Dashboard patterns were adapted from CodeTrack by Rupesh Sen under the MIT License."],
    ["Artwork", "Locally hosted technology marks are from Simple Icons under CC0 1.0. Full details are in ATTRIBUTIONS.md."],
  ] },
};

export const Route = createFileRoute("/legal/$slug")({
  head: ({ params }) => { const doc = docs[params.slug]; return { meta: [
    { title: `${doc?.title ?? "Legal"} — WebKeet` },
    { name: "description", content: `WebKeet ${doc?.title ?? "legal information"}.` },
    { property: "og:title", content: `${doc?.title ?? "Legal"} — WebKeet` },
    { property: "og:description", content: `WebKeet ${doc?.title ?? "legal information"}.` },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }; }, component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const doc = docs[slug] ?? docs["terms"];
  if (!doc) return null;
  return <SiteShell><main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16"><p className="font-mono text-xs text-muted-foreground">LEGAL / UPDATED {doc.updated.toUpperCase()}</p><h1 className="mt-4 text-5xl font-semibold">{doc.title}</h1><div className="mt-12 space-y-10">{doc.sections.map(([heading, copy]) => <section key={heading}><h2 className="text-xl font-semibold">{heading}</h2><p className="mt-3 leading-7 text-muted-foreground">{copy}</p></section>)}</div></main></SiteShell>;
}