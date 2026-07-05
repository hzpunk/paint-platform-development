import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/serverAuth";

// GET single user
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
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
  if (!user) return new Response("User not found", { status: 404 });

  return NextResponse.json(user);
}

// PATCH update user
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.email === "string") data.email = body.email;
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.phone === "string") data.phone = body.phone;
  if (typeof body.role === "string") data.role = body.role;
  if (typeof body.password === "string" && body.password) {
    data.password = await hashPassword(body.password);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
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

  return NextResponse.json(user);
}

// DELETE user
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  await prisma.user.delete({ where: { id: params.id } });

  return new Response(null, { status: 204 });
}
