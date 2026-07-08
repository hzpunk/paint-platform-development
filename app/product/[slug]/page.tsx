import { ProductPageClient } from "./product-page-client";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({ select: { slug: true } });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.warn("Database connection failed during build, skipping static parameters generation:", error);
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Normalize slug and try several unicode-normalized variants to avoid lookup failures
  const slugStr = String(slug || "");
  // include decoded URL component and normalized forms
  let decoded = slugStr;
  try {
    decoded = decodeURIComponent(slugStr);
  } catch (e) {
    // ignore
  }

  const candidates = Array.from(
    new Set([
      slugStr,
      decoded,
      slugStr.normalize("NFC"),
      slugStr.normalize("NFD"),
      decoded.normalize("NFC"),
      decoded.normalize("NFD"),
    ]),
  );

  console.log({ slugParam: slugStr, candidates });

  const product = await prisma.product.findFirst({
    where: { slug: { in: candidates } },
    include: {
      category: true,
      brand: true,
      reviews: { include: { user: { select: { name: true } } } },
    },
  });

  console.log("product lookup result:", product ? product.slug : null);

  // If not found, try transliteration fallback (Cyrillic -> Latin)
  if (!product) {
    const translit = (s: string) => {
      const map: Record<string, string> = {
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ё: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "y",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "c",
        ч: "ch",
        ш: "sh",
        щ: "shch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya",
      };
      return s
        .toLowerCase()
        .split("")
        .map((ch) => map[ch] ?? ch)
        .join("")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/\s+/g, "-");
    };

    const t = translit(slugStr);
    if (t) {
      const tCandidates = Array.from(
        new Set([t, t.normalize("NFC"), t.normalize("NFD")]),
      );
      const product2 = await prisma.product.findFirst({
        where: { slug: { in: tCandidates } },
        include: {
          category: true,
          brand: true,
          reviews: { include: { user: { select: { name: true } } } },
        },
      });
      if (product2) {
        // redirect to canonical slug
        redirect(`/product/${product2.slug}`);
      }
    }
  }

  // As a last resort, try a fuzzy search by slug contains or name contains
  if (!product) {
    const fuzzy = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: { contains: slugStr } },
          { name: { contains: slugStr, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        brand: true,
        reviews: { include: { user: { select: { name: true } } } },
      },
    });
    if (fuzzy) {
      redirect(`/product/${fuzzy.slug}`);
    }
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    include: { category: true, brand: true },
  });

  const accessories = await prisma.product.findMany({
    where: { category: { slug: { in: ["primer", "special"] } } },
    take: 4,
    include: { category: true, brand: true },
  });

  const normalizeColors = (value: unknown) => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => {
      if (typeof item === "string") {
        return { hex: item, name: item };
      }
      if (item && typeof item === "object" && "hex" in item) {
        const stockValue =
          typeof (item as any).stock === "number"
            ? (item as any).stock
            : typeof (item as any).stock === "string" &&
                (item as any).stock.trim()
              ? Number((item as any).stock)
              : null;

        return {
          hex: String((item as any).hex),
          name: String((item as any).name ?? (item as any).hex ?? ""),
          stock: Number.isFinite(stockValue) ? stockValue : null,
        };
      }
      return { hex: "#ffffff", name: "" };
    });
  };

  const normalizePackaging = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return [value];
    return [];
  };

  const normalizeSpecs = (value: unknown) => {
    if (value && typeof value === "object") return value;
    return null;
  };

  const productForClient = {
    ...product,
    categorySlug: product.category.slug,
    brand: product.brand.name,
    inStock: product.stock > 0,
    packaging: normalizePackaging(product.packaging),
    colors: normalizeColors(product.colors),
    specs: normalizeSpecs(product.specs),
  };

  const reviewsForClient = product.reviews.map((review) => ({
    ...review,
    author: review.user?.name ?? "Покупатель",
    date: review.createdAt.toISOString(),
    text: review.text ?? "",
  }));

  const relatedForClient = related.map((p) => ({
    ...p,
    categorySlug: p.category.slug,
    brand: p.brand.name,
    inStock: p.stock > 0,
    packaging: normalizePackaging(p.packaging),
    colors: normalizeColors(p.colors),
    specs: normalizeSpecs(p.specs),
  }));

  const accessoriesForClient = accessories.map((p) => ({
    ...p,
    categorySlug: p.category.slug,
    brand: p.brand.name,
    inStock: p.stock > 0,
    packaging: normalizePackaging(p.packaging),
    colors: normalizeColors(p.colors),
    specs: normalizeSpecs(p.specs),
  }));

  return (
    <ProductPageClient
      product={productForClient}
      related={relatedForClient}
      reviews={reviewsForClient}
      accessories={accessoriesForClient}
    />
  );
}
