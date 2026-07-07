"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Palette,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";

const HIGHLIGHTS = [
  { icon: CreditCard, label: "Оплата при получении" },
  { icon: Palette, label: "Колеровка в любой цвет" },
  { icon: ShieldCheck, label: "Сертифицированные ЛКМ" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.11, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevEnabled(emblaApi.canScrollPrev());
    setNextEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetch("/api/products?limit=8&inStock=true")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.products) && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Декоративный фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(245,166,35,0.13), transparent 60%), radial-gradient(ellipse 50% 50% at 10% 90%, rgba(255,255,255,0.04), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="section-shell relative grid min-h-[90vh] items-center gap-10 py-16 md:grid-cols-2 md:py-20">
        {/* ─── Левая колонка: текст ─── */}
        <div className="flex flex-col gap-6">
          <motion.span
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            КраскиУНАС — профессиональные ЛКМ
          </motion.span>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-balance font-heading text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl"
          >
            Краска, которая{" "}
            <span className="text-accent">ложится идеально</span>
            {" "}с первого слоя
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-sm text-pretty text-base leading-relaxed text-primary-foreground/70 md:text-lg"
          >
            Более 500 позиций ЛКМ. Колеровка, самовывоз в Москве,
            оплата при получении.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              className="gap-2 bg-accent font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/40"
              render={<Link href="/catalog" />}
            >
              Перейти в каталог
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-primary-foreground/25 font-semibold text-primary-foreground transition-all hover:border-primary-foreground/50 hover:bg-primary-foreground/10"
              render={<Link href="/colormixing" />}
            >
              Услуга колеровки
            </Button>
          </motion.div>

          <motion.ul
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-x-6 gap-y-2 pt-1"
          >
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-primary-foreground/85">
                <Icon className="size-4 text-accent" />
                {label}
              </li>
            ))}
          </motion.ul>

          {/* Статистика */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid w-fit grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6"
          >
            {[
              { value: "500+", label: "товаров" },
              { value: "10 000+", label: "оттенков" },
              { value: "12 лет", label: "опыта" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-heading text-2xl font-extrabold text-accent">{s.value}</p>
                <p className="mt-0.5 text-xs text-primary-foreground/55">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── Правая колонка: слайдер товаров ─── */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          {/* Заголовок слайдера + навигация */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-primary-foreground/70">
              Популярные товары
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Назад"
                className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Вперёд"
                className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Карусель */}
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-[420px] w-64 shrink-0 animate-pulse rounded-2xl bg-primary-foreground/10" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div ref={emblaRef} className="overflow-hidden rounded-2xl">
              <div className="flex gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[260px] shrink-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Заглушка если нет продуктов */
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5">
              <p className="text-sm text-primary-foreground/40">Нет товаров</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
