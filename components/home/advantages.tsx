"use client";

import { motion } from "framer-motion";
import {
  MapPin, Palette, BadgePercent, Headphones, ShieldCheck, CreditCard,
} from "lucide-react";

const ITEMS = [
  {
    icon: MapPin,
    title: "Удобный самовывоз",
    text: "Бесплатно забирайте заказы из нашего склада-магазина в Москве ежедневно 9:00–21:00.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    hoverBg: "group-hover:bg-blue-500",
  },
  {
    icon: Palette,
    title: "Профессиональная колеровка",
    text: "Подберём и заколеруем краску в любой оттенок по RAL, NCS, Tikkurila или вашему образцу.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    hoverBg: "group-hover:bg-purple-500",
  },
  {
    icon: CreditCard,
    title: "Оплата при получении",
    text: "Платите картой или наличными при получении. Для бизнеса — безналичный расчёт с НДС.",
    color: "text-green-500",
    bg: "bg-green-500/10",
    hoverBg: "group-hover:bg-green-500",
  },
  {
    icon: BadgePercent,
    title: "Бонусная программа",
    text: "До 10% бонусами с каждой покупки и персональные скидки постоянным клиентам.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    hoverBg: "group-hover:bg-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Только сертификат",
    text: "Продаём оригинальную продукцию с сертификатами качества и гарантией производителя.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    hoverBg: "group-hover:bg-red-500",
  },
  {
    icon: Headphones,
    title: "Консультация специалиста",
    text: "Поможем рассчитать расход и подобрать материал под конкретную поверхность.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    hoverBg: "group-hover:bg-sky-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Секция «О нас» / преимущества магазина
 */
export function Advantages() {
  return (
    <section className="section-shell py-16 md:py-24">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          О нас
        </p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">
          Почему выбирают КраскиУНАС
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          12 лет на рынке ЛКМ. Более 500 позиций в наличии. Гарантия качества на каждый товар.
        </p>
      </motion.div>

      {/* Сетка преимуществ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ITEMS.map(({ icon: Icon, title, text, color, bg, hoverBg }) => (
          <motion.div
            key={title}
            variants={itemVariants}
            className="group relative flex gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
          >
            {/* Фоновый эффект при ховере */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04] group-hover:from-current" />

            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${bg} transition-all duration-300 ${hoverBg} group-hover:text-white group-hover:shadow-lg`}
            >
              <Icon className={`size-5 ${color} transition-colors duration-300 group-hover:text-white`} />
            </span>

            <div>
              <h3 className="font-heading text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Нижняя статистика */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 grid grid-cols-2 gap-4 rounded-3xl border border-border bg-card p-8 shadow-sm md:grid-cols-4"
      >
        {[
          { value: "500+", label: "товаров в наличии" },
          { value: "12 лет", label: "на рынке ЛКМ" },
          { value: "10 000+", label: "оттенков колеровки" },
          { value: "6", label: "проверенных брендов" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-3xl font-extrabold text-accent md:text-4xl">{s.value}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
