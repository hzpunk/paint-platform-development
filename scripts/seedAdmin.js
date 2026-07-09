const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.COLORS_ADMIN || "admin@local";
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
