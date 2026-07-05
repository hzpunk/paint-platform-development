import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const data = await req.json();
  const doc = await prisma.document.create({ data });
  return NextResponse.json(doc);
}

export async function PATCH(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { id, title, type, url } = body;
  const doc = await prisma.document.update({
    where: { id },
    data: { title, type, url },
  });
  return NextResponse.json(doc);
}

export async function DELETE(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  await prisma.document.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
