import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalNonEmptyString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url().optional(),
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
    DATA_ENCRYPTION_KEY: requiredSecret.optional(),
    GOOGLE_CLIENT_ID: optionalNonEmptyString,
    GOOGLE_CLIENT_SECRET: optionalNonEmptyString,
    RESEND_API_KEY: optionalNonEmptyString,
    RESEND_FROM_EMAIL: optionalNonEmptyString,
    UPLOADTHING_TOKEN: optionalNonEmptyString,
    AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
    AI_SERVICE_GRPC_URL: optionalUrl,
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

    const skipValidation =
      process.env.SKIP_ENV_VALIDATION === "1" ||
      process.env.SKIP_ENV_VALIDATION === "true";

    if (env.NODE_ENV === "production" && !skipValidation) {
      const publicUrls = [
        ["BETTER_AUTH_URL", env.BETTER_AUTH_URL],
        ["NEXT_PUBLIC_BETTER_AUTH_URL", env.NEXT_PUBLIC_BETTER_AUTH_URL],
      ] as const;

      for (const [key, value] of publicUrls) {
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value)) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} must not point to localhost in production.`,
          });
        }

        if (!value.startsWith("https://")) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} must use HTTPS in production.`,
          });
        }
      }

      if (!env.AI_SERVICE_API_KEY) {
        ctx.addIssue({
          code: "custom",
          path: ["AI_SERVICE_API_KEY"],
          message: "AI_SERVICE_API_KEY is required in production.",
        });
      }

      if (!env.DATA_ENCRYPTION_KEY) {
        ctx.addIssue({
          code: "custom",
          path: ["DATA_ENCRYPTION_KEY"],
          message: "DATA_ENCRYPTION_KEY is required in production.",
        });
      }

      if (!env.AI_SERVICE_URL.startsWith("https://")) {
        ctx.addIssue({
          code: "custom",
          path: ["AI_SERVICE_URL"],
          message: "AI_SERVICE_URL must use HTTPS in production.",
        });
      }

      if (env.BETTER_AUTH_URL !== env.NEXT_PUBLIC_BETTER_AUTH_URL) {
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_BETTER_AUTH_URL"],
          message:
            "NEXT_PUBLIC_BETTER_AUTH_URL must match BETTER_AUTH_URL in production.",
        });
      }
    }
  });

export const serverEnv = serverEnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  AI_SERVICE_GRPC_URL: process.env.AI_SERVICE_GRPC_URL,
  TAVILY_API_KEY: process.env.TAVILY_API_KEY,
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
