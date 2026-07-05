import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

/**
 * Получить статическую страницу по ID
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notAuthorized = await requireAdmin(_);
  if (notAuthorized) return notAuthorized;

  const page = await prisma.staticPage.findUnique({ where: { id } });
  if (!page) return new Response("Not found", { status: 404 });

  return NextResponse.json(page);
}

/**
 * Обновить статическую страницу
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const { title, slug, content } = body;

  const page = await prisma.staticPage.update({
    where: { id },
    data: {
      title,
      slug,
      content,
    },
  });

  return NextResponse.json(page);
}

/**
 * Удалить статическую страницу
 */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.staticPage.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
