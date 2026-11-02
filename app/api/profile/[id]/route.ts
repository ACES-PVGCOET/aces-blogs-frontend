/**
 * GET & PUT /api/profile/[id]
 *
 * GET: Returns the user profile (with embedded badges) as JSON.
 * PUT: Updates author credentials (name, avatarUrl, bio, companion, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/profile-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const user = await getProfile(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error("[GET /api/profile/:id]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await getProfile(id);

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = {
      ...existing,
      name: body.name ?? existing.name,
      avatarUrl: body.avatarUrl ?? body.profileImg ?? existing.avatarUrl,
      hometown: body.bio ?? body.hometown ?? existing.hometown,
      companion: body.companion ?? body.username ?? existing.companion,
      rankTitle: body.rankTitle ?? existing.rankTitle,
      lastAccess: new Date().toISOString(),
    };

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/profile/:id]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
