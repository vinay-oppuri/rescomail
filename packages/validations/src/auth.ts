import { z } from "zod";

export const emailOtpRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const emailOtpVerifySchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit code."),
});

export type EmailOtpRequestInput = z.infer<typeof emailOtpRequestSchema>;
export type EmailOtpVerifyInput = z.infer<typeof emailOtpVerifySchema>;
