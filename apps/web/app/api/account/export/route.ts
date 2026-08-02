import { auth } from "@repo/auth";
import { atsAnalyses, coldEmails, db, resumes, userPreferences, userProfile } from "@repo/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const [profile, preferences, resumeRows, analysisRows, emailRows] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, userId) }),
    db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) }),
    db.select().from(resumes).where(eq(resumes.userId, userId)),
    db.select().from(atsAnalyses).where(eq(atsAnalyses.userId, userId)),
    db.select().from(coldEmails).where(eq(coldEmails.userId, userId)),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    account: session.user,
    profile: profile ?? null,
    preferences: preferences
      ? {
          primaryProvider: preferences.primaryProvider,
          hasGeminiApiKey: Boolean(preferences.geminiApiKey),
          hasGroqApiKey: Boolean(preferences.groqApiKey),
          createdAt: preferences.createdAt,
          updatedAt: preferences.updatedAt,
        }
      : null,
    resumes: resumeRows,
    atsAnalyses: analysisRows,
    coldEmails: emailRows,
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="rescomail-data-export.json"',
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
