import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalNonEmptyString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().url().optional(),
);

const requiredSecret = z
  .string()
  .trim()
  .min(32, "Must be at least 32 characters.");

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_BETTER_AUTH_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
    BETTER_AUTH_SECRET: requiredSecret,
    GOOGLE_CLIENT_ID: optionalNonEmptyString,
    GOOGLE_CLIENT_SECRET: optionalNonEmptyString,
    RESEND_API_KEY: optionalNonEmptyString,
    RESEND_FROM_EMAIL: optionalNonEmptyString,
    UPLOADTHING_TOKEN: optionalNonEmptyString,
    RESUME_PARSER_WEBHOOK_URL: optionalUrl,
    RESUME_PARSER_API_KEY: optionalNonEmptyString,
    AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
    TAVILY_API_KEY: optionalNonEmptyString,
    AI_SERVICE_API_KEY: optionalNonEmptyString,
  })
  .superRefine((env, ctx) => {
    const hasGoogleId = Boolean(env.GOOGLE_CLIENT_ID);
    const hasGoogleSecret = Boolean(env.GOOGLE_CLIENT_SECRET);

    if (hasGoogleId !== hasGoogleSecret) {
      ctx.addIssue({
        code: "custom",
        path: ["GOOGLE_CLIENT_ID"],
        message:
          "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together.",
      });
    }

    if (env.RESUME_PARSER_WEBHOOK_URL && !env.RESUME_PARSER_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["RESUME_PARSER_API_KEY"],
        message:
          "RESUME_PARSER_API_KEY is required when RESUME_PARSER_WEBHOOK_URL is configured.",
      });
    }
  });

export const serverEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  RESUME_PARSER_WEBHOOK_URL: process.env.RESUME_PARSER_WEBHOOK_URL,
  RESUME_PARSER_API_KEY: process.env.RESUME_PARSER_API_KEY,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
