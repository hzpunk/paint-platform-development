import { NextResponse } from "next/server";
import { getUserFromCookieHeader } from "@/lib/serverAuth";
import { cancelClientOrder, getMyOrders } from "@/lib/orders";

export async function DELETE(req: Request, { params }: { params: { id?: string } }) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  let orderId = params?.id || url.searchParams.get("id") || url.pathname.split("/").filter(Boolean).pop();

  if (!orderId) {
    return NextResponse.json({ error: "Order id is required" }, { status: 400 });
  }

  try {
    const order = await cancelClientOrder(user.id, orderId);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 400 },
    );
  }
}
