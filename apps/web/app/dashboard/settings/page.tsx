import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, userPreferences } from "@repo/db";
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

  return (
    <SettingsClient
      user={session.user}
      geminiApiKey={maskSecret(prefs?.geminiApiKey)}
    />
  );
};

export default Page;
