import type { Metadata } from "next";
import { ResumeDocEditor } from "@/modules/resumes/ui/components/resume-doc-editor/resume-doc-editor";

export const metadata: Metadata = {
  title: "Resume Editor | Docs Style",
  description: "Live rich-text Google Docs-style resume editor powered by Tiptap.",
};

export default function ResumeEditorPage() {
  return <ResumeDocEditor />;
}
