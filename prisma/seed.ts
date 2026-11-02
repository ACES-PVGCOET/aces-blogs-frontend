// Prisma seed file — populates the database with test data
// matching lib/mock-data.ts so you can test with real Prisma queries.
//
// Run: npx prisma db seed

import { PrismaClient, EmblemVariant } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean up previous seed data ─────────────────────────────────────────────
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // ── Users ────────────────────────────────────────────────────────────────────
  const userBase = await prisma.user.create({
    data: {
      id: "user-1",
      name: "Ana Clara Mendes",
      email: "ana.mendes@escola.sp.gov.br",
      school: "E.E. Cecília Meireles",
      city: "São Paulo, SP",
      age: 16,
      hometown: "Campinas, SP",
      companion: "Pipoca (Golden)",
      lastAccess: new Date("2020-05-08T18:45:00.000Z"),
      rankTitle: "Aventureiro",
      avatarUrl: "/images/avatar-placeholder.png",
      bannerUrl: "/images/banner-placeholder.jpg",
    },
  });

  const userWithBadges = await prisma.user.create({
    data: {
      id: "user-2",
      name: "Ana Clara Mendes",
      email: "ana.badges@escola.sp.gov.br",
      school: "E.E. Cecília Meireles",
      city: "São Paulo, SP",
      age: 16,
      hometown: "Campinas, SP",
      companion: "Pipoca (Golden)",
      lastAccess: new Date("2020-05-08T18:45:00.000Z"),
      rankTitle: "Aventureiro",
      avatarUrl: "/images/avatar-placeholder.png",
      bannerUrl: "/images/banner-placeholder.jpg",
      badges: {
        create: [
          {
            id: "badge-1",
            name: "Primeira Vitória",
            iconUrl: null,
            earnedAt: new Date("2020-04-12T10:00:00.000Z"),
          },
          {
            id: "badge-2",
            name: "Explorador da Floresta",
            iconUrl: null,
            earnedAt: new Date("2020-05-01T14:20:00.000Z"),
          },
        ],
      },
    },
  });

  // ── Teams (rank 1-8) ─────────────────────────────────────────────────────────
  const teams = [
    { id: "team-1", name: "Equipe Um",    points: 7210, streakDays: 5, emblemVariant: EmblemVariant.default,   rank: 1 },
    { id: "team-2", name: "Equipe Dois",  points: 6970, streakDays: 2, emblemVariant: EmblemVariant.default,   rank: 2 },
    { id: "team-3", name: "Equipe Três",  points: 6520, streakDays: 1, emblemVariant: EmblemVariant.decorated, rank: 3 },
    { id: "team-4", name: "Equipe Quatro",points: 5875, streakDays: 0, emblemVariant: EmblemVariant.default,   rank: 4 },
    { id: "team-5", name: "Equipe Cinco", points: 5800, streakDays: 0, emblemVariant: EmblemVariant.default,   rank: 5 },
    { id: "team-6", name: "Equipe Seis",  points: 5535, streakDays: 0, emblemVariant: EmblemVariant.default,   rank: 6 },
    { id: "team-7", name: "Equipe Sete",  points: 5535, streakDays: 0, emblemVariant: EmblemVariant.default,   rank: 7 },
    { id: "team-8", name: "Equipe Oito",  points: 5180, streakDays: 0, emblemVariant: EmblemVariant.default,   rank: 8 },
  ];

  for (const team of teams) {
    await prisma.team.create({ data: team });
  }

  console.log(`✅ Seeded: 2 users, ${teams.length} teams`);
  console.log(`   user-1: ${userBase.email} (no badges)`);
  console.log(`   user-2: ${userWithBadges.email} (2 badges)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
