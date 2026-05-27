import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getColdEmailHistoryForUser } from "@/modules/coldmail/server/coldmail-history";
import { getColdmailResumeOptions } from "@/modules/coldmail/server/coldmail-resumes";
import ColdmailView from "@/modules/coldmail/ui/views/coldmail-view";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [resumes, emails] = await Promise.all([
    getColdmailResumeOptions(session.user.id),
    getColdEmailHistoryForUser(session.user.id),
  ]);

  return <ColdmailView emails={emails} resumes={resumes} />;
};

export default Page;
