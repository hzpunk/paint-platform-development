import prisma from "./db";
import type { Order } from "./types";

export type AuditEntry = {
  id?: string;
  orderId: string;
  actor: string;
  from: string;
  to: string;
  at: string;
};

function mapOrder(row: any): Order {
  return {
    id: row.id,
    date:
      row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date),
    status: row.status,
    items: (row.items || []).map((i: any) => ({
      name: i.name,
      volume: i.volume,
      quantity: i.qty ?? i.quantity ?? 1,
      price: i.price,
    })),
    total: Number(row.total) || 0,
    bonusEarned: row.bonusEarned ?? 0,
    tracking: row.tracking ?? undefined,
  };
}

export async function getOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!row) return undefined;
  return mapOrder(row);
}

export async function updateOrderStatus(
  id: string,
  status: string,
  actor = "system",
) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw new Error("Order not found");
  const prev = existing.status;
  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  // append audit
  await prisma.auditEntry.create({
    data: { orderId: id, actor, from: prev, to: status, at: new Date() },
  });
  return mapOrder(updated);
}

export async function appendAudit(entry: AuditEntry) {
  await prisma.auditEntry.create({
    data: {
      orderId: entry.orderId,
      actor: entry.actor,
      from: entry.from,
      to: entry.to,
      at: new Date(entry.at),
    },
  });
}

export async function getAuditForOrder(orderId: string): Promise<AuditEntry[]> {
  const rows = await prisma.auditEntry.findMany({
    where: { orderId },
    orderBy: { at: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    actor: r.actor,
    from: r.from,
    to: r.to,
    at: r.at.toISOString(),
  }));
}

export async function createOrder(payload: {
  name?: string;
  phone?: string;
  email?: string;
  items: {
    name: string;
    volume: number;
    price: number;
    quantity: number;
    sku?: string;
  }[];
  total?: number;
}) {
  const id = `ORD-${Date.now().toString().slice(-6)}`;
  const total =
    payload.total ??
    payload.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const created = await prisma.order.create({
    data: {
      id,
      date: new Date(),
      total,
      status: "Оформлен",
      bonusEarned: Math.round(total * 0.03),
      items: {
        create: payload.items.map((it) => ({
          name: it.name,
          volume: it.volume,
          price: it.price,
          qty: it.quantity,
        })),
      },
    },
    include: { items: true },
  });
  return mapOrder(created);
}
