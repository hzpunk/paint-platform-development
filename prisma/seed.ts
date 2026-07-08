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

  // Продукты
  for (const product of products) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: { equals: product.categorySlug, mode: "insensitive" } },
          { name: { equals: product.categorySlug, mode: "insensitive" } },
        ],
      },
    });

    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { slug: { equals: product.brand, mode: "insensitive" } },
          { name: { equals: product.brand, mode: "insensitive" } },
        ],
      },
    });

    if (!category || !brand) {
      console.warn(`Skipping product ${product.name}: category (${product.categorySlug}) or brand (${product.brand}) not found`);
      continue;
    }

    const productData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: typeof product.stock === "number" ? product.stock : ((product as any).inStock ? 50 : 0),
      images: product.images,
      category: { connect: { id: category.id } },
      brand: { connect: { id: brand.id } },
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
