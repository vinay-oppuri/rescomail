import { z } from "zod";

const nullableOptionalText = (maxLength: number) =>
  z
    .union([z.string().trim().max(maxLength), z.null()])
    .optional()
    .transform((value) => (value === null ? "" : value));

const nullableOptionalUrl = z
  .union([z.string().trim().url(), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === null ? "" : value));

export const userProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: nullableOptionalText(30),
  location: nullableOptionalText(120),
  portfolio_url: nullableOptionalUrl,
  github_url: nullableOptionalUrl,
  linkedin_url: nullableOptionalUrl,
  extra_links: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        url: z.string().trim().url(),
      }),
    )
    .max(5)
    .optional(),
  last_prompted_at: z.string().datetime().nullable().optional(),
});

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        const phoneRegex = /^[0-9+\s\-()]+$/;
        if (!phoneRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Only digits, spaces, dashes, parentheses and + allowed",
          });
        }
      }
    }),
  location: z.string().trim().optional(),
  portfolioUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL must start with https://",
          });
          return;
        }
        try {
          new URL(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid URL format",
          });
        }
      }
    }),
  githubUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL must start with https://",
          });
          return;
        }
        try {
          new URL(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid URL format",
          });
        }
      }
    }),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val) {
        if (!val.startsWith("https://")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL must start with https://",
          });
          return;
        }
        try {
          new URL(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid URL format",
          });
        }
      }
    }),
  extraLinks: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Label is required"),
        url: z
          .string()
          .trim()
          .min(1, "URL is required")
          .superRefine((val, ctx) => {
            if (!val.startsWith("https://")) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must start with https://",
              });
              return;
            }
            try {
              new URL(val);
            } catch {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid URL format",
              });
            }
          }),
      }),
    )
    .max(5),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
