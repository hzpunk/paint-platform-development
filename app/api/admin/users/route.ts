import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/serverAuth";

// GET all users
export async function GET(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const users = await prisma.user.findMany({
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
  return NextResponse.json(users);
}

// POST new user (optional, if creation from admin is needed)
export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const { email, name, password, role } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
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
