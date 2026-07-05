"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  productName: string;
  userName: string;
  createdAt: string;
};

export function AdminReviewsTable({
  initialReviews,
}: {
  initialReviews: ReviewRow[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function deleteReview(id: string) {
    if (!confirm("Удалить отзыв?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка");
      setReviews((prev) => prev.filter((item) => item.id !== id));
      toast.success("Отзыв удалён");
    } catch {
      toast.error("Не удалось удалить отзыв");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Отзывы</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Просмотр и модерация отзывов покупателей.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Оценка</th>
              <th className="px-4 py-3">Комментарий</th>
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-t border-border">
                <td className="px-4 py-3">{review.productName}</td>
                <td className="px-4 py-3">{review.userName}</td>
                <td className="px-4 py-3">{review.rating}</td>
                <td className="px-4 py-3 max-w-[320px] truncate">
                  {review.comment}
                </td>
                <td className="px-4 py-3">{review.createdAt}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteReview(review.id)}
                    disabled={loadingId === review.id}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
