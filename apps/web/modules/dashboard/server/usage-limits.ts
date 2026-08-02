import { db, usageEvents, userPreferences } from "@repo/db";
import { and, eq, gt, gte, or, sql } from "drizzle-orm";

import { hasUsableSecret } from "@/lib/server/secrets";

export const FREE_PLAN_LIMITS = {
  ats_analysis: 2,
  cold_email_generate: 2,
  resume_upload: 50,
  resume_parse: 50,
} as const;

const BYOK_LIMITS: Record<UsageEventType, number> = {
  ats_analysis: 100,
  cold_email_generate: 100,
  resume_upload: 100,
  resume_parse: 100,
};

export type UsageEventType = keyof typeof FREE_PLAN_LIMITS;

export class UsageLimitError extends Error {
  readonly statusCode = 429;

  constructor(
    public readonly eventType: UsageEventType,
    public readonly used: number,
    public readonly limit: number,
  ) {
    super(`Monthly ${eventType.replaceAll("_", " ")} limit reached (${used}/${limit}).`);
    this.name = "UsageLimitError";
  }
}

const monthStart = () => {
  const value = new Date();
  value.setUTCDate(1);
  value.setUTCHours(0, 0, 0, 0);
  return value;
};

const limitsForUser = async (userId: string) => {
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  const usesOwnKey =
    hasUsableSecret(prefs?.geminiApiKey, userId, "gemini") ||
    hasUsableSecret(prefs?.groqApiKey, userId, "groq");
  return usesOwnKey ? BYOK_LIMITS : FREE_PLAN_LIMITS;
};

/** Atomically reserves capacity before work is queued. */
export const reserveUsage = async (
  userId: string,
  eventType: UsageEventType,
  operationId: string,
) => {
  const limit = (await limitsForUser(userId))[eventType];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`${userId}:${eventType}`}))`);

    const [result] = await tx
      .select({ total: sql<number>`coalesce(sum(${usageEvents.quantity}), 0)` })
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.userId, userId),
          eq(usageEvents.type, eventType),
          gte(usageEvents.createdAt, monthStart()),
          or(
            eq(usageEvents.status, "consumed"),
            and(eq(usageEvents.status, "reserved"), gt(usageEvents.expiresAt, now)),
          ),
        ),
      );

    const used = Number(result?.total ?? 0);
    if (used >= limit) throw new UsageLimitError(eventType, used, limit);

    await tx.insert(usageEvents).values({
      userId,
      type: eventType,
      operationId,
      status: "reserved",
      expiresAt,
    });
  });
};

export const consumeUsage = async (operationId: string, metadata?: object) => {
  await db
    .update(usageEvents)
    .set({ status: "consumed", metadata, updatedAt: new Date() })
    .where(and(eq(usageEvents.operationId, operationId), eq(usageEvents.status, "reserved")));
};

export const releaseUsage = async (operationId: string) => {
  await db
    .update(usageEvents)
    .set({ status: "released", updatedAt: new Date() })
    .where(and(eq(usageEvents.operationId, operationId), eq(usageEvents.status, "reserved")));
};

export const getMonthlyUsageSummary = async (userId: string) => {
  const limits = await limitsForUser(userId);
  const rows = await db
    .select({
      type: usageEvents.type,
      total: sql<number>`coalesce(sum(${usageEvents.quantity}), 0)`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        gte(usageEvents.createdAt, monthStart()),
        or(
          eq(usageEvents.status, "consumed"),
          and(
            eq(usageEvents.status, "reserved"),
            gt(usageEvents.expiresAt, new Date()),
          ),
        ),
      ),
    )
    .groupBy(usageEvents.type);

  const totals = Object.fromEntries(rows.map((row) => [row.type, Number(row.total)]));
  return {
    atsUsed: totals.ats_analysis ?? 0,
    coldEmailUsed: totals.cold_email_generate ?? 0,
    atsLimit: limits.ats_analysis,
    coldEmailLimit: limits.cold_email_generate,
  };
};
