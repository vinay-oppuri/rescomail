"use server";

import { auth } from "@repo/auth";
import { db, user, userPreferences, session as sessionTable, account as accountTable } from "@repo/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import {
  profileNameSchema,
  settingsPreferencesSchema,
  type SettingsPreferencesInput,
} from "@repo/validations";

import { encryptSecret } from "@/lib/server/secrets";

const GEMINI_KEY_VALIDATION_TIMEOUT_MS = 10_000;

const validateGeminiApiKey = async (apiKey: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    GEMINI_KEY_VALIDATION_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models",
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
      },
    );

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export const EditProfileActions = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsedName = profileNameSchema.safeParse(name);

  if (!parsedName.success) {
    throw new Error("Enter a valid profile name.");
  }

  await db
    .update(user)
    .set({ name: parsedName.data })
    .where(eq(user.id, session.user.id));
};

export const EditPreferenceAction = async (input: SettingsPreferencesInput) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = settingsPreferencesSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid settings payload." };
  }

  const data = parsed.data;
  const geminiApiKey =
    data.geminiApiKey === null ? null : data.geminiApiKey?.trim();
  const nextData = {
    ...data,
    geminiApiKey:
      geminiApiKey === undefined
        ? undefined
        : geminiApiKey
          ? encryptSecret(geminiApiKey)
          : null,
  };

  if (geminiApiKey) {
    const isValid = await validateGeminiApiKey(geminiApiKey);

    if (!isValid) {
      return { error: "Invalid Gemini API Key. Please provide a valid key." };
    }
  }

  const existingPrefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  if (existingPrefs) {
    await db
      .update(userPreferences)
      .set({
        ...nextData,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, session.user.id));
  } else {
    await db.insert(userPreferences).values({
      id: randomUUID(),
      userId: session.user.id,
      ...nextData,
    });
  }

  return { success: true };
};

export const DelectAccountAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Delete related auth records first to prevent foreign key constraint violations
  // since `session` and `account` don't have onDelete: "cascade" configured.
  await db.delete(sessionTable).where(eq(sessionTable.userId, session.user.id));
  await db.delete(accountTable).where(eq(accountTable.userId, session.user.id));

  // Drizzle cascades should handle deleting userPreferences, resumes, etc., since they have cascade constraints
  await db.delete(user).where(eq(user.id, session.user.id));
};
