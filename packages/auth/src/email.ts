import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@repo/env/server";

const DEFAULT_FROM_EMAIL = "Rescomail <onboarding@resend.dev>";

interface LoginOtpEmailInput {
  email: string;
  otp: string;
}

export const sendLoginOtpEmail = async ({
  email,
  otp,
}: LoginOtpEmailInput) => {
  const apiKey = serverEnv.RESEND_API_KEY;

  if (!apiKey) {
    if (serverEnv.NODE_ENV !== "production") {
      console.info(`Login code for ${email}: ${otp}`);
      return;
    }

    throw new Error("Email provider is not configured.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: serverEnv.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
    to: email,
    subject: "Your Rescomail login code",
    text: `Your Rescomail login code is ${otp}. It expires in five minutes.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><p>Your Rescomail login code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p><p style="color:#6b7280;font-size:14px">This code expires in five minutes. If you did not request it, you can ignore this email.</p></div>`,
  });

  if (error) {
    console.error("Resend login OTP delivery failed", {
      name: error.name,
      message: error.message,
    });

    throw new Error("Unable to send login code.");
  }
};
