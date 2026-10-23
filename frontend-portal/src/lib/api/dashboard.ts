import { apiGet, RequestOptions } from "./client";
import { DashboardData } from "@/lib/types/dashboard";

export async function getDashboardData(options?: RequestOptions): Promise<DashboardData> {
  return apiGet<DashboardData>("/dashboard", options);
}
