import { ProductPageClient } from "./product-page-client";
import prisma from "@/lib/db";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, reviews: { include: { user: { select: { name: true } } } } },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    include: { category: true, brand: true },
  });

  const accessories = await prisma.product.findMany({
    where: { category: { slug: { in: ["primer", "special"] } } },
    take: 4,
    include: { category: true, brand: true },
  });

  const productForClient = {
    ...product,
    categorySlug: product.category.slug,
    brand: product.brand.name,
    inStock: product.stock > 0,
    packaging: product.packaging as any,
    colors: product.colors as any,
    specs: product.specs as any,
  };

  const reviewsForClient = product.reviews.map((review) => ({
    ...review,
    author: review.user?.name ?? "Покупатель",
    date: review.createdAt.toISOString(),
    text: review.text ?? "",
  }));

  const relatedForClient = related.map((p) => ({
    ...p,
    categorySlug: p.category.slug,
    brand: p.brand.name,
    inStock: p.stock > 0,
    packaging: p.packaging as any,
    colors: p.colors as any,
    specs: p.specs as any,
  }));

  const accessoriesForClient = accessories.map((p) => ({
    ...p,
    categorySlug: p.category.slug,
    brand: p.brand.name,
    inStock: p.stock > 0,
    packaging: p.packaging as any,
    colors: p.colors as any,
    specs: p.specs as any,
  }));

  return (
    <ProductPageClient
      product={productForClient}
      related={relatedForClient}
      reviews={reviewsForClient}
      accessories={accessoriesForClient}
    />
  );
}
