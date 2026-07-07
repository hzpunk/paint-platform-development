import prisma from "./db";
import { Order } from "@prisma/client";
import { bonusFor } from "./data";

const statusPriority: Record<string, number> = {
  new: 0,
  pending: 1,
  collected: 2,
  confirmed: 3,
  completed: 4,
  paid: 4,
  cancelled: 99,
  refunded: 99,
  собран: 2,
  завершен: 4,
  завершён: 4,
  отменён: 99,
  отменен: 99,
  новый: 0,
  "в обработке": 1,
  подтвержден: 3,
};

function normalizeStatus(status: string | null | undefined) {
  return String(status ?? "")
    .trim()
    .toLowerCase();
}

function sortOrders(orders: Order[]) {
  return [...orders].sort((a, b) => {
    const aPriority = statusPriority[normalizeStatus(a.status)] ?? 99;
    const bPriority = statusPriority[normalizeStatus(b.status)] ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return sortOrders(orders);
}

export async function getOrder(id: string): Promise<
  | (Order & {
      items: Array<{
        id: string;
        name: string;
        volume: number;
        price: number;
        qty: number;
        productId: string | null;
        color: string | null;
        ral: string | null;
      }>;
    })
  | null
> {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  }) as Promise<
    | (Order & {
        items: Array<{
          id: string;
          name: string;
          volume: number;
          price: number;
          qty: number;
          productId: string | null;
          color: string | null;
          ral: string | null;
        }>;
      })
    | null
  >;
}

export async function updateOrderStatus(
  id: string,
  status: string,
  cancellationReason?: string,
): Promise<Order> {
  const data: { status: string; cancellationReason?: string | null } = {
    status,
  };

  if (typeof cancellationReason === "string" && cancellationReason.trim()) {
    data.cancellationReason = cancellationReason.trim();
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error("Order not found");
  }

  const normalizedStatus = String(status ?? "")
    .trim()
    .toLowerCase();
  const shouldAwardBonus =
    (normalizedStatus === "completed" ||
      normalizedStatus === "завершён" ||
      normalizedStatus === "завершен") &&
    order.bonusEarned !== 0;

  if (shouldAwardBonus && order.customerId) {
    const bonusAmount = bonusFor(Number(order.total) || 0);
    const currentUser = await prisma.user.findUnique({
      where: { id: order.customerId },
    });

    if (currentUser) {
      await prisma.user.update({
        where: { id: order.customerId },
        data: {
          bonusBalance: (currentUser.bonusBalance || 0) + bonusAmount,
          totalSpent:
            (currentUser.totalSpent || 0) +
            Math.round(Number(order.total) || 0),
        },
      });

      // CHECK REFERRAL SYSTEM FOR FIRST COMPLETED ORDER
      const completedOrdersCount = await prisma.order.count({
        where: {
          customerId: order.customerId,
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
          id: { not: order.id },
        },
      });

      if (completedOrdersCount === 0 && currentUser.referredById) {
        const referralReward = Math.round(Number(order.total) * 0.05);
        if (referralReward > 0) {
          await prisma.user.update({
            where: { id: currentUser.referredById },
            data: {
              bonusBalance: { increment: referralReward },
              referralBonus: { increment: referralReward },
            },
          });

          // Deduct 5% from commission
          const baseCommission = Number(order.commission) || 0;
          data.commission = Math.max(0, baseCommission - referralReward);
        }
      }
    }

    data.bonusEarned = bonusAmount;
  }

  return prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  });
}

export async function getAuditForOrder(orderId: string) {
  return prisma.auditEntry.findMany({
    where: { orderId },
    orderBy: { at: "desc" },
  });
}

export async function deleteOrder(id: string) {
  return prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: id } }),
    prisma.auditEntry.deleteMany({ where: { orderId: id } }),
    prisma.order.delete({ where: { id } }),
  ]);
}

export async function deleteAllOrders() {
  return prisma.$transaction([
    prisma.orderItem.deleteMany({}),
    prisma.auditEntry.deleteMany({}),
    prisma.order.deleteMany({}),
  ]);
}
