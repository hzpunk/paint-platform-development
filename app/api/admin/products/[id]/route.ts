import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";
import { ProductSchema } from "@/lib/schemas";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    });
    if (!product) return new Response("Not found", { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Ошибка при получении товара ${id}:`, error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const notAllowed = await requireAdmin(req);
    if (notAllowed) return notAllowed;

    const body = await req.json();
    const validation = ProductSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.format() },
        { status: 400 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: validation.data,
      include: { category: true, brand: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Ошибка при обновлении товара ${id}:`, error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const notAllowed = await requireAdmin(_);
    if (notAllowed) return notAllowed;

    await prisma.product.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Ошибка при удалении товара ${id}:`, error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
