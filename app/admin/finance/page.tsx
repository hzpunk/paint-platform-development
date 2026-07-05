import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminFinanceTable } from "@/components/admin/finance-table";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const [revenue, allocations] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.fundAllocation.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Финансы</h1>
        <p className="text-sm text-muted-foreground">Управление финансами</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Заработок платформы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(revenue._sum.total ?? 0).toLocaleString("ru")} ₽
            </p>
          </CardContent>
        </Card>
      </div>

      <AdminFinanceTable initialAllocations={allocations} />
    </div>
  );
}
