import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
  if (!product) return new Response("Not found", { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const { name, slug, description, price, stock, images, categoryId, brandId } = body;

  const product = await prisma.product.update({
    where: { id },
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

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.product.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
