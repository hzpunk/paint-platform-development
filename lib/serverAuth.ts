import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./db";

const SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const COOKIE_NAME = "auth_token";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return new Response(JSON.stringify({ message: "Logged out" }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function getUserFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  const token = cookie.split("=")[1];
  const decoded = await verifyToken(token);

  if (!decoded || typeof decoded !== "object" || !decoded.userId) return null;

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  return user;
}

/**
 * Проверяет авторизацию администратора.
 * Возвращает null при успехе (авторизация пройдена),
 * Response 401 при провале — вызывающий код делает: const err = await requireAdmin(req); if (err) return err;
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
    const user = await getUserFromCookieHeader(req.headers.get('cookie'));
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    return null;
}
