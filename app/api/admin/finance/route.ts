import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
  });

  const fundAllocations = await prisma.fundAllocation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    totalRevenue: totalRevenue._sum.total || 0,
    fundAllocations,
  });
}

export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const allocation = await prisma.fundAllocation.create({
    data: {
      name: body.name,
      percentage: Number(body.percentage || 0),
      amount: Number(body.amount || 0),
    },
  });

  return NextResponse.json(allocation);
}

export async function DELETE(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.fundAllocation.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
