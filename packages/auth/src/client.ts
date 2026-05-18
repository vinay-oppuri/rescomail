import { clientEnv } from "@repo/env/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signUp, useSession, signOut } = authClient;
