import "server-only";
import { cookies } from "next/headers";
import {
  AuthServiceError,
  getAuthCookieName,
  getCurrentUserForToken,
} from "./service";
import type { AuthUser, UserRole } from "./types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  return token ? getCurrentUserForToken(token) : null;
}

export async function requireCurrentUser(
  roles?: readonly UserRole[]
): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthServiceError("Authentication required.", 401, "INVALID_SESSION");
  }
  if (roles && !roles.includes(user.role)) {
    throw new AuthServiceError(
      "You are not authorized to access this resource.",
      403,
      "FORBIDDEN"
    );
  }
  return user;
}
