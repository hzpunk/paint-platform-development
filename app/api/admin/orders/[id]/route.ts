import { NextResponse } from "next/server";
import {
  getOrder,
  updateOrderStatus,
  getAuditForOrder,
} from "@/lib/adminOrders";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const audit = await getAuditForOrder(params.id);
    return NextResponse.json({ ...order, audit });
  } catch (error) {
    console.error(`Failed to fetch order ${params.id}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch order ${params.id}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const updatedOrder = await updateOrderStatus(params.id, status);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update order ${params.id}:`, error);
    return NextResponse.json(
      { error: `Failed to update order ${params.id}` },
      { status: 500 }
    );
  }
}
