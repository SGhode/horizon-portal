export type LeaveTypeCode = "CASUAL" | "SICK" | "EARNED" | "PARENTAL" | "UNPAID";

export interface LeaveType {
  id: string;
  code: LeaveTypeCode;
  name: string;
  description: string;
  defaultDaysPerYear: number;
  requiresApproval: boolean;
  color: string;
  isActive: boolean;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  color: string;
}

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveRequestStatus;
  appliedAt: string; // ISO timestamp
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface CreateLeaveRequestInput {
  leaveTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: "NATIONAL" | "COMPANY" | "OPTIONAL";
  description: string;
}
