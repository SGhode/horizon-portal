import { apiGet, apiPut, RequestOptions } from "./client";
import { EmployeeProfile, UpdateProfilePayload } from "@/lib/types/profile";

export async function getEmployeeProfile(
  options?: RequestOptions
): Promise<EmployeeProfile> {
  return apiGet<EmployeeProfile>("/profile", options);
}

export async function updateEmployeeProfile(
  payload: UpdateProfilePayload,
  options?: RequestOptions
): Promise<EmployeeProfile> {
  return apiPut<EmployeeProfile>("/profile", payload, options);
}
