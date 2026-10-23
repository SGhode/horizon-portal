import { NextRequest, NextResponse } from "next/server";
import { mockProjects } from "@/mocks/data/projects";
import { authenticateRequest } from "@/lib/auth/route-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest();
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";

  let filtered = [...mockProjects];

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (priority && priority !== "all") {
    filtered = filtered.filter((p) => p.priority === priority);
  }

  return NextResponse.json(filtered);
}
