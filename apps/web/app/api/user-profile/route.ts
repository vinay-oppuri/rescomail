import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { db, userProfile } from "@repo/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
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

    if (!profile) {
      return NextResponse.json({
        exists: false,
        is_complete: false,
        should_prompt: true,
        profile: null,
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
      },
    });
  } catch (error) {
    console.error("GET user-profile error:", error);
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

    // Map body keys from snake_case to camelCase
    const dataToSave: any = {};
    if (body.full_name !== undefined) dataToSave.fullName = body.full_name;
    if (body.email !== undefined) dataToSave.email = body.email;
    if (body.phone !== undefined) dataToSave.phone = body.phone;
    if (body.location !== undefined) dataToSave.location = body.location;
    if (body.portfolio_url !== undefined) dataToSave.portfolioUrl = body.portfolio_url;
    if (body.github_url !== undefined) dataToSave.githubUrl = body.github_url;
    if (body.linkedin_url !== undefined) dataToSave.linkedinUrl = body.linkedin_url;
    if (body.extra_links !== undefined) dataToSave.extraLinks = body.extra_links;
    if (body.last_prompted_at !== undefined) {
      dataToSave.lastPromptedAt = body.last_prompted_at ? new Date(body.last_prompted_at) : null;
    }

    const existingProfile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    });

    // Helper function to check completeness: non-null and non-empty
    const checkField = (val: any) => val !== undefined && val !== null && String(val).trim() !== "";

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
    console.error("POST user-profile error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
