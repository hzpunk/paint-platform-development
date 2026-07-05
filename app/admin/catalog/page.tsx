import { AdminProductsTable } from "@/components/admin/products-table";
import prisma from "@/lib/db";

export default async function AdminCatalogPage() {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminProductsTable initialProducts={products} />
    </div>
  );
}
