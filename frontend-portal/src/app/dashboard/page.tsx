"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Receipt,
  FileText,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  Shield,
  Briefcase,
  Eye,
} from "lucide-react";
import { getDashboardData } from "@/lib/api/dashboard";
import { DashboardData } from "@/lib/types/dashboard";
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
import { getCurrentUser } from "@/lib/api/auth";

type DashboardRoleView = "employee" | "administrator";

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [roleView, setRoleView] = React.useState<DashboardRoleView>("employee");
  const [userName, setUserName] = React.useState("PeoplePortal");

  // State simulator toggles for design review
  const [simulateEmpty, setSimulateEmpty] = React.useState(false);

  const fetchData = React.useCallback(async (triggerFailure = false) => {
    try {
      setLoading(true);
      setError(null);

      if (triggerFailure) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        throw new Error("HTTP 503: Gateway temporarily unavailable. Upstream HR database connection timeout.");
      }

      const res = await getDashboardData();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    let active = true;
    getCurrentUser()
      .then(({ user }) => {
        if (active) {
          setRoleView(user.role === "admin" ? "administrator" : "employee");
          setUserName(user.name);
        }
      })
      .catch(() => {
        if (active) setRoleView("employee");
      });
    return () => {
      active = false;
    };
  }, []);

  // State 4: API failure with retry action
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-card p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Failed to Load Dashboard</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {error}
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => fetchData(false)} variant="primary" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header follows the authenticated server-validated role. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {roleView === "employee" ? `Welcome back, ${userName}` : "Workforce Administrator Console"}
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono">
              {roleView === "employee" ? "Employee Portal" : "Admin HR View"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {roleView === "employee"
              ? "Review your personal compensation, leave balances, and scheduled company events."
              : "Consolidated enterprise workforce statistics, payroll disbursement metrics, and departmental requests."}
          </p>
        </div>

        {/* State Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Diagnostic Simulator dropdown/buttons for testing all 4 states */}
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulateEmpty(!simulateEmpty)}
              className="text-xs h-8"
              title="Toggle between populated sample data and empty lists (State 3)"
            >
              {simulateEmpty ? "Show Data" : "Test Empty"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              title="Test API error state (State 4)"
            >
              Test Error
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(false)}
              isLoading={loading}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Illustrative data disclaimer */}
      <div className="flex items-center justify-between rounded-md border border-border/80 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>
            {roleView === "employee"
              ? "Confidential employee self-service record for Shivraj Ghode (PP-10482)."
              : "Enterprise workforce metrics reflect 248 total employees across 12 business units (Illustrative Sample Data)."}
          </span>
        </span>
        <span className="text-[11px] font-mono opacity-80">Cycle: Sep 2024</span>
      </div>

      {/* =========================================================================
          VIEW A: EMPLOYEE SELF-SERVICE DASHBOARD
         ========================================================================= */}
      {roleView === "employee" && (
        <div className="space-y-6">
          {/* Summary KPI Cards: Personal Employee Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Next Payday */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Next Scheduled Payday
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-foreground">Oct 31, 2024</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>In 19 days · Semi-Monthly Cycle</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Available PTO Balance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paid Time Off (PTO)
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-foreground">16.5 Days</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Accrued: 18.0 days · Used: 1.5 days YTD
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Last Net Disbursed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Latest Net Disbursed
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-foreground">$7,558.05</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <span>Deposited Sep 30 · Chase •••• 4821</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Employment Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Status
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <UserCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">Active</span>
                      <Badge variant="success" className="text-[10px]">Regular</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Core Platform Engineering · IC-5
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Employee Actions</CardTitle>
              <CardDescription className="text-xs">
                Common self-service workflows for time off, tax forms, and profile maintenance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild variant="outline" className="h-auto py-3 px-4 flex items-center justify-between text-left group">
                  <Link href="/payslips">
                    <div>
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        View Latest Payslip
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        September 2024 Statement
                      </p>
                    </div>
                    <Receipt className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3 px-4 flex items-center justify-between text-left group">
                  <Link href="/profile">
                    <div>
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        Update Contact Info
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Address & Emergency contacts
                      </p>
                    </div>
                    <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3 px-4 flex items-center justify-between text-left group">
                  <Link href="/payslips">
                    <div>
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        Tax & W-2 Forms
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Withholding statements
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-3 px-4 flex items-center justify-between text-left group">
                  <Link href="/users">
                    <div>
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        Workforce Directory
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Find colleagues & teams
                      </p>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-Column Grid: Compact Payslips & Upcoming HR Events */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Recent Payslips (4 Cols) */}
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Recent Payslip History</CardTitle>
                  <CardDescription className="text-xs">
                    Last 3 disbursed payroll statements.
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                  <Link href="/payslips">
                    <span>All Payslips</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : simulateEmpty ? (
                  <div className="p-8 text-center">
                    <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-foreground">No Payslips on File</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Payroll records for this employee account are pending initial cycle processing.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Pay Date</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { period: "September 2024", date: "Sep 30, 2024", net: "$7,558.05", status: "Paid" },
                        { period: "August 2024", date: "Aug 31, 2024", net: "$7,558.05", status: "Paid" },
                        { period: "July 2024", date: "Jul 31, 2024", net: "$7,274.60", status: "Paid" },
                      ].map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs text-foreground">
                            {item.period}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {item.date}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-foreground font-mono">
                            {item.net}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                              <Link href="/payslips">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Upcoming HR & Payroll Events (3 Cols) */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upcoming HR & Payroll Dates</CardTitle>
                <CardDescription className="text-xs">
                  Company schedule and benefit deadlines.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulateEmpty ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-foreground">No Upcoming Events</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      No corporate deadlines or scheduled holidays this month.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-2.5">
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-primary/10 text-primary font-bold">
                        <span className="text-[10px] uppercase leading-none">Oct</span>
                        <span className="text-xs leading-none">25</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          401(k) Contribution Window Closes
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Deadline to modify deferral percentage for next month.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-2.5">
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="text-[10px] uppercase leading-none">Nov</span>
                        <span className="text-xs leading-none">01</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          Annual Benefits Open Enrollment
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Review medical, dental, and vision coverage for 2025.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-2.5">
                      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                        <span className="text-[10px] uppercase leading-none">Nov</span>
                        <span className="text-xs leading-none">28</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          Thanksgiving Company Holiday
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Offices closed Nov 28 & Nov 29 (Paid Holiday).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: ADMINISTRATOR WORKFORCE DASHBOARD
         ========================================================================= */}
      {roleView === "administrator" && (
        <div className="space-y-6">
          {/* Workforce Summary KPI Cards: 248 employees, 12 departments, 18 pending requests */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Total Employees */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Workforce
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">248</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+14 this quarter · 98.4% retention</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 2: Departments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Operating Departments
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Eng (84), Sales (52), Product (28)...
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: Pending HR Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending Approvals
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">18</div>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1">
                  <span>12 PTO requests · 6 Profile edits</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 4: Monthly Payroll Disbursement */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payroll Disbursement
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">100%</span>
                  <Badge variant="success" className="text-[10px]">On Schedule</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Sep 2024: $2.14M successfully cleared
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Distribution & Audit Activity Table */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Department Breakdown (4 Cols) */}
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Departmental Headcount & Budget</CardTitle>
                  <CardDescription className="text-xs">
                    Staff allocation across all 12 operational business units.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">12 Business Units</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Headcount</TableHead>
                      <TableHead>Share</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Product Engineering", count: 84, pct: 34, lead: "Marcus Vance" },
                      { name: "Global Sales & Revenue", count: 52, pct: 21, lead: "David Ross" },
                      { name: "Operations & Logistics", count: 36, pct: 15, lead: "Maya Patel" },
                      { name: "Product Design & Research", count: 28, pct: 11, lead: "Elena Rostova" },
                      { name: "Brand & Growth Marketing", count: 24, pct: 10, lead: "Rachel Green" },
                      { name: "Legal, HR & Finance", count: 24, pct: 10, lead: "Sarah Jenkins" },
                    ].map((dept, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-xs text-foreground">
                          {dept.name}
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-mono">
                          {dept.count} members
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${dept.pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">{dept.pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                            <Link href="/users">
                              Inspect
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Administrative Audit Stream (3 Cols) */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Workforce Event Log</CardTitle>
                <CardDescription className="text-xs">
                  Administrative audits and system approvals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3.5">
                  {[
                    { title: "Salary Adjustment Approved", user: "HR Executive", target: "Engineering Staff", time: "12m ago" },
                    { title: "PTO Request Submitted", user: "Alex Kumar", target: "5 days (Oct 21-25)", time: "45m ago" },
                    { title: "Tax Exemption Form Verified", user: "Sarah Jenkins", target: "W-4 Annual Election", time: "2h ago" },
                    { title: "New Employee Onboarded", user: "Workforce Ops", target: "Zoe Saldana (Frontend)", time: "5h ago" },
                  ].map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/40 transition-colors">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground font-medium leading-snug">
                          {evt.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {evt.user} · {evt.target} · <span className="font-mono">{evt.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Synchronized system metadata footer */}
      {data && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>HR Engine Status: <strong className="text-foreground capitalize">{data.metrics.systemStatus.status}</strong></span>
          </div>
          <span>Enterprise Portal Active · Build v2.4</span>
        </div>
      )}
    </div>
  );
}
