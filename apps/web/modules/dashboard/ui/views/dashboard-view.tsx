import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, resumes, atsAnalyses } from "@repo/db";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { FileText, Activity } from "lucide-react";

const DashboardView = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const userId = session.user.id;

    const [resumesCountResult, atsCountResult] = await Promise.all([
        db.select({ count: count() }).from(resumes).where(eq(resumes.userId, userId)),
        db.select({ count: count() }).from(atsAnalyses).where(eq(atsAnalyses.userId, userId))
    ]);

    const resumesCount = resumesCountResult[0]?.count || 0;
    const atsCount = atsCountResult[0]?.count || 0;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your activity and statistics.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Resumes
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resumesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Uploaded resumes
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            ATS Analyses
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{atsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed analyses
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;
