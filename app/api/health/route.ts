/**
 * GET /api/health
 *
 * Quick health check endpoint used by load balancers and CI/CD pipelines.
 *
 * Returns 200 if the server is running.
 * Also tests the database connection (if DATABASE_URL is set) and
 * reports Prisma connectivity status.
 *
 * Response:
 *   { status: "ok", db: "connected" | "disconnected" | "not_configured" }
 */

import { NextResponse } from "next/server";

export async function GET() {
  let dbStatus: "connected" | "disconnected" | "not_configured" =
    "not_configured";

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
