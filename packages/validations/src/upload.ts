import { z } from "zod";

export const resumeUploadSchema = z.object({
  title: z.string().trim().max(120).optional(),
});

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
