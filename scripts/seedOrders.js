const fs = require("fs");
const path = require("path");

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const file = path.join(process.cwd(), "data", "admin", "orders.json");
  if (!fs.existsSync(file)) {
    console.log("No orders.json to seed");
    process.exit(0);
  }
  const raw = fs.readFileSync(file, "utf-8");
  const orders = JSON.parse(raw);

  for (const o of orders) {
    const exists = await prisma.order.findUnique({ where: { id: o.id } });
    if (exists) {
      console.log("Skipping existing", o.id);
      continue;
    }
    const created = await prisma.order.create({
      data: {
        id: o.id,
        date: o.date ? new Date(o.date) : new Date(),
        total: o.total || 0,
        status: o.status || "Оформлен",
        bonusEarned: o.bonusEarned || 0,
        tracking: o.tracking || null,
        items: {
          create: (o.items || []).map((it) => ({
            name: it.name,
            volume: it.volume,
            price: it.price,
            qty: it.quantity,
          })),
        },
      },
    });
    console.log("Created order", created.id);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
