import { coldEmailResponseSchema } from "@repo/validations";
import { coldEmails, db, resumes } from "@repo/db";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export const getColdEmailHistoryForUser = async (userId: string) => {
  const rows = await db
    .select({
      id: coldEmails.id,
      resumeId: coldEmails.resumeId,
      resumeTitle: resumes.title,
      jobTitle: coldEmails.jobTitle,
      companyName: coldEmails.companyName,
      companyWebsiteUrl: coldEmails.companyWebsiteUrl,
      recipientName: coldEmails.recipientName,
      recipientRole: coldEmails.recipientRole,
      tone: coldEmails.tone,
      length: coldEmails.length,
      callToAction: coldEmails.callToAction,
      subject: coldEmails.subject,
      previewText: coldEmails.previewText,
      body: coldEmails.body,
      qualityScore: coldEmails.qualityScore,
      draft: coldEmails.draft,
      createdAt: coldEmails.createdAt,
    })
    .from(coldEmails)
    .innerJoin(resumes, eq(coldEmails.resumeId, resumes.id))
    .where(
      and(
        eq(coldEmails.userId, userId),
        eq(coldEmails.status, "completed"),
        isNotNull(coldEmails.draft),
        isNotNull(coldEmails.subject),
        isNotNull(coldEmails.previewText),
        isNotNull(coldEmails.body),
        isNotNull(coldEmails.qualityScore),
      ),
    )
    .orderBy(desc(coldEmails.createdAt))
    .limit(25);

  return rows.map((row) => {
    const parsed = coldEmailResponseSchema.safeParse(row.draft);

    return {
      id: row.id,
      resumeId: row.resumeId,
      resumeTitle: row.resumeTitle,
      jobTitle: row.jobTitle,
      companyName: row.companyName,
      companyWebsiteUrl: row.companyWebsiteUrl,
      recipientName: row.recipientName,
      recipientRole: row.recipientRole,
      tone: row.tone,
      length: row.length,
      callToAction: row.callToAction,
      subject: row.subject ?? "",
      previewText: row.previewText ?? "",
      body: row.body ?? "",
      qualityScore: row.qualityScore ?? 0,
      draft: parsed.success
        ? {
            ...parsed.data,
            coldEmailId: row.id,
          }
        : null,
      createdAt: row.createdAt.toISOString(),
    };
  });
};

export type ColdEmailHistoryItem = Awaited<
  ReturnType<typeof getColdEmailHistoryForUser>
>[number];
