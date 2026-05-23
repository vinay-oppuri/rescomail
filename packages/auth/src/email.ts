import { serverEnv } from "@repo/env/server";

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = "Rescomail <onboarding@resend.dev>";

interface PasswordResetEmailInput {
  email: string;
  name?: string | null;
  resetUrl: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const createPasswordResetEmail = ({
  name,
  resetUrl,
}: PasswordResetEmailInput) => {
  const safeName = escapeHtml(name?.trim() || "there");
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset your Rescomail password",
    text: [
      `Hi ${name?.trim() || "there"},`,
      "",
      "Use this link to reset your Rescomail password:",
      resetUrl,
      "",
      "This link expires soon. If you did not request it, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${safeName},</p>
        <p>Use the button below to reset your Rescomail password.</p>
        <p>
          <a href="${safeResetUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 10px 16px; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          This link expires soon. If you did not request it, you can ignore this email.
        </p>
      </div>
    `,
  };
};

export const sendPasswordResetEmail = async (
  input: PasswordResetEmailInput,
) => {
  if (!serverEnv.RESEND_API_KEY) {
    if (serverEnv.NODE_ENV !== "production") {
      console.info(
        "RESEND_API_KEY is not configured. Password reset email was not sent.",
      );
      console.info("Password reset link:", input.resetUrl);
      return;
    }

    throw new Error("Password reset email provider is not configured.");
  }

  const email = createPasswordResetEmail(input);
  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: serverEnv.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL,
      to: input.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Unable to send password reset email: ${message}`);
  }

  if (serverEnv.NODE_ENV !== "production") {
    const result = (await response.json()) as { id?: string };
    console.info("Password reset email queued by Resend:", result.id);
  }
};
