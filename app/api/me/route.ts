import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  // return public profile fields
  const { id, email, name, phone, bonusBalance, totalSpent } = user;
  return NextResponse.json({
    id,
    email,
    name,
    phone,
    bonusBalance,
    totalSpent,
  });
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const allowed: any = {};
  if (body.name !== undefined) allowed.name = body.name;
  if (body.phone !== undefined) allowed.phone = body.phone;
  if (body.email !== undefined) allowed.email = body.email;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: allowed,
  });
  const { id, email, name, phone, bonusBalance, totalSpent } = updated;
  return NextResponse.json({
    id,
    email,
    name,
    phone,
    bonusBalance,
    totalSpent,
  });
}
