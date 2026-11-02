/**
 * lib/profile-service.ts
 *
 * Server-side data access layer for user profiles, badges, and team rankings.
 *
 * Strategy:
 *   1.  If DATABASE_URL is set  →  query Prisma (real database).
 *   2.  If DATABASE_URL is NOT set → fall back to in-memory mock data.
 *       This makes local dev / Storybook / Prisma-less preview envs work
 *       without any extra config.
 *
 * Frontend API routes in app/api/ call these functions and return JSON,
 * so the React components never import this file directly (server boundary).
 */

import type { User, Team, Badge } from "./types";

// ── Lazy Prisma import so the module loads fine without @prisma/client ──────────
let _prismaPromise: Promise<import("@prisma/client").PrismaClient> | null = null;

function getPrisma() {
  if (!_prismaPromise) {
    _prismaPromise = import("./prisma").then((m) => m.prisma);
  }
  return _prismaPromise;
}

const useDb = !!process.env.DATABASE_URL;

// ── Helpers to map Prisma shapes → TypeScript interfaces ─────────────────────
// Prisma returns Date objects; our types use ISO strings.

type PrismaUser = {
  id: string;
  name: string;
  email: string;
  school: string;
  city: string;
  age: number;
  hometown: string;
  companion: string;
  lastAccess: Date;
  rankTitle: string;
  avatarUrl: string | null;
  bannerUrl: string;
  badges: PrismaBadge[];
};

type PrismaBadge = {
  id: string;
  name: string;
  iconUrl: string | null;
  earnedAt: Date;
};

type PrismaTeam = {
  id: string;
  name: string;
  points: number;
  streakDays: number;
  emblemVariant: "default" | "decorated";
  rank: number;
};

function mapUser(u: PrismaUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    school: u.school,
    city: u.city,
    age: u.age,
    hometown: u.hometown,
    companion: u.companion,
    lastAccess: u.lastAccess.toISOString(),
    rankTitle: u.rankTitle,
    avatarUrl: u.avatarUrl,
    bannerUrl: u.bannerUrl,
    badges: u.badges.map(mapBadge),
  };
}

function mapBadge(b: PrismaBadge): Badge {
  return {
    id: b.id,
    name: b.name,
    iconUrl: b.iconUrl,
    earnedAt: b.earnedAt.toISOString(),
  };
}

function mapTeam(t: PrismaTeam): Team {
  return {
    id: t.id,
    name: t.name,
    points: t.points,
    streakDays: t.streakDays,
    emblemVariant: t.emblemVariant,
    rank: t.rank,
  };
}

// ── Profile ──────────────────────────────────────────────────────────────────

/**
 * Fetch a single user profile (with their badges) by ID.
 * Returns null if the user doesn't exist.
 */
export async function getProfile(userId: string): Promise<User | null> {
  if (useDb) {
    try {
      const db = await getPrisma();
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { badges: { orderBy: { earnedAt: "asc" } } },
      });
      return user ? mapUser(user as PrismaUser) : null;
    } catch (err) {
      console.warn(
        "[profile-service] Database query failed, falling back to mock data:",
        (err as Error).message
      );
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────────
  const { mockUser, mockUserWithBadges } = await import("./mock-data");

  if (userId === "user-1" || userId === "ana" || userId === "default") {
    return mockUser;
  }
  if (userId === "user-2" || userId === "with-badges") {
    return mockUserWithBadges;
  }
  if (userId === "unknown" || userId === "not-found") {
    return null;
  }
  return { ...mockUser, id: userId };
}

// ── Ranking ───────────────────────────────────────────────────────────────────

/**
 * Fetch all teams ordered by rank ascending.
 */
export async function getRanking(): Promise<Team[]> {
  if (useDb) {
    try {
      const db = await getPrisma();
      const teams = await db.team.findMany({ orderBy: { rank: "asc" } });
      return teams.map((t) => mapTeam(t as PrismaTeam));
    } catch (err) {
      console.warn(
        "[profile-service] Database ranking query failed, falling back to mock data:",
        (err as Error).message
      );
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────────
  const { mockTeams } = await import("./mock-data");
  return [...mockTeams].sort((a, b) => a.rank - b.rank);
}

// ── Badges ────────────────────────────────────────────────────────────────────

/**
 * Fetch all badges earned by a specific user.
 */
export async function getBadges(userId: string): Promise<Badge[]> {
  if (useDb) {
    try {
      const db = await getPrisma();
      const badges = await db.badge.findMany({
        where: { userId },
        orderBy: { earnedAt: "asc" },
      });
      return badges.map((b) => mapBadge(b as PrismaBadge));
    } catch (err) {
      console.warn(
        "[profile-service] Database badges query failed, falling back to mock data:",
        (err as Error).message
      );
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────────
  const { mockSampleBadges } = await import("./mock-data");
  if (userId === "user-2" || userId === "with-badges") {
    return mockSampleBadges;
  }
  return [];
}
