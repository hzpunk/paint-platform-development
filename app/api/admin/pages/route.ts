import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

/**
 * Получить список статических страниц
 */
export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const pages = await prisma.staticPage.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages);
}

/**
 * Создать новую статическую страницу
 */
export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { title, slug, content } = body;

  const page = await prisma.staticPage.create({
    data: {
      title,
      slug,
      content,
    },
  });

  return NextResponse.json(page);
}
