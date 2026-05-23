import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@repo/ui";
import { FileText, Activity, Sparkles, Upload, Award, Briefcase, ChevronRight, BarChart2 } from "lucide-react";
import { 
  getResumesCount, 
  getAtsAnalysesCount, 
  getAverageAtsScore, 
  getRecentScans 
} from "../../server/procedures";

const DashboardView = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const userId = session.user.id;

    const [resumesCount, atsCount, averageAtsScore, recentScans] = await Promise.all([
        getResumesCount(userId),
        getAtsAnalysesCount(userId),
        getAverageAtsScore(userId),
        getRecentScans(userId, 5)
    ]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500 dark:text-emerald-400";
        if (score >= 65) return "text-blue-500 dark:text-blue-400";
        if (score >= 50) return "text-amber-500 dark:text-amber-400";
        return "text-destructive";
    };

    const getScoreBadgeColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
        if (score >= 65) return "bg-blue-500/10 border-blue-500/20";
        if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
        return "bg-destructive/10 border-destructive/20";
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto rounded-none">
            {/* Minimalist Welcome Header */}
            <div className="relative overflow-hidden rounded-none border border-foreground/5 bg-card/60 p-6 md:p-8 shadow-sm">
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between rounded-none">
                    <div className="space-y-1.5 rounded-none">
                        <div className="flex items-center gap-2 rounded-none">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Job Application Copilot</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Hello, {session.user.name || "User"}
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-155">
                            Optimize your application pipeline with AI tools. Scan your resumes against job descriptions, audit key phrases, and tailors your profiles to land more interviews.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 shrink-0 rounded-none">
                        <Button asChild size="default" className="rounded-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Link href="/dashboard/resumes">
                                <Upload className="mr-2 h-4 w-4" /> Upload Resume
                            </Link>
                        </Button>
                        <Button asChild size="default" variant="outline" className="rounded-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all bg-card">
                            <Link href="/dashboard/ats">
                                <Sparkles className="mr-2 h-4 w-4 text-primary" /> Run ATS Scan
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Statistics Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-none">
                <Card className="bg-card/60 rounded-none hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 rounded-none">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Total Resumes
                        </CardTitle>
                        <div className="p-1.5 rounded-none bg-primary/5 text-primary">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1 rounded-none">
                        <div className="text-3xl font-bold tracking-tight">{resumesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Stored profiles ready for AI matching
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card/60 rounded-none hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500/70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 rounded-none">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            ATS Scans Done
                        </CardTitle>
                        <div className="p-1.5 rounded-none bg-blue-500/5 text-blue-500">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1 rounded-none">
                        <div className="text-3xl font-bold tracking-tight">{atsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Job descriptions compared and parsed
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/60 rounded-none hover:shadow-md transition-all duration-300 border-l-4 border-l-emerald-500/70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 rounded-none">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Average Match Score
                        </CardTitle>
                        <div className="p-1.5 rounded-none bg-emerald-500/5 text-emerald-500">
                            <Award className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1 rounded-none">
                        <div className="flex items-baseline gap-2 rounded-none">
                            <div className={`text-3xl font-bold tracking-tight ${getScoreColor(averageAtsScore)}`}>
                                {averageAtsScore > 0 ? `${averageAtsScore}%` : "—"}
                            </div>
                            {averageAtsScore > 0 && (
                                <Badge variant="outline" className={`rounded-none px-1.5 py-0.5 text-[9px] font-bold uppercase border ${getScoreBadgeColor(averageAtsScore)}`}>
                                    {averageAtsScore >= 85 ? "Excellent" : averageAtsScore >= 70 ? "Good" : "Needs Work"}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Overall fit across historical analyses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Scans */}
            <div className="grid gap-6 md:grid-cols-5 rounded-none">
                {/* Recent ATS Analyses (Span 3 Columns) */}
                <div className="md:col-span-3 space-y-4 rounded-none">
                    <div className="flex items-center justify-between rounded-none">
                        <div className="rounded-none">
                            <h2 className="text-lg font-bold tracking-tight">Recent Scans</h2>
                            <p className="text-xs text-muted-foreground">Tailored comparisons and keyword checks</p>
                        </div>
                        {recentScans.length > 0 && (
                            <Button asChild variant="ghost" size="sm" className="rounded-none text-xs font-semibold cursor-pointer">
                                <Link href="/dashboard/ats" className="flex items-center gap-1">
                                    View All <ChevronRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        )}
                    </div>

                    {recentScans.length > 0 ? (
                        <div className="flex flex-col gap-3 rounded-none">
                            {recentScans.map((scan) => {
                                const verdictLabelMap: Record<string, string> = {
                                    strong_match: "Strong Match",
                                    good_match: "Good Match",
                                    partial_match: "Partial Match",
                                    needs_work: "Needs Work",
                                };
                                
                                const verdictColorMap: Record<string, string> = {
                                    strong_match: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                    good_match: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                                    partial_match: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                    needs_work: "bg-destructive/10 text-destructive border-destructive/20",
                                };

                                return (
                                    <div 
                                        key={scan.id} 
                                        className="flex items-center justify-between p-4 rounded-none border border-foreground/5 bg-card/50 hover:bg-card hover:scale-[1.01] hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3 rounded-none">
                                            <div className="p-2 rounded-none bg-primary/5 text-primary">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5 rounded-none">
                                                <h3 className="font-semibold text-sm line-clamp-1">{scan.jobTitle}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{scan.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 rounded-none">
                                            <div className="text-right rounded-none">
                                                <span className={`text-lg font-extrabold ${getScoreColor(scan.overallScore)}`}>
                                                    {scan.overallScore}%
                                                </span>
                                                <p className="text-[10px] text-muted-foreground">Match</p>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={`rounded-none px-2 py-0.5 text-[9px] font-bold border ${verdictColorMap[scan.verdict] || "bg-muted text-muted-foreground"}`}
                                            >
                                                {verdictLabelMap[scan.verdict] || scan.verdict}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                                                {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-none text-center bg-card/30">
                            <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">No recent scans yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-62.5">
                                Upload your resume and scan against a job description to get started.
                            </p>
                            <Button asChild size="sm" variant="outline" className="rounded-none mt-4">
                                <Link href="/dashboard/ats">Run First Scan</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Tips & Recommendations (Span 2 Columns) */}
                <div className="md:col-span-2 space-y-4 rounded-none">
                    <div className="rounded-none">
                        <h2 className="text-lg font-bold tracking-tight">AI Insights</h2>
                        <p className="text-xs text-muted-foreground">Pro tips to beat ATS algorithms</p>
                    </div>

                    <div className="space-y-3 rounded-none">
                        <Card className="bg-card/60 border-l-2 border-l-primary/60 rounded-none">
                            <CardHeader className="pb-2 rounded-none">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 rounded-none">
                                    <BarChart2 className="h-3.5 w-3.5" /> Core Tip #1: Match Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground leading-relaxed rounded-none">
                                Aim for a Match Score of <strong className="text-foreground">75% or higher</strong> before applying. This typically covers 90% of the recruiter&apos;s baseline keyword queries.
                            </CardContent>
                        </Card>

                        <Card className="bg-card/60 border-l-2 border-l-blue-500/60 rounded-none">
                            <CardHeader className="pb-2 rounded-none">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5 rounded-none">
                                    <Sparkles className="h-3.5 w-3.5" /> Core Tip #2: Action Verbs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground leading-relaxed rounded-none">
                                Avoid passive language. Use high-impact verbs like <em className="text-foreground font-semibold not-italic">&quot;Engineered&quot;</em>, <em className="text-foreground font-semibold not-italic">&quot;Streamlined&quot;</em>, and <em className="text-foreground font-semibold not-italic">&quot;Spearheaded&quot;</em> aligned with key job requirements.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
