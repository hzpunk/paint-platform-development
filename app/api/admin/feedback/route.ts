import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

/**
 * Получить список обращений в поддержку
 */
export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}
