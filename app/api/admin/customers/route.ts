import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}
