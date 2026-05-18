import { z } from "zod";

export const resumeParserWebhookSchema = z.object({
  resumeId: z.string().uuid(),
  userId: z.string().min(1),
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.literal("application/pdf"),
});

export type ResumeParserWebhookInput = z.infer<
  typeof resumeParserWebhookSchema
>;
