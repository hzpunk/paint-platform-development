import { NextResponse } from "next/server";
import { getOrders } from "@/lib/adminOrders";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const orders = await getOrders();
  return NextResponse.json(orders);
}
