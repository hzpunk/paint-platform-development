"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

type Item = { name?: string; volume?: number; qty?: number; price?: number };
type Order = {
  id: string;
  createdAt?: string;
  total?: number;
  items?: Item[];
  status?: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  deliveryMethod?: string | null;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
};

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${id}`);
        if (!response.ok) throw new Error("Заказ не найден");
        const data = await response.json();
        if (!active) return;
        setOrder(data);
        setStatus(data.status || "Оформлен");
      } catch {
        if (active) {
          setOrder(null);
          setStatus("Оформлен");
        }
      }
    };

    loadOrder();
    return () => { active = false; };
  }, [id]);

  async function changeStatus() {
    if (!order) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setOrder({ ...order, ...updated, status: updated.status || status });
      }
    } finally {
      setLoading(false);
    }
  }

  if (!order) return <div className="rounded-lg border border-border bg-card p-6">Загрузка заказа…</div>;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-heading font-bold">Заказ #{order.id}</h1>
        <button onClick={() => router.back()} className="rounded-md border px-3 py-2 text-sm">Назад</button>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Дата: {order.createdAt ? new Date(order.createdAt).toLocaleString("ru") : "—"}</span>
          <span>Сумма: <strong className="text-foreground">{(order.total ?? 0).toLocaleString("ru-RU")} ₽</strong></span>
          <span>Статус: <strong className="text-foreground">{order.status || "Оформлен"}</strong></span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <h3 className="font-semibold">Контакты</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>{order.customerName || "—"}</p>
              <p>{order.customerEmail || "—"}</p>
              <p>{order.customerPhone || "—"}</p>
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/20 p-3">
            <h3 className="font-semibold">Доставка</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>{order.deliveryMethod || "—"}</p>
              <p>{order.deliveryAddress || "—"}</p>
              <p>{order.paymentMethod || "—"}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Товары</h3>
          {items.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              {items.map((it, i) => (
                <li key={i}>
                  {it.name || "Товар"} · {it.volume ?? 0} л · {it.qty ?? 1} шт. — {(it.price ?? 0).toLocaleString("ru-RU")} ₽
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Состав заказа пуст.</p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Статус</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="Оформлен">Оформлен</option>
              <option value="Собирается">Собирается</option>
              <option value="В пути">В пути</option>
              <option value="Доставлен">Доставлен</option>
              <option value="Отменён">Отменён</option>
            </select>
            <button
              disabled={loading}
              onClick={changeStatus}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Сохраняю…" : "Сменить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
