"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Palette, Droplets, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const SWATCHES = [
  { hex: "#F4F4F0", name: "Белый" },
  { hex: "#D9C7A3", name: "Бежевый" },
  { hex: "#9DB4C0", name: "Серо-голубой" },
  { hex: "#7C8B4F", name: "Оливковый" },
  { hex: "#C05746", name: "Терракота" },
  { hex: "#3A4A6B", name: "Индиго" },
  { hex: "#6B7280", name: "Графит" },
  { hex: "#E7B7A0", name: "Пудровый" },
  { hex: "#B5C8A8", name: "Фисташковый" },
  { hex: "#8B5E3C", name: "Шоколад" },
  { hex: "#F0E68C", name: "Соломенный" },
  { hex: "#708090", name: "Стальной" },
];

const FEATURES = [
  { icon: Palette, label: "RAL, NCS, Tikkurila, образец" },
  { icon: Droplets, label: "Компьютерная колеровка" },
  { icon: Zap, label: "Готово за 15 минут" },
];

/**
 * CTA-секция — услуга колеровки красок
 */
export function ColorMixingCta() {
  return (
    <section className="section-shell py-16 md:py-24">
      <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        {/* Декоративный фон */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 70% at 100% 50%, rgba(245,166,35,0.15), transparent 60%), radial-gradient(ellipse 50% 60% at 0% 80%, rgba(255,255,255,0.05), transparent 50%)",
          }}
        />

        <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">
          {/* Левая колонка */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent">
              <Palette className="size-3.5" />
              Услуга
            </span>

            <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight md:text-4xl">
              Колеровка в любой из{" "}
              <span className="text-accent">10 000+</span> оттенков
            </h2>

            <p className="mt-4 max-w-md leading-relaxed text-primary-foreground/70">
              Подбираем цвет по каталогам RAL, NCS, Tikkurila или вашему образцу.
              Компьютерная колеровка гарантирует точное попадание и повторяемость.
            </p>

            {/* Фичи */}
            <ul className="mt-6 flex flex-col gap-3">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm text-primary-foreground/85">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20">
                    <Icon className="size-4 text-accent" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="mt-8 gap-2 bg-accent font-bold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:bg-accent/90 hover:-translate-y-0.5 hover:shadow-accent/40 hover:shadow-xl"
              render={<Link href="/colormixing" />}
            >
              Заказать колеровку
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          {/* Правая колонка — свотчи */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-4 gap-3"
          >
            {SWATCHES.map((s, i) => (
              <motion.div
                key={s.hex}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <div
                  className="aspect-square rounded-xl border border-white/10 shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:scale-105"
                  style={{ backgroundColor: s.hex }}
                  role="img"
                  aria-label={`Оттенок ${s.name}`}
                />
                <span className="pointer-events-none absolute inset-x-0 top-full mt-1.5 text-center text-[10px] font-medium text-primary-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {s.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
