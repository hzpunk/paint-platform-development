import { NextResponse } from "next/server";
import { getMyOrders, createClientOrder } from "@/lib/orders";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getMyOrders(user.id);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const order = await createClientOrder(user.id, body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
