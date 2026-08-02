import { getSessionCookie } from "@repo/auth/next";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  // API handlers perform their own session validation and must never be
  // redirected by Proxy. Only dashboard pages use this optimistic cookie check.
  matcher: ["/dashboard/:path*"],
};
