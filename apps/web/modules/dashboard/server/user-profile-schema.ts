import { z } from "zod";

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
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
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
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
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
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
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL must start with https://" });
          return;
        }
        try { new URL(val); } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
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
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must start with https://" });
              return;
            }
            try { new URL(val); } catch {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format" });
            }
          }),
      })
    )
    .max(5),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
