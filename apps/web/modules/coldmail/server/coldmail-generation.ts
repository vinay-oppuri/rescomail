import type { ColdEmailGenerateInput, ColdEmailResponse } from "@repo/validations";
import { coldEmails, db, resumes, usageEvents } from "@repo/db";
import { and, eq } from "drizzle-orm";

import { ColdmailError } from "./coldmail-errors";

import { runAiColdmailGeneration } from "./coldmail-service-client";

export const generateColdEmailForUser = async (
  input: ColdEmailGenerateInput & { userId: string },
): Promise<ColdEmailResponse> => {
  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, input.resumeId), eq(resumes.userId, input.userId)),
  });

  if (!resume) {
    throw new ColdmailError("Resume not found.", 404);
  }

  try {
    const draft = await runAiColdmailGeneration(
      {
        ...input,
        companyContext: "", // AI service will fetch if empty
      },
      resume,
    );
    
    // AI service might have fetched context, use it or fallback to empty string
    const companyContext = draft.companyContext || "";

    const [savedDraft] = await db
      .insert(coldEmails)
      .values({
        userId: input.userId,
        organizationId: resume.organizationId,
        resumeId: resume.id,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        companyWebsiteUrl: input.companyWebsiteUrl,
        recipientName: input.recipientName,
        recipientRole: input.recipientRole,
        jobDescription: input.jobDescription,
        companyContext,
        personalNote: input.personalNote,
        tone: input.tone,
        length: input.length,
        callToAction: input.callToAction,
        draft,
        subject: draft.subject,
        previewText: draft.previewText,
        body: draft.body,
        qualityScore: draft.qualityScore,
      })
      .returning({ id: coldEmails.id });

    await db.insert(usageEvents).values({
      userId: input.userId,
      organizationId: resume.organizationId,
      type: "cold_email_generate",
      metadata: {
        resumeId: resume.id,
        jobTitle: input.jobTitle,
        companyName: input.companyName,
        companyWebsiteUrl: input.companyWebsiteUrl,
        qualityScore: draft.qualityScore,
      },
    });

    return {
      ...draft,
      companyContext,
      coldEmailId: savedDraft?.id,
    };
  } catch (error) {
    if (error instanceof ColdmailError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unknown cold email generation error";

    throw new ColdmailError(message, 502);
  }
};
