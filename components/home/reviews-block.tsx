"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Блок отзывов покупателей с анимацией входа
 */
export default function ReviewsBlock() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (error || reviews.length === 0)) return null;

  return (
    <section className="border-t border-border bg-secondary/30 py-16 md:py-24">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Нам доверяют</p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">
            Отзывы покупателей
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Реальные отзывы от клиентов о нашей продукции и сервисе
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {reviews.map((review) => {
              const name = review.user?.name || review.author || "Покупатель";
              const initial = name.trim().charAt(0).toUpperCase() || "П";
              return (
                <motion.figure
                  key={review.id}
                  variants={cardVariants}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
                >
                  {/* Декоративная кавычка */}
                  <Quote
                    aria-hidden
                    className="absolute -right-1 -top-1 size-16 text-primary/5 transition-colors duration-300 group-hover:text-accent/10"
                  />

                  {/* Звёзды */}
                  <div
                    className="flex items-center gap-0.5"
                    role="img"
                    aria-label={`Оценка: ${review.rating} из 5`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < review.rating ? "fill-accent text-accent" : "text-border"
                        )}
                      />
                    ))}
                  </div>

                  {/* Текст */}
                  <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                    {review.text}
                  </blockquote>

                  {/* Автор */}
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
                      {initial}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      {review.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </figcaption>
                </motion.figure>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
