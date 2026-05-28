import { auth } from "@repo/auth";
import { atsAnalyses, db } from "@repo/db";
import { atsAnalysisResponseSchema } from "@repo/validations";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: analysisId } = await params;

  try {
    const analysisRecord = await db.query.atsAnalyses.findFirst({
      where: and(
        eq(atsAnalyses.id, analysisId),
        eq(atsAnalyses.userId, session.user.id),
      ),
    });

    if (!analysisRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (analysisRecord.status === "completed") {
      const parsed = atsAnalysisResponseSchema.safeParse({
        ...(isRecord(analysisRecord.analysis) ? analysisRecord.analysis : {}),
        analysisId: analysisRecord.id,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Stored ATS analysis is invalid." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ...parsed.data,
        status: "completed",
      });
    }

    if (analysisRecord.status === "failed") {
      return NextResponse.json(
        {
          error:
            analysisRecord.error || "ATS analysis failed during processing.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        analysisId: analysisRecord.id,
        status: "processing",
      },
      { status: 202 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
