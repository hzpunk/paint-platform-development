import { PrismaClient } from "@prisma/client";
import { categories, brands } from "../lib/data";
import * as dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");
  await prisma.review.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: "admin" } } });

  console.log("Seeding database...");

  // Категории и бренды
  for (const category of categories) {
    const { name, slug } = category;
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  for (const brand of brands) {
    const { name, slug } = brand;
    await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
