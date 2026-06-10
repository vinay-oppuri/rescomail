import { logger, schedules } from "@trigger.dev/sdk/v3";
import { db, userPreferences } from "@repo/db";
import { eq } from "drizzle-orm";
import { serverEnv } from "@repo/env/server";

export const jobDigestSchedule = schedules.task({
  id: "job-digest-daily",
  cron: "0 8 * * *", // Runs daily at 08:00 UTC
  run: async () => {
    logger.log("Starting daily job digest generation");

    const usersWithTargetRoles = await db.query.userPreferences.findMany({
      with: {
        user: true, // to get the email
      },
    });

    // In a real app we would check if they opted in to emails.
    const usersToProcess = usersWithTargetRoles.filter(p => p.targetRoles && p.targetRoles.length > 0);

    if (usersToProcess.length === 0) {
      logger.log("No users with target roles found for digest");
      return { sentCount: 0 };
    }

    let sentCount = 0;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000 * 5); // 5 minute timeout per job digest

    try {
      for (const pref of usersToProcess) {
        const payload = {
          user_id: pref.userId,
          email: pref.user?.email || "unknown@example.com",
          role: pref.targetRoles?.[0] || "Software Engineer",
          location: pref.preferredLocations?.[0]?.country || "Remote",
          experience_level: pref.targetSeniority || "mid",
          resume_text: "", 
        };

        const response = await fetch(`${serverEnv.AI_SERVICE_URL}/jobs/digest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Rescomail-User-Id": pref.userId,
            ...(serverEnv.AI_SERVICE_API_KEY ? { Authorization: `Bearer ${serverEnv.AI_SERVICE_API_KEY}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (response.ok) {
          const result = await response.json();
          logger.log(`Digest sent for user ${pref.userId}`, { result });
          sentCount++;
        } else {
          logger.error(`Failed to send digest for user ${pref.userId}: ${response.statusText}`);
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    logger.log(`Daily job digest complete. Sent ${sentCount} digests.`);
    return { sentCount };
  },
});
