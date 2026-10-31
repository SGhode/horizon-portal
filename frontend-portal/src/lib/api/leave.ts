import { apiGet, apiPost, RequestOptions } from "./client";
import {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  CreateLeaveRequestInput,
} from "@/lib/types/leave";
import { MonthlyAttendance } from "@/lib/types/attendance";

export async function getLeaveTypes(options?: RequestOptions): Promise<LeaveType[]> {
  return apiGet<LeaveType[]>("/leave/types", options);
}

export async function getLeaveBalances(
  year?: number,
  options?: RequestOptions
): Promise<LeaveBalance[]> {
  return apiGet<LeaveBalance[]>("/leave/balances", {
    ...options,
    params: { ...(options?.params || {}), ...(year ? { year } : {}) },
  });
}

export async function getLeaveRequests(
  options?: RequestOptions
): Promise<LeaveRequest[]> {
  return apiGet<LeaveRequest[]>("/leave/requests", options);
}

export interface CreateLeaveRequestResponse {
  message: string;
  request: LeaveRequest;
  balance: LeaveBalance;
}

export async function createLeaveRequest(
  input: CreateLeaveRequestInput,
  options?: RequestOptions
): Promise<CreateLeaveRequestResponse> {
  return apiPost<CreateLeaveRequestResponse>("/leave/requests", input, options);
}

export async function getHolidays(
  year?: number,
  options?: RequestOptions
): Promise<Holiday[]> {
  return apiGet<Holiday[]>("/holidays", {
    ...options,
    params: { ...(options?.params || {}), ...(year ? { year } : {}) },
  });
}

export async function getLatestMonthlyAttendance(
  options?: RequestOptions
): Promise<MonthlyAttendance> {
  return apiGet<MonthlyAttendance>("/attendance/monthly", options);
}
