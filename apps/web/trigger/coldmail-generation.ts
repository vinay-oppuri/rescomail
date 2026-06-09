import { logger, task } from "@trigger.dev/sdk/v3";
import { coldEmails, db, resumes, usageEvents, userPreferences } from "@repo/db";
import { and, eq } from "drizzle-orm";

import { ColdmailError } from "@/modules/coldmail/server/coldmail-errors";
import { runAiColdmailGeneration } from "@/modules/coldmail/server/coldmail-service-client";
import { decryptSecret } from "@/lib/server/secrets";
import type {
  ColdEmailCallToAction,
  ColdEmailLength,
  ColdEmailTone,
} from "@repo/validations";

type ColdmailGenerationPayload = {
  coldEmailId: string;
  userId: string;
};

const getFailureMessage = (error: unknown) =>
  error instanceof ColdmailError
    ? error.message
    : "Cold email generation failed after retries.";

export const coldmailGenerationTask = task({
  id: "coldmail-generation",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
  },
  run: async (payload: ColdmailGenerationPayload) => {
    const { coldEmailId, userId } = payload;

    logger.log(`Starting cold email generation job: ${coldEmailId}`);

    const emailRecord = await db.query.coldEmails.findFirst({
      where: and(eq(coldEmails.id, coldEmailId), eq(coldEmails.userId, userId)),
    });

    if (!emailRecord) {
      throw new Error(`Cold email record not found: ${coldEmailId}`);
    }

    if (emailRecord.status === "completed") {
      logger.log("Cold email already generated - skipping duplicate run.");
      return { success: true, alreadyCompleted: true };
    }

    await db
      .update(coldEmails)
      .set({
        status: "processing",
        error: null,
      })
      .where(
        and(eq(coldEmails.id, coldEmailId), eq(coldEmails.userId, userId)),
      );

    const resume = await db.query.resumes.findFirst({
      where: and(
        eq(resumes.id, emailRecord.resumeId),
        eq(resumes.userId, userId),
      ),
    });

    if (!resume) {
      throw new Error(
        `Resume not found for cold email: ${emailRecord.resumeId}`,
      );
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    const draft = await runAiColdmailGeneration(
      {
        resumeId: resume.id,
        jobTitle: emailRecord.jobTitle,
        companyName: emailRecord.companyName,
        companyWebsiteUrl: emailRecord.companyWebsiteUrl,
        recipientName: emailRecord.recipientName,
        recipientRole: emailRecord.recipientRole,
        jobDescription: emailRecord.jobDescription,
        companyContext: emailRecord.companyContext,
        personalNote: emailRecord.personalNote,
        tone: emailRecord.tone as ColdEmailTone,
        length: emailRecord.length as ColdEmailLength,
        callToAction: emailRecord.callToAction as ColdEmailCallToAction,
      },
      resume,
      userId,
      decryptSecret(prefs?.geminiApiKey) ?? undefined
    );

    await db.transaction(async (tx) => {
      await tx
        .update(coldEmails)
        .set({
          status: "completed",
          draft,
          subject: draft.subject,
          previewText: draft.previewText,
          body: draft.body,
          qualityScore: draft.qualityScore,
          companyContext: draft.companyContext ?? emailRecord.companyContext,
          error: null,
        })
        .where(
          and(eq(coldEmails.id, coldEmailId), eq(coldEmails.userId, userId)),
        );

      await tx.insert(usageEvents).values({
        userId,
        organizationId: resume.organizationId,
        type: "cold_email_generate",
        metadata: {
          resumeId: resume.id,
          jobTitle: emailRecord.jobTitle,
          companyName: emailRecord.companyName,
          qualityScore: draft.qualityScore,
        },
      });
    });

    logger.log(`Successfully generated cold email: ${coldEmailId}`);

    return { success: true };
  },
  onFailure: async ({ payload, error }) => {
    const reason = getFailureMessage(error);

    logger.error(`Cold email generation failed permanently: ${reason}`);

    await db
      .update(coldEmails)
      .set({
        status: "failed",
        error: reason,
      })
      .where(
        and(
          eq(coldEmails.id, payload.coldEmailId),
          eq(coldEmails.userId, payload.userId),
        ),
      );
  },
});
