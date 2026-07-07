"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Gift, ArrowRight, Check, Trophy, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loyaltyTiers } from "@/lib/data";

const TIER_ICONS = [Star, Trophy, Gem, Star];

/**
 * Блок программы лояльности и реферальной программы на главной
 */
export function LoyaltyBlock() {
  return (
    <section className="section-shell py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Привилегии</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">
          Зарабатывайте с каждой покупкой
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Копите бонусы, приглашайте друзей и получайте привилегии уже с первого заказа.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Блок лояльности */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-md">
              <Star className="size-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Программа лояльности
            </span>
          </div>

          <h3 className="mt-5 font-heading text-2xl font-extrabold">
            До 10% бонусами с каждой покупки
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Накапливайте баллы и тратьте их на следующие заказы. Четыре уровня
            привилегий — от Стандарта до Платины с персональным менеджером.
          </p>

          {/* Тиры */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {loyaltyTiers.map((tier, i) => {
              const Icon = TIER_ICONS[i] ?? Star;
              return (
                <div
                  key={tier.name}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/50 px-4 py-3"
                >
                  <Icon className="size-4 text-accent shrink-0" />
                  <div>
                    <p className="text-xs font-bold">{tier.name}</p>
                    <p className="text-[11px] text-muted-foreground">{tier.rate}% бонусов</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-7">
            <Button
              className="gap-2 bg-accent font-semibold text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90 hover:-translate-y-0.5 transition-all"
              render={<Link href="/loyalty" />}
            >
              Узнать подробнее
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>

        {/* Блок реферальной программы */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col rounded-3xl border border-border bg-primary p-8 text-primary-foreground shadow-sm"
        >
          {/* Фоновый градиент */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 60% at 80% 20%, rgba(245,166,35,0.12), transparent 60%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15 text-accent">
              <Gift className="size-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
              Реферальная программа
            </span>
          </div>

          <h3 className="relative mt-5 font-heading text-2xl font-extrabold">
            Приглашайте друзей — зарабатывайте вместе
          </h3>
          <p className="relative mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Поделитесь своим кодом. После первого заказа друга вы оба получите бонусы.
          </p>

          <ul className="relative mt-6 space-y-3.5 text-sm text-primary-foreground/85">
            {[
              "Друг зарегистрировался → вам +100 бонусов",
              "Друг сделал первый заказ → вам +2% от суммы",
              "Выплата из комиссии сервиса — без потерь для друга",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>

          <div className="relative mt-auto pt-7">
            <Button
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 transition-all"
              render={<Link href="/register" />}
            >
              Зарегистрироваться
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
