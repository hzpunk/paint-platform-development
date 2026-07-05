import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const allocations = await prisma.fundAllocation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(allocations);
}

export async function POST(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const data = await req.json();
  const allocation = await prisma.fundAllocation.create({ data });
  return NextResponse.json(allocation);
}

export async function PATCH(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { id, name, percentage, amount } = body;
  const allocation = await prisma.fundAllocation.update({
    where: { id },
    data: { name, percentage, amount },
  });
  return NextResponse.json(allocation);
}

export async function DELETE(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  await prisma.fundAllocation.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
