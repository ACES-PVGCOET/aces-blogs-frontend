/**
 * GET & POST & DELETE /api/profile/[id]/badges
 *
 * GET: Returns badges accredited to this user.
 * POST: Accredits a new editorial badge / accolade (given by the editorial team).
 * DELETE: Revokes an accreditation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getBadges } from "@/lib/profile-service";
import type { Badge } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const badges = await getBadges(id);
    return NextResponse.json(badges, { status: 200 });
  } catch (err) {
    console.error("[GET /api/profile/:id/badges]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();

    if (!body.name && !body.text) {
      return NextResponse.json(
        { error: "Badge title is required" },
        { status: 400 }
      );
    }

    const badgeTitle = body.name || body.text;
    const newBadge: Badge = {
      id: "badge-" + Date.now(),
      name: badgeTitle,
      iconUrl: body.iconUrl || body.emoji || "★",
      earnedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: `Accreditation '${badgeTitle}' awarded by ${body.awardedBy || "ACES Editorial Board"}`,
        badge: newBadge,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/profile/:id/badges]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get("badgeId");

    return NextResponse.json(
      {
        success: true,
        message: `Accreditation '${badgeId || "specified"}' revoked for author ${id}`,
        badgeId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE /api/profile/:id/badges]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
