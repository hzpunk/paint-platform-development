import prisma from "@/lib/db";

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
}
