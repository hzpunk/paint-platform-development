import prisma from "./db";
import type { Order } from "@prisma/client";
import { HZCOMPANY_COMMISSION_RATE } from "./productPricing";

export async function getMyOrders(userId: string): Promise<Order[]> {
  return prisma.order.findMany({
    where: { customerId: userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClientOrder(
  userId: string,
  orderData: any,
): Promise<Order> {
  const { items, name, phone, email, total, subtotal, promoCode, bonusUsed } = orderData;
  const orderTotal = Number(total) || Number(subtotal) || 0;

  const commissionTotal = (Array.isArray(items) ? items : []).reduce(
    (s: number, item: any) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || Number(item.qty) || 1;
      const itemCommission = Math.round(
        price * qty * (HZCOMPANY_COMMISSION_RATE / (1 + HZCOMPANY_COMMISSION_RATE))
      );
      return s + itemCommission;
    },
    0,
  );

  const parsedBonusUsed = Number(bonusUsed) || 0;

  return prisma.$transaction(async (tx) => {
    if (parsedBonusUsed > 0 && userId) {
      const userRecord = await tx.user.findUnique({ where: { id: userId } });
      if (userRecord) {
        await tx.user.update({
          where: { id: userId },
          data: {
            bonusBalance: Math.max(0, (userRecord.bonusBalance || 0) - parsedBonusUsed),
          },
        });
      }
    }

    return tx.order.create({
      data: {
        total: orderTotal,
        commission: commissionTotal,
        status: "new",
        customerId: userId,
        customerName: name ?? null,
        customerPhone: phone ?? null,
        customerEmail: email ?? null,
        promoCode: promoCode || null,
        bonusEarned: parsedBonusUsed > 0 ? 0 : null,
        items: {
          create: (Array.isArray(items) ? items : []).map((item: any) => ({
            name: item.name ?? "Товар",
            volume: Number(item.volume) || 0,
            price: Number(item.price) || 0,
            qty: Number(item.quantity) || Number(item.qty) || 1,
            productId: item.productId ?? null,
            color: item.color ?? null,
            ral: item.ral ?? null,
          })),
        },
      },
    });
  });
}

export async function cancelClientOrder(
  userId: string,
  orderId: string,
): Promise<Order> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== userId) {
    throw new Error("Forbidden");
  }

  const status = String(order.status ?? "")
    .trim()
    .toLowerCase();
  if (status !== "new" && status !== "новый") {
    throw new Error("Невозможно отменить заказ");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "Отменён" },
  });
}
