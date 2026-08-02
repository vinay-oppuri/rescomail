import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

import { db } from "@repo/db";
import { serverEnv } from "@repo/env/server";

import { sendLoginOtpEmail } from "./email";

const socialProviders = {
  ...(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: serverEnv.GOOGLE_CLIENT_ID,
          clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(serverEnv.GITHUB_CLIENT_ID && serverEnv.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: serverEnv.GITHUB_CLIENT_ID,
          clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/email-otp/send-verification-otp": {
        window: 60,
        max: 3,
      },
    },
  },

  socialProviders,
  plugins: [
    emailOTP({
      expiresIn: 5 * 60,
      otpLength: 6,
      allowedAttempts: 5,
      storeOTP: "hashed",
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== "sign-in") return;
        await sendLoginOtpEmail({ email, otp });
      },
    }),
  ],
});
