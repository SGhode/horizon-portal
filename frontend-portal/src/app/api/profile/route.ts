import { NextRequest, NextResponse } from "next/server";
import { mockEmployeeProfile } from "@/mocks/data/profile";
import { UpdateProfilePayload } from "@/lib/types/profile";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

let profileState = { ...mockEmployeeProfile };

export async function GET() {
  const auth = await authenticateRequest(["employee", "admin"]);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(profileState);
}

export async function PUT(request: NextRequest) {
  const auth = await authenticateRequest(["employee", "admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as UpdateProfilePayload;
    profileState = {
      ...profileState,
      personalPhone: body.personalPhone ?? profileState.personalPhone,
      residentialAddress: body.residentialAddress ?? profileState.residentialAddress,
      emergencyContact: body.emergencyContact ?? profileState.emergencyContact,
    };
    return NextResponse.json(profileState);
  } catch {
    return NextResponse.json(
      { message: "Invalid profile update payload" },
      { status: 400 }
    );
  }
}
