"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { deleteResume } from "./resumes";

export const deleteResumeAction = async (resumeId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteResume(resumeId, session.user.id);
    revalidatePath("/dashboard/resumes");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete resume.";
    return { success: false, error: message };
  }
};
