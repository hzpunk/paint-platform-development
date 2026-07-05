import { NextResponse } from "next/server";
import {
  getOrder,
  updateOrderStatus,
  getAuditForOrder,
} from "@/lib/adminOrders";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;
  const order = await getOrder(params.id);
  if (!order) return new Response("Not found", { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { status, actor } = body;
  if (!status) return new Response("Missing status", { status: 400 });
  try {
    const updated = await updateOrderStatus(
      params.id,
      status,
      actor ?? "admin",
    );
    return NextResponse.json(updated);
  } catch (e: any) {
    return new Response(e.message || "Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  // optional: return audit for order when POST /api/admin/orders/:id with action=audit
  const body = await req.json();
  if (body?.action === "audit") {
    const audit = await getAuditForOrder(params.id);
    return NextResponse.json(audit);
  }
  return new Response("Not supported", { status: 400 });
}
