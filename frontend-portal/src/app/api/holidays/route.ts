import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/route-guard";
import { getHolidays } from "@/mocks/data/leave";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  const holidays = getHolidays(year);
  return NextResponse.json(holidays);
}
