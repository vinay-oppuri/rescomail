"use server";

import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db, applications } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { serverEnv } from "@repo/env/server";

export const createApplicationAction = async (data: {
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  stage?: "saved" | "applied" | "phone_screen" | "interview" | "offer" | "rejected";
  notes?: string;
  resumeId?: string;
  appliedAt?: string;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const parsedAppliedAt = data.appliedAt ? new Date(data.appliedAt) : null;
    const parsedResumeId = data.resumeId && data.resumeId !== "none" ? data.resumeId : null;

    const [newApp] = await db
      .insert(applications)
      .values({
        userId: session.user.id,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobUrl: data.jobUrl || null,
        stage: data.stage || "saved",
        notes: data.notes || null,
        resumeId: parsedResumeId,
        appliedAt: parsedAppliedAt,
      })
      .returning();

    revalidatePath("/dashboard/applications");
    return { success: true, data: newApp };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create application.";
    return { success: false, error: message };
  }
};

export const updateApplicationAction = async (
  id: string,
  data: {
    jobTitle?: string;
    companyName?: string;
    jobUrl?: string;
    stage?: "saved" | "applied" | "phone_screen" | "interview" | "offer" | "rejected";
    notes?: string;
    resumeId?: string;
    appliedAt?: string;
  }
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: Record<string, any> = {};
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.jobUrl !== undefined) updateData.jobUrl = data.jobUrl || null;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.resumeId !== undefined) {
      updateData.resumeId = data.resumeId && data.resumeId !== "none" ? data.resumeId : null;
    }
    if (data.appliedAt !== undefined) {
      updateData.appliedAt = data.appliedAt ? new Date(data.appliedAt) : null;
    }

    updateData.updatedAt = new Date();

    await db
      .update(applications)
      .set(updateData)
      .where(and(eq(applications.id, id), eq(applications.userId, session.user.id)));

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update application.";
    return { success: false, error: message };
  }
};

export const deleteApplicationAction = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, session.user.id)));

    revalidatePath("/dashboard/applications");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete application.";
    return { success: false, error: message };
  }
};

export const searchJobsAction = async (query: string, location: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const url = new URL(`${serverEnv.AI_SERVICE_URL}/jobs/search`);
    url.searchParams.append("query", query);
    url.searchParams.append("location", location);

    const headersObj: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (serverEnv.AI_SERVICE_API_KEY) {
      headersObj.Authorization = `Bearer ${serverEnv.AI_SERVICE_API_KEY}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: headersObj,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `AI Search failed: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, results: data.results || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job search query failed.";
    return { success: false, error: message };
  }
};

export const getApplicationsAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { getApplicationsForUser } = await import("./queries");
    const data = await getApplicationsForUser(session.user.id);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch applications.";
    return { success: false, error: message };
  }
};
