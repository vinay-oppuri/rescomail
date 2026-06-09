import "server-only";

import { NextResponse } from "next/server";

export const logRouteError = (scope: string, error: unknown) => {
  console.error(scope, error);
};

export const internalServerError = (
  scope: string,
  error: unknown,
  message = "Internal Server Error",
) => {
  logRouteError(scope, error);

  return NextResponse.json({ error: message }, { status: 500 });
};
