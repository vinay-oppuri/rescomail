import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { db, userProfile, userPreferences } from "@repo/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { logRouteError } from "@/lib/server/api-errors";

const userProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(120).optional(),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  extra_links: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        url: z.string().url(),
      })
    )
    .max(5)
    .optional(),
  last_prompted_at: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    });

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    const preferences = {
      primaryProvider: prefs?.primaryProvider || "gemini",
      hasGeminiKey: !!prefs?.geminiApiKey,
      hasGroqKey: !!prefs?.groqApiKey,
    };

    if (!profile) {
      return NextResponse.json({
        exists: false,
        is_complete: false,
        should_prompt: true,
        profile: null,
        preferences,
      });
    }

    let should_prompt = false;
    if (!profile.isComplete) {
      if (!profile.lastPromptedAt) {
        should_prompt = true;
      } else {
        const timeDiff = Date.now() - new Date(profile.lastPromptedAt).getTime();
        // 24 hours cooldown
        if (timeDiff > 24 * 60 * 60 * 1000) {
          should_prompt = true;
        }
      }
    }

    // Map database camelCase columns back to snake_case for the frontend UI components
    return NextResponse.json({
      exists: true,
      is_complete: profile.isComplete,
      should_prompt,
      preferences,
      profile: {
        id: profile.id,
        user_id: profile.userId,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        portfolio_url: profile.portfolioUrl,
        github_url: profile.githubUrl,
        linkedin_url: profile.linkedinUrl,
        extra_links: profile.extraLinks,
        is_complete: profile.isComplete,
        last_prompted_at: profile.lastPromptedAt,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
        preferences,
      },
    });
  } catch (error) {
    logRouteError("GET user-profile error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const parsed = userProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const validatedBody = parsed.data;

    // Map body keys from snake_case to camelCase
    const dataToSave: Partial<{
      fullName: string;
      email: string;
      phone: string;
      location: string;
      portfolioUrl: string;
      githubUrl: string;
      linkedinUrl: string;
      extraLinks: { label: string; url: string; }[];
      isComplete: boolean;
      lastPromptedAt: Date | null;
      updatedAt: Date;
    }> = {};

    if (validatedBody.full_name !== undefined) dataToSave.fullName = validatedBody.full_name;
    if (validatedBody.email !== undefined) dataToSave.email = validatedBody.email;
    if (validatedBody.phone !== undefined) dataToSave.phone = validatedBody.phone;
    if (validatedBody.location !== undefined) dataToSave.location = validatedBody.location;
    if (validatedBody.portfolio_url !== undefined) dataToSave.portfolioUrl = validatedBody.portfolio_url;
    if (validatedBody.github_url !== undefined) dataToSave.githubUrl = validatedBody.github_url;
    if (validatedBody.linkedin_url !== undefined) dataToSave.linkedinUrl = validatedBody.linkedin_url;
    if (validatedBody.extra_links !== undefined) dataToSave.extraLinks = validatedBody.extra_links;
    if (validatedBody.last_prompted_at !== undefined) {
      dataToSave.lastPromptedAt = validatedBody.last_prompted_at ? new Date(validatedBody.last_prompted_at) : null;
    }

    const existingProfile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    });

    // Helper function to check completeness: non-null and non-empty
    const checkField = (val: unknown) => val !== undefined && val !== null && String(val).trim() !== "";

    const mergedProfile = {
      fullName: dataToSave.fullName !== undefined ? dataToSave.fullName : existingProfile?.fullName,
      email: dataToSave.email !== undefined ? dataToSave.email : existingProfile?.email,
      phone: dataToSave.phone !== undefined ? dataToSave.phone : existingProfile?.phone,
      portfolioUrl: dataToSave.portfolioUrl !== undefined ? dataToSave.portfolioUrl : existingProfile?.portfolioUrl,
      githubUrl: dataToSave.githubUrl !== undefined ? dataToSave.githubUrl : existingProfile?.githubUrl,
      linkedinUrl: dataToSave.linkedinUrl !== undefined ? dataToSave.linkedinUrl : existingProfile?.linkedinUrl,
    };

    const isComplete =
      checkField(mergedProfile.fullName) &&
      checkField(mergedProfile.email) &&
      checkField(mergedProfile.phone) &&
      checkField(mergedProfile.portfolioUrl) &&
      checkField(mergedProfile.githubUrl) &&
      checkField(mergedProfile.linkedinUrl);

    dataToSave.isComplete = isComplete;
    dataToSave.updatedAt = new Date();

    let updatedProfile;
    if (existingProfile) {
      const results = await db
        .update(userProfile)
        .set(dataToSave)
        .where(eq(userProfile.userId, userId))
        .returning();
      updatedProfile = results[0];
    } else {
      const results = await db
        .insert(userProfile)
        .values({
          userId,
          ...dataToSave,
        })
        .returning();
      updatedProfile = results[0];
    }

    if (!updatedProfile) {
      throw new Error("Failed to save user profile");
    }

    // Map database response (camelCase keys) back to snake_case for the frontend UI
    return NextResponse.json({
      id: updatedProfile.id,
      user_id: updatedProfile.userId,
      full_name: updatedProfile.fullName,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      location: updatedProfile.location,
      portfolio_url: updatedProfile.portfolioUrl,
      github_url: updatedProfile.githubUrl,
      linkedin_url: updatedProfile.linkedinUrl,
      extra_links: updatedProfile.extraLinks,
      is_complete: updatedProfile.isComplete,
      last_prompted_at: updatedProfile.lastPromptedAt,
      created_at: updatedProfile.createdAt,
      updated_at: updatedProfile.updatedAt,
    });
  } catch (error) {
    logRouteError("POST user-profile error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
