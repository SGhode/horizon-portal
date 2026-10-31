"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CalendarDays,
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Send,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  getLeaveTypes,
  getLeaveBalances,
  getLeaveRequests,
  createLeaveRequest,
  getHolidays,
  getLatestMonthlyAttendance,
} from "@/lib/api/leave";
import {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Holiday,
  CreateLeaveRequestInput,
} from "@/lib/types/leave";
import { MonthlyAttendance } from "@/lib/types/attendance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { ApiClientError } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Form Validation Schema
// ---------------------------------------------------------------------------

const leaveFormSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Please select a leave type."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters.")
      .max(500, "Reason cannot exceed 500 characters."),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: "Start date cannot be after end date.",
    path: ["startDate"],
  });

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export default function LeaveAttendancePage() {
  // State variables
  const [types, setTypes] = React.useState<LeaveType[]>([]);
  const [balances, setBalances] = React.useState<LeaveBalance[]>([]);
  const [requests, setRequests] = React.useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [attendance, setAttendance] = React.useState<MonthlyAttendance | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formServerError, setFormServerError] = React.useState<string | null>(null);

  // Diagnostic simulator for design review
  const [simulateEmpty, setSimulateEmpty] = React.useState(false);

  // Filter for request history
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Calendar state (defaults to October 2026 or current month)
  const [calendarDate, setCalendarDate] = React.useState<Date>(() => new Date(2026, 9, 1)); // Oct 2026

  const { toast } = useToast();
  const formRef = React.useRef<HTMLDivElement>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const selectedTypeId = watch("leaveTypeId");
  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");

  // Calculate requested days count preview
  const estimatedDays = React.useMemo(() => {
    if (!watchStartDate || !watchEndDate || watchStartDate > watchEndDate) return 0;
    const start = new Date(`${watchStartDate}T00:00:00Z`);
    const end = new Date(`${watchEndDate}T00:00:00Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.getUTCDay();
      if (d !== 0 && d !== 6) count++;
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return count > 0 ? count : 1;
  }, [watchStartDate, watchEndDate]);

  // Selected leave type balance
  const selectedBalance = React.useMemo(() => {
    return balances.find((b) => b.leaveTypeId === selectedTypeId);
  }, [balances, selectedTypeId]);

  // Load all initial data from APIs
  const fetchAllData = React.useCallback(async (triggerFailure = false) => {
    try {
      setLoading(true);
      setError(null);

      if (triggerFailure) {
        await new Promise((r) => setTimeout(r, 400));
        throw new Error("HTTP 503: Leave & Attendance microservice is temporarily unavailable.");
      }

      const [loadedTypes, loadedBalances, loadedRequests, loadedHolidays, loadedAttendance] =
        await Promise.all([
          getLeaveTypes(),
          getLeaveBalances(),
          getLeaveRequests(),
          getHolidays(),
          getLatestMonthlyAttendance().catch(() => null),
        ]);

      setTypes(loadedTypes);
      setBalances(loadedBalances);
      setRequests(loadedRequests);
      setHolidays(loadedHolidays);
      setAttendance(loadedAttendance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave and attendance data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle leave submission
  const onSubmit = async (values: LeaveFormValues) => {
    setFormServerError(null);
    setSubmitting(true);

    try {
      const input: CreateLeaveRequestInput = {
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
      };

      const res = await createLeaveRequest(input);

      toast({
        title: "Leave Request Submitted",
        description: `Your application for ${res.request.daysCount} day(s) of ${res.request.leaveTypeName} has been logged as PENDING.`,
        type: "success",
      });

      // Reset form
      reset({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });

      // Refresh data
      await fetchAllData();
    } catch (err: unknown) {
      let msg = "Failed to submit leave request.";
      if (err instanceof ApiClientError) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setFormServerError(msg);
      toast({
        title: "Application Rejected",
        description: msg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(calendarDate);

  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const setTodayMonth = () => {
    setCalendarDate(new Date(2026, 9, 1));
  };

  // Calendar cells generation
  const calendarCells = React.useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      holiday?: Holiday;
      approvedLeaves: LeaveRequest[];
      pendingLeaves: LeaveRequest[];
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split("T")[0];
      const d = prevDate.getDay();
      cells.push({
        dayNumber: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isWeekend: d === 0 || d === 6,
        approvedLeaves: [],
        pendingLeaves: [],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(year, month, d);
      // Format YYYY-MM-DD
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${year}-${mm}-${dd}`;
      const dayOfWeek = dateObj.getDay();

      const hol = holidays.find((h) => h.date === dateStr);
      const appLeaves = requests.filter(
        (r) => r.status === "APPROVED" && r.startDate <= dateStr && r.endDate >= dateStr
      );
      const penLeaves = requests.filter(
        (r) => r.status === "PENDING" && r.startDate <= dateStr && r.endDate >= dateStr
      );

      cells.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        holiday: hol,
        approvedLeaves: appLeaves,
        pendingLeaves: penLeaves,
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split("T")[0];
      const d = nextDate.getDay();
      cells.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: false,
        isWeekend: d === 0 || d === 6,
        approvedLeaves: [],
        pendingLeaves: [],
      });
    }

    return cells;
  }, [year, month, holidays, requests]);

  // Filtered requests
  const filteredRequests = React.useMemo(() => {
    if (simulateEmpty) return [];
    if (statusFilter === "ALL") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter, simulateEmpty]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Failed to Load Leave & Attendance</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
        <Button onClick={() => fetchAllData()} className="mt-6 gap-2" variant="primary">
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Screen Header & Top Action Bar */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <CalendarCheck2 className="h-3.5 w-3.5" />
            <span>Employee Self-Service</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Leave & Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your allocated leave quotas, schedule upcoming time off, and track monthly attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Diagnostic Simulator */}
          <button
            type="button"
            onClick={() => setSimulateEmpty((prev) => !prev)}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            {simulateEmpty ? "Show Data" : "Simulate Empty State"}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllData()}
            className="gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Apply for Leave</span>
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Leave Balance Cards */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Available Leave Balances
            </h2>
            <p className="text-xs text-muted-foreground">
              Annual entitlement for calendar year 2026. Available balance accounts for pending approvals.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Year 2026
          </Badge>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </Card>
            ))}
          </div>
        ) : simulateEmpty || balances.length === 0 ? (
          <Card className="p-8 text-center">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No Leave Balances Assigned</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No leave quotas have been configured for your profile for this calendar year. Please contact HR.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {balances.map((balance) => {
              const allocated = balance.allocatedDays;
              const used = balance.usedDays;
              const pending = balance.pendingDays;
              const available = balance.availableDays;
              const usedPercent = allocated > 0 ? Math.min(100, ((used + pending) / allocated) * 100) : 0;

              return (
                <Card
                  key={balance.id}
                  className="relative overflow-hidden transition-all hover:shadow-md"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: balance.color || "#3b82f6" }}
                  />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {balance.leaveTypeName}
                      </CardTitle>
                      <Badge
                        variant={available <= 2 ? "warning" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {balance.leaveTypeCode}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-extrabold tracking-tight text-foreground">
                          {available}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">days left</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        of {allocated} allocated
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${usedPercent}%`,
                            backgroundColor: balance.color || "#3b82f6",
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Used: {used}d</span>
                        {pending > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Pending: {pending}d
                          </span>
                        )}
                        <span>Quota: {allocated}d</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Monthly Attendance Summary Card */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  Monthly Attendance Performance
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Latest verified attendance record for {attendance?.month || "Current Month"} (
                {attendance?.employeeName || "Shivraj Ghode"})
              </CardDescription>
            </div>
            {attendance && (
              <Badge variant="success" className="w-fit text-xs gap-1 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{attendance.attendancePercentage}% Attendance Rate</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !attendance || simulateEmpty ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No monthly attendance summary is available for this period.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <span className="text-xs text-muted-foreground font-medium block">Working Days</span>
                <span className="text-2xl font-bold text-foreground mt-0.5 block">
                  {attendance.totalWorkingDays}
                </span>
                <span className="text-[10px] text-muted-foreground">Total billable</span>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">
                  Present Days
                </span>
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                  {attendance.presentDays}
                </span>
                <span className="text-[10px] text-muted-foreground">Full shift</span>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block">
                  Half Days
                </span>
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">
                  {attendance.halfDays}
                </span>
                <span className="text-[10px] text-muted-foreground">0.5 credit</span>
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                <span className="text-xs text-blue-700 dark:text-blue-400 font-medium block">
                  Approved Leave
                </span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-0.5 block">
                  {attendance.onLeaveDays}
                </span>
                <span className="text-[10px] text-muted-foreground">Excused absence</span>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-center">
                <span className="text-xs text-muted-foreground font-medium block">Late Check-ins</span>
                <span className="text-2xl font-bold text-foreground mt-0.5 block">
                  {attendance.lateArrivals}
                </span>
                <span className="text-[10px] text-muted-foreground">Grace period</span>
              </div>

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
                <span className="text-xs text-destructive font-medium block">Unexcused</span>
                <span className="text-2xl font-bold text-destructive mt-0.5 block">
                  {attendance.absentDays}
                </span>
                <span className="text-[10px] text-muted-foreground">Zero credit</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: Apply for Leave Form & Interactive Preview */}
      {/* ------------------------------------------------------------------ */}
      <div ref={formRef} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold text-foreground">
                Apply for Time Off
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Submit a formal leave application. Requests are routed to your direct manager for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formServerError && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold block">Application Validation Error</span>
                  <span>{formServerError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Leave Type Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor="leaveTypeId"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Leave Category <span className="text-destructive">*</span>
                </label>
                <select
                  id="leaveTypeId"
                  {...register("leaveTypeId")}
                  disabled={submitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Choose Leave Category --</option>
                  {types.map((type) => {
                    const bal = balances.find((b) => b.leaveTypeId === type.id);
                    const avText = bal ? `(${bal.availableDays} days remaining)` : "";
                    return (
                      <option key={type.id} value={type.id}>
                        {type.name} {avText}
                      </option>
                    );
                  })}
                </select>
                {errors.leaveTypeId && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.leaveTypeId.message}
                  </p>
                )}
              </div>

              {/* Date pickers (Start & End) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="startDate"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Start Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    disabled={submitting}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="endDate"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    End Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    disabled={submitting}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Reason for leave */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reason"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Reason for Time Off <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  {...register("reason")}
                  placeholder="Provide brief context for your supervisor (e.g., medical appointment, annual family trip)..."
                  disabled={submitting}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-y"
                />
                {errors.reason && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    setFormServerError(null);
                  }}
                  disabled={submitting}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  className="gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Leave Request</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Application Summary & Eligibility Sidebar */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" />
              <span>Application Summary</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live calculation of eligible balance and duration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold text-foreground">
                  {selectedBalance?.leaveTypeName || "Not Selected"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available Quota:</span>
                <span className="font-bold text-foreground">
                  {selectedBalance ? `${selectedBalance.availableDays} days` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Requested Duration:</span>
                <span className="font-bold text-primary">
                  {estimatedDays > 0 ? `${estimatedDays} business day(s)` : "—"}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Balance After Request:</span>
                <span
                  className={
                    selectedBalance && selectedBalance.availableDays - estimatedDays < 0
                      ? "text-destructive font-bold"
                      : "text-emerald-600 dark:text-emerald-400 font-bold"
                  }
                >
                  {selectedBalance
                    ? `${selectedBalance.availableDays - estimatedDays} days`
                    : "—"}
                </span>
              </div>
            </div>

            {selectedBalance && selectedBalance.availableDays - estimatedDays < 0 && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>
                  Insufficient balance! You are requesting {estimatedDays} days but only have{" "}
                  {selectedBalance.availableDays} days available.
                </span>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground space-y-1.5">
              <span className="font-semibold block text-foreground">Policy Reminders:</span>
              <p>• Weekends (Sat-Sun) are automatically excluded from leave deductions.</p>
              <p>• Overlapping requests are blocked to maintain payroll integrity.</p>
              <p>• New applications require approval from Marcus Vance (VP of Eng).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Monthly Leave Calendar */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  Monthly Leave & Holiday Schedule
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Visual overview of official statutory holidays and your scheduled time off.
              </CardDescription>
            </div>

            {/* Calendar Month Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">
                {monthName}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={setTodayMonth} className="text-xs h-8">
                Current
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground uppercase border-b border-border pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => (
              <div
                key={`${cell.dateString}-${idx}`}
                className={`min-h-[78px] rounded-md border p-1.5 transition-colors flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? "border-transparent bg-muted/20 text-muted-foreground/40 opacity-40"
                    : cell.isWeekend
                    ? "border-border/50 bg-muted/30 text-muted-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      cell.isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  {cell.holiday && (
                    <span className="inline-block h-2 w-2 rounded-full bg-amber-500" title={cell.holiday.name} />
                  )}
                </div>

                {/* Day events (Holiday & Leave Badges) */}
                <div className="space-y-1 mt-1">
                  {cell.holiday && (
                    <div
                      className="truncate rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400"
                      title={`${cell.holiday.name} (${cell.holiday.type})`}
                    >
                      🎉 {cell.holiday.name}
                    </div>
                  )}

                  {cell.approvedLeaves.map((al) => (
                    <div
                      key={al.id}
                      className="truncate rounded bg-emerald-500/15 px-1 py-0.5 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400"
                      title={`Approved Leave: ${al.leaveTypeName}`}
                    >
                      ✓ {al.leaveTypeName}
                    </div>
                  ))}

                  {cell.pendingLeaves.map((pl) => (
                    <div
                      key={pl.id}
                      className="truncate rounded bg-blue-500/15 px-1 py-0.5 text-[9px] font-semibold text-blue-700 dark:text-blue-400 border border-dashed border-blue-400/40"
                      title={`Pending Approval: ${pl.leaveTypeName}`}
                    >
                      ⏳ {pl.leaveTypeName}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Official Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Approved Leave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-dashed border-blue-600" />
              <span>Pending Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-muted/60" />
              <span>Weekend</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5: Leave Request History */}
      {/* ------------------------------------------------------------------ */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                  Leave Request History
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Comprehensive audit log of your submitted leave requests and supervisor decisions.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/40">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">No Leave Requests Found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {statusFilter === "ALL"
                  ? "You have not submitted any leave applications yet. Use the form above to submit your first request."
                  : `No requests with status '${statusFilter}' were found.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Review Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                types.find((t) => t.id === req.leaveTypeId)?.color ||
                                "#3b82f6",
                            }}
                          />
                          <span>{req.leaveTypeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-foreground text-xs">
                        {req.daysCount} d
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(req.appliedAt)}
                      </TableCell>
                      <TableCell>
                        {req.status === "APPROVED" && (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {req.status === "PENDING" && (
                          <Badge variant="warning" className="gap-1 text-[11px]">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {req.status === "REJECTED" && (
                          <Badge variant="destructive" className="gap-1 text-[11px]">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </Badge>
                        )}
                        {req.status === "CANCELLED" && (
                          <Badge variant="secondary" className="gap-1 text-[11px]">
                            Cancelled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs">
                        {req.rejectionReason ? (
                          <span className="text-destructive font-medium" title={req.rejectionReason}>
                            Reason: {req.rejectionReason}
                          </span>
                        ) : req.reviewedBy ? (
                          <span>Reviewed by {req.reviewedBy}</span>
                        ) : (
                          <span className="italic">Awaiting review</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
