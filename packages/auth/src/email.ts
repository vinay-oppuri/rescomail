import { serverEnv } from "@repo/env/server";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = "Rescomail <onboarding@resend.dev>";

interface LoginOtpEmailInput {
  email: string;
  otp: string;
}

export const sendLoginOtpEmail = async ({
  email,
  otp,
}: LoginOtpEmailInput) => {
  if (!serverEnv.RESEND_API_KEY) {
    if (serverEnv.NODE_ENV !== "production") {
      console.info(`Login code for ${email}: ${otp}`);
      return;
    }

    throw new Error("Email provider is not configured.");
  }

  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: serverEnv.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: email,
      subject: "Your Rescomail login code",
      text: `Your Rescomail login code is ${otp}. It expires in five minutes.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827"><p>Your Rescomail login code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p><p style="color:#6b7280;font-size:14px">This code expires in five minutes. If you did not request it, you can ignore this email.</p></div>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to send login code.");
  }
};
