import { Star } from "lucide-react";
import { getLatestReviews } from "@/lib/reviewQueries";
import { formatDate } from "@/lib/format";

/** Карусель отзывов на главной (статичная сетка 3 отзыва). */
export default async function ReviewsBlock() {
  const shown = await getLatestReviews(4);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold md:text-3xl">
          Отзывы покупателей
        </h2>
        <p className="mt-2 text-muted-foreground">
          Реальные отзывы подтверждённых покупателей
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            {/* Звёзды */}
            <div
              className="flex items-center gap-0.5"
              aria-label={`Оценка: ${review.rating} из 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            {/* Текст */}
            <p className="flex-1 text-sm leading-relaxed text-foreground">
              "{review.text}"
            </p>
            {/* Автор */}
            <div className="border-t border-border pt-3">
              <p className="text-sm font-semibold">{review.author}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {formatDate(review.date)}
                </p>
                {review.verified && (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    ✓ Покупатель
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
