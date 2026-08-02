import { handlers } from "@repo/auth/next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthMethod = keyof typeof handlers;

const describeError = (error: unknown, depth = 0): unknown => {
  if (!(error instanceof Error) || depth > 2) {
    return String(error);
  }

  const detailedError = error as Error & {
    code?: unknown;
    errors?: unknown[];
  };

  return {
    name: error.name,
    message: error.message,
    code: detailedError.code,
    cause: error.cause ? describeError(error.cause, depth + 1) : undefined,
    errors: detailedError.errors?.map((nestedError) =>
      describeError(nestedError, depth + 1),
    ),
  };
};

const handleAuthRequest = (method: AuthMethod) => async (request: Request) => {
  try {
    return await handlers[method](request);
  } catch (error) {
    console.error(`Better Auth ${method} request failed`, error);

    return Response.json(
      {
        error: "Authentication request failed.",
        ...(process.env.NODE_ENV === "development"
          ? { detail: describeError(error) }
          : {}),
      },
      { status: 500 },
    );
  }
};

export const GET = handleAuthRequest("GET");
export const POST = handleAuthRequest("POST");
export const PATCH = handleAuthRequest("PATCH");
export const PUT = handleAuthRequest("PUT");
export const DELETE = handleAuthRequest("DELETE");
