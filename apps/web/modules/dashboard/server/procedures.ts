import { db, resumes, atsAnalyses, coldEmails } from "@repo/db";
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

export const getColdEmailsCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(coldEmails)
    .where(eq(coldEmails.userId, userId));
  return result[0]?.count || 0;
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
