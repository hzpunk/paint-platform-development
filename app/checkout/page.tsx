"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PaintCan } from "@/components/product/paint-can";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
// Commission is not calculated on checkout page — it's embedded in prices
import { cn } from "@/lib/utils";

type Step = 1 | 2;

function formatPhoneValue(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";

  const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;

  if (normalized.length <= 1) return "+7";
  if (normalized.length <= 4) return `+7 (${normalized.slice(1)}`;
  if (normalized.length <= 7)
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4)}`;
  if (normalized.length <= 9) {
    return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7)}`;
  }

  return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalBonus, clear } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);

  // Форма контактов
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [agreedOferta, setAgreedOferta] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Промокоды и бонусы
  const [promoCode, setPromoCode] = useState("");
  const [bonusUsed, setBonusUsed] = useState(0);

  const PROMO_CODES: Record<string, number> = {
    PROF10: 10,
    PAINT15: 15,
  };

  const discount = promoCode
    ? Math.round((subtotal * (PROMO_CODES[promoCode.toUpperCase()] || 0)) / 100)
    : 0;

  const total = subtotal - discount - bonusUsed;
  const earnedBonus = bonusUsed > 0 ? 0 : totalBonus;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPromoCode(params.get("promo") || "");
      setBonusUsed(Number(params.get("bonus") || 0));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    setName((current) => current || user.name || "");
    setPhone((current) => current || formatPhoneValue(user.phone || ""));
    setEmail((current) => current || user.email || "");
  }, [user]);

  function validateStep1(): boolean {
    if (!name.trim() || !phone.trim()) {
      toast.error("Заполните имя и телефон");
      return false;
    }
    return true;
  }

  async function submitOrder() {
    if (!agreedOferta || !agreedPrivacy) {
      toast.error(
        "Подтвердите согласие с офертой и политикой конфиденциальности",
      );
      return;
    }

    const payload = {
      name,
      phone,
      email,
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        volume: it.volume,
        price: it.price,
        quantity: it.quantity,
        sku: it.sku,
        color: it.color ?? null,
      })),
      total,
      subtotal,
      promoCode: promoCode || null,
      bonusUsed,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error("Ошибка оформления: " + (err?.error || res.statusText));
        setLoading(false);
        return;
      }
      const created = await res.json();
      clear();
      router.push(`/account?order=${created.id}`);
      toast.success(`Заказ ${created.id} оформлен! Ожидайте звонка.`);
    } catch (e) {
      toast.error("Ошибка оформления");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 text-center md:px-6">
        <p className="text-muted-foreground mb-4">Корзина пуста</p>
        <Button render={<Link href="/catalog" />}>В каталог</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <h1 className="mb-6 font-heading text-2xl font-bold md:text-3xl">
        Оформление заказа
      </h1>

      {/* Шаги */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        {[
          { n: 1, label: "Контакты и доставка" },
          { n: 2, label: "Подтверждение" },
        ].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-2">
            {idx > 0 && (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            <div
              className={cn(
                "flex items-center gap-2 font-medium",
                step === n
                  ? "text-primary"
                  : step > n
                    ? "text-success"
                    : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  step === n
                    ? "bg-primary text-primary-foreground"
                    : step > n
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {step > n ? "✓" : n}
              </span>
              <span className="hidden sm:block">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Форма */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <section>
                <h2 className="font-heading font-bold mb-4">
                  Контактные данные
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatPhoneValue(e.target.value))
                      }
                      placeholder="+7 900 000-00-00"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email (необязательно)</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mail@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border p-5 bg-muted/20">
                <h2 className="font-heading font-bold mb-2 flex items-center gap-2">
                  <Store className="size-5 text-primary" />
                  Способ получения
                </h2>
                <p className="text-sm font-medium">Самовывоз — Бесплатно</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Адрес: МКАД, 41-й километр, 4, стр. 27, Москва Ж12/5 (Пн–Пт
                  9:00–21:00, Сб 10:00–18:00)
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Подготовим заказ к выдаче в течение 2 часов. Оплата при
                  получении.
                </p>
              </section>

              <Button
                size="lg"
                className="self-start"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
              >
                Далее →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              {/* Сводка заказа */}
              <section>
                <h2 className="font-heading font-bold mb-4">Ваш заказ</h2>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={`${item.sku}-${item.color}`}
                      className="flex gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="w-12 h-12 shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/40">
                        {typeof item.image === "string" &&
                        /^(https?:|\/|data:image)/i.test(item.image) ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              const target = event.currentTarget;
                              target.style.display = "none";
                              const fallback =
                                target.parentElement?.querySelector(
                                  "[data-fallback]",
                                ) as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          data-fallback
                          className={cn(
                            "flex h-full w-full items-center justify-center",
                            typeof item.image === "string" &&
                              /^(https?:|\/|data:image)/i.test(item.image)
                              ? "hidden"
                              : "flex",
                          )}
                        >
                          <PaintCan
                            color={item.image || "#E5E7EB"}
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground">
                          {item.volume} л · {item.quantity} шт.
                        </p>
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Данные получения */}
              <section className="rounded-lg border border-border p-4 text-sm">
                <p className="font-semibold mb-2">Данные получения</p>
                <p>
                  <span className="text-muted-foreground">Получатель:</span>{" "}
                  {name}, {phone}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Способ получения:
                  </span>{" "}
                  Самовывоз (МКАД, 41-й километр, 4, стр. 27, Москва Ж12/5)
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Изменить
                </button>
              </section>

              {/* Напоминание об оплате */}
              <div className="rounded-lg border-2 border-accent/40 bg-accent/5 p-4">
                <p className="font-semibold text-sm mb-1">
                  💳 Оплата при получении
                </p>
                <p className="text-sm text-muted-foreground">
                  Оплачивайте заказ наличными или картой при получении в нашем
                  магазине. Онлайн-оплата не требуется.
                </p>
              </div>

              {/* Согласия 152-ФЗ */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="oferta"
                    checked={agreedOferta}
                    onCheckedChange={(v) => setAgreedOferta(Boolean(v))}
                  />
                  <label
                    htmlFor="oferta"
                    className="cursor-pointer text-sm leading-relaxed"
                  >
                    Я ознакомился и согласен с{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Пользовательским соглашением
                    </Link>{" "}
                    и{" "}
                    <Link
                      href="/loyalty-terms"
                      className="text-primary hover:underline"
                    >
                      Условиями программы лояльности
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy"
                    checked={agreedPrivacy}
                    onCheckedChange={(v) => setAgreedPrivacy(Boolean(v))}
                  />
                  <label
                    htmlFor="privacy"
                    className="cursor-pointer text-sm leading-relaxed"
                  >
                    Я даю согласие на{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      обработку персональных данных
                    </Link>{" "}
                    в соответствии с ФЗ-152
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  ← Назад
                </Button>
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={submitOrder}
                  disabled={!agreedOferta || !agreedPrivacy || loading}
                >
                  <CheckCircle className="size-5" />
                  {loading ? "Оформление..." : "Подтвердить заказ"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Сайдбар с итогом */}
        <div>
          <div className="rounded-lg border border-border bg-card p-5 sticky top-20">
            <h2 className="font-heading font-bold mb-4">Сумма заказа</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span>Товары ({items.length})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Скидка ({promoCode})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              {bonusUsed > 0 && (
                <div className="flex justify-between text-success">
                  <span>Бонусы</span>
                  <span>−{formatPrice(bonusUsed)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Получение</span>
                <span>Самовывоз (Бесплатно)</span>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold text-base">
                <span>Итого</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
             {earnedBonus > 0 ? (
               <p className="mt-3 text-xs text-success">
                 +{earnedBonus} бонусных баллов
               </p>
             ) : (
               <p className="mt-3 text-xs text-muted-foreground">
                 Баллы не начисляются при оплате бонусами
               </p>
             )}
            <p className="mt-2 text-xs text-muted-foreground">
              Самовывоз доступен в рабочие часы магазина
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
