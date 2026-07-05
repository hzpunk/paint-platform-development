const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin exists:", email);
  } else {
    const hash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { email, name: "Administrator", role: "admin", password: hash },
    });
    console.log("Created admin", user.id);
  }

  const demoUsers = [
    {
      email: "ivan@local",
      name: "Иван Иванов",
      password: "welcome123",
      phone: "+7 915 123-45-67",
      bonusBalance: 520,
      totalSpent: 48600,
    },
    {
      email: "maria@local",
      name: "Мария Сергеева",
      password: "welcome123",
      phone: "+7 916 987-65-43",
      bonusBalance: 320,
      totalSpent: 23800,
    },
  ];

  for (const userData of demoUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      console.log("Demo user exists:", userData.email);
      continue;
    }
    const hash = bcrypt.hashSync(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: "user",
        password: hash,
        phone: userData.phone,
        bonusBalance: userData.bonusBalance,
        totalSpent: userData.totalSpent,
      },
    });
    console.log("Created demo user", user.id);
  }

  const demoReviews = [
    {
      id: "review-1",
      productId: "interior-matt-premium",
      userEmail: "ivan@local",
      rating: 5,
      text: "Красил спальню, краска ложится ровно и ложится хорошо. Цвет сохранился после влажной уборки.",
    },
    {
      id: "review-2",
      productId: "interior-matt-premium",
      userEmail: "maria@local",
      rating: 4,
      text: "Колеровка пришла точь-в-точь, упаковка надёжная. Сухнет за два слоя.",
    },
    {
      id: "review-3",
      productId: "facade-acryl-fasad",
      userEmail: "ivan@local",
      rating: 5,
      text: "Заказали для фасада — держится отличчо и не выцвел за сезон.",
    },
  ];

  for (const reviewData of demoReviews) {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewData.id },
    });
    if (existingReview) {
      console.log("Review exists:", reviewData.id);
      continue;
    }

    const reviewUser = await prisma.user.findUnique({
      where: { email: reviewData.userEmail },
    });
    if (!reviewUser) {
      console.log("Skipping review without user:", reviewData.userEmail);
      continue;
    }

    const review = await prisma.review.create({
      data: {
        id: reviewData.id,
        userId: reviewUser.id,
        productId: reviewData.productId,
        rating: reviewData.rating,
        text: reviewData.text,
      },
    });
    console.log("Created review", review.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
