import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

const sections = [
  ["Beta service", "Rescomail is currently a free beta. Features, limits, and availability may change, and the service may be interrupted while we improve it."],
  ["Your account", "You must provide accurate information, keep credentials secure, and promptly report suspected unauthorized access. You are responsible for activity performed through your account."],
  ["Acceptable use", "Do not abuse the service, bypass limits, probe other users' data, upload malicious files, violate law or third-party rights, or use generated content for spam, deception, or harassment."],
  ["Your content", "You retain ownership of content you submit. You grant us the limited permission needed to host and process it to provide and secure the service. You are responsible for having the right to submit that content."],
  ["AI output", "AI output can be incomplete or incorrect and must be reviewed before use. ATS scores are advisory and do not represent an employer, guarantee compatibility, or promise any outcome."],
  ["Third-party services", "File storage, AI providers, email delivery, monitoring, and linked websites are operated by third parties and may have separate terms."],
  ["Termination and disclaimers", "You may delete your account at any time. We may restrict abusive or unlawful use. The beta is provided as available without guarantees to the maximum extent permitted by law."],
  ["Contact", "Questions about these terms can be sent to support@rescomail.com."],
] as const;

export default function TermsPage() {
  return <main className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-bold">Terms of Service</h1><p className="mt-2 text-sm text-muted-foreground">Effective July 31, 2026</p><div className="mt-10 space-y-8">{sections.map(([title, text]) => <section key={title}><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></section>)}</div></main>;
}
