import { apiGet, apiPost } from "./client";
import type { AuthUser } from "@/lib/auth/types";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUserResponse {
  user: AuthUser;
}

export function login(payload: LoginPayload): Promise<AuthUserResponse> {
  return apiPost<AuthUserResponse>("/auth/login", payload);
}

export function getCurrentUser(): Promise<AuthUserResponse> {
  return apiGet<AuthUserResponse>("/auth/me");
}

export function logout(): Promise<void> {
  return apiPost<void>("/auth/logout");
}
