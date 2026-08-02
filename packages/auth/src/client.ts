import { clientEnv } from "@repo/env/client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [emailOTPClient()],
});

export const {
  emailOtp,
  signIn,
  useSession,
  signOut,
  updateUser,
} = authClient;
