import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { name, slug } = body;

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  return NextResponse.json(category);
}
