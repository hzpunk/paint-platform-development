import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromCookieHeader } from "@/lib/serverAuth";

/**
 * Получить список отзывов для клиентской части
 * Возвращает только опубликованные отзывы с информацией о продукте
 */
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        text: {
          not: null
        }
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении отзывов' },
      { status: 500 }
    );
  }
}

/**
 * Создать новый отзыв
 * Требует авторизации пользователя
 */
export async function POST(req: Request) {
  try {
    const user = await getUserFromCookieHeader(req.headers.get("cookie"));
    if (!user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, text } = body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Неверные данные отзыва" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        rating,
        text: text || null,
        userId: user.id,
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: true,
          },
        },
      },
    });

    // Пересчитать средний рейтинг продукта
    const productReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) /
      productReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewsCount: productReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Ошибка при создании отзыва:", error);
    return NextResponse.json(
      { error: "Ошибка при создании отзыва" },
      { status: 500 }
    );
  }
}