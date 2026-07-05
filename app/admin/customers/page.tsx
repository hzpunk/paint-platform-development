import { headers } from "next/headers";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { AdminCustomersTable } from "@/components/admin/customers-table";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Клиенты</h1>
        <p className="text-sm text-muted-foreground">
          Зарегистрированные покупатели и их бонусная статистика.
        </p>
      </div>
      <AdminCustomersTable
        initialCustomers={customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          role: customer.role,
          bonusBalance: customer.bonusBalance,
          totalSpent: customer.totalSpent,
          createdAt: customer.createdAt.toISOString().slice(0, 10),
        }))}
      />
    </div>
  );
}
