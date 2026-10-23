import { apiGet, RequestOptions } from "./client";
import { Project, ProjectFilters } from "@/lib/types/project";
import { ApiResponse } from "@/lib/types/api";

export async function getProjects(
  filters: ProjectFilters = {},
  options?: RequestOptions
): Promise<Project[]> {
  const params: Record<string, string | undefined> = {
    search: filters.search?.trim() || undefined,
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
    priority: filters.priority && filters.priority !== "all" ? filters.priority : undefined,
  };

  const response = await apiGet<ApiResponse<Project[]> | Project[]>("/projects", {
    ...options,
    params,
  });

  // Handle either direct array response or envelope { data: [...] }
  if (Array.isArray(response)) {
    return response;
  }
  return response.data;
}
