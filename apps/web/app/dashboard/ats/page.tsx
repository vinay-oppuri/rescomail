import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAtsAnalysisHistoryForUser } from "@/modules/ats/server/ats-history";
import { getAtsResumeOptions } from "@/modules/ats/server/ats-resumes";
import AtsAnalysisView from "@/modules/ats/ui/views/ats-analysis-view";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [resumes, analyses] = await Promise.all([
    getAtsResumeOptions(session.user.id),
    getAtsAnalysisHistoryForUser(session.user.id),
  ]);

  return <AtsAnalysisView analyses={analyses} resumes={resumes} />;
};

export default Page;
