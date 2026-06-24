import { logger, task } from "@trigger.dev/sdk/v3";
import { atsAnalyses, db, resumes, usageEvents, userPreferences } from "@repo/db";
import { and, eq } from "drizzle-orm";

import { AtsAnalysisError } from "@/modules/ats/server/ats-errors";
import { runAiAtsAnalysis } from "@/modules/ats/server/ats-service-client";
import { decryptSecret } from "@/lib/server/secrets";

type AtsAnalysisPayload = {
  analysisId: string;
  userId: string;
};

const getTargetKeywords = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((keyword): keyword is string => typeof keyword === "string")
    : [];

const getFailureMessage = (error: unknown) =>
  error instanceof AtsAnalysisError
    ? error.message
    : "ATS analysis failed after retries.";

export const atsAnalysisTask = task({
  id: "ats-analysis",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
  },
  run: async (payload: AtsAnalysisPayload) => {
    const { analysisId, userId } = payload;

    logger.log(`Starting ATS analysis job: ${analysisId}`);

    const analysisRecord = await db.query.atsAnalyses.findFirst({
      where: and(
        eq(atsAnalyses.id, analysisId),
        eq(atsAnalyses.userId, userId),
      ),
    });

    if (!analysisRecord) {
      throw new Error(`ATS analysis record not found: ${analysisId}`);
    }

    if (analysisRecord.status === "completed") {
      logger.log("ATS analysis already completed - skipping duplicate run.");
      return { success: true, alreadyCompleted: true };
    }

    await db
      .update(atsAnalyses)
      .set({
        status: "processing",
        error: null,
      })
      .where(
        and(eq(atsAnalyses.id, analysisId), eq(atsAnalyses.userId, userId)),
      );

    const resume = await db.query.resumes.findFirst({
      where: and(
        eq(resumes.id, analysisRecord.resumeId),
        eq(resumes.userId, userId),
      ),
    });

    if (!resume) {
      throw new Error(
        `Resume not found for analysis: ${analysisRecord.resumeId}`,
      );
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    const analysis = await runAiAtsAnalysis(
      {
        resumeId: resume.id,
        jobTitle: analysisRecord.jobTitle,
        companyName: analysisRecord.companyName,
        jobDescription: analysisRecord.jobDescription,
        targetKeywords: getTargetKeywords(analysisRecord.targetKeywords),
      },
      resume,
      userId,
      decryptSecret(prefs?.geminiApiKey) ?? undefined,
      decryptSecret(prefs?.groqApiKey) ?? undefined
    );

    await db.transaction(async (tx) => {
      await tx
        .update(atsAnalyses)
        .set({
          status: "completed",
          analysis,
          overallScore: analysis.overallScore,
          verdict: analysis.verdict,
          error: null,
        })
        .where(
          and(eq(atsAnalyses.id, analysisId), eq(atsAnalyses.userId, userId)),
        );

      await tx.insert(usageEvents).values({
        userId,
        organizationId: resume.organizationId,
        type: "ats_analysis",
        metadata: {
          resumeId: resume.id,
          jobTitle: analysisRecord.jobTitle,
          companyName: analysisRecord.companyName,
          overallScore: analysis.overallScore,
        },
      });
    });

    logger.log(`Successfully completed ATS analysis: ${analysisId}`);

    return { success: true };
  },
  onFailure: async ({ payload, error }) => {
    const reason = getFailureMessage(error);

    logger.error(`ATS analysis failed permanently: ${reason}`);

    await db
      .update(atsAnalyses)
      .set({
        status: "failed",
        error: reason,
      })
      .where(
        and(
          eq(atsAnalyses.id, payload.analysisId),
          eq(atsAnalyses.userId, payload.userId),
        ),
      );
  },
});
