import type { AtsAnalysisResponse, AtsAnalyzeInput } from "@repo/validations";
import { atsAnalyses, db, resumes, usageEvents } from "@repo/db";
import { and, eq } from "drizzle-orm";

import { AtsAnalysisError } from "./ats-errors";
import { runAiAtsAnalysis } from "./ats-service-client";

export const runAtsAnalysisForUser = async (
  input: AtsAnalyzeInput & { userId: string },
): Promise<AtsAnalysisResponse> => {
  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, input.resumeId), eq(resumes.userId, input.userId)),
  });

  if (!resume) {
    throw new AtsAnalysisError("Resume not found.", 404);
  }

  try {
    const analysis = await runAiAtsAnalysis(input, resume);

    const [savedAnalysis] = await db
      .insert(atsAnalyses)
      .values({
        userId: input.userId,
        organizationId: resume.organizationId,
        resumeId: resume.id,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        jobDescription: input.jobDescription,
        targetKeywords: input.targetKeywords,
        analysis,
        overallScore: analysis.overallScore,
        verdict: analysis.verdict,
      })
      .returning({ id: atsAnalyses.id });

    await db.insert(usageEvents).values({
      userId: input.userId,
      organizationId: resume.organizationId,
      type: "ats_analysis",
      metadata: {
        resumeId: resume.id,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        overallScore: analysis.overallScore,
      },
    });

    return {
      ...analysis,
      analysisId: savedAnalysis?.id,
    };
  } catch (error) {
    if (error instanceof AtsAnalysisError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Unknown ATS analysis error";

    throw new AtsAnalysisError(message, 502);
  }
};
