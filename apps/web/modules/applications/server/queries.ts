import { db, applications, resumes } from "@repo/db";
import { desc, eq } from "drizzle-orm";

export const getApplicationsForUser = async (userId: string) => {
  const rows = await db
    .select({
      id: applications.id,
      jobTitle: applications.jobTitle,
      companyName: applications.companyName,
      jobUrl: applications.jobUrl,
      stage: applications.stage,
      notes: applications.notes,
      appliedAt: applications.appliedAt,
      resumeId: applications.resumeId,
      resumeTitle: resumes.title,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
    })
    .from(applications)
    .leftJoin(resumes, eq(applications.resumeId, resumes.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));

  return rows.map((row) => ({
    ...row,
    appliedAt: row.appliedAt ? row.appliedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
};

export const getResumeOptions = async (userId: string) => {
  return await db
    .select({
      id: resumes.id,
      title: resumes.title,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
};

export type ApplicationItem = Awaited<ReturnType<typeof getApplicationsForUser>>[number];
export type ResumeOption = Awaited<ReturnType<typeof getResumeOptions>>[number];
