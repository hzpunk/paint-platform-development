import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!review) return new Response("Not found", { status: 404 });

  return NextResponse.json(review);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const notAllowed = await requireAdmin(req);
  if (notAllowed) return notAllowed;

  const body = await req.json();
  const allowed: Partial<Record<string, any>> = {};
  if (body.rating !== undefined) allowed.rating = Number(body.rating);
  if (body.text !== undefined) allowed.text = body.text;

  if (Object.keys(allowed).length === 0) {
    return new Response("No fields to update", { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: allowed,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const notAllowed = await requireAdmin(_);
  if (notAllowed) return notAllowed;

  await prisma.review.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
