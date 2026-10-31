import {
  type LeaveType,
  type LeaveBalance,
  type LeaveRequest,
  type Holiday,
  type CreateLeaveRequestInput,
} from "@/lib/types/leave";
import type { MonthlyAttendance } from "@/lib/types/attendance";

// ---------------------------------------------------------------------------
// Initial Seed Data
// ---------------------------------------------------------------------------

const INITIAL_LEAVE_TYPES: LeaveType[] = [
  {
    id: "lt-casual",
    code: "CASUAL",
    name: "Casual Leave",
    description: "Short personal leave for personal emergencies or events.",
    defaultDaysPerYear: 12,
    requiresApproval: true,
    color: "#3b82f6", // Blue
    isActive: true,
  },
  {
    id: "lt-sick",
    code: "SICK",
    name: "Sick Leave",
    description: "Paid time off for medical illness, recovery, or healthcare appointments.",
    defaultDaysPerYear: 10,
    requiresApproval: true,
    color: "#10b981", // Emerald
    isActive: true,
  },
  {
    id: "lt-earned",
    code: "EARNED",
    name: "Earned / Annual Leave",
    description: "Accrued vacation time for planned holidays and extended rest.",
    defaultDaysPerYear: 15,
    requiresApproval: true,
    color: "#8b5cf6", // Purple
    isActive: true,
  },
  {
    id: "lt-parental",
    code: "PARENTAL",
    name: "Parental Leave",
    description: "Paid leave following the birth, adoption, or foster placement of a child.",
    defaultDaysPerYear: 30,
    requiresApproval: true,
    color: "#f59e0b", // Amber
    isActive: true,
  },
  {
    id: "lt-unpaid",
    code: "UNPAID",
    name: "Leave Without Pay",
    description: "Unpaid leave taken when standard paid allowances are exhausted.",
    defaultDaysPerYear: 0,
    requiresApproval: true,
    color: "#64748b", // Slate
    isActive: true,
  },
];

