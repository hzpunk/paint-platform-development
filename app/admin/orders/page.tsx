import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

type OrderSummary = { id: string; date: string; total: number; status: string };

export default async function AdminOrdersPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const mapped: OrderSummary[] = orders.map((order) => ({
    id: order.id,
    date:
      order.date instanceof Date
        ? order.date.toISOString().slice(0, 10)
        : String(order.date),
    total: Math.round(order.total),
    status: order.status,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Заказы</h1>
        <p className="text-sm text-muted-foreground">
          Управление всем потоком заказов.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {mapped.map((o) => (
          <Link
            key={o.id}
            href={`/admin/orders/${o.id}`}
            className="rounded-md border p-3 hover:bg-muted flex flex-col sm:flex-row sm:justify-between gap-2"
          >
            <div>
              <div className="font-mono">#{o.id}</div>
              <div className="text-sm text-muted-foreground">{o.date}</div>
            </div>
            <div className="text-sm font-semibold">{o.status}</div>
            <div className="text-sm font-bold">
              {o.total.toLocaleString("ru")} ₽
            </div>
          </Link>
        ))}
        {mapped.length === 0 && (
          <div className="text-sm text-muted-foreground">Нет заказов</div>
        )}
      </div>
    </div>
  );
}
