import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { db } from "@repo/db";
import { serverEnv } from "@repo/env/server";

import { sendPasswordResetEmail } from "./email";

const socialProviders =
  serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: serverEnv.GOOGLE_CLIENT_ID,
          clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 60 * 15,
        max: 5,
      },
    },
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: serverEnv.TURNSTILE_SECRET_KEY || "dummy-key",
    }),
  ],
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  socialProviders,
});
