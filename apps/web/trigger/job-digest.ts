import { logger, schedules } from "@trigger.dev/sdk/v3";
import { db, userPreferences, jobNotifications, resumes } from "@repo/db";
import { eq, desc } from "drizzle-orm";
import { serverEnv } from "@repo/env/server";

interface JobResult {
  id: string;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  apply_link?: string | null;
  posted_at?: string | null;
  source?: string | null;
  relevance_score?: number | null;
}

export const jobDigestSchedule = schedules.task({
  id: "job-digest-daily",
  cron: {
    pattern: "0 8 * * *", // Runs daily at 08:00 UTC
  },
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
        try {
          const role = pref.targetRoles?.[0] || "Software Engineer";
          const seniorityRaw = pref.targetSeniority || "";
          const seniority = seniorityRaw.replace("_", " ");
          const formattedSeniority = seniority ? seniority.charAt(0).toUpperCase() + seniority.slice(1) : "";
          const location = pref.preferredLocations?.[0]?.city || pref.preferredLocations?.[0]?.country || "Remote";

          const formattedRole = formattedSeniority ? `${formattedSeniority} ${role}` : role;

          logger.log(`Fetching job matches for user ${pref.userId}: "${formattedRole}" in "${location}"`);

          // Retrieve the user's latest parsed resume
          const userResume = await db
            .select({ parsedText: resumes.parsedText })
            .from(resumes)
            .where(eq(resumes.userId, pref.userId))
            .orderBy(desc(resumes.createdAt))
            .limit(1);

          const resumeText = userResume[0]?.parsedText || "";

          let realJobs: (typeof jobNotifications.$inferInsert)[] = [];
          try {
            const aiResponse = await fetch(`${serverEnv.AI_SERVICE_URL}/jobs/search?query=${encodeURIComponent(formattedRole)}&location=${encodeURIComponent(location)}&max_results=5`, {
              method: "GET",
              headers: {
                ...(serverEnv.AI_SERVICE_API_KEY ? { Authorization: `Bearer ${serverEnv.AI_SERVICE_API_KEY}` } : {})
              },
              cache: "no-store"
            });

            if (aiResponse.ok) {
              const data = await aiResponse.json();
              if (data.results && data.results.length > 0) {
                let scoredResults = data.results;
                if (resumeText) {
                  try {
                    const relevanceResponse = await fetch(`${serverEnv.AI_SERVICE_URL}/jobs/relevance`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(serverEnv.AI_SERVICE_API_KEY ? { Authorization: `Bearer ${serverEnv.AI_SERVICE_API_KEY}` } : {})
                      },
                      body: JSON.stringify({
                        jobs: data.results,
                        resume_text: resumeText
                      })
                    });

                    if (relevanceResponse.ok) {
                      const relevanceData = await relevanceResponse.json();
                      if (relevanceData.results) {
                        scoredResults = relevanceData.results;
                      }
                    } else {
                      logger.error(`AI Service /jobs/relevance returned status: ${relevanceResponse.status} for user ${pref.userId}`);
                    }
                  } catch (e) {
                    logger.error(`Failed to calculate relevance for user ${pref.userId}`, { error: e });
                  }
                }

                realJobs = scoredResults.map((r: JobResult, idx: number) => {
                  const relevanceScore = r.relevance_score !== undefined && r.relevance_score !== null ? r.relevance_score : null;
                  const matchScore = relevanceScore !== null
                    ? Math.round(((relevanceScore + 1.0) / 2.0) * 100)
                    : 80;

                  return {
                    id: `real_job_${r.id || idx}_${pref.userId}`,
                    userId: pref.userId,
                    title: r.title ? (r.title.length > 40 ? r.title.substring(0, 40) + "..." : r.title) : "Job Opening",
                    company: r.company || "Unknown",
                    location: r.location || location,
                    matchScore,
                    timeAgo: r.posted_at || "Recent",
                    url: r.apply_link || null,
                    isRead: false
                  };
                });
              }
            } else {
              logger.error(`AI Service /jobs/search returned status: ${aiResponse.status} for user ${pref.userId}`);
            }
          } catch (e) {
            logger.error(`Failed to fetch jobs for user ${pref.userId}`, { error: e });
          }

          if (realJobs.length > 0) {
            try {
              await db.insert(jobNotifications)
                .values(realJobs)
                .onConflictDoNothing();
              logger.log(`Saved ${realJobs.length} job notifications to db for user ${pref.userId}`);
            } catch (dbErr) {
              logger.error(`Failed to save jobs to db for user ${pref.userId}`, { error: dbErr });
            }
          }

          // Trigger email digest
          const payload = {
            user_id: pref.userId,
            email: pref.user?.email || "unknown@example.com",
            role: pref.targetRoles?.[0] || "Software Engineer",
            location: pref.preferredLocations?.[0]?.country || "Remote",
            experience_level: pref.targetSeniority || "mid",
            resume_text: resumeText, 
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
        } catch (userErr) {
          logger.error(`Failed to process job digest for user ${pref.userId}`, { error: userErr });
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    logger.log(`Daily job digest complete. Sent ${sentCount} digests.`);
    return { sentCount };
  },
});
