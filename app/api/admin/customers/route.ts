import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      bonusBalance: true,
      totalSpent: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(customers);
}
