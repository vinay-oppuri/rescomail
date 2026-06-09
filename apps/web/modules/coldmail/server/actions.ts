"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, coldEmails } from "@repo/db";
import { and, eq } from "drizzle-orm";

export const deleteColdmailAction = async (coldEmailId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(coldEmails)
      .where(
        and(
          eq(coldEmails.id, coldEmailId),
          eq(coldEmails.userId, session.user.id)
        )
      );
    revalidatePath("/dashboard/emails");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete cold email." };
  }
};
