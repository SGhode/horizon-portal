import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    status: "ok",
    application: "frontend-portal",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Direct structured log to stdout for container logging
  console.log(
    JSON.stringify({
      level: "info",
      message: "Health probe check successful",
      path: "/health",
      status: 200,
      timestamp: payload.timestamp,
    })
  );

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json",
    },
  });
}
