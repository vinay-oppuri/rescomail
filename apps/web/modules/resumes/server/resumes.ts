import { db, resumes } from "@repo/db";
import { desc, eq } from "drizzle-orm";

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

export const getResumesForUser = async (userId: string) => {
  return db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: [desc(resumes.createdAt)],
  });
};

export type ResumeListItem = Awaited<
  ReturnType<typeof getResumesForUser>
>[number];
