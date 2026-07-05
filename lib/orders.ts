import prisma from "./db";
import { Order } from "@prisma/client";

export async function getMyOrders(userId: string): Promise<Order[]> {
  return prisma.order.findMany({
    where: { customerId: userId },
    include: { items: true }, // Include order items
    orderBy: { createdAt: "desc" },
  });
}

export async function createClientOrder(
  userId: string,
  orderData: any
): Promise<Order> {
  return prisma.order.create({
    data: {
      ...orderData,
      customerId: userId,
    },
  });
}
