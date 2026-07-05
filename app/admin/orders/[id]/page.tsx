"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { name: string; volume: number; quantity: number; price: number };
type Order = {
  id: string;
  date: string;
  total: number;
  items: Item[];
  status: string;
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      });

    // fetch audit
    fetch(`/api/admin/orders/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "audit" }),
    })
      .then((r) => r.json())
      .then((a) => setAudit(a || []))
      .catch(() => setAudit([]));
  }, [params.id]);

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
      // refresh audit
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

  if (!order) return <div>Загрузка заказа…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading font-bold">Заказ #{order.id}</h1>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Дата: {order.date}</p>
        <p className="text-sm">
          Сумма: <strong>{order.total} ₽</strong>
        </p>
        <div className="mt-3">
          <h3 className="font-semibold">Товары</h3>
          <ul className="list-disc pl-5">
            {order.items.map((it, i) => (
              <li key={i}>
                {it.name} · {it.volume} л · {it.quantity} шт. — {it.price} ₽
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Статус</label>
          <div className="flex gap-2 mt-2">
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
            <button
              disabled={loading}
              onClick={changeStatus}
              className="btn-primary"
            >
              Сменить
            </button>
            <button onClick={() => router.back()} className="btn-secondary">
              Назад
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Аудит лог</h3>
          <ul className="list-none mt-2">
            {audit.map((a, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {a.at} · {a.actor} · {a.from} → {a.to}
              </li>
            ))}
            {audit.length === 0 && (
              <li className="text-sm text-muted-foreground">Записей нет</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
