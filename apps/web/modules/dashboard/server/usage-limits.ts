import { db, usageEvents } from "@repo/db";
import { and, eq, gte, sql } from "drizzle-orm";

/**
 * Free-plan credit limits per calendar month.
 * Update these when paid plans are introduced.
 */
export const FREE_PLAN_LIMITS = {
  ats_analysis: 10,
  cold_email_generate: 10,
  resume_upload: 50,
  resume_parse: 50,
  application_create: 100,
} as const;

export type UsageEventType = keyof typeof FREE_PLAN_LIMITS;

export class UsageLimitError extends Error {
  readonly statusCode = 429;

  constructor(
    public readonly eventType: UsageEventType,
    public readonly used: number,
    public readonly limit: number,
  ) {
    super(
      `Monthly limit reached: you have used ${used} of ${limit} ${eventType.replace(/_/g, " ")} credits this month.`,
    );
    this.name = "UsageLimitError";
  }
}

/**
 * Checks whether the user is within their monthly limit for a given event type.
 * Throws `UsageLimitError` (HTTP 429) if the limit is exceeded.
 *
 * Call this **before** performing the billable action.
 */
export const checkUsageLimit = async (
  userId: string,
  eventType: UsageEventType,
  limitOverride?: number,
): Promise<void> => {
  const limit = limitOverride ?? FREE_PLAN_LIMITS[eventType];

  // Start of the current calendar month in UTC.
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${usageEvents.quantity}), 0)` })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        eq(usageEvents.type, eventType),
        gte(usageEvents.createdAt, startOfMonth),
      ),
    );

  const used = Number(result?.total ?? 0);

  if (used >= limit) {
    throw new UsageLimitError(eventType, used, limit);
  }
};

/**
 * Returns the monthly usage summary for the sidebar credit display.
 */
export const getMonthlyUsageSummary = async (
  userId: string,
): Promise<{ atsUsed: number; coldEmailUsed: number }> => {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const rows = await db
    .select({
      type: usageEvents.type,
      total: sql<number>`coalesce(sum(${usageEvents.quantity}), 0)`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        gte(usageEvents.createdAt, startOfMonth),
      ),
    )
    .groupBy(usageEvents.type);

  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.type] = Number(row.total);
  }

  return {
    atsUsed: map["ats_analysis"] ?? 0,
    coldEmailUsed: map["cold_email_generate"] ?? 0,
  };
};
