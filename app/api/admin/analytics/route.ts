import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";

export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  // consider only completed/paid orders for revenue/commission
  const [totalUsers, totalOrders, revenueResult] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
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

  const totalRevenue = revenueResult._sum.total || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const hzcompanyCommission = Math.round(
    totalRevenue *
      (HZCOMPANY_COMMISSION_RATE / (1 + HZCOMPANY_COMMISSION_RATE)),
  );

  return NextResponse.json({
    totalUsers,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    hzcompanyCommission,
  });
}
