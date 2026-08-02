import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  ["Data we collect", "We store the account details you provide, uploaded resumes and extracted resume content, ATS analysis inputs and results, cold-email inputs and drafts, usage records, and basic security and operational logs."],
  ["How we use data", "We use this data only to operate, secure, troubleshoot, and improve Rescomail. We do not sell personal data or use your private content to train public AI models."],
  ["Service providers", "Rescomail relies on infrastructure and processing providers for hosting, file storage, email delivery, error monitoring, background jobs, and AI generation. When you use BYOK, the selected AI provider processes requests under its own terms."],
  ["API keys", "Personal Gemini and Groq keys are encrypted at rest with authenticated encryption. They are decrypted only on the server for the requested operation and are never included in data exports."],
  ["Retention and control", "Content remains until you delete it or your account, except for limited backups or records we must retain for security or legal reasons. Settings include a JSON export and permanent account deletion."],
  ["Security and international processing", "We use access controls, encryption in transit, rate limits, and monitoring. Providers may process data in other countries using their applicable legal safeguards. No internet service can guarantee absolute security."],
  ["Contact", "For privacy questions or requests, contact support@rescomail.com."],
] as const;

export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-bold">Privacy Policy</h1><p className="mt-2 text-sm text-muted-foreground">Effective July 31, 2026</p><div className="mt-10 space-y-8">{sections.map(([title, text]) => <section key={title}><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></section>)}</div></main>;
}
