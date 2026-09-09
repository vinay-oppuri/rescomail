import type { Metadata } from "next";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getResumesForUser } from "@/modules/resumes/server/resumes";
import { ResumeDocEditor } from "@/modules/resumes/ui/components/resume-doc-editor/resume-doc-editor";

export const metadata: Metadata = {
  title: "Resume Editor | Docs Style",
  description: "Live rich-text Google Docs-style resume editor powered by Tiptap.",
};

export default async function ResumeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let dbResumes: Array<{ id: string; title: string; parsedJson: unknown }> = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      const userResumes = await getResumesForUser(session.user.id);
      dbResumes = userResumes
        .filter((r) => r.parsedJson && typeof r.parsedJson === "object")
        .map((r) => ({
          id: r.id,
          title: r.title,
          parsedJson: r.parsedJson,
        }));
    }
  } catch (err) {
    console.error("Error fetching resumes from database:", err);
  }

  return (
    <ResumeDocEditor
      dbResumes={dbResumes}
      initialResumeId={id}
    />
  );
}
