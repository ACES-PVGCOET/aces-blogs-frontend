/**
 * lib/prisma.ts
 *
 * Singleton PrismaClient for Next.js.
 * In production a single instance is created and reused.
 * In development hot-reload would create many instances, so we cache
 * the instance on `globalThis` to avoid "too many connections" errors.
 *
 * Docs: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
