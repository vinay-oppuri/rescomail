import { auth } from "@repo/auth";
import { coldEmails, db } from "@repo/db";
import { coldEmailResponseSchema } from "@repo/validations";
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

  const { id: coldEmailId } = await params;

  try {
    const emailRecord = await db.query.coldEmails.findFirst({
      where: and(
        eq(coldEmails.id, coldEmailId),
        eq(coldEmails.userId, session.user.id),
      ),
    });

    if (!emailRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (emailRecord.status === "completed") {
      const parsed = coldEmailResponseSchema.safeParse({
        ...(isRecord(emailRecord.draft) ? emailRecord.draft : {}),
        coldEmailId: emailRecord.id,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Stored cold email draft is invalid." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ...parsed.data,
        status: "completed",
      });
    }

    if (emailRecord.status === "failed") {
      return NextResponse.json(
        {
          error:
            emailRecord.error ||
            "Cold email generation failed during processing.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        coldEmailId: emailRecord.id,
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
