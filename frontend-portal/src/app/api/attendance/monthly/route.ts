import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/route-guard";
import { getLatestMonthlyAttendanceForEmployee } from "@/mocks/data/leave";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  // Derive employeeId strictly from session
  const attendance = getLatestMonthlyAttendanceForEmployee(auth.id);
  if (!attendance) {
    return NextResponse.json(
      { message: "No attendance records found for this employee." },
      { status: 404 }
    );
  }

  return NextResponse.json(attendance);
}
