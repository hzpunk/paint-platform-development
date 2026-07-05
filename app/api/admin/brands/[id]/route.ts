import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id },
  });
  if (!brand) return new Response("Not found", { status: 404 });

  return NextResponse.json(brand);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const { name, slug } = body;

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name,
      slug,
    },
  });

  return NextResponse.json(brand);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.brand.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
