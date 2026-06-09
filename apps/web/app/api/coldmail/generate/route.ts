import { NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { coldEmailGenerateSchema } from "@repo/validations";

import { ColdmailError } from "@/modules/coldmail/server/coldmail-errors";
import { generateColdEmailForUser } from "@/modules/coldmail/server/coldmail-generation";
import { UsageLimitError } from "@/modules/dashboard/server/usage-limits";
import { internalServerError } from "@/lib/server/api-errors";

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

  const payload = coldEmailGenerateSchema.safeParse(await parseRequestJson(req));

  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid cold email payload", details: payload.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const draft = await generateColdEmailForUser({
      ...payload.data,
      userId: session.user.id,
    });

    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof ColdmailError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return internalServerError(
      "Unhandled cold email generation route error",
      error,
      "Unable to generate a cold email right now.",
    );
  }
}
