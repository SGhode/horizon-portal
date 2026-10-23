import "server-only";
import { AuthUserSchema, type AuthUser } from "./types";

const MOCK_SESSION_SECONDS = 60 * 60;
const MOCK_EMPLOYEE_EMAIL = "shivraj.ghode@peopleportal.internal";
const MOCK_ADMIN_EMAIL = "admin.workforce@peopleportal.internal";
const MOCK_EMPLOYEE_PASSWORD = "employeePass123!";
const MOCK_ADMIN_PASSWORD = "adminEnterprise2024!";

interface LoginResult {
  token: string;
  expiresIn: number;
  user: AuthUser;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code:
      | "INVALID_CREDENTIALS"
      | "INVALID_SESSION"
      | "FORBIDDEN"
      | "AUTH_SERVICE_UNAVAILABLE"
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

const MOCK_EMPLOYEE_TOKEN = "peopleportal-development-employee-session";
const MOCK_ADMIN_TOKEN = "peopleportal-development-admin-session";

export function getAuthCookieName(): string {
  const configured = process.env.AUTH_COOKIE_NAME;
  return configured && /^[A-Za-z0-9_-]+$/.test(configured)
    ? configured
    : "peopleportal_session";
}

export function isSecureCookie(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.AUTH_COOKIE_SECURE === "true"
  );
}

function getBackendUrl(path: string): URL {
  const baseUrl = process.env.AUTH_BACKEND_URL;
  if (!baseUrl) {
    throw new AuthServiceError(
      "Authentication service is not configured.",
      503,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
  try {
    const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported authentication backend protocol.");
    }
    return url;
  } catch {
    throw new AuthServiceError(
      "Authentication service is not configured correctly.",
      503,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
}

function isDevelopmentMockEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_DEV_MOCK_ENABLED === "true"
  );
}

function asAuthUser(value: unknown): AuthUser {
  const candidate =
    value && typeof value === "object" && "user" in value
      ? (value as { user: unknown }).user
      : value;
  const parsed = AuthUserSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new AuthServiceError(
      "Authentication service returned an unsupported user profile.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
  return parsed.data;
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AuthServiceError(
      "Authentication service returned an invalid response.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
}

async function backendFetch(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(getBackendUrl(path), {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new AuthServiceError(
      "Authentication service is temporarily unavailable.",
      503,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
}

function loginWithDevelopmentMock(email: string, password: string): LoginResult {
  if (!isDevelopmentMockEnabled()) {
    throw new AuthServiceError(
      "Authentication service is not configured.",
      503,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user: AuthUser | undefined;
  if (
    normalizedEmail === MOCK_EMPLOYEE_EMAIL &&
    password === MOCK_EMPLOYEE_PASSWORD
  ) {
    user = {
      id: "emp-001",
      email: MOCK_EMPLOYEE_EMAIL,
      name: "Shivraj Ghode",
      role: "employee",
    };
  } else if (
    normalizedEmail === MOCK_ADMIN_EMAIL &&
    password === MOCK_ADMIN_PASSWORD
  ) {
    user = {
      id: "admin-001",
      email: MOCK_ADMIN_EMAIL,
      name: "Workforce Administrator",
      role: "admin",
    };
  }

  if (!user) {
    throw new AuthServiceError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const token = user.role === "admin" ? MOCK_ADMIN_TOKEN : MOCK_EMPLOYEE_TOKEN;
  return { token, expiresIn: MOCK_SESSION_SECONDS, user };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  if (isDevelopmentMockEnabled()) {
    return loginWithDevelopmentMock(email, password);
  }

  const response = await backendFetch("/auth/login", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    throw new AuthServiceError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }
  if (!response.ok) {
    throw new AuthServiceError(
      "Authentication service could not complete the sign-in request.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }

  const payload = await parseJson(response);
  if (!payload || typeof payload !== "object") {
    throw new AuthServiceError(
      "Authentication service returned an invalid response.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }

  const result = payload as Record<string, unknown>;
  if (typeof result.access_token !== "string" || result.access_token.length === 0) {
    throw new AuthServiceError(
      "Authentication service did not return a session token.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
  if (
    typeof result.expires_in !== "number" ||
    !Number.isSafeInteger(result.expires_in) ||
    result.expires_in < 1
  ) {
    throw new AuthServiceError(
      "Authentication service did not return a valid session expiration.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }

  const token = result.access_token;
  const currentUser = await getCurrentUserForToken(token);
  if (!currentUser) {
    throw new AuthServiceError(
      "Authentication service rejected the new session.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }

  return {
    token,
    expiresIn: result.expires_in,
    user: currentUser,
  };
}

export async function getCurrentUserForToken(
  token: string
): Promise<AuthUser | null> {
  if (isDevelopmentMockEnabled()) {
    if (token === MOCK_EMPLOYEE_TOKEN) {
      return {
        id: "emp-001",
        email: MOCK_EMPLOYEE_EMAIL,
        name: "Shivraj Ghode",
        role: "employee",
      };
    }
    if (token === MOCK_ADMIN_TOKEN) {
      return {
        id: "admin-001",
        email: MOCK_ADMIN_EMAIL,
        name: "Workforce Administrator",
        role: "admin",
      };
    }
    return null;
  }

  const response = await backendFetch("/auth/me", {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) {
    throw new AuthServiceError(
      "Authentication service could not validate the session.",
      503,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
  return asAuthUser(await parseJson(response));
}

export function isDevelopmentMockToken(token: string): boolean {
  return (
    isDevelopmentMockEnabled() &&
    (token === MOCK_EMPLOYEE_TOKEN || token === MOCK_ADMIN_TOKEN)
  );
}

export async function revokeBackendToken(token: string): Promise<void> {
  if (isDevelopmentMockToken(token)) {
    return;
  }

  const response = await backendFetch("/auth/logout", {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!response.ok && response.status !== 401) {
    throw new AuthServiceError(
      "The local session was cleared, but the backend could not confirm sign-out.",
      502,
      "AUTH_SERVICE_UNAVAILABLE"
    );
  }
}
