import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, signToken, makeAuthResponse } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, phone } = body;
  if (!email || !password) return new Response("Missing", { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return new Response("User exists", { status: 400 });
  const user = await prisma.user.create({
    data: { email, name, phone, password: hashPassword(password) },
  });
  const token = signToken({ id: user.id });
  return makeAuthResponse(
    { id: user.id, email: user.email, name: user.name },
    token,
  );
}
