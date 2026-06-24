import { z } from "zod";

export const profileNameSchema = z.string().trim().min(1).max(120);

const preferredLocationSchema = z
  .object({
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
    country: z.string().trim().max(120).optional(),
    remote: z.boolean().optional(),
  })
  .strict();

export const settingsPreferencesSchema = z
  .object({
    targetRoles: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
    targetSeniority: z
      .enum(["intern", "new_grad", "junior", "mid", "senior", "lead"])
      .optional(),
    workModes: z.array(z.enum(["remote", "hybrid", "onsite"])).max(3).optional(),
    employmentTypes: z
      .array(
        z.enum([
          "internship",
          "full_time",
          "part_time",
          "contract",
          "freelance",
        ]),
      )
      .max(5)
      .optional(),
    preferredLocations: z.array(preferredLocationSchema).max(20).optional(),
    geminiApiKey: z.string().trim().min(1).max(256).nullable().optional(),
    groqApiKey: z.string().trim().min(1).max(256).nullable().optional(),
    primaryProvider: z.enum(["gemini", "groq"]).nullable().optional(),
  })
  .strict();

export type SettingsPreferencesInput = z.infer<typeof settingsPreferencesSchema>;
