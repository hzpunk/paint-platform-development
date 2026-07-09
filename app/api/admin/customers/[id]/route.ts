import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer) return new Response("Not found", { status: 404 });

  const { password, ...safeCustomer } = customer;
  return NextResponse.json(safeCustomer);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const allowed: Partial<Record<string, any>> = {};
  if (body.name !== undefined) allowed.name = body.name;
  if (body.phone !== undefined) allowed.phone = body.phone;
  if (body.email !== undefined) allowed.email = body.email;
  if (body.role !== undefined) allowed.role = body.role;
  if (body.bonusBalance !== undefined)
    allowed.bonusBalance = Number(body.bonusBalance);
  if (body.totalSpent !== undefined)
    allowed.totalSpent = Number(body.totalSpent);

  if (Object.keys(allowed).length === 0) {
    return new Response("No fields to update", { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: allowed,
  });
  const { password, ...safeUpdated } = updated;
  return NextResponse.json(safeUpdated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.favorite.deleteMany({ where: { userId: id } });
  await prisma.review.deleteMany({ where: { userId: id } });
  await prisma.user.updateMany({
    where: { referredById: id },
    data: { referredById: null },
  });
  await prisma.user.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
