import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, FileText, Mail, Sparkles, Upload } from "lucide-react";
import { auth } from "@repo/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";

import {
  getAtsAnalysesCount,
  getColdEmailsCount,
  getRecentScans,
  getResumesCount,
} from "../../server/procedures";
import DashboardGettingStarted from "../components/dashboard-getting-started";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);

const DashboardView = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [resumesCount, atsCount, coldEmailsCount, recentScans] =
    await Promise.all([
      getResumesCount(session.user.id),
      getAtsAnalysesCount(session.user.id),
      getColdEmailsCount(session.user.id),
      getRecentScans(session.user.id, 5),
    ]);

  const metrics = [
    {
      label: "Resumes",
      value: resumesCount,
      icon: FileText,
      href: "/dashboard/resumes",
    },
    {
      label: "ATS analyses",
      value: atsCount,
      icon: Activity,
      href: "/dashboard/ats",
    },
    {
      label: "Cold emails",
      value: coldEmailsCount,
      icon: Mail,
      href: "/dashboard/emails",
    },
  ];
  const emptyStateHref =
    resumesCount > 0 ? "/dashboard/ats" : "/dashboard/resumes";
  const emptyStateAction =
    resumesCount > 0 ? "Run your first analysis" : "Upload your first resume";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-sm border bg-card p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Sparkles className="h-4 w-4" />
                  Resume and outreach workspace
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  Welcome back, {session.user.name || "there"}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Store resumes, compare them with a role description, and
                  create personalized outreach emails.
                </p>
              </div>
              <div className="flex w-full max-w-44 shrink-0 flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard/resumes">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload resume
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/ats">Run ATS analysis</Link>
                </Button>
              </div>
            </div>
          </div>

          <div
            className="grid gap-4 sm:grid-cols-3"
            aria-label="Workspace totals"
          >
            {metrics.map((metric) => (
              <Link href={metric.href} key={metric.label}>
                <Card className="h-full transition-colors hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <metric.icon className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Recent ATS analyses</CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/ats">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="flex flex-col items-center rounded-sm border border-dashed p-8 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No completed analysis yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    Start with a parsed resume, then compare it with a role
                    description.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href={emptyStateHref}>{emptyStateAction}</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {scan.jobTitle || "Untitled analysis"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {scan.companyName || "No company specified"} -{" "}
                          {formatDate(scan.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {scan.overallScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside aria-label="Getting started">
          <DashboardGettingStarted
            resumesCount={resumesCount}
            atsCount={atsCount}
            coldEmailsCount={coldEmailsCount}
          />
        </aside>
      </section>
    </div>
  );
};

export default DashboardView;
