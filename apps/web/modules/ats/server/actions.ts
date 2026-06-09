"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, atsAnalyses } from "@repo/db";
import { and, eq } from "drizzle-orm";

export const deleteAtsAnalysisAction = async (analysisId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(atsAnalyses)
      .where(
        and(
          eq(atsAnalyses.id, analysisId),
          eq(atsAnalyses.userId, session.user.id)
        )
      );
    revalidatePath("/dashboard/ats");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete ATS analysis." };
  }
};
