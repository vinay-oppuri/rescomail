import { auth } from "@repo/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Activity, FileText, Mail, Sparkles, Upload } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAtsAnalysesCount,
  getColdEmailsCount,
  getRecentScans,
  getResumesCount,
} from "../../server/procedures";

const DashboardView = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [resumesCount, atsCount, coldEmailsCount, recentScans] = await Promise.all([
    getResumesCount(session.user.id),
    getAtsAnalysesCount(session.user.id),
    getColdEmailsCount(session.user.id),
    getRecentScans(session.user.id, 5),
  ]);

  const metrics = [
    { label: "Resumes", value: resumesCount, icon: FileText, href: "/dashboard/resumes" },
    { label: "ATS analyses", value: atsCount, icon: Activity, href: "/dashboard/ats" },
    { label: "Cold emails", value: coldEmailsCount, icon: Mail, href: "/dashboard/emails" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="rounded-sm border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-4 w-4" /> Resume and outreach workspace
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Welcome back, {session.user.name || "there"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Store resumes, compare them with a role description, and create personalized outreach emails.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild><Link href="/dashboard/resumes"><Upload className="mr-2 h-4 w-4" />Upload resume</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/ats">Run ATS analysis</Link></Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Link href={metric.href} key={metric.label}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{metric.label}</CardTitle>
                <metric.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{metric.value}</p></CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent ATS analyses</CardTitle>
          <Button asChild size="sm" variant="ghost"><Link href="/dashboard/ats">View all</Link></Button>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="rounded-sm border border-dashed p-8 text-center text-sm text-muted-foreground">
              No completed analysis yet. Upload a resume and compare it with a role description.
            </div>
          ) : (
            <div className="divide-y">
              {recentScans.map((scan) => (
                <Link href={`/dashboard/ats/${scan.id}`} key={scan.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{scan.jobTitle || "Untitled analysis"}</p>
                    <p className="text-xs text-muted-foreground">{scan.companyName || "No company specified"}</p>
                  </div>
                  <Badge variant="outline">{scan.overallScore}%</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
