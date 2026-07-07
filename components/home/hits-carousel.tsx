"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";

/**
 * Слайдер лидеров продаж с Embla Carousel + Framer Motion
 */
export function HitsCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    containScroll: "trimSnaps",
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetch("/api/products?hit=true&limit=12")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.products) && d.products.length > 0) {
          setProducts(d.products);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (error || products.length === 0)) return null;

  return (
    <section className="overflow-hidden border-y border-border bg-secondary/30 py-16 md:py-24">
      <div className="section-shell">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between gap-4"
        >
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <Flame className="size-3.5" />
              Выбор покупателей
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">
              Лидеры продаж
            </h2>
            <p className="mt-2 text-muted-foreground">
              Самые востребованные товары этого месяца
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Кнопки навигации */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!prevBtnEnabled}
              aria-label="Назад"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!nextBtnEnabled}
              aria-label="Вперёд"
              className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>

            <Link
              href="/catalog"
              className="ml-2 hidden items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground sm:flex"
            >
              Весь каталог
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Слайдер */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-72 shrink-0">
                <div className="h-96 animate-pulse rounded-2xl bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="w-[280px] shrink-0"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dot-навигация */}
            {scrollSnaps.length > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {scrollSnaps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Слайд ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === selectedIndex
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
