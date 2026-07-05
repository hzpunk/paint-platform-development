import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const metrics = await prisma.marketingMetric.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(metrics);
}

export async function POST(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { platform, views, likes, followers, date } = body;
  const metric = await prisma.marketingMetric.create({
    data: { platform, views, likes, followers, date: date ? new Date(date) : new Date() },
  });
  return NextResponse.json(metric);
}

export async function PATCH(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { id, platform, views, likes, followers, date } = body;
  const metric = await prisma.marketingMetric.update({
    where: { id },
    data: { platform, views, likes, followers, date: date ? new Date(date) : undefined },
  });
  return NextResponse.json(metric);
}

export async function DELETE(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  await prisma.marketingMetric.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
