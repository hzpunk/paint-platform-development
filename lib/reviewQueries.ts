import { Review } from "@prisma/client";
import { getProductBySlug } from "./data";

export function getReviewsForProduct(slug: string): Review[] {
  const product = getProductBySlug(slug);
  if (!product) return [];

  // This is a mock implementation. Replace with actual database query.
  const mockReviews: Review[] = [
    {
      id: "1",
      userId: "1",
      productId: product.id,
      rating: 5,
      text: "Отличный товар!",
      createdAt: new Date(),
    },
  ];

  return mockReviews;
}
