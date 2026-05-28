import { db, resumes } from "@repo/db";
import { desc, eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

export type CreateResumeUploadInput = {
  userId: string;
  title?: string | null;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

const titleFromFileName = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, "").trim() || "Untitled resume";

export const createResumeUpload = async (input: CreateResumeUploadInput) => {
  const [resume] = await db
    .insert(resumes)
    .values({
      userId: input.userId,
      title: input.title?.trim() || titleFromFileName(input.fileName),
      fileUrl: input.fileUrl,
      fileKey: input.fileKey,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      status: "uploaded",
      updatedAt: new Date(),
    })
    .returning();

  if (!resume) {
    throw new Error("Failed to create resume upload record");
  }

  return resume;
};

export const markResumeParsingFailed = async (
  resumeId: string,
  userId: string,
  reason: string,
) => {
  await db
    .update(resumes)
    .set({
      status: "parse_failed",
      parsingError: reason,
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));
};

export const getResumesForUser = async (userId: string) => {
  return db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: [desc(resumes.createdAt)],
  });
};

export const deleteResume = async (resumeId: string, userId: string) => {
  const [resume] = await db
    .select({ id: resumes.id, fileKey: resumes.fileKey })
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .limit(1);

  if (!resume) {
    throw new Error("Resume not found or access denied.");
  }

  // Delete file from UploadThing storage
  try {
    const utapi = new UTApi();
    await utapi.deleteFiles(resume.fileKey);
  } catch {
    // Non-fatal: log but continue with DB deletion
    console.warn("Failed to delete file from storage:", resume.fileKey);
  }

  await db
    .delete(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));
};

export type ResumeListItem = Awaited<
  ReturnType<typeof getResumesForUser>
>[number];
