"use server";

import { auth } from "@repo/auth";
import { db, userPreferences, jobNotifications } from "@repo/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type JobNotification = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  timeAgo: string;
  url?: string | null;
  isRead: boolean;
  createdAt: Date;
};

export const GetJobNotificationsAction = async (): Promise<{
  error?: string;
  needsSetup?: boolean;
  jobs?: JobNotification[];
  unreadCount?: number;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  // Fetch the user's preferences to check if profile is set up
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  if (!prefs || (!prefs.targetRoles?.length && !prefs.targetSeniority && !prefs.preferredLocations?.length)) {
    return { needsSetup: true, jobs: [], unreadCount: 0 };
  }

  // Retrieve notifications from the last 7 days from the database
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let notifications: JobNotification[] = [];
  try {
    const dbNotifs = await db.select()
      .from(jobNotifications)
      .where(
        and(
          eq(jobNotifications.userId, session.user.id),
          gte(jobNotifications.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(jobNotifications.createdAt));

    notifications = dbNotifs.map(n => ({
      id: n.id,
      title: n.title,
      company: n.company,
      location: n.location,
      matchScore: n.matchScore,
      timeAgo: n.timeAgo,
      url: n.url,
      isRead: n.isRead,
      createdAt: n.createdAt
    }));
  } catch (dbErr) {
    console.error("[GetJobNotificationsAction] Failed to query notifications from db", dbErr);
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return { 
    jobs: notifications,
    unreadCount
  };
};

export const MarkNotificationsAsReadAction = async (): Promise<{
  success?: boolean;
  error?: string;
}> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.update(jobNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(jobNotifications.userId, session.user.id),
          eq(jobNotifications.isRead, false)
        )
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("[MarkNotificationsAsReadAction] Failed to mark notifications as read", e);
    return { error: "Failed to update notifications" };
  }
};
