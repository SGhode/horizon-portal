import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/route-guard";
import { getLeaveBalancesForEmployee } from "@/mocks/data/leave";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  // Strict ownership: derive employeeId from the authenticated token session
  const employeeId = auth.id;

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : 2026;

  const balances = getLeaveBalancesForEmployee(employeeId, year);
  return NextResponse.json(balances);
}
