import { NextResponse } from "next/server";
import {
  AuthServiceError,
  getAuthCookieName,
  isSecureCookie,
} from "./service";
import { requireCurrentUser } from "./server";
import type { AuthUser, UserRole } from "./types";

export async function authenticateRequest(
  roles?: readonly UserRole[]
): Promise<AuthUser | NextResponse> {
  try {
    return await requireCurrentUser(roles);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const response = NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
      if (error.status === 401) {
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
    throw error;
  }
}
