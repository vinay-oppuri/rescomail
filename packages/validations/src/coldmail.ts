import { z } from "zod";

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => value ?? "");

const companyWebsiteUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.string().trim().url("Enter a valid company website URL.").max(500));

export const coldEmailToneSchema = z.enum([
  "warm",
  "confident",
  "direct",
  "friendly",
]);

export const coldEmailLengthSchema = z.enum([
  "concise",
  "standard",
  "detailed",
]);

export const coldEmailCallToActionSchema = z.enum([
  "conversation",
  "referral",
  "interview",
  "feedback",
]);

export const coldEmailGenerateSchema = z.object({
  resumeId: z.string().uuid(),
  jobTitle: optionalTrimmedString(200),
  companyName: optionalTrimmedString(200),
  companyWebsiteUrl: companyWebsiteUrlSchema,
  recipientName: optionalTrimmedString(120),
  recipientRole: optionalTrimmedString(160),
  jobDescription: z.string().trim().min(20).max(100_000),
  personalNote: optionalTrimmedString(1_000),
  tone: coldEmailToneSchema.default("warm"),
  length: coldEmailLengthSchema.default("standard"),
  callToAction: coldEmailCallToActionSchema.default("conversation"),
});

export const coldEmailResponseSchema = z.object({
  coldEmailId: z.string().uuid().optional(),
  resumeId: z.string().nullable().optional(),
  subject: z.string().trim().min(1).max(160),
  previewText: z.string().trim().min(1).max(240),
  body: z.string().trim().min(20).max(8_000),
  followUpSubject: z.string().trim().min(1).max(160),
  followUpBody: z.string().trim().min(20).max(8_000),
  personalizationNotes: z.array(z.string().trim().min(1).max(300)).max(6),
  qualityScore: z.number().int().min(0).max(100),
  estimatedReadTimeSeconds: z.number().int().min(10).max(300),
  companyContext: z.string().optional(),
});

export type ColdEmailGenerateInput = z.infer<typeof coldEmailGenerateSchema>;
export type ColdEmailResponse = z.infer<typeof coldEmailResponseSchema>;
export type ColdEmailTone = z.infer<typeof coldEmailToneSchema>;
export type ColdEmailLength = z.infer<typeof coldEmailLengthSchema>;
export type ColdEmailCallToAction = z.infer<
  typeof coldEmailCallToActionSchema
>;
