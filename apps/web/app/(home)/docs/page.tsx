import type { ComponentType, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Gauge,
  KeyRound,
  Mail,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { Badge, Button } from "@repo/ui";

export const metadata: Metadata = {
  title: "Documentation | Rescomail",
  description:
    "Learn how to upload resumes, run ATS analysis, and generate personalized outreach with Rescomail.",
};

const navigationGroups = [
  {
    label: "Overview",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Quick start", href: "#quick-start" },
    ],
  },
  {
    label: "Workflows",
    items: [
      { label: "Resume library", href: "#resume-library" },
      { label: "ATS analysis", href: "#ats-analysis" },
      { label: "Cold email", href: "#cold-email" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "AI providers", href: "#ai-providers" },
      { label: "Privacy and account", href: "#privacy-account" },
    ],
  },
];

const workflowCards = [
  {
    icon: Upload,
    title: "Upload a resume",
    description: "Add a PDF and wait until its status changes to Parsed.",
  },
  {
    icon: Gauge,
    title: "Compare it with a role",
    description:
      "Upload or paste a job description and review the match report.",
  },
  {
    icon: Mail,
    title: "Create outreach",
    description:
      "Reuse the resume and role context to generate an email and follow-up.",
  },
];

const atsFields = [
  ["Resume", "A parsed resume from your library", "Required"],
  ["Job description", "PDF, Markdown, or pasted text", "Required"],
  ["Job title", "The title used to label the analysis", "Optional"],
  ["Company", "The company used to label the analysis", "Optional"],
];

const emailFields = [
  ["Resume", "A parsed resume used as candidate evidence", "Required"],
  ["Company website", "Used to gather company context", "Required"],
  ["Job description", "PDF, Markdown, or pasted text", "Required"],
  [
    "Role and company",
    "Improves targeting and subject-line context",
    "Optional",
  ],
  [
    "Recipient details",
    "Personalizes the greeting and positioning",
    "Optional",
  ],
  [
    "Tone, length, and CTA",
    "Controls the style and requested response",
    "Configured",
  ],
];

