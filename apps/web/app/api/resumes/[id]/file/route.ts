import { NextRequest, NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { db, resumes } from "@repo/db";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, id), eq(resumes.userId, session.user.id)),
  });

  if (!resume) {
    return new NextResponse("Not Found or Access Denied", { status: 404 });
  }

  try {
    const response = await fetch(resume.fileUrl);
    
    if (!response.ok) {
      return new NextResponse("Failed to fetch file from storage", { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": resume.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${resume.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
