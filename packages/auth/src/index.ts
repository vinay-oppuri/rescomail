import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const isBuild = process.env.npm_lifecycle_event === "build";
const secret =
    process.env.BETTER_AUTH_SECRET ??
    (process.env.NODE_ENV === "production" && !isBuild
        ? undefined
        : "rescomail-local-development-secret");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const socialProviders =
    googleClientId && googleClientSecret
        ? {
              google: {
                  clientId: googleClientId,
                  clientSecret: googleClientSecret,
              },
        }
        : undefined;

if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required in production.");
}

export const auth = betterAuth({
    baseURL,
    secret,
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    ...(socialProviders ? { socialProviders } : {}),
});
