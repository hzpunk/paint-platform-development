import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;
  const body = await req.json();
  const { id, role, name, phone } = body;
  
  const user = await prisma.user.update({
    where: { id },
    data: { role, name, phone },
  });
  return NextResponse.json(user);
}
