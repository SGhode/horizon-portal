import { NextRequest, NextResponse } from "next/server";
import {
  AuthServiceError,
  getAuthCookieName,
  getCurrentUserForToken,
  isSecureCookie,
} from "@/lib/auth/service";
import { safeReturnTo } from "@/lib/auth/redirect";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(getAuthCookieName())?.value;

  if (pathname === "/health") {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (!token) return NextResponse.next();
    try {
      const user = await getCurrentUserForToken(token);
      if (!user) return NextResponse.next();
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      return NextResponse.next();
    }
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", safeReturnTo(`${pathname}${search}`));
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = await getCurrentUserForToken(token);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", safeReturnTo(`${pathname}${search}`));
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(getAuthCookieName(), "", {
        httpOnly: true,
        secure: isSecureCookie(),
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    if (pathname.startsWith("/users") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard?forbidden=1", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "auth-unavailable");
    const response = NextResponse.redirect(loginUrl);
    if (
      error instanceof AuthServiceError &&
      error.code === "INVALID_SESSION"
    ) {
      response.cookies.set(getAuthCookieName(), "", {
        httpOnly: true,
        secure: isSecureCookie(),
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
