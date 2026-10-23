import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AuthServiceError,
  getAuthCookieName,
  isSecureCookie,
  revokeBackendToken,
} from "@/lib/auth/service";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const clearCookie = (response: NextResponse) => {
    response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    });
    return response;
  };

  if (token) {
    try {
    await revokeBackendToken(token);
    } catch (error) {
    if (error instanceof AuthServiceError) {
      return clearCookie(NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      ));
    }
    return clearCookie(NextResponse.json(
      {
        message:
          "The local session was cleared, but backend sign-out could not be confirmed.",
      },
      { status: 502 }
    ));
    }
  }
  return clearCookie(new NextResponse(null, { status: 204 }));
}
