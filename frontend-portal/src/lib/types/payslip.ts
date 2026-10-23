export interface EarningItem {
  id: string;
  category: string;
  description: string;
  rate?: number;
  hours?: number;
  amount: number;
}

export interface DeductionItem {
  id: string;
  category: "Tax" | "Pre-Tax" | "Post-Tax";
  description: string;
  amount: number;
}

export interface PayslipSummary {
  id: string;
  period: string; // e.g., "September 2024"
  payDate: string; // e.g., "2024-09-30"
  periodStartDate: string;
  periodEndDate: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: "Paid" | "Processing" | "Pending";
  paymentMethod: string;
  downloadUrl?: string;
}

export interface PayslipDetail extends PayslipSummary {
  employeeName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  earnings: EarningItem[];
  deductions: DeductionItem[];
  ytdGross: number;
  ytdDeductions: number;
  ytdNet: number;
}
