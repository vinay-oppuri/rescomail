import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const urlWithDefault = (fallback: string) =>
  z.preprocess(emptyStringToUndefined, z.string().url().default(fallback));

const clientEnvSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_URL: urlWithDefault("http://localhost:3000"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
