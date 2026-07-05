import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

/**
 * Получить список избранных товаров (ID продуктов)
 */
export async function GET(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json(favorites.map((f) => f.productId));
}

/**
 * Добавить товар в избранное
 */
export async function POST(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  await prisma.favorite.create({
    data: { userId: user.id, productId },
  });

  return NextResponse.json({ success: true });
}

/**
 * Удалить товар из избранного
 */
export async function DELETE(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, productId },
  });

  return NextResponse.json({ success: true });
}
