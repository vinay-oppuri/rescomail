import { db, resumes, atsAnalyses } from "@repo/db";
import { count, eq, avg, desc } from "drizzle-orm";

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
    .where(eq(atsAnalyses.userId, userId));
  return result[0]?.count || 0;
};

export const getAverageAtsScore = async (userId: string): Promise<number> => {
  const result = await db
    .select({ avg: avg(atsAnalyses.overallScore) })
    .from(atsAnalyses)
    .where(eq(atsAnalyses.userId, userId));
  const average = result[0]?.avg ? parseFloat(result[0].avg) : 0;
  return Math.round(average);
};

export const getRecentScans = async (
  userId: string,
  limit = 5
) => {
  return await db
    .select({
      id: atsAnalyses.id,
      jobTitle: atsAnalyses.jobTitle,
      companyName: atsAnalyses.companyName,
      overallScore: atsAnalyses.overallScore,
      verdict: atsAnalyses.verdict,
      createdAt: atsAnalyses.createdAt,
    })
    .from(atsAnalyses)
    .where(eq(atsAnalyses.userId, userId))
    .orderBy(desc(atsAnalyses.createdAt))
    .limit(limit);
};

