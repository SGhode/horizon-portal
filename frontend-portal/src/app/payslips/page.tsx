"use client";

import * as React from "react";
import {
  Receipt,
  Download,
  Printer,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getPayslips, getPayslipById } from "@/lib/api/payslips";
import { PayslipDetail, PayslipSummary } from "@/lib/types/payslip";
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

export default function PayslipsPage() {
  const [summaries, setSummaries] = React.useState<PayslipSummary[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("ps-2024-09");
  const [currentPayslip, setCurrentPayslip] = React.useState<PayslipDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Privacy toggle: mask sensitive financial amounts
  const [maskAmounts, setMaskAmounts] = React.useState(false);

  // Diagnostic state simulator
  const [simulateEmpty, setSimulateEmpty] = React.useState(false);

  const { toast } = useToast();

  const fetchPayslipData = React.useCallback(async (targetId: string, triggerFailure = false) => {
    try {
      setLoading(true);
      setError(null);

      if (triggerFailure) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        throw new Error("HTTP 500: Secure Payroll Vault decryption failed. Failed to load statement.");
      }

      const list = await getPayslips();
      setSummaries(list);

      if (list.length > 0) {
        const detail = await getPayslipById(targetId);
        setCurrentPayslip(detail);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payslip data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayslipData(selectedId);
  }, [fetchPayslipData, selectedId]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    fetchPayslipData(id);
  };

  const handleDownload = (format: "pdf" | "csv") => {
    toast({
      title: "Downloading Statement",
      description: `Generating encrypted ${format.toUpperCase()} payslip for ${currentPayslip?.period}. Your download will start shortly.`,
      type: "success",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format currency or mask
  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return "$0.00";
    if (maskAmounts) return "••••••••";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // State 4: Error state with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-card p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Payslip Record Unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {error}
        </p>
        <Button
          onClick={() => fetchPayslipData(selectedId, false)}
          variant="primary"
          className="mt-6 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Payroll & Payslip Statements
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono">
              Semi-Monthly
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Confidential earnings records, tax withholdings, and retirement contribution statements.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Privacy Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMaskAmounts(!maskAmounts)}
            className="text-xs h-8 gap-1.5"
            title="Mask or unmask sensitive financial figures"
          >
            {maskAmounts ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{maskAmounts ? "Show Amounts" : "Mask Private Data"}</span>
          </Button>

          {/* Download & Print Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload("pdf")}
            className="text-xs h-8 gap-1.5"
            disabled={loading || simulateEmpty}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-8 gap-1.5 hidden md:inline-flex"
            disabled={loading || simulateEmpty}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>

          {/* Diagnostic Simulator for testing State 3 & 4 */}
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimulateEmpty(!simulateEmpty)}
              className="text-xs h-8"
              title="Toggle empty state (State 3)"
            >
              {simulateEmpty ? "Show Data" : "Test Empty"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPayslipData(selectedId, true)}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              title="Test error state (State 4)"
            >
              Test Error
            </Button>
          </div>
        </div>
      </div>

      {/* Sensitive Data Advisory Banner */}
      <div className="flex items-center justify-between rounded-md border border-border/80 bg-muted/30 px-3.5 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>
            Financial Privacy Protection: This payslip contains confidential compensation data for <strong>{currentPayslip?.employeeName ?? "Employee"}</strong>. All figures shown are illustrative fictional numbers.
          </span>
        </span>
        <span className="text-[11px] font-mono">Disbursed via ACH</span>
      </div>

      {/* State 3: Empty State */}
      {simulateEmpty ? (
        <Card className="p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-foreground">No Payslips Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            There are currently no disbursed payroll statements available for your employee profile. Newly processed statements appear on the 15th and last business day of each month.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSimulateEmpty(false)}
            className="mt-4"
          >
            Reset Simulator
          </Button>
        </Card>
      ) : (
        <>
          {/* Month Selector Bar Card */}
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  Select Pay Statement:
                </span>
                <select
                  value={selectedId}
                  onChange={handleMonthChange}
                  disabled={loading}
                  className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {summaries.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.period} (Pay Date: {p.payDate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  Payment Status:
                </span>
                <Badge variant="success" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {currentPayslip?.status ?? "Paid"}
                </Badge>
                <span className="text-muted-foreground font-mono">
                  {currentPayslip?.paymentMethod}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Prominent Net Pay Hero Banner Card */}
          <Card className="border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 shadow-sm">
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-center">
                {/* Net Pay (Hero Metric) */}
                <div className="lg:border-r border-border pr-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Net Take-Home Pay
                  </span>
                  <div className="text-3xl font-extrabold text-foreground mt-1 tracking-tight text-primary">
                    {loading ? <Skeleton className="h-9 w-36" /> : formatAmount(currentPayslip?.netPay)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Disbursed directly into your verified bank account
                  </span>
                </div>

                {/* Gross Pay */}
                <div className="lg:border-r border-border pr-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Gross Earnings
                  </span>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {loading ? <Skeleton className="h-8 w-32" /> : formatAmount(currentPayslip?.grossPay)}
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Includes base, bonus & stipends
                  </span>
                </div>

                {/* Total Deductions */}
                <div className="lg:border-r border-border pr-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Deductions & Taxes
                  </span>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {loading ? <Skeleton className="h-8 w-32" /> : formatAmount(currentPayslip?.totalDeductions)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    FIT, State Tax, 401(k), Healthcare
                  </span>
                </div>

                {/* YTD Summary */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    YTD Net Compensation
                  </span>
                  <div className="text-2xl font-bold text-foreground mt-1 font-mono">
                    {loading ? <Skeleton className="h-8 w-32" /> : formatAmount(currentPayslip?.ytdNet)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    YTD Gross: {formatAmount(currentPayslip?.ytdGross)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statement Breakdowns: Earnings Table vs Deductions Table */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Earnings Breakdown Table */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-foreground">Earnings Breakdown</CardTitle>
                    <CardDescription className="text-xs">
                      Gross salary, performance bonus, and allowances.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    Gross: {formatAmount(currentPayslip?.grossPay)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category / Description</TableHead>
                        <TableHead>Hours / Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPayslip?.earnings.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium text-xs">
                            <div>
                              <p className="text-foreground">{e.category}</p>
                              <p className="text-[11px] text-muted-foreground font-normal">
                                {e.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {e.hours ? `${e.hours}h @ $${e.rate?.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-foreground font-mono">
                            {formatAmount(e.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Earnings Row */}
                      <TableRow className="bg-muted/40 font-semibold">
                        <TableCell colSpan={2} className="text-xs text-foreground">
                          Total Gross Earnings
                        </TableCell>
                        <TableCell className="text-right text-xs text-foreground font-mono font-bold">
                          {formatAmount(currentPayslip?.grossPay)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Deductions Breakdown Table */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-foreground">Deductions Breakdown</CardTitle>
                    <CardDescription className="text-xs">
                      Taxes, healthcare elections, and retirement deferrals.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono text-rose-600 dark:text-rose-400">
                    Total: {formatAmount(currentPayslip?.totalDeductions)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Deduction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPayslip?.deductions.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-xs px-1.5 py-0.5 text-[10px] font-semibold ${
                                d.category === "Tax"
                                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              }`}
                            >
                              {d.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-foreground">
                            {d.description}
                          </TableCell>
                          <TableCell className="text-right text-xs font-semibold text-foreground font-mono">
                            {formatAmount(d.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Deductions Row */}
                      <TableRow className="bg-muted/40 font-semibold">
                        <TableCell colSpan={2} className="text-xs text-foreground">
                          Total Taxes & Deductions
                        </TableCell>
                        <TableCell className="text-right text-xs text-foreground font-mono font-bold">
                          {formatAmount(currentPayslip?.totalDeductions)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Payslips Table Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-foreground">Historical Payroll Statements</CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive chronological payroll archive for the current tax year.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {summaries.length} Statements
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statement Period</TableHead>
                    <TableHead>Disbursement Date</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((s) => (
                    <TableRow
                      key={s.id}
                      className={s.id === selectedId ? "bg-muted/50 font-medium" : "hover:bg-muted/30"}
                    >
                      <TableCell className="font-semibold text-xs text-foreground">
                        {s.period}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {s.payDate}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-mono">
                        {formatAmount(s.grossPay)}
                      </TableCell>
                      <TableCell className="text-xs text-rose-600 dark:text-rose-400 font-mono">
                        {formatAmount(s.totalDeductions)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground font-mono">
                        {formatAmount(s.netPay)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px]">
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedId(s.id);
                            fetchPayslipData(s.id);
                          }}
                        >
                          Select
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleDownload("pdf")}
                          title="Download statement"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
