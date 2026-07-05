import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Получить список категорий для клиентской части
 * Возвращает только активные категории с товарами
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            stock: {
              gt: 0
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении категорий' },
      { status: 500 }
    );
  }
}