const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  // emp-001 (Shivraj Ghode)
  {
    id: "lb-001-casual",
    employeeId: "emp-001",
    leaveTypeId: "lt-casual",
    leaveTypeCode: "CASUAL",
    leaveTypeName: "Casual Leave",
    year: 2026,
    allocatedDays: 12,
    usedDays: 3,
    pendingDays: 1,
    availableDays: 8,
    color: "#3b82f6",
  },
  {
    id: "lb-001-sick",
    employeeId: "emp-001",
    leaveTypeId: "lt-sick",
    leaveTypeCode: "SICK",
    leaveTypeName: "Sick Leave",
    year: 2026,
    allocatedDays: 10,
    usedDays: 2,
    pendingDays: 0,
    availableDays: 8,
    color: "#10b981",
  },
  {
    id: "lb-001-earned",
    employeeId: "emp-001",
    leaveTypeId: "lt-earned",
    leaveTypeCode: "EARNED",
    leaveTypeName: "Earned / Annual Leave",
    year: 2026,
    allocatedDays: 15,
    usedDays: 5,
    pendingDays: 0,
    availableDays: 10,
    color: "#8b5cf6",
  },
  {
    id: "lb-001-parental",
    employeeId: "emp-001",
    leaveTypeId: "lt-parental",
    leaveTypeCode: "PARENTAL",
    leaveTypeName: "Parental Leave",
    year: 2026,
    allocatedDays: 30,
    usedDays: 0,
    pendingDays: 0,
    availableDays: 30,
    color: "#f59e0b",
  },

  // emp-002 (Marcus Vance - Isolation benchmark)
  {
    id: "lb-002-casual",
    employeeId: "emp-002",
    leaveTypeId: "lt-casual",
    leaveTypeCode: "CASUAL",
    leaveTypeName: "Casual Leave",
    year: 2026,
    allocatedDays: 12,
    usedDays: 1,
    pendingDays: 0,
    availableDays: 11,
    color: "#3b82f6",
  },
  {
    id: "lb-002-sick",
    employeeId: "emp-002",
    leaveTypeId: "lt-sick",
    leaveTypeCode: "SICK",
    leaveTypeName: "Sick Leave",
    year: 2026,
    allocatedDays: 10,
    usedDays: 0,
    pendingDays: 0,
    availableDays: 10,
    color: "#10b981",
  },
  {
    id: "lb-002-earned",
    employeeId: "emp-002",
    leaveTypeId: "lt-earned",
    leaveTypeCode: "EARNED",
    leaveTypeName: "Earned / Annual Leave",
    year: 2026,
    allocatedDays: 15,
    usedDays: 2,
    pendingDays: 0,
    availableDays: 13,
    color: "#8b5cf6",
  },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  // emp-001 requests
  {
    id: "lr-101",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    leaveTypeId: "lt-casual",
    leaveTypeCode: "CASUAL",
    leaveTypeName: "Casual Leave",
    startDate: "2026-10-14",
    endDate: "2026-10-15",
    daysCount: 2,
    reason: "Attending family wedding and travel",
    status: "APPROVED",
    appliedAt: "2026-10-02T09:30:00Z",
    reviewedAt: "2026-10-03T11:00:00Z",
    reviewedBy: "Marcus Vance",
    rejectionReason: null,
  },
  {
    id: "lr-102",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    leaveTypeId: "lt-sick",
    leaveTypeCode: "SICK",
    leaveTypeName: "Sick Leave",
    startDate: "2026-09-17",
    endDate: "2026-09-18",
    daysCount: 2,
    reason: "Severe viral fever and physician consultation",
    status: "APPROVED",
    appliedAt: "2026-09-17T07:45:00Z",
    reviewedAt: "2026-09-17T09:00:00Z",
    reviewedBy: "Marcus Vance",
    rejectionReason: null,
  },
  {
    id: "lr-103",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    leaveTypeId: "lt-casual",
    leaveTypeCode: "CASUAL",
    leaveTypeName: "Casual Leave",
    startDate: "2026-11-20",
    endDate: "2026-11-20",
    daysCount: 1,
    reason: "Dental procedure appointment",
    status: "PENDING",
    appliedAt: "2026-10-25T14:20:00Z",
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  },
  {
    id: "lr-104",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    leaveTypeId: "lt-earned",
    leaveTypeCode: "EARNED",
    leaveTypeName: "Earned / Annual Leave",
    startDate: "2026-08-03",
    endDate: "2026-08-07",
    daysCount: 5,
    reason: "Summer family road trip",
    status: "APPROVED",
    appliedAt: "2026-07-15T10:00:00Z",
    reviewedAt: "2026-07-16T14:30:00Z",
    reviewedBy: "Marcus Vance",
    rejectionReason: null,
  },
  {
    id: "lr-105",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    leaveTypeId: "lt-earned",
    leaveTypeCode: "EARNED",
    leaveTypeName: "Earned / Annual Leave",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    daysCount: 3,
    reason: "Long holiday weekend getaway",
    status: "REJECTED",
    appliedAt: "2026-06-20T16:00:00Z",
    reviewedAt: "2026-06-22T09:15:00Z",
    reviewedBy: "Marcus Vance",
    rejectionReason: "Critical sprint delivery milestone and client demo scheduled.",
  },

  // emp-002 request
  {
    id: "lr-201",
    employeeId: "emp-002",
    employeeName: "Marcus Vance",
    leaveTypeId: "lt-casual",
    leaveTypeCode: "CASUAL",
    leaveTypeName: "Casual Leave",
    startDate: "2026-10-09",
    endDate: "2026-10-09",
    daysCount: 1,
    reason: "Personal day",
    status: "APPROVED",
    appliedAt: "2026-10-01T08:00:00Z",
    reviewedAt: "2026-10-01T08:30:00Z",
    reviewedBy: "Elena Rostova",
    rejectionReason: null,
  },
];

