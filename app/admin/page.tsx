import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getUserFromCookieHeader } from '@/lib/serverAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getUserFromCookieHeader((await headers()).get('cookie'));
  if (!user || user.role !== 'admin') redirect('/admin/login');

  const [orderCount, customerCount, reviewCount, revenue, products] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.review.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.findMany({
      include: { category: true, brand: true },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Статистика по заказам, клиентам и отзывам.
        </p>
      </div>

      {/* Быстрые метрики */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orderCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Финансы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(revenue._sum.total ?? 0).toLocaleString('ru')} ₽
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Маркетинг</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Посещение</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customerCount}</p>
          </CardContent>
        </Card>
      </section>

      {/* Топ 10 товаров */}
      <Card>
        <CardHeader>
          <CardTitle>Топ 10 товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product, idx) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold w-6">{idx + 1}.</span>
                  <span>{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.price.toLocaleString('ru')} ₽</p>
                  <p className="text-xs text-muted-foreground">
                    {product.category?.name} • {product.brand?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
