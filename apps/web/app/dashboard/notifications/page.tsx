import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GetJobNotificationsAction } from "@/modules/dashboard/server/actions";
import NotificationsClient from "./notifications-client";

export const metadata = {
  title: "Job Notifications - Rescomail",
  description: "View your job matches from the last 7 days.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const result = await GetJobNotificationsAction();

  if (result.error === "Unauthorized") {
    redirect("/login");
  }

  return (
    <NotificationsClient 
      initialJobs={result.jobs || []} 
      needsSetup={result.needsSetup} 
    />
  );
}
