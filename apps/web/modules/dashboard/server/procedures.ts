import { db, resumes, atsAnalyses, applications } from "@repo/db";
import { and, avg, count, desc, eq, isNotNull } from "drizzle-orm";

export { getMonthlyUsageSummary } from "./usage-limits";

export const getResumesCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(resumes)
    .where(eq(resumes.userId, userId));
  return result[0]?.count || 0;
};

export const getAtsAnalysesCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(atsAnalyses)
    .where(
      and(eq(atsAnalyses.userId, userId), eq(atsAnalyses.status, "completed")),
    );
  return result[0]?.count || 0;
};

export const getAverageAtsScore = async (userId: string): Promise<number> => {
  const result = await db
    .select({ avg: avg(atsAnalyses.overallScore) })
    .from(atsAnalyses)
    .where(
      and(
        eq(atsAnalyses.userId, userId),
        eq(atsAnalyses.status, "completed"),
        isNotNull(atsAnalyses.overallScore),
      ),
    );
  const average = result[0]?.avg ? parseFloat(result[0].avg) : 0;
  return Math.round(average);
};

export const getTrackedJobsStats = async (userId: string) => {
  const result = await db
    .select({ stage: applications.stage, count: count() })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.stage);

  const stats = {
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0, // phone_screen + interview
    offer: 0,
    rejected: 0,
  };

  result.forEach((row) => {
    const c = Number(row.count);
    stats.total += c;
    if (row.stage === 'saved') stats.saved += c;
    if (row.stage === 'applied') stats.applied += c;
    if (row.stage === 'phone_screen' || row.stage === 'interview') stats.interviewing += c;
    if (row.stage === 'offer') stats.offer += c;
    if (row.stage === 'rejected') stats.rejected += c;
  });

  return stats;
};

export const getRecentScans = async (userId: string, limit = 5) => {
  const rows = await db
    .select({
      id: atsAnalyses.id,
      jobTitle: atsAnalyses.jobTitle,
      companyName: atsAnalyses.companyName,
      overallScore: atsAnalyses.overallScore,
      verdict: atsAnalyses.verdict,
      createdAt: atsAnalyses.createdAt,
    })
    .from(atsAnalyses)
    .where(
      and(
        eq(atsAnalyses.userId, userId),
        eq(atsAnalyses.status, "completed"),
        isNotNull(atsAnalyses.overallScore),
        isNotNull(atsAnalyses.verdict),
      ),
    )
    .orderBy(desc(atsAnalyses.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    overallScore: row.overallScore ?? 0,
    verdict: row.verdict ?? "needs_work",
  }));
};
