import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

/**
 * Получить документ по ID
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notAuthorized = await requireAdmin(_);
  if (notAuthorized) return notAuthorized;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return new Response("Not found", { status: 404 });

  return NextResponse.json(document);
}

/**
 * Обновить документ
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const { title, type, url } = body;

  const document = await prisma.document.update({
    where: { id },
    data: {
      title,
      type,
      url,
    },
  });

  return NextResponse.json(document);
}

/**
 * Удалить документ
 */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.document.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
