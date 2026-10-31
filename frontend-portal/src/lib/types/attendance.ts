export interface MonthlyAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g. "2026-10" or "October 2026"
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateArrivals: number;
  halfDays: number;
  onLeaveDays: number;
  attendancePercentage: number;
  lastUpdated: string;
}
