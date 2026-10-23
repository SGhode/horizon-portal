export type UserRole = "admin" | "editor" | "viewer" | "developer";
export type UserStatus = "active" | "inactive" | "pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  department: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  limit?: number;
}
