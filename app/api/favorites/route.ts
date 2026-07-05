import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favs.map((f) => f.productId));
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { productId } = body;
  if (!productId) return new Response("Missing", { status: 400 });
  try {
    const rec = await prisma.favorite.create({
      data: { userId: user.id, productId },
    });
    return NextResponse.json({ productId: rec.productId });
  } catch (e: any) {
    return new Response("Conflict", { status: 409 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { productId } = body;
  if (!productId) return new Response("Missing", { status: 400 });
  await prisma.favorite.deleteMany({ where: { userId: user.id, productId } });
  return new Response(null, { status: 204 });
}
