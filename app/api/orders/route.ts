import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders, createOrder } from "@/lib/adminOrders";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().min(5),
    email: z.string().email().optional(),
    items: z.array(
      z.object({
        name: z.string(),
        volume: z.number(),
        price: z.number(),
        quantity: z.number().min(1),
        sku: z.string().optional(),
      }),
    ),
    total: z.number().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.format() }), {
      status: 400,
    });
  }

  try {
    const created = await createOrder(parsed.data);
    return NextResponse.json(created);
  } catch (e: any) {
    return new Response(e.message || "Error", { status: 500 });
  }
}
