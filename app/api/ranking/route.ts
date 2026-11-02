/**
 * GET /api/ranking
 *
 * Returns all teams sorted by rank ascending (rank 1 first).
 *
 * Response shape: Team[] (from lib/types.ts)
 *   [{ id, name, points, streakDays, emblemVariant, rank }]
 *
 * Example: GET /api/ranking
 *   → 200 [{ id: "team-1", name: "Equipe Um", points: 7210, ... }, ...]
 */

import { NextResponse } from "next/server";
import { getRanking } from "@/lib/profile-service";

export async function GET() {
  try {
    const teams = await getRanking();
    return NextResponse.json(teams, { status: 200 });
  } catch (err) {
    console.error("[GET /api/ranking]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
