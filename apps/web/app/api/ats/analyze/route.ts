import { NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { atsAnalyzeSchema } from "@repo/validations";

import { runAtsAnalysisForUser } from "@/modules/ats/server/ats-analysis";
import { AtsAnalysisError } from "@/modules/ats/server/ats-errors";

const parseRequestJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = atsAnalyzeSchema.safeParse(await parseRequestJson(req));

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid ATS payload", details: payload.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const analysis = await runAtsAnalysisForUser({
      ...payload.data,
      userId: session.user.id,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof AtsAnalysisError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown ATS analysis error",
      },
      { status: 500 },
    );
  }
}
