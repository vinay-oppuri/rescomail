import { z } from "zod";

export const settingsPreferencesSchema = z
  .object({
    geminiApiKey: z.string().trim().min(1).max(256).nullable().optional(),
    groqApiKey: z.string().trim().min(1).max(256).nullable().optional(),
    primaryProvider: z.enum(["gemini", "groq"]).nullable().optional(),
  })
  .strict();

export type SettingsPreferencesInput = z.infer<typeof settingsPreferencesSchema>;
