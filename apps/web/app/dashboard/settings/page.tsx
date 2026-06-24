import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, userPreferences, userProfile } from "@repo/db";
import { eq } from "drizzle-orm";
import SettingsClient from "../../../modules/settings/ui/components/settings-client";
import { maskSecret } from "@/lib/server/secrets";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, session.user.id),
  });

  return (
    <SettingsClient
      user={session.user}
      geminiApiKey={maskSecret(prefs?.geminiApiKey)}
      groqApiKey={maskSecret(prefs?.groqApiKey)}
      primaryProvider={prefs?.primaryProvider || "gemini"}
      profile={profile ? {
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        portfolioUrl: profile.portfolioUrl || "",
        githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        extraLinks: profile.extraLinks as { label: string; url: string }[] || [],
      } : undefined}
    />
  );
};

export default Page;
