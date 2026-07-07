"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, Building2, Layers, Paintbrush,
  ShieldCheck, FlaskConical, ArrowUpRight, type LucideIcon,
} from "lucide-react";
import { categories as fallbackCategories } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = {
  Home, Building2, Layers, Paintbrush, ShieldCheck, FlaskConical,
};

// Красивые градиенты для карточек категорий
const GRADIENTS = [
  "from-blue-500/20 to-indigo-500/10",
  "from-orange-500/20 to-red-500/10",
  "from-green-500/20 to-emerald-500/10",
  "from-purple-500/20 to-violet-500/10",
  "from-amber-500/20 to-yellow-500/10",
  "from-sky-500/20 to-cyan-500/10",
];

const ICON_COLORS = [
  "text-blue-500",
  "text-orange-500",
  "text-green-500",
  "text-purple-500",
  "text-amber-500",
  "text-sky-500",
];

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  _count?: { products: number };
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Сетка популярных категорий с анимацией входа
 * Загружает категории из API с fallback на статику
 */
export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(
          Array.isArray(data) && data.length > 0
            ? data
            : (fallbackCategories as Category[])
        );
      })
      .catch(() => setCategories(fallbackCategories as Category[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-shell py-16 md:py-24">
      {/* Заголовок секции */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Каталог
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">
            Популярные категории
          </h2>
          <p className="mt-2 text-muted-foreground">
            Выберите тип покрытия для вашей задачи
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground sm:flex"
        >
          Все категории
          <ArrowUpRight className="size-3.5" />
        </Link>
      </motion.div>

      {/* Скелетон при загрузке */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon ?? ""] ?? Layers;
            const grad = GRADIENTS[i % GRADIENTS.length];
            const iconColor = ICON_COLORS[i % ICON_COLORS.length];

            return (
              <motion.div key={c.slug} variants={cardVariants}>
                <Link
                  href={`/catalog?category=${c.slug}`}
                  className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Фоновый градиент при ховере */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${grad} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  {/* Иконка */}
                  <span className={`relative flex size-14 items-center justify-center rounded-2xl bg-secondary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground`}>
                    <Icon className={`size-6 ${iconColor} transition-colors duration-300 group-hover:text-primary-foreground`} />
                  </span>

                  {/* Название */}
                  <span className="relative text-sm font-bold leading-tight">{c.name}</span>

                  {/* Количество товаров */}
                  {c._count?.products !== undefined && (
                    <span className="relative text-xs text-muted-foreground">
                      {c._count.products} товаров
                    </span>
                  )}

                  {/* Линия снизу */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