const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: "hol-01",
    name: "New Year's Day",
    date: "2026-01-01",
    type: "NATIONAL",
    description: "Federal holiday celebrating the start of the Gregorian new year.",
  },
  {
    id: "hol-02",
    name: "Martin Luther King Jr. Day",
    date: "2026-01-19",
    type: "NATIONAL",
    description: "Commemorating the life and legacy of Dr. Martin Luther King Jr.",
  },
  {
    id: "hol-03",
    name: "Presidents' Day",
    date: "2026-02-16",
    type: "NATIONAL",
    description: "Honoring Washington and Lincoln and all American presidents.",
  },
  {
    id: "hol-04",
    name: "Memorial Day",
    date: "2026-05-25",
    type: "NATIONAL",
    description: "Honoring military personnel who died in service to their country.",
  },
  {
    id: "hol-05",
    name: "Juneteenth National Independence Day",
    date: "2026-06-19",
    type: "NATIONAL",
    description: "Commemorating the emancipation of enslaved African Americans.",
  },
  {
    id: "hol-06",
    name: "Independence Day",
    date: "2026-07-03",
    type: "NATIONAL",
    description: "Celebration of the Declaration of Independence (Observed).",
  },
  {
    id: "hol-07",
    name: "Labor Day",
    date: "2026-09-07",
    type: "NATIONAL",
    description: "Honoring the American labor movement and contributions of workers.",
  },
  {
    id: "hol-08",
    name: "Indigenous Peoples' Day",
    date: "2026-10-12",
    type: "NATIONAL",
    description: "Recognizing and celebrating Indigenous cultures and history.",
  },
  {
    id: "hol-09",
    name: "Veterans Day",
    date: "2026-11-11",
    type: "NATIONAL",
    description: "Honoring all military veterans who served in the armed forces.",
  },
  {
    id: "hol-10",
    name: "Thanksgiving Day",
    date: "2026-11-26",
    type: "NATIONAL",
    description: "Annual day of giving thanks and gathering with family.",
  },
  {
    id: "hol-11",
    name: "Day After Thanksgiving",
    date: "2026-11-27",
    type: "COMPANY",
    description: "Company-sponsored paid holiday extension.",
  },
  {
    id: "hol-12",
    name: "Christmas Day",
    date: "2026-12-25",
    type: "NATIONAL",
    description: "Celebration of Christmas Day.",
  },
];

