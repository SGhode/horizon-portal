import { NextResponse } from "next/server";
import { mockDashboardData } from "@/mocks/data/dashboard";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(mockDashboardData);
}
