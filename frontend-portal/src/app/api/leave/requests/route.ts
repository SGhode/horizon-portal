import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/route-guard";
import {
  getLeaveRequestsForEmployee,
  createLeaveRequestForEmployee,
  ValidationErrorResponse,
} from "@/mocks/data/leave";
import { CreateLeaveRequestInput } from "@/lib/types/leave";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  // Strict ownership: derive employeeId from authenticated session
  const requests = getLeaveRequestsForEmployee(auth.id);
  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Malformed JSON request body.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "Invalid request payload.", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const payload = body as Partial<CreateLeaveRequestInput>;

  try {
    // Crucial: Employee identity derived solely from session. Client-supplied IDs or statuses are ignored.
    const result = createLeaveRequestForEmployee(auth.id, auth.name, {
      leaveTypeId: payload.leaveTypeId ?? "",
      startDate: payload.startDate ?? "",
      endDate: payload.endDate ?? "",
      reason: payload.reason ?? "",
    });

    return NextResponse.json(
      {
        message: "Leave request submitted successfully.",
        request: result.request,
        balance: result.balance,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as ValidationErrorResponse;
    const status = error.statusCode || 400;
    return NextResponse.json(
      {
        message: error.message || "Failed to process leave request.",
        code: error.code || "VALIDATION_ERROR",
        field: error.field,
      },
      { status }
    );
  }
}