const INITIAL_MONTHLY_ATTENDANCE: MonthlyAttendance[] = [
  // emp-001 (Shivraj Ghode)
  {
    id: "att-001-2026-10",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    month: "2026-10",
    year: 2026,
    totalWorkingDays: 22,
    presentDays: 19,
    absentDays: 0,
    lateArrivals: 1,
    halfDays: 1,
    onLeaveDays: 2,
    attendancePercentage: 93.18,
    lastUpdated: "2026-10-31T18:00:00Z",
  },
  {
    id: "att-001-2026-09",
    employeeId: "emp-001",
    employeeName: "Shivraj Ghode",
    month: "2026-09",
    year: 2026,
    totalWorkingDays: 21,
    presentDays: 19,
    absentDays: 0,
    lateArrivals: 2,
    halfDays: 0,
    onLeaveDays: 2,
    attendancePercentage: 95.24,
    lastUpdated: "2026-09-30T18:00:00Z",
  },

  // emp-002 (Marcus Vance - Isolation benchmark)
  {
    id: "att-002-2026-10",
    employeeId: "emp-002",
    employeeName: "Marcus Vance",
    month: "2026-10",
    year: 2026,
    totalWorkingDays: 22,
    presentDays: 21,
    absentDays: 0,
    lateArrivals: 0,
    halfDays: 0,
    onLeaveDays: 1,
    attendancePercentage: 97.73,
    lastUpdated: "2026-10-31T18:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// In-Memory Mutex & Data Store
// ---------------------------------------------------------------------------

let leaveTypesState = structuredClone(INITIAL_LEAVE_TYPES);
let leaveBalancesState = structuredClone(INITIAL_LEAVE_BALANCES);
let leaveRequestsState = structuredClone(INITIAL_LEAVE_REQUESTS);
let holidaysState = structuredClone(INITIAL_HOLIDAYS);
let monthlyAttendanceState = structuredClone(INITIAL_MONTHLY_ATTENDANCE);

export function resetLeaveDatabase(): void {
  leaveTypesState = structuredClone(INITIAL_LEAVE_TYPES);
  leaveBalancesState = structuredClone(INITIAL_LEAVE_BALANCES);
  leaveRequestsState = structuredClone(INITIAL_LEAVE_REQUESTS);
  holidaysState = structuredClone(INITIAL_HOLIDAYS);
  monthlyAttendanceState = structuredClone(INITIAL_MONTHLY_ATTENDANCE);
}

// ---------------------------------------------------------------------------
// Business Logic & Helpers
// ---------------------------------------------------------------------------

/**
 * Calculates working days (Monday-Friday) between startDate and endDate inclusive.
 * Falls back to 1 day minimum if dates match on a weekend.
 */
export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(`${startDateStr}T00:00:00Z`);
  const end = new Date(`${endDateStr}T00:00:00Z`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let count = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dayOfWeek = cur.getUTCDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // Fallback to at least 1 day if both days fall on weekend
  return count > 0 ? count : 1;
}

export function isValidDateFormat(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
}

// ---------------------------------------------------------------------------
// Query Functions (Enforcing Employee Isolation)
// ---------------------------------------------------------------------------

export function getLeaveTypes(): LeaveType[] {
  return leaveTypesState.filter((t) => t.isActive);
}

export function getLeaveBalancesForEmployee(employeeId: string, year = 2026): LeaveBalance[] {
  return leaveBalancesState
    .filter((b) => b.employeeId === employeeId && b.year === year)
    .map((b) => ({
      ...b,
      availableDays: Math.max(0, b.allocatedDays - b.usedDays - b.pendingDays),
    }));
}

export function getLeaveRequestsForEmployee(employeeId: string): LeaveRequest[] {
  return leaveRequestsState
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

export function getHolidays(year?: number): Holiday[] {
  if (!year) return [...holidaysState];
  return holidaysState.filter((h) => h.date.startsWith(String(year)));
}

export function getLatestMonthlyAttendanceForEmployee(
  employeeId: string
): MonthlyAttendance | null {
  const records = monthlyAttendanceState
    .filter((a) => a.employeeId === employeeId)
    .sort((a, b) => b.month.localeCompare(a.month));

  return records.length > 0 ? { ...records[0] } : null;
}

// ---------------------------------------------------------------------------
// Mutation Functions (Atomic Validations & Double-Deduction Protection)
// ---------------------------------------------------------------------------

export interface ValidationErrorResponse {
  field?: string;
  message: string;
  statusCode: number;
  code?: string;
}

export function createLeaveRequestForEmployee(
  employeeId: string,
  employeeName: string,
  input: CreateLeaveRequestInput
): { request: LeaveRequest; balance: LeaveBalance } {
  const { leaveTypeId, startDate, endDate, reason } = input;

  // 1. Required fields check
  if (!leaveTypeId || !startDate || !endDate || !reason?.trim()) {
    throw {
      message: "Leave type, start date, end date, and reason are required.",
      statusCode: 400,
      code: "MISSING_REQUIRED_FIELDS",
    };
  }

  // 2. Date format checks
  if (!isValidDateFormat(startDate)) {
    throw {
      field: "startDate",
      message: "Start date must be in YYYY-MM-DD format.",
      statusCode: 400,
      code: "INVALID_DATE_FORMAT",
    };
  }
  if (!isValidDateFormat(endDate)) {
    throw {
      field: "endDate",
      message: "End date must be in YYYY-MM-DD format.",
      statusCode: 400,
      code: "INVALID_DATE_FORMAT",
    };
  }

  // 3. Start date cannot be after end date
  if (startDate > endDate) {
    throw {
      field: "startDate",
      message: "Start date cannot be after end date.",
      statusCode: 400,
      code: "INVALID_DATE_RANGE",
    };
  }

  // 4. Past date business rule: Prevent requests older than 30 days in the past
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const minAllowedDate = thirtyDaysAgo.toISOString().split("T")[0];
  if (startDate < minAllowedDate) {
    throw {
      field: "startDate",
      message: "Leave requests cannot be submitted for dates more than 30 days in the past.",
      statusCode: 400,
      code: "PAST_DATE_PROHIBITED",
    };
  }

  // 5. Leave type validity
  const leaveType = leaveTypesState.find((t) => t.id === leaveTypeId && t.isActive);
  if (!leaveType) {
    throw {
      field: "leaveTypeId",
      message: "Selected leave type is invalid or inactive.",
      statusCode: 400,
      code: "INVALID_LEAVE_TYPE",
    };
  }

  // 6. Overlapping active requests check
  // Active requests are PENDING or APPROVED. REJECTED or CANCELLED do not block.
  const activeExisting = leaveRequestsState.filter(
    (r) =>
      r.employeeId === employeeId &&
      (r.status === "PENDING" || r.status === "APPROVED")
  );

  const overlapping = activeExisting.find(
    (r) => r.startDate <= endDate && r.endDate >= startDate
  );

  if (overlapping) {
    throw {
      field: "startDate",
      message: `You already have an active leave request (${overlapping.status.toLowerCase()} from ${overlapping.startDate} to ${overlapping.endDate}) overlapping this date range.`,
      statusCode: 409,
      code: "OVERLAPPING_REQUEST",
    };
  }

  // 7. Calculate requested business days
  const daysCount = calculateWorkingDays(startDate, endDate);
  if (daysCount <= 0) {
    throw {
      message: "Requested duration does not contain valid working days.",
      statusCode: 400,
      code: "ZERO_DAYS_REQUESTED",
    };
  }

  // 8. Leave balance verification
  const year = parseInt(startDate.slice(0, 4), 10) || 2026;
  let balance = leaveBalancesState.find(
    (b) => b.employeeId === employeeId && b.leaveTypeId === leaveTypeId && b.year === year
  );

  // If no balance record exists for this year, check if unpaid or initialize default
  if (!balance) {
    if (leaveType.code === "UNPAID") {
      balance = {
        id: `lb-${employeeId}-unpaid-${year}`,
        employeeId,
        leaveTypeId,
        leaveTypeCode: "UNPAID",
        leaveTypeName: leaveType.name,
        year,
        allocatedDays: 999,
        usedDays: 0,
        pendingDays: 0,
        availableDays: 999,
        color: leaveType.color,
      };
      leaveBalancesState.push(balance);
    } else {
      throw {
        message: `No eligible leave balance found for ${leaveType.name} in year ${year}.`,
        statusCode: 400,
        code: "BALANCE_NOT_FOUND",
      };
    }
  }

  const currentAvailable = balance.allocatedDays - balance.usedDays - balance.pendingDays;
  if (leaveType.code !== "UNPAID" && currentAvailable < daysCount) {
    throw {
      message: `Insufficient leave balance. You have ${currentAvailable} day(s) available for ${leaveType.name}, but requested ${daysCount} day(s).`,
      statusCode: 400,
      code: "INSUFFICIENT_BALANCE",
    };
  }

  // 9. Atomic balance update:
  // Increment pendingDays ONLY (does not deduct usedDays until approval)
  // Double-deductions are prevented because availableDays = allocated - used - pending.
  balance.pendingDays += daysCount;
  balance.availableDays = balance.allocatedDays - balance.usedDays - balance.pendingDays;

  // 10. Create new request with PENDING status
  const newRequest: LeaveRequest = {
    id: `lr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    employeeId,
    employeeName,
    leaveTypeId: leaveType.id,
    leaveTypeCode: leaveType.code,
    leaveTypeName: leaveType.name,
    startDate,
    endDate,
    daysCount,
    reason: reason.trim(),
    status: "PENDING",
    appliedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };

  leaveRequestsState.unshift(newRequest);

  return {
    request: newRequest,
    balance: { ...balance },
  };
}