const Page = () => {
  return (
    <div className="min-h-screen bg-background pt-28">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 gap-1.5 font-normal p-4!">
              <BookOpen className="h-3.5 w-3.5" />
              Product guide
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Rescomail documentation
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Learn the complete workflow from uploading a resume to reviewing
              its role fit and creating personalized outreach.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="px-6">
                <Link href="/login">
                  Open the workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="px-6 border-foreground/10!">
                <Link href="#quick-start">Read the quick start</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileNavigation />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8 lg:py-14">
        <DesktopNavigation />

        <main className="min-w-0 max-w-3xl">
          <DocsSection
            id="introduction"
            eyebrow="Overview"
            title="A focused job-search workspace"
            description="Rescomail keeps the core application workflow in one place. Your parsed resumes become reusable inputs for ATS analysis and cold-email generation, while saved reports and drafts remain available from their respective history menus."
            first
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {workflowCards.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-sm border border-border/60 bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-foreground/5 bg-muted/20">
                      <item.icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </DocsSection>

          <DocsSection
            id="quick-start"
            eyebrow="Getting started"
            title="Complete your first workflow"
            description="Start with a resume, use a real role description, and then reuse that context for outreach."
          >
            <StepList
              steps={[
                {
                  title: "Upload a PDF resume",
                  description:
                    "Open Resumes, choose a PDF up to 8 MB, give it a useful title, and start the upload.",
                },
                {
                  title: "Wait for parsing to finish",
                  description:
                    "The resume must show Parsed before it can be selected in ATS or email workflows.",
                },
                {
                  title: "Run an ATS analysis",
                  description:
                    "Select the resume, upload or paste the target job description, and analyze the match.",
                },
                {
                  title: "Generate the outreach",
                  description:
                    "Add the company website, choose your tone and CTA, then generate the email and follow-up.",
                },
              ]}
            />
            <Note>
              Use specific resume titles such as “Backend Engineer - 2026” so
              the correct version is easy to identify in later workflows.
            </Note>
          </DocsSection>

          <DocsSection
            id="resume-library"
            eyebrow="Workflow 1"
            title="Resume library"
            description="The resume library stores the source documents used throughout the application."
            icon={FileText}
          >
            <StepList
              steps={[
                {
                  title: "Add the source document",
                  description:
                    "Upload one PDF at a time. Files larger than 8 MB or non-PDF formats are rejected before upload.",
                },
                {
                  title: "Follow the processing status",
                  description:
                    "Uploaded and Processing statuses mean extraction is still running. Parsed means the resume is ready.",
                },
                {
                  title: "Handle a failed parse",
                  description:
                    "Review the displayed parsing error, confirm the PDF contains readable text, and upload a corrected copy.",
                },
              ]}
            />
            <SectionLink href="/dashboard/resumes">
              Open resume library
            </SectionLink>
          </DocsSection>

          <DocsSection
            id="ats-analysis"
            eyebrow="Workflow 2"
            title="ATS analysis"
            description="Compare one parsed resume against one target role and turn the result into a focused rewrite plan."
            icon={Gauge}
          >
            <FieldTable rows={atsFields} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Outcome
                title="Match overview"
                description="Overall score, verdict, summary, and category-level signals."
              />
              <Outcome
                title="Keyword evidence"
                description="Matched and missing terms grounded in the role description."
              />
              <Outcome
                title="Skill gaps"
                description="Important gaps with evidence strength and learning focus."
              />
              <Outcome
                title="Rewrite plan"
                description="Point-by-point replacements for weak resume content."
              />
            </div>
            <Note>
              Saved analyses can be reopened from Analysis history. Deleting a
              report permanently removes that saved analysis.
            </Note>
            <SectionLink href="/dashboard/ats">Open ATS analysis</SectionLink>
          </DocsSection>

          <DocsSection
            id="cold-email"
            eyebrow="Workflow 3"
            title="Cold email generation"
            description="Generate a personalized initial email and follow-up using resume evidence, company context, and the target role."
            icon={Mail}
          >
            <FieldTable rows={emailFields} />
            <div className="mt-6 rounded-sm border border-border/60 bg-card p-5">
              <h3 className="text-sm font-semibold">What is generated</h3>
              <ul className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-2">
                {[
                  "Subject line and preview text",
                  "Initial outreach email",
                  "Follow-up subject and body",
                  "Personalization notes and quality score",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Note>
              The company website is required because the service uses it to
              ground the email in real company context. Only public HTTP or
              HTTPS URLs are accepted.
            </Note>
            <SectionLink href="/dashboard/emails">
              Open cold email generator
            </SectionLink>
          </DocsSection>

          <DocsSection
            id="ai-providers"
            eyebrow="Configuration"
            title="AI provider settings"
            description="Connect personal provider keys when you want requests to use your own Gemini or Groq allowance."
            icon={KeyRound}
          >
            <StepList
              steps={[
                {
                  title: "Open Settings",
                  description:
                    "Go to the AI provider section in your dashboard settings.",
                },
                {
                  title: "Add a provider key",
                  description:
                    "Paste a Gemini or Groq API key and save the provider settings.",
                },
                {
                  title: "Choose the primary provider",
                  description:
                    "Select which configured provider should be attempted first for supported workflows.",
                },
              ]}
            />
            <SectionLink href="/dashboard/settings">Open settings</SectionLink>
          </DocsSection>

          <DocsSection
            id="privacy-account"
            eyebrow="Account"
            title="Privacy and account controls"
            description="Manage profile information, credentials, and account access from one settings page."
            icon={ShieldCheck}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Outcome
                icon={KeyRound}
                title="Protected provider keys"
                description="Saved provider credentials are encrypted before they are stored."
              />
              <Outcome
                icon={UserRound}
                title="Account controls"
                description="Update your profile or permanently delete the account from Settings."
              />
            </div>
            <div className="mt-6 rounded-sm border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-xs leading-5 text-muted-foreground">
                Account deletion is permanent. Review the confirmation dialog
                carefully before completing the action.
              </p>
            </div>
          </DocsSection>

          <div className="mt-12 flex flex-col gap-4 rounded-sm border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Ready to get started?</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Upload your first resume and continue from the dashboard.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/login">
                Open Rescomail
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

const MobileNavigation = () => (
  <nav
    aria-label="Documentation sections"
    className="sticky top-20 z-30 border-b border-border/60 bg-background/95 backdrop-blur lg:hidden"
  >
    <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:px-6">
      {navigationGroups
        .flatMap((group) => group.items)
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-sm border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
    </div>
  </nav>
);

const DesktopNavigation = () => (
  <aside className="hidden lg:block">
    <nav
      aria-label="Documentation sections"
      className="sticky top-28 space-y-7"
    >
      {navigationGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {group.label}
          </p>
          <ul className="border-l border-border/70">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="-ml-px block border-l border-transparent px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  </aside>
);

interface DocsSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  first?: boolean;
  children: ReactNode;
}

const DocsSection = ({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  first = false,
  children,
}: DocsSectionProps) => (
  <section
    id={id}
    className={`scroll-mt-32 ${first ? "pb-10" : "border-t border-border/60 py-10 sm:py-12"}`}
  >
    <div className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {eyebrow}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 text-primary" /> : null}
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    {children}
  </section>
);

interface StepListProps {
  steps: Array<{ title: string; description: string }>;
}

const StepList = ({ steps }: StepListProps) => (
  <ol className="overflow-hidden rounded-sm border border-border/60 bg-card">
    {steps.map((step, index) => (
      <li
        key={step.title}
        className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-border/60 p-4 last:border-b-0 sm:p-5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-foreground/5 bg-muted/20 text-xs font-semibold">
          {index + 1}
        </span>
        <div>
          <h3 className="text-sm font-medium">{step.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {step.description}
          </p>
        </div>
      </li>
    ))}
  </ol>
);

interface FieldTableProps {
  rows: string[][];
}

const FieldTable = ({ rows }: FieldTableProps) => (
  <div className="overflow-x-auto rounded-sm border border-border/60">
    <table className="w-full min-w-136 border-collapse text-left text-xs">
      <thead className="bg-muted/20 text-muted-foreground">
        <tr>
          <th className="px-4 py-3 font-medium">Input</th>
          <th className="px-4 py-3 font-medium">Purpose</th>
          <th className="px-4 py-3 font-medium">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 bg-card">
        {rows.map(([field, purpose, status]) => (
          <tr key={field}>
            <td className="px-4 py-3 font-medium text-foreground">{field}</td>
            <td className="px-4 py-3 leading-5 text-muted-foreground">
              {purpose}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface OutcomeProps {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
}

const Outcome = ({ title, description, icon: Icon = Check }: OutcomeProps) => (
  <div className="flex gap-3 rounded-sm border border-border/60 bg-card p-4">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-foreground/5 bg-muted/20">
      <Icon className="h-3.5 w-3.5 text-primary" />
    </span>
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  </div>
);

const Note = ({ children }: { children: ReactNode }) => (
  <div className="mt-6 border-primary bg-muted/20 px-4 py-3">
    <p className="text-xs leading-5 text-muted-foreground">{children}</p>
  </div>
);

const SectionLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Button asChild variant="outline" size="sm" className="mt-6">
    <Link href={href}>
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </Button>
);

export default Page;
