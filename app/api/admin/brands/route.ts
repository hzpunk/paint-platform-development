import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { name, slug } = body;

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
    },
  });

  return NextResponse.json(brand);
}
