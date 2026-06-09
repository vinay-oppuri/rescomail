import { atsAnalyses, db, resumes } from "@repo/db";
import { and, eq } from "drizzle-orm";

import { AtsAnalysisError } from "./ats-errors";
import { checkUsageLimit } from "@/modules/dashboard/server/usage-limits";
import { atsAnalysisTask } from "@/trigger/ats-analysis";
import type { AtsAnalyzeInput } from "@repo/validations";

export const runAtsAnalysisForUser = async (
  input: AtsAnalyzeInput & { userId: string },
) => {
  // Pre-flight: enforce monthly credit limit before triggering the AI service.
  await checkUsageLimit(input.userId, "ats_analysis");

  const resume = await db.query.resumes.findFirst({
    where: and(
      eq(resumes.id, input.resumeId),
      eq(resumes.userId, input.userId),
    ),
  });

  if (!resume) {
    throw new AtsAnalysisError("Resume not found.", 404);
  }

  let savedAnalysisId: string | null = null;

  try {
    // 1. Insert placeholder row in the DB
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
        status: "processing",
      })
      .returning({ id: atsAnalyses.id });

    if (!savedAnalysis) {
      throw new Error("Failed to save ATS analysis record.");
    }

    savedAnalysisId = savedAnalysis.id;

    // 2. Queue the job in Trigger.dev
    await atsAnalysisTask.trigger(
      {
        analysisId: savedAnalysis.id,
        userId: input.userId,
      },
      {
        idempotencyKey: `ats-analysis:${savedAnalysis.id}`,
      },
    );

    // 3. Return the jobId so the frontend can poll it
    return {
      analysisId: savedAnalysis.id,
      status: "processing",
    };
  } catch (error) {
    if (error instanceof AtsAnalysisError) {
      throw error;
    }

    console.error("Failed to queue ATS analysis", error);
    const message = "Unable to start ATS analysis right now.";

    if (savedAnalysisId) {
      await db
        .update(atsAnalyses)
        .set({
          status: "failed",
          error: message,
        })
        .where(
          and(
            eq(atsAnalyses.id, savedAnalysisId),
            eq(atsAnalyses.userId, input.userId),
          ),
        );
    }

    throw new AtsAnalysisError(message, 502);
  }
};
