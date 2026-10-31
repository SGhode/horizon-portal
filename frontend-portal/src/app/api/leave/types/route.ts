import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/route-guard";
import { getLeaveTypes } from "@/mocks/data/leave";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  const types = getLeaveTypes();
  return NextResponse.json(types);
}
