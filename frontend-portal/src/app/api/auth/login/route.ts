import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AuthServiceError,
  getAuthCookieName,
  isSecureCookie,
  login,
} from "@/lib/auth/service";

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(1024),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a valid work email and password." },
      { status: 400 }
    );
  }

  try {
    const result = await login(parsed.data.email, parsed.data.password);
    const maxAge = parsed.data.rememberMe
      ? result.expiresIn
      : Math.min(result.expiresIn, 8 * 60 * 60);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(getAuthCookieName(), result.token, {
      httpOnly: true,
      secure: isSecureCookie(),
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return response;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { message: "Sign-in failed unexpectedly." },
      { status: 500 }
    );
  }
}
