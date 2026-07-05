import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

/**
 * Получить список документов
 */
export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

/**
 * Создать новый документ
 */
export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { title, type, url } = body;

  const document = await prisma.document.create({
    data: {
      title,
      type,
      url,
    },
  });

  return NextResponse.json(document);
}
