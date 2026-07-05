import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getUserFromCookieHeader } from '@/lib/serverAuth';
import { DashboardOverview } from '@/components/admin/dashboard-overview';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getUserFromCookieHeader((await headers()).get('cookie'));
  if (!user || user.role !== 'admin') redirect('/admin/login');

  const [orderCount, customerCount, revenue, products] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.product.findMany({
      include: { category: true, brand: true },
      take: 10,
    }),
  ]);

  return (
    <DashboardOverview
      orderCount={orderCount}
      customerCount={customerCount}
      revenue={Math.round(revenue._sum.total ?? 0)}
      products={products.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        brand: product.brand,
      }))}
    />
  );
}
