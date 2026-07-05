import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { AdminMarketingTable } from "@/components/admin/marketing-table";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const user = await getUserFromCookieHeader((await headers()).get("cookie"));
  if (!user || user.role !== "admin") redirect("/admin/login");

  const metrics = await prisma.marketingMetric.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Маркетинг</h1>
        <p className="text-sm text-muted-foreground">Управление маркетингом</p>
      </div>
      <AdminMarketingTable initialMetrics={metrics} />
    </div>
  );
}
