import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getResumesForUser } from "@/modules/resumes/server/resumes";
import ResumesView from "@/modules/resumes/ui/views/resumes-view";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resumes = await getResumesForUser(session.user.id);

  return <ResumesView resumes={resumes} />;
};

export default Page;
