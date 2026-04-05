/**
 * Persistence layer for the deal engine.
 *
 * This project uses **PostgreSQL via Prisma** (not SQLite): serverless-friendly,
 * already wired across the app, and required for Vercel production.
 *
 * - `deals` → `Product` model (`@@map("products")`)
 * - `categories` → `Category` model (`@@map("categories")`)
 */

export { prisma, hasDatabase } from "@/lib/prisma";
export {
  upsertProductFromFetched,
  syncCategoriesFromProducts,
} from "@/lib/deal-engine/persist";
