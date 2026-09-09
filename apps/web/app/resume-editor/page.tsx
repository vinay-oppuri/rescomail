import { redirect } from "next/navigation";

export default async function ResumeEditorRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  redirect(id ? `/dashboard/editor?id=${id}` : "/dashboard/editor");
}
