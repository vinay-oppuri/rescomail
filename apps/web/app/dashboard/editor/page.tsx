import type { Metadata } from "next";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getResumesForUser } from "@/modules/resumes/server/resumes";
import { ResumeDocEditor } from "@/modules/resumes/ui/components/resume-doc-editor/resume-doc-editor";

export const metadata: Metadata = {
  title: "Resume Editor | Rescomail",
  description: "Live rich-text Google Docs-style resume editor powered by Tiptap.",
};

export default async function DashboardEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userResumes = await getResumesForUser(session.user.id);
  const dbResumes = userResumes
    .filter((r) => r.parsedJson && typeof r.parsedJson === "object")
    .map((r) => ({
      id: r.id,
      title: r.title,
      parsedJson: r.parsedJson,
    }));

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <ResumeDocEditor
        dbResumes={dbResumes}
        initialResumeId={id}
      />
    </div>
  );
}
