import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/serverAuth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSettingKey(type: string) {
  if (type === "surfaces") return "catalog_surfaces";
  if (type === "paintTypes") return "catalog_paint_types";
  throw new Error("Unsupported dictionary type");
}

function parseItems(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type !== "surfaces" && type !== "paintTypes") {
    return NextResponse.json([]);
  }

  const setting = await prisma.setting.findUnique({
    where: { key: getSettingKey(type) },
  });
  return NextResponse.json(parseItems(setting?.value ?? null));
}

export async function POST(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const type = body.type;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : slugify(name);

  if (!type || !name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const key = getSettingKey(type);
  const existing = await prisma.setting.findUnique({ where: { key } });
  const items = parseItems(existing?.value ?? null);

  const duplicate = items.some(
    (item: any) => item.slug === slug || item.name === name,
  );
  if (duplicate) {
    return NextResponse.json({ error: "Item already exists" }, { status: 409 });
  }

  const item = {
    id: `${type}-${Date.now()}`,
    name,
    slug,
  };

  const updated = [...items, item];

  const saved = await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(updated) },
    create: { key, value: JSON.stringify(updated) },
  });

  return NextResponse.json({
    id: item.id,
    name: item.name,
    slug: item.slug,
    key: saved.key,
  });
}

export async function DELETE(req: Request) {
  const notAuthorized = await requireAdmin(req);
  if (notAuthorized) return notAuthorized;

  const body = await req.json();
  const type = body.type;
  const id = body.id;

  if (!type || !id) {
    return NextResponse.json(
      { error: "Type and id are required" },
      { status: 400 },
    );
  }

  const key = getSettingKey(type);
  const existing = await prisma.setting.findUnique({ where: { key } });
  const items = parseItems(existing?.value ?? null);
  const filtered = items.filter((item: any) => item.id !== id);

  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(filtered) },
    create: { key, value: JSON.stringify(filtered) },
  });

  return NextResponse.json({ success: true });
}
