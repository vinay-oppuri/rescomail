import { db, resumes } from "@repo/db";
import { desc, eq } from "drizzle-orm";

export const getAtsResumeOptions = async (userId: string) => {
  const rows = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      fileName: resumes.fileName,
      status: resumes.status,
      parsingError: resumes.parsingError,
      createdAt: resumes.createdAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.createdAt));

  return rows.map((resume) => ({
    ...resume,
    createdAt: resume.createdAt.toISOString(),
  }));
};

export type AtsResumeOption = Awaited<
  ReturnType<typeof getAtsResumeOptions>
>[number];
