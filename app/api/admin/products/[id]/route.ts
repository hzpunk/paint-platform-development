import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";
import { ProductSchema } from "@/lib/schemas";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";

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
    const payload = body;

    const validation = ProductSchema.partial().safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.format() },
        { status: 400 },
      );
    }

    const {
      commission: _commission,
      name,
      slug,
      description,
      price,
      stock,
      images,
      categoryId,
      brandId,
      type,
      surfaces,
      badges,
      colorable,
      shortSpec,
      specs,
      application,
      packaging,
      colors,
    } = validation.data;

    const normalizedData: Record<string, any> = {};

    if (name !== undefined) normalizedData.name = name;
    if (slug !== undefined) normalizedData.slug = slug;
    if (description !== undefined) normalizedData.description = description;
    if (price !== undefined) normalizedData.price = price;
    if (stock !== undefined) normalizedData.stock = stock;
    if (images !== undefined) normalizedData.images = images;
    if (type !== undefined) normalizedData.type = type;
    if (surfaces !== undefined) normalizedData.surfaces = surfaces;
    if (badges !== undefined) normalizedData.badges = badges;
    if (colorable !== undefined) normalizedData.colorable = colorable;
    if (shortSpec !== undefined) normalizedData.shortSpec = shortSpec;
    if (specs !== undefined) normalizedData.specs = specs;
    if (application !== undefined) normalizedData.application = application;
    if (packaging !== undefined) normalizedData.packaging = packaging;
    if (colors !== undefined) normalizedData.colors = colors;

    if (categoryId !== undefined) normalizedData.categoryId = categoryId ?? undefined;
    if (brandId !== undefined) normalizedData.brandId = brandId ?? undefined;

    if (typeof price === "number") {
      normalizedData.commission = Math.round(
        price * HZCOMPANY_COMMISSION_RATE,
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: normalizedData,
      include: { category: true, brand: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Ошибка при обновлении товара ${id}:`, error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
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

    await prisma.review.deleteMany({ where: { productId: id } });
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
