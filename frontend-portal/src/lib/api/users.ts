import { apiGet, RequestOptions } from "./client";
import { User, UserFilters } from "@/lib/types/user";
import { PaginatedResponse } from "@/lib/types/api";

export async function getUsers(
  filters: UserFilters = {},
  options?: RequestOptions
): Promise<PaginatedResponse<User>> {
  const params: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    search: filters.search?.trim() || undefined,
    role: filters.role && filters.role !== "all" ? filters.role : undefined,
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
  };

  return apiGet<PaginatedResponse<User>>("/users", {
    ...options,
    params,
  });
}
