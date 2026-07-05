import prisma from "./db";
import { Order } from "@prisma/client";

export async function getOrders(): Promise<Order[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(id: string): Promise<(Order & { items: Array<{ id: string; name: string; volume: number; price: number; qty: number; productId: string | null; color: string | null; ral: string | null }> }) | null> {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  }) as Promise<(Order & { items: Array<{ id: string; name: string; volume: number; price: number; qty: number; productId: string | null; color: string | null; ral: string | null }> }) | null>;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function getAuditForOrder(orderId: string) {
  return prisma.auditEntry.findMany({
    where: { orderId },
    orderBy: { at: "desc" },
  });
}
