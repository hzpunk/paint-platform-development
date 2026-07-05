const { PrismaClient } = require("@prisma/client");
const { products, categories, brands } = require("../lib/data");
const { hash } = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Create categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
      },
    });
  }

  // Create brands
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
      },
    });
  }

  // Get created categories and brands for IDs
  const dbCategories = await prisma.category.findMany();
  const dbBrands = await prisma.brand.findMany();

  // Create products
  for (const product of products) {
    const category = dbCategories.find((c) => c.slug === product.categorySlug);
    const brand = dbBrands.find((b) => b.name === product.brand);

    if (!category || !brand) {
      console.warn(`Skipping product ${product.slug}: category or brand not found`);
      continue;
    }

    const productData = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      stock: product.inStock ? 100 : 0,
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
      specs: product.specs,
      application: product.application,
      packaging: product.packaging,
      colors: product.colors,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData,
    });
  }
  console.log(`Seeded ${products.length} products.`);

  // Seed Admin User
  const adminEmail = process.env.COLORS_ADMIN || "admin@local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        role: "admin",
      },
    });
    console.log(`Created admin user with email: ${adminEmail}`);
  } else {
    console.log(`Admin user with email: ${adminEmail} already exists.`);
  }

  console.log("Seeding done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
