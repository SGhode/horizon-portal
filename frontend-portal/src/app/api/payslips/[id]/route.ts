import { NextRequest, NextResponse } from "next/server";
import { mockPayslips } from "@/mocks/data/payslips";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const found = mockPayslips.find((p) => p.id === id);

  if (!found) {
    return NextResponse.json(
      { message: `Payslip record '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(found);
}
