import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword);
}

export async function PATCH(req: Request) {
  const user = await getUserFromCookieHeader(req.headers.get("cookie"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.phone === "string") data.phone = body.phone;
  if (typeof body.email === "string") data.email = body.email;
  if (typeof body.birthday === "string") data.birthday = body.birthday;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  const { password: _password, ...userWithoutPassword } = updatedUser;
  return NextResponse.json(userWithoutPassword);
}
