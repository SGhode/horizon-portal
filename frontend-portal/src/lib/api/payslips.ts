import { apiGet, RequestOptions } from "./client";
import { PayslipDetail, PayslipSummary } from "@/lib/types/payslip";

export async function getPayslips(
  options?: RequestOptions
): Promise<PayslipSummary[]> {
  return apiGet<PayslipSummary[]>("/payslips", options);
}

export async function getPayslipById(
  id: string,
  options?: RequestOptions
): Promise<PayslipDetail> {
  return apiGet<PayslipDetail>(`/payslips/${id}`, options);
}
