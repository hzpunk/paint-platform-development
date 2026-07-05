import prisma from "./db";
import type { Review } from "./types";

function mapReview(row: any): Review {
  return {
    id: row.id,
    productSlug: row.productId,
    author: row.user?.name || row.user?.email?.split("@")[0] || "Покупатель",
    rating: row.rating,
    date:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString().slice(0, 10)
        : String(row.createdAt),
    text: row.text ?? "",
    verified: true,
  };
}

export async function getReviewsForProduct(
  productSlug: string,
): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: { productId: productSlug },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(mapReview);
}

export async function getLatestReviews(limit = 4): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reviews.map(mapReview);
}
