import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrisma(): PrismaClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: url,
      max: 10,
    });
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const instantiated = globalForPrisma.prisma ?? createPrisma();
if (instantiated) {
  globalForPrisma.prisma = instantiated;
}

/** Null when `DATABASE_URL` is unset — use mock data layer. */
export const prisma: PrismaClient | null = instantiated;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
