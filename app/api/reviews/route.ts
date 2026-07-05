import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET(req: Request) {
  // optionally support ?productId=...
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const where = productId ? { productId } : {};
  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { productId, rating, text } = body;
  if (!productId || !rating) return new Response("Missing", { status: 400 });
  const rec = await prisma.review.create({
    data: { userId: user.id, productId, rating: Number(rating), text },
  });
  return NextResponse.json(rec);
}
