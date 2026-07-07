import { NextResponse } from "next/server";
import {
  getOrder,
  updateOrderStatus,
  getAuditForOrder,
  deleteOrder,
} from "@/lib/adminOrders";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const audit = await getAuditForOrder(id);
    return NextResponse.json({ ...order, audit });
  } catch (error) {
    console.error(`Failed to fetch order ${id}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch order ${id}` },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { status, cancellationReason } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const updatedOrder = await updateOrderStatus(
      id,
      status,
      cancellationReason,
    );
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update order ${id}:`, error);
    return NextResponse.json(
      { error: `Failed to update order ${id}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const notAuthorized = await requireAdmin(req);
    if (notAuthorized) return notAuthorized;

    await deleteOrder(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete order ${id}:`, error);
    return NextResponse.json(
      { error: `Failed to delete order ${id}` },
      { status: 500 },
    );
  }
}
