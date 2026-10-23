import { NextResponse } from "next/server";
import { mockPayslipSummaries } from "@/mocks/data/payslips";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(mockPayslipSummaries);
}
