import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";
import { ProductSchema } from "@/lib/schemas";
import { HZCOMPANY_COMMISSION_RATE } from "@/lib/productPricing";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}0-9\s-]/gu, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    if (
      !body.slug ||
      typeof body.slug !== "string" ||
      body.slug.trim().length < 3
    ) {
      body.slug = slugify(body.name || "");
    }

    const payload = body;

    const hasColorValues =
      Array.isArray(payload.colors) &&
      payload.colors.length > 0 &&
      payload.colors.some((value: unknown) => {
        if (typeof value === "string") return value.trim().length > 0;
        if (value && typeof value === "object" && "hex" in value) {
          return typeof (value as { hex?: unknown }).hex === "string"
            ? (value as { hex: string }).hex.trim().length > 0
            : false;
        }
        return false;
      });
    const looksLikePaintProduct = [
      payload.name,
      payload.type,
      payload.shortSpec,
      payload.description,
    ]
      .filter((value): value is string => typeof value === "string")
      .some((value) =>
        /(краска|эмаль|лак|водоэмульсион|paint|emulsion|lacquer)/i.test(value),
      );

    if (looksLikePaintProduct && !hasColorValues) {
      return NextResponse.json(
        { error: "Для краски нужно добавить хотя бы один цвет" },
        { status: 400 },
      );
    }

    const validation = ProductSchema.safeParse(payload);

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

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        commission: Math.round(price * HZCOMPANY_COMMISSION_RATE),
        stock,
        images: images ?? [],
        categoryId: categoryId ?? undefined,
        brandId: brandId ?? undefined,
        type,
        surfaces: surfaces ?? [],
        badges: badges ?? [],
        colorable: colorable ?? false,
        shortSpec,
        specs,
        application,
        packaging,
        colors,
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
