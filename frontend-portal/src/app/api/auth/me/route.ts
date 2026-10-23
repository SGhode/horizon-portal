import { NextResponse } from "next/server";
import {
  AuthServiceError,
  getAuthCookieName,
  getCurrentUserForToken,
  isSecureCookie,
} from "@/lib/auth/service";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  try {
    const user = await getCurrentUserForToken(token);
    if (!user) {
      const response = NextResponse.json(
        { message: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
      response.cookies.set(getAuthCookieName(), "", {
        httpOnly: true,
        secure: isSecureCookie(),
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Unable to validate the current session." },
      { status: 500 }
    );
  }
}
