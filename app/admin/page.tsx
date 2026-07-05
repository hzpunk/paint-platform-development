import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const [orderCount, customerCount, reviewCount, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Статистика по заказам, клиентам и отзывам.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Всего заказов</p>
          <p className="mt-3 text-3xl font-bold">{orderCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Всего клиентов</p>
          <p className="mt-3 text-3xl font-bold">{customerCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Всего отзывов</p>
          <p className="mt-3 text-3xl font-bold">{reviewCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Общая выручка</p>
          <p className="mt-3 text-3xl font-bold">
            {Math.round(revenue._sum.total ?? 0).toLocaleString("ru")} ₽
          </p>
        </div>
      </section>
    </div>
  );
}
