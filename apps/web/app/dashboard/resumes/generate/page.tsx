import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getResumesForUser } from "@/modules/resumes/server/resumes";
import ResumeGeneratorView from "@/modules/resumes/ui/views/resume-generator-view";

const Page = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");

  const resumes = await getResumesForUser(session.user.id);
  const parsedResumes = resumes
    .filter((resume) => resume.parsedJson && typeof resume.parsedJson === "object")
    .map((resume) => ({ id: resume.id, title: resume.title, parsedJson: resume.parsedJson }));

  return <ResumeGeneratorView sourceResumes={parsedResumes} />;
};

export default Page;
