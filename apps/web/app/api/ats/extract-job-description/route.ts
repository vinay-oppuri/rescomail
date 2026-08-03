import { NextResponse } from "next/server";
import { auth } from "@repo/auth";

import {
  extractJobDescription,
  JobDescriptionFileError,
} from "@/modules/ats/server/job-description-extraction";
import { internalServerError } from "@/lib/server/api-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a PDF or Markdown file." },
        { status: 400 },
      );
    }

    const text = await extractJobDescription(file);
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof JobDescriptionFileError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return internalServerError(
      "Job description extraction failed",
      error,
      "Unable to read that job-description file.",
    );
  }
}
