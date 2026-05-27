"use server";

import { auth } from "@repo/auth";
import { db, user, userPreferences, session as sessionTable, account as accountTable } from "@repo/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export const EditProfileActions = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.update(user).set({ name }).where(eq(user.id, session.user.id));
};

export const EditPreferenceAction = async (data: {
  targetRoles?: string[];
  targetSeniority?: "intern" | "new_grad" | "junior" | "mid" | "senior" | "lead";
  workModes?: ("remote" | "hybrid" | "onsite")[];
  employmentTypes?: ("internship" | "full_time" | "part_time" | "contract" | "freelance")[];
  preferredLocations?: { city?: string; state?: string; country?: string; remote?: boolean }[];
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const existingPrefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  if (existingPrefs) {
    await db
      .update(userPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, session.user.id));
  } else {
    await db.insert(userPreferences).values({
      id: randomUUID(),
      userId: session.user.id,
      ...data,
    });
  }
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