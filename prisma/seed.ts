import { PrismaClient, Prisma } from "@prisma/client";
import { products, categories, brands } from "../lib/data";
import type { Product, ProductSpecs, Packaging } from "../lib/types";
import * as dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Категории и бренды
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug }, update: {}, create: category,
    });
  }
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug }, update: {}, create: brand,
    });
  }

  // Продукты
  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    const brand = await prisma.brand.findUnique({ where: { slug: product.brand } });

    if (!category || !brand) {
      console.warn(`Skipping product ${product.name}: category or brand not found`);
      continue;
    }

    const productData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.stock,
      images: product.images,
      categoryId: category.id,
      brandId: brand.id,
      type: product.type,
      surfaces: product.surfaces,
      badges: product.badges,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      colorable: product.colorable,
      shortSpec: product.shortSpec,
      application: product.application,
      specs: product.specs as unknown as Prisma.InputJsonValue,
      packaging: product.packaging as unknown as Prisma.InputJsonValue,
      colors: product.colors as unknown as Prisma.InputJsonValue,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData,
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
