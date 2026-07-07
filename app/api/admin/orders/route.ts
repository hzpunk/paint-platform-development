import { NextResponse } from "next/server";
import { getOrders, deleteAllOrders } from "@/lib/adminOrders";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const notAuthorized = await requireAdmin(req);
    if (notAuthorized) return notAuthorized;

    await deleteAllOrders();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete all orders:", error);
    return NextResponse.json(
      { error: "Failed to delete all orders" },
      { status: 500 }
    );
  }
}
