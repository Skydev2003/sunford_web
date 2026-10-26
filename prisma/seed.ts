import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { products } from "../src/features/catalog/data/products";

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR-PASSWORD")) {
    throw new Error("Set a valid DIRECT_URL or DATABASE_URL before seeding.");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    for (const product of products) {
      await prisma.product.upsert({ where: { id: product.id }, create: product, update: product });
    }
    console.info(`Seeded ${products.length} Sunford products.`);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(() => {
  console.error("Seeding failed. Check your database configuration and schema.");
  process.exitCode = 1;
});
