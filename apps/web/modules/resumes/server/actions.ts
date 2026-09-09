"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { deleteResume, getResumesForUser, updateResumeParsedJson } from "./resumes";

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
  } catch {
    return { success: false, error: "Failed to delete resume." };
  }
};

export const getParsedResumesAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, resumes: [] };
  }

  try {
    const list = await getResumesForUser(session.user.id);
    const parsedResumes = list
      .filter((r) => r.parsedJson && typeof r.parsedJson === "object")
      .map((r) => ({
        id: r.id,
        title: r.title,
        parsedJson: r.parsedJson,
      }));
    return { success: true, resumes: parsedResumes };
  } catch (error) {
    console.error("Failed to fetch resumes from database:", error);
    return { success: false, resumes: [] };
  }
};

export const updateResumeParsedJsonAction = async (
  resumeId: string,
  parsedJson: unknown
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await updateResumeParsedJson(resumeId, session.user.id, parsedJson);
    revalidatePath("/dashboard/resumes");
    revalidatePath("/resume-editor");
    return { success: true };
  } catch (error) {
    console.error("Failed to update resume parsed json:", error);
    return { success: false, error: "Failed to update resume in database." };
  }
};

