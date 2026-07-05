import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyPassword, signToken, makeAuthResponse } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) return new Response("Missing", { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return new Response("Invalid", { status: 401 });
  const ok = verifyPassword(password, user.password);
  if (!ok) return new Response("Invalid", { status: 401 });
  const token = signToken({ id: user.id });
  return makeAuthResponse(
    { id: user.id, email: user.email, name: user.name },
    token,
  );
}
