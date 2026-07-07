import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [
    userCount,
    orderCount,
    productCount,
    reviewCount,
    categoryCount,
    brandCount,
    revenueResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.review.count(),
    prisma.category.count(),
    prisma.brand.count(),
    // sum totals only for completed/paid orders
    prisma.order.aggregate({
      where: {
        status: {
          in: [
            "completed",
            "paid",
            "Завершён",
            "Завершен",
            "Оплачен",
            "завершён",
            "завершен",
            "оплачен",
          ],
        },
      },
      _sum: { total: true },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      status: true,
      total: true,
      customerName: true,
      customerEmail: true,
    },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const totalRevenue = revenueResult._sum.total || 0;
  // If product prices already include the commission, the embedded commission
  // amount equals totalRevenue * (rate / (1 + rate)). Show commission only
  // for successfully completed/paid orders.
  const hzcompanyCommission = Math.round(
    totalRevenue *
      (HZCOMPANY_COMMISSION_RATE / (1 + HZCOMPANY_COMMISSION_RATE)),
  );

  return {
    userCount,
    orderCount,
    productCount,
    reviewCount,
    categoryCount,
    brandCount,
    totalRevenue,
    hzcompanyCommission,
    recentOrders,
    recentUsers,
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusVariant(status: string) {
  switch (status) {
    case "new":
    case "pending":
      return "secondary";
    case "confirmed":
    case "completed":
    case "paid":
      return "success";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function AdminPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const stats = await getAdminStats();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Card className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Админ-панель</h1>
            <p className="text-muted-foreground">
              Обзор системы и быстрый доступ к разделам.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {user.name ? `${user.name} (${user.email})` : user.email}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.userCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.orderCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Товаров</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.productCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Отзывы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.reviewCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Категорий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.categoryCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Брендов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.brandCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Комиссия Hzcompany</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.hzcompanyCommission.toLocaleString("ru-RU", {
                style: "currency",
                currency: "RUB",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Нет недавних заказов.
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border/60 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            Заказ {order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground space-y-1">
                        <p>
                          Сумма:{" "}
                          {order.total.toLocaleString("ru-RU", {
                            style: "currency",
                            currency: "RUB",
                          })}
                        </p>
                        <p>
                          Клиент:{" "}
                          {order.customerName || order.customerEmail || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Новые пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Нет новых пользователей.
                </p>
              ) : (
                stats.recentUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="rounded-2xl border border-border/60 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">
                          {userItem.name || userItem.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userItem.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          userItem.role === "admin"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {userItem.role}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {formatDate(userItem.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
