import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ProductSource } from "../src/generated/prisma/enums";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL to run seed.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.product.upsert({
    where: {
      source_externalId: {
        source: ProductSource.MANUAL,
        externalId: "seed-demo-1",
      },
    },
    create: {
      source: ProductSource.MANUAL,
      externalId: "seed-demo-1",
      title: "Seed — Wireless Earbuds Pro (Demo SKU)",
      normalizedTitle: "Wireless Earbuds Pro",
      brand: "DemoAudio",
      category: "Electronics",
      subcategory: "Audio",
      imageUrl:
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop",
      productUrl: "https://www.amazon.com/dp/seed-demo",
      affiliateUrl: "https://www.amazon.com/dp/seed-demo?tag=flashdealai-20",
      currency: "USD",
      currentPrice: 59.99,
      originalPrice: 99.99,
      discountPercent: 40,
      aiScore: 85,
      aiSummary: "Demo row from prisma/seed.ts — replace with live ingestion.",
      aiReasonToBuy: "Strong seed discount for testing admin publish + AI rerun flows.",
      availability: "In stock",
      rating: 4.5,
      reviewCount: 1200,
      tags: ["seed", "audio"],
      slug: "seed-wireless-earbuds-pro",
      seoTitle: "Demo earbuds deal",
      seoDescription: "Seeded product for FlashDealAI local development.",
      published: true,
      lastSeenAt: new Date(),
    },
    update: {
      lastSeenAt: new Date(),
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
