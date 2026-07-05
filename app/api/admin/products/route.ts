import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";
import { ProductSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Ошибка при получении товаров:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const notAuthorized = await requireAdmin(req);
    if (notAuthorized) return notAuthorized;

    const body = await req.json();
    const validation = ProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.format() },
        { status: 400 },
      );
    }

    const { name, slug, description, price, stock, images, categoryId, brandId } =
      validation.data;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        images,
        categoryId,
        brandId,
      },
      include: { category: true, brand: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Ошибка при создании товара:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
