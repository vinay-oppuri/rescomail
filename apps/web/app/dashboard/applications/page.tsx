import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getApplicationsForUser, getResumeOptions } from "@/modules/applications/server/queries";
import ApplicationsView from "@/modules/applications/ui/views/applications-view";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [applications, resumes] = await Promise.all([
    getApplicationsForUser(session.user.id),
    getResumeOptions(session.user.id),
  ]);

  return (
    <ApplicationsView
      initialApplications={applications}
      resumes={resumes}
    />
  );
};

export default Page;
