import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/mocks/data/users";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

  let filtered = [...mockUsers];

  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.department.toLowerCase().includes(search)
    );
  }

  if (role && role !== "all") {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (status && status !== "all") {
    filtered = filtered.filter((u) => u.status === status);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}
