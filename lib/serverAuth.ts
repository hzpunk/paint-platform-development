import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "kraska_token";

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

function getUserFromToken(token?: string | null) {
  if (!token) return null;
  const data = verifyToken(decodeURIComponent(token));
  if (!data || !data.id) return null;
  return prisma.user.findUnique({ where: { id: data.id } });
}

export async function getUserFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  return getUserFromCookieHeader(cookie);
}

export async function getUserFromCookieHeader(cookieHeader?: string | null) {
  const match = (cookieHeader || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + "="));
  if (!match) return null;
  const token = match.split("=").slice(1).join("=");
  return getUserFromToken(token);
}

function getCookieToken() {
  if (typeof window === "undefined") {
    const cookieStore = cookies();
    if (cookieStore) {
      if (typeof cookieStore.get === "function") {
        return cookieStore.get(COOKIE_NAME)?.value ?? null;
      }
      if (typeof cookieStore.getAll === "function") {
        return (
          cookieStore.getAll().find((cookie) => cookie.name === COOKIE_NAME)
            ?.value ?? null
        );
      }
    }
    return null;
  }

  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export async function getUserFromCookies() {
  const token = getCookieToken();
  return getUserFromToken(token);
}

export async function getUserFromServerCookies() {
  return null;
}

export function makeAuthResponse(resBody: any, token: string) {
  const res = new Response(JSON.stringify(resBody), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
    },
  });
  return res;
}

export function clearAuthCookie() {
  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}

export async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
