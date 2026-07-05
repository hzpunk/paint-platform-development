import { headers } from "next/headers";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { AdminReviewsTable } from "@/components/admin/reviews-table";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, product: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Отзывы</h1>
        <p className="text-sm text-muted-foreground">
          Список отзывов покупателей с привязкой к товарам.
        </p>
      </div>
      <AdminReviewsTable
        initialReviews={reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          productName: review.product?.name ?? "Товар удалён",
          userName: review.user?.name ?? review.user?.email ?? "Покупатель",
          createdAt: review.createdAt.toISOString().slice(0, 10),
        }))}
      />
    </div>
  );
}
