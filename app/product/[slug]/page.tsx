import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getProductBySlug,
  products,
  getRelatedProducts,
  getAccessories,
} from "@/lib/data";
import { getReviewsForProduct } from "@/lib/reviewQueries";
import { ProductPageClient } from "./product-page-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortSpec,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const reviews = await getReviewsForProduct(slug);
  const accessories = getAccessories();

  return (
    <ProductPageClient
      product={product}
      related={related}
      reviews={reviews}
      accessories={accessories}
    />
  );
}
