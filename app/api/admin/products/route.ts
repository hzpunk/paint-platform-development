import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const products = await prisma.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { name, slug, description, price, stock, images, categoryId, brandId } = body;

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
  });

  return NextResponse.json(product);
}
