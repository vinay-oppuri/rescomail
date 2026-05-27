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
        if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
        if (score >= 65) return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
        if (score >= 50) return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
        return "bg-destructive/10 border-destructive/20 text-destructive";
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full relative">
            {/* Ambient Background Glow (Subtle) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] overflow-hidden -z-10 pointer-events-none opacity-40">
                <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] rounded-none bg-primary/10 blur-[100px]" />
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-none bg-blue-500/10 blur-[100px]" />
            </div>

            {/* Minimalist Welcome Header */}
            <div className="relative overflow-hidden rounded-none border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-xl">
                <div className="absolute -inset-0.5 bg-linear-to-br from-primary/10 to-blue-500/10 blur-xl opacity-50 -z-10" />
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Job Application Copilot</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">{session.user.name || "User"}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                            Optimize your application pipeline with AI tools. Scan your resumes against job descriptions, audit key phrases, and tailor your profile to land more interviews.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 shrink-0">
                        <Button asChild size="default" className="rounded-none h-11 px-5 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm font-medium">
                            <Link href="/dashboard/resumes">
                                <Upload className="mr-2 h-4 w-4" /> Upload Resume
                            </Link>
                        </Button>
                        <Button asChild size="default" variant="outline" className="rounded-none h-11 px-5 border-border/50 hover:bg-muted transition-all text-sm font-medium bg-card/50 backdrop-blur-sm">
                            <Link href="/dashboard/ats">
                                <Sparkles className="mr-2 h-4 w-4 text-primary" /> Run ATS Scan
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Statistics Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="group relative rounded-none border border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/70" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Total Resumes
                        </CardTitle>
                        <div className="p-2 bg-primary/10 text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-extrabold tracking-tight text-foreground">{resumesCount}</div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Stored profiles ready for AI matching
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="group relative rounded-none border border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/70" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            ATS Scans Done
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 text-blue-500 shrink-0">
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-4xl font-extrabold tracking-tight text-foreground">{atsCount}</div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Job descriptions compared and parsed
                        </p>
                    </CardContent>
                </Card>

                <Card className="group relative rounded-none border border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/70" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Average Match
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 shrink-0">
                            <Award className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <div className={`text-4xl font-extrabold tracking-tight ${getScoreColor(averageAtsScore)}`}>
                                {averageAtsScore > 0 ? `${averageAtsScore}%` : "—"}
                            </div>
                            {averageAtsScore > 0 && (
                                <Badge variant="outline" className={`rounded-none px-2 py-0.5 text-[10px] font-bold uppercase border ${getScoreBadgeColor(averageAtsScore)}`}>
                                    {averageAtsScore >= 85 ? "Excellent" : averageAtsScore >= 70 ? "Good" : "Needs Work"}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                            Overall fit across historical analyses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Scans */}
            <div className="grid gap-8 md:grid-cols-5">
                {/* Recent ATS Analyses (Span 3 Columns) */}
                <div className="md:col-span-3 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Scans</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Tailored comparisons and keyword checks</p>
                        </div>
                        {recentScans.length > 0 && (
                            <Button asChild variant="ghost" size="sm" className="rounded-none text-xs font-semibold hover:bg-muted/50 transition-colors">
                                <Link href="/dashboard/ats" className="flex items-center gap-1">
                                    View All <ChevronRight className="h-3 w-3" />
                                </Link>
                            </Button>
                        )}
                    </div>

                    {recentScans.length > 0 ? (
                        <div className="flex flex-col gap-3">
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
                                        className="flex items-center justify-between p-4 border border-border/50 bg-card/80 backdrop-blur-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 rounded-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-primary/10 text-primary shrink-0 rounded-none">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-sm line-clamp-1 text-foreground">{scan.jobTitle}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{scan.companyName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="text-right">
                                                <span className={`text-xl font-extrabold tracking-tight ${getScoreColor(scan.overallScore)}`}>
                                                    {scan.overallScore}%
                                                </span>
                                            </div>
                                            <Badge 
                                                variant="outline" 
                                                className={`rounded-none px-2 py-1 text-[10px] font-bold border w-24 justify-center ${verdictColorMap[scan.verdict] || "bg-muted text-muted-foreground"}`}
                                            >
                                                {verdictLabelMap[scan.verdict] || scan.verdict}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap hidden sm:inline-block w-12 text-right">
                                                {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border border-border/50 border-dashed bg-card/50 backdrop-blur-sm text-center rounded-none">
                            <div className="p-4 bg-muted mb-4 text-muted-foreground/50 rounded-none">
                               <Sparkles className="h-8 w-8" />
                            </div>
                            <p className="text-base font-semibold text-foreground">No recent scans yet</p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
                                Upload your resume and scan against a job description to get started.
                            </p>
                            <Button asChild size="default" className="rounded-none mt-6 h-10 px-6 text-sm">
                                <Link href="/dashboard/ats">Run First Scan</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Tips & Recommendations (Span 2 Columns) */}
                <div className="md:col-span-2 space-y-5">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">AI Insights</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Pro tips to beat ATS algorithms</p>
                    </div>

                    <div className="space-y-4">
                        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 border-l-2 border-l-primary rounded-none shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <BarChart2 className="h-4 w-4" /> Core Tip #1: Match Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Aim for a Match Score of <strong className="text-foreground">75% or higher</strong> before applying. This typically covers 90% of the recruiter&apos;s baseline keyword queries.
                            </CardContent>
                        </Card>

                        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 border-l-2 border-l-blue-500 rounded-none shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> Core Tip #2: Action Verbs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
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
