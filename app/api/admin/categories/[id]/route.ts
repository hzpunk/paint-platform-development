import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) return new Response("Not found", { status: 404 });

  return NextResponse.json(category);
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

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
