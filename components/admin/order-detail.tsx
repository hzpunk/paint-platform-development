"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Item = { name: string; volume: number; quantity: number; price: number };
type Order = {
  id: string;
  date: string;
  total: number;
  items: Item[];
  status: string;
};

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      })
      .catch(() => setOrder(null));

    fetch(`/api/admin/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "audit" }),
    })
      .then((r) => r.json())
      .then((a) => setAudit(a || []))
      .catch(() => setAudit([]));
  }, [orderId]);

  async function changeStatus() {
    if (!order) return;
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, actor: "admin" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder(updated);
      const ares = await fetch(`/api/admin/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "audit" }),
      });
      const ajson = await ares.json();
      setAudit(ajson || []);
    }
    setLoading(false);
  }

  if (order === null) {
    return <div>Загрузка заказа…</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Заказ #{order.id}</h1>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Дата: {order.date}</p>
        <p className="text-sm">
          Сумма: <strong>{order.total.toLocaleString("ru")} ₽</strong>
        </p>
        <div className="mt-3">
          <h3 className="font-semibold">Товары</h3>
          <ul className="list-disc pl-5">
            {order.items.map((it, i) => (
              <li key={i}>
                {it.name} · {it.volume} л · {it.quantity} шт. —{" "}
                {it.price.toLocaleString("ru")} ₽
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Статус</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input"
            >
              <option>Оформлен</option>
              <option>Собирается</option>
              <option>В пути</option>
              <option>Доставлен</option>
              <option>Отменён</option>
            </select>
            <Button type="button" disabled={loading} onClick={changeStatus}>
              {loading ? "Сохранение..." : "Сменить"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Назад
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Аудит лог</h3>
          <ul className="list-none mt-2 space-y-2">
            {audit.length > 0 ? (
              audit.map((a, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {a.at} · {a.actor} · {a.from} → {a.to}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">Записей нет</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
