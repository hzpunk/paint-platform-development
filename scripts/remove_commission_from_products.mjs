import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const HZCOMPANY_COMMISSION_RATE = 0.2;
const MULT = 1 + HZCOMPANY_COMMISSION_RATE;

async function main() {
  const outPath = path.resolve(process.cwd(), "tmp", "price-backup.json");
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

  console.log("Loading products...");
  const products = await prisma.product.findMany({
    select: { id: true, price: true, packaging: true },
  });

  const backup = products.map((p) => ({
    id: p.id,
    price: p.price,
    packaging: p.packaging,
  }));
  await fs.promises.writeFile(outPath, JSON.stringify(backup, null, 2), "utf8");
  console.log(`Backup written to ${outPath}`);

  for (const p of products) {
    const currentPrice = typeof p.price === "number" ? p.price : null;
    const newPrice = currentPrice ? Math.round(currentPrice / MULT) : null;

    let newPackaging = p.packaging;
    if (Array.isArray(p.packaging)) {
      newPackaging = p.packaging.map((pkg) => {
        if (!pkg || typeof pkg !== "object") return pkg;
        if (typeof pkg.price === "number") {
          return { ...pkg, price: Math.round(pkg.price / MULT) };
        }
        return pkg;
      });
    } else if (p.packaging && typeof p.packaging === "object") {
      newPackaging = { ...p.packaging };
      if (typeof newPackaging.price === "number") {
        newPackaging.price = Math.round(newPackaging.price / MULT);
      }
    }

    // Only update when a change is expected
    const shouldUpdate =
      (currentPrice && newPrice && currentPrice !== newPrice) ||
      JSON.stringify(newPackaging) !== JSON.stringify(p.packaging);
    if (shouldUpdate) {
      await prisma.product.update({
        where: { id: p.id },
        data: { price: newPrice, packaging: newPackaging },
      });
      console.log(`Updated product ${p.id}: ${currentPrice} -> ${newPrice}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
