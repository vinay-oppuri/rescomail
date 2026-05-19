import { atsAnalysisResponseSchema } from "@repo/validations";
import { atsAnalyses, db, resumes } from "@repo/db";
import { desc, eq } from "drizzle-orm";

export const getAtsAnalysisHistoryForUser = async (userId: string) => {
  const rows = await db
    .select({
      id: atsAnalyses.id,
      resumeId: atsAnalyses.resumeId,
      resumeTitle: resumes.title,
      jobTitle: atsAnalyses.jobTitle,
      companyName: atsAnalyses.companyName,
      overallScore: atsAnalyses.overallScore,
      verdict: atsAnalyses.verdict,
      analysis: atsAnalyses.analysis,
      createdAt: atsAnalyses.createdAt,
    })
    .from(atsAnalyses)
    .innerJoin(resumes, eq(atsAnalyses.resumeId, resumes.id))
    .where(eq(atsAnalyses.userId, userId))
    .orderBy(desc(atsAnalyses.createdAt))
    .limit(20);

  return rows.map((row) => {
    const parsed = atsAnalysisResponseSchema.safeParse(row.analysis);

    return {
      id: row.id,
      resumeId: row.resumeId,
      resumeTitle: row.resumeTitle,
      jobTitle: row.jobTitle,
      companyName: row.companyName,
      overallScore: row.overallScore,
      verdict: row.verdict,
      analysis: parsed.success
        ? {
            ...parsed.data,
            analysisId: row.id,
          }
        : null,
      createdAt: row.createdAt.toISOString(),
    };
  });
};

export type AtsAnalysisHistoryItem = Awaited<
  ReturnType<typeof getAtsAnalysisHistoryForUser>
>[number];